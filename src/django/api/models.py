from collections import defaultdict
from itertools import groupby

from django.contrib.auth.models import (AbstractBaseUser,
                                        BaseUserManager,
                                        PermissionsMixin)
from django.contrib.gis.db import models as gis_models
from django.contrib.postgres import fields as postgres
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.aggregates.general import ArrayAgg
from django.db import models, transaction
from django.db.models import F, Q, CharField
from django.db.models.signals import post_save
from django.db.models.functions import Concat
from django.contrib.gis.geos import GEOSGeometry
from django.utils.dateformat import format
from django.utils import timezone
from allauth.account.models import EmailAddress
from simple_history.models import HistoricalRecords
from waffle import switch_is_active

from api.constants import FeatureGroups
from api.countries import COUNTRY_CHOICES
from api.oar_id import make_oar_id
from api.constants import Affiliations, Certifications, FacilitiesQueryParams
from api.helpers import prefix_a_an


class ArrayLength(models.Func):
    """
    A Func subclass that can be used in a QuerySet.annotate() call to invoke
    the Postgres cardinality function on an array field, which returns the
    length of the array.
    """
    function = 'CARDINALITY'


class Version(models.Model):
    """
    A table storing feature version numbers.
    """
    name = models.CharField(
        max_length=100,
        null=False,
        blank=False,
        primary_key=True,
        help_text='The name of a feature with versions.')
    version = models.IntegerField(
        null=False,
        blank=False,
        help_text='The version number of the feature.')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class EmailAsUsernameUserManager(BaseUserManager):
    """
    A custom user manager which uses emails as unique identifiers for auth
    instead of usernames.
    """

    def _create_user(self, email, password, **extra_fields):
        """
        Creates and saves a User with the given email and password.
        """
        if not email:
            raise ValueError('Email must be set')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()

        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self._create_user(email, password, **extra_fields)


class Contributor(models.Model):
    """
    A participant in or observer of the supply chain that will
    upload facility lists to the registry.
    """
    # These choices must be kept in sync with the identical list kept in the
    # React client's constants file
    OTHER_CONTRIB_TYPE = 'Other'

    CONTRIB_TYPE_CHOICES = (
        ('Academic / Researcher / Journalist / Student',
         'Academic / Researcher / Journalist / Student'),
        ('Auditor / Certification Scheme / Service Provider',
         'Auditor / Certification Scheme / Service Provider'),
        ('Brand / Retailer', 'Brand / Retailer'),
        ('Civil Society Organization', 'Civil Society Organization'),
        ('Facility / Factory / Manufacturing Group / Supplier / Vendor',
         'Facility / Factory / Manufacturing Group / Supplier / Vendor'),
        ('Multi-Stakeholder Initiative', 'Multi-Stakeholder Initiative'),
        ('Union', 'Union'),
        (OTHER_CONTRIB_TYPE, OTHER_CONTRIB_TYPE),
    )

    PLURAL_CONTRIB_TYPE = {
        'Academic / Researcher / Journalist / Student':
        'Academics / Researchers / Journalists / Students',
        'Auditor / Certification Scheme / Service Provider':
        'Auditors / Certification Schemes / Service Providers',
        'Brand / Retailer': 'Brands / Retailers',
        'Civil Society Organization': 'Civil Society Organizations',
        'Facility / Factory / Manufacturing Group / Supplier / Vendor':
        'Facilities / Factories / Manufacturing Groups / Suppliers / Vendors',
        'Multi-Stakeholder Initiative': 'Multi-Stakeholder Initiatives',
        'Union': 'Unions',
        OTHER_CONTRIB_TYPE: 'Others',
    }

    EMBED_LEVEL_CHOICES = (
        (1, 'Embed'),
        (2, 'Embed+'),
        (3, 'Embed Deluxe / Custom Embed'),
    )

    admin = models.OneToOneField(
        'User',
        on_delete=models.PROTECT,
        help_text=('The user account responsible for uploading and '
                   'maintaining facility lists for the contributor'))
    name = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        help_text='The full name of the contributor.')
    description = models.TextField(
        null=False,
        blank=True,
        help_text='A detailed description of the contributor.')
    website = models.URLField(
        null=False,
        blank=True,
        help_text='A URL linking to a web site for the contributor.')
    contrib_type = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        choices=CONTRIB_TYPE_CHOICES,
        help_text='The category to which this contributor belongs.')
    other_contrib_type = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='Free text field if selected contributor type is other'
    )
    is_verified = models.BooleanField(
        'verified',
        default=False,
        help_text=(
            'Has this contributor has been verified by OAR staff.'
        ),
    )
    verification_notes = models.TextField(
        null=False,
        blank=True,
        help_text=(
            'A description of the manual steps taken to verify the '
            'contributor.'
        )
    )
    embed_config = models.OneToOneField(
        'EmbedConfig',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text=('The embedded map configuration for the contributor'))
    embed_level = models.IntegerField(
        null=True,
        blank=True,
        choices=EMBED_LEVEL_CHOICES,
        help_text='The embedded map level that is enabled for the contributor')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    @staticmethod
    def post_save(sender, **kwargs):
        instance = kwargs.get('instance')
        f_ids = Facility.objects \
            .filter(facilitylistitem__source__contributor=instance)\
            .values_list('id', flat=True)
        if len(f_ids) > 0:
            index_facilities(f_ids)

    def __str__(self):
        return '{name} ({id})'.format(**self.__dict__)

    @classmethod
    def prefix_with_count(cls, value, count):
        if count == 1:
            if value.lower() == 'other':
                # Special case to avoid returning the awkward "An Other"
                return 'One {}'.format(value)
            return prefix_a_an(value)
        else:
            return '{} {}'.format(
                count, cls.PLURAL_CONTRIB_TYPE.get(value, value))


class User(AbstractBaseUser, PermissionsMixin):
    USERNAME_FIELD = 'email'
    objects = EmailAsUsernameUserManager()

    is_staff = models.BooleanField(
        ('staff status'),
        default=False,
        help_text=('Designates whether the user can log into this site.'),
    )
    is_active = models.BooleanField(
        ('active'),
        default=True,
        help_text=(
            'Designates whether this user should be treated as active. '
            'Unselect this instead of deleting accounts.'
        ),
    )

    email = models.EmailField(
        unique=True,
        null=False,
        blank=False,
        help_text='Unique email address used as a username'
    )
    username = models.CharField(max_length=20, null=True, blank=True)
    should_receive_newsletter = models.BooleanField(
        default=False,
        help_text='User has asked to receive the newsletter'
    )
    has_agreed_to_terms_of_service = models.BooleanField(
        default=False,
        help_text='User has agreed to the terms of service'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email

    def get_full_name(self):
        return self.email

    def get_short_name(self):
        return self.email

    def first_name(self):
        pass

    def last_name(self):
        pass

    @property
    def did_register_and_confirm_email(self):
        try:
            email_address = EmailAddress.objects.get_primary(self.id)

            if email_address:
                return email_address.verified

        # if no EmailAddress record exists, the User was created through the
        # Django admin rather than the UI. Treat this User as verified.
            return True
        except EmailAddress.DoesNotExist:
            return True

    @property
    def can_submit_privately(self):
        return self.groups.filter(
            name=FeatureGroups.CAN_SUBMIT_PRIVATE_FACILITY
        ).exists()

    @property
    def can_view_full_contrib_details(self):
        if self.can_submit_privately:
            return self.groups.filter(
                name=FeatureGroups.CAN_VIEW_FULL_CONTRIB_DETAIL
            ).exists()

        return True


class Source(models.Model):
    LIST = 'LIST'
    SINGLE = 'SINGLE'

    SOURCE_TYPE_CHOICES = (
        (LIST, LIST),
        (SINGLE, SINGLE),
    )

    contributor = models.ForeignKey(
        'Contributor',
        null=True,
        on_delete=models.SET_NULL,
        help_text='The contributor who submitted the facility data'
    )
    source_type = models.CharField(
        null=False,
        max_length=6,
        choices=SOURCE_TYPE_CHOICES,
        help_text='Did the the facility data arrive in a list or a single item'
    )
    facility_list = models.OneToOneField(
        'FacilityList',
        null=True,
        on_delete=models.PROTECT,
        help_text='The related list if the type of the source is LIST.'
    )
    is_active = models.BooleanField(
        null=False,
        default=True,
        help_text=('True if items from the source should be shown as being '
                   'associated with the contributor')
    )
    is_public = models.BooleanField(
        null=False,
        default=True,
        help_text=('True if the public can see factories from this list '
                   'are associated with the contributor.')
    )
    create = models.BooleanField(
        null=False,
        default=True,
        help_text=('Should a facility or facility match be created from the '
                   'facility data')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __init__(self, *args, **kwargs):
        super(Source, self).__init__(*args, **kwargs)
        self.__original_is_active = self.is_active

    def save(self, force_insert=False, force_update=False, *args, **kwargs):
        super(Source, self).save(force_insert, force_update, *args, **kwargs)
        if self.__original_is_active and not self.is_active:
            for item in self.facilitylistitem_set.annotate(
                ppe_product_types_len=ArrayLength('ppe_product_types')
            ).filter(PPEMixin.PPE_FILTER):
                for match in (item.facilitymatch_set
                              .filter(is_active=True)
                              .exclude(status=FacilityMatch.REJECTED)
                              .exclude(status=FacilityMatch.PENDING)):
                    if match.facility.revert_ppe(item):
                        match.facility.save()
        self.__original_is_active = self.is_active

    @property
    def display_name(self):
        name = self.contributor.name \
            if self.contributor else '[Unknown Contributor]'
        if self.facility_list:
            return '{} ({})'.format(name, self.facility_list.name)
        return name

    @staticmethod
    def post_save(sender, **kwargs):
        instance = kwargs.get('instance')
        f_ids = Facility.objects \
                        .filter(facilitylistitem__source=instance) \
                        .values_list('id', flat=True)
        if len(f_ids) > 0:
            index_facilities(f_ids)

    def __str__(self):
        return '{0} ({1})'.format(
            self.display_name, self.id)


class FacilityList(models.Model):
    """
    Metadata for an uploaded list of facilities.
    """
    name = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        help_text='The name of list. Defaults to name of the uploaded file.')
    description = models.TextField(
        null=True,
        blank=True,
        help_text='The description of list.')
    file_name = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        editable=False,
        help_text='The full name of the uploaded file.')
    header = models.TextField(
        null=False,
        blank=False,
        editable=False,
        help_text='The header row of the uploaded CSV.')
    replaces = models.OneToOneField(
        'self',
        null=True,
        blank=True,
        unique=True,
        on_delete=models.PROTECT,
        help_text=('If not null this list is an updated version of the '
                   'list specified by this field.'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        try:
            if self.source.contributor is None:
                return '{0} ({1})'.format(self.name, self.id)

            return '{0} - {1} ({2})'.format(
                self.source.contributor.name, self.name, self.id)
        except Source.DoesNotExist:
            return '{0} [NO SOURCE] ({1})'.format(self.name, self.id)


class PPEMixin(models.Model):
    class Meta:
        abstract = True

    # TODO: #1038 Remove the isnull checks after the fields are made
    # non-null
    PPE_FILTER = (
        (Q(ppe_product_types__isnull=False)
         & Q(ppe_product_types_len__gt=0))
        |
        (Q(ppe_contact_phone__isnull=False)
         & ~Q(ppe_contact_phone=''))
        |
        (Q(ppe_contact_email__isnull=False)
         & ~Q(ppe_contact_email=''))
        |
        (Q(ppe_website__isnull=False)
         & ~Q(ppe_website=''))
    )

    ppe_product_types = postgres.ArrayField(
        models.CharField(
            null=False,
            blank=False,
            max_length=100,
            help_text=('A type of personal protective equipment produced at '
                       'the facility'),
            verbose_name='ppe product type',
        ),
        null=True,
        blank=True,
        help_text=('The types of personal protective equipment produced at '
                   'the facility'),
        verbose_name='ppe product types')
    ppe_contact_email = models.EmailField(
        null=True,
        blank=True,
        verbose_name='ppe contact email',
        help_text='The contact email for PPE-related discussion')
    ppe_contact_phone = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name='ppe contact phone',
        help_text='The contact phone number for PPE-related discussion')
    ppe_website = models.URLField(
        null=True,
        blank=True,
        verbose_name='ppe website',
        help_text='The website for PPE information')

    @property
    def has_ppe_product_types(self):
        return (self.ppe_product_types is not None
                and self.ppe_product_types != [])

    @property
    def has_ppe_contact_phone(self):
        return (self.ppe_contact_phone is not None
                and self.ppe_contact_phone != '')

    @property
    def has_ppe_contact_email(self):
        return (self.ppe_contact_email is not None
                and self.ppe_contact_email != '')

    @property
    def has_ppe_website(self):
        return (self.ppe_website is not None and self.ppe_website != '')


class FacilityListItem(PPEMixin):
    """
    Data, metadata, and workflow status and results for a single line from a
    facility list file.
    """
    UPLOADED = 'UPLOADED'
    PARSED = 'PARSED'
    GEOCODED = 'GEOCODED'
    GEOCODED_NO_RESULTS = 'GEOCODED_NO_RESULTS'
    MATCHED = 'MATCHED'
    POTENTIAL_MATCH = 'POTENTIAL_MATCH'
    CONFIRMED_MATCH = 'CONFIRMED_MATCH'
    ERROR = 'ERROR'
    ERROR_PARSING = 'ERROR_PARSING'
    ERROR_GEOCODING = 'ERROR_GEOCODING'
    ERROR_MATCHING = 'ERROR_MATCHING'
    DELETED = 'DELETED'

    # NEW_FACILITY is a meta status. If the `status` of a `FacilityListItem` is
    # `MATCHED` or `CONFIRMED_MATCH` and the `facility` was `created_from` the
    # `FacilityListItem` then the item represents a new facility.
    NEW_FACILITY = 'NEW_FACILITY'

    # REMOVED is also a meta status. A `FacilityListItem` has been removed if
    # any of its `FacilityMatch`es have `is_active` set to False.
    REMOVED = 'REMOVED'

    # These status choices must be kept in sync with the client's
    # If a new status is added, add supporting styles src/app/src/App.css
    # `facilityListItemStatusChoicesEnum`.
    STATUS_CHOICES = (
        (UPLOADED, UPLOADED),
        (PARSED, PARSED),
        (GEOCODED, GEOCODED),
        (GEOCODED_NO_RESULTS, GEOCODED_NO_RESULTS),
        (MATCHED, MATCHED),
        (POTENTIAL_MATCH, POTENTIAL_MATCH),
        (CONFIRMED_MATCH, CONFIRMED_MATCH),
        (ERROR, ERROR),
        (ERROR_PARSING, ERROR_PARSING),
        (ERROR_GEOCODING, ERROR_GEOCODING),
        (ERROR_MATCHING, ERROR_MATCHING),
        (DELETED, DELETED),
    )

    ERROR_STATUSES = [ERROR, ERROR_PARSING, ERROR_GEOCODING, ERROR_MATCHING]
    COMPLETE_STATUSES = [MATCHED, CONFIRMED_MATCH]

    class Meta:
        indexes = [
            models.Index(fields=['source', 'row_index'],
                         name='api_fli_facility_list_row_idx'),
        ]

    source = models.ForeignKey(
        'Source',
        null=False,
        on_delete=models.PROTECT,
        help_text='The source from which this item was created.'
    )
    row_index = models.IntegerField(
        null=False,
        editable=False,
        help_text='Index of this line in the CSV file.')
    raw_data = models.TextField(
        null=False,
        blank=False,
        help_text='The full, unparsed CSV line as it appeared in the file.')
    status = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        choices=STATUS_CHOICES,
        default=UPLOADED,
        help_text='The current workflow progress of the line item.')
    processing_started_at = models.DateTimeField(
        null=True,
        help_text=('When background processing of this item started. '
                   'Items awaiting processing will have a null value.'))
    processing_completed_at = models.DateTimeField(
        null=True,
        help_text=('When background processing of this item finished. '
                   'Items awaiting or in process will have a null value.'))
    processing_results = postgres.JSONField(
        default=list,
        help_text=('Diagnostic details logged by background processing '
                   'including details returned from the geocoder.'))
    name = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        help_text='The name of the facility taken from the raw data.')
    address = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        help_text='The address of the facility taken from the raw data.')
    country_code = models.CharField(
        max_length=2,
        null=False,
        blank=False,
        choices=COUNTRY_CHOICES,
        help_text=('The ISO 3166-1 alpha-2 country code of the facility taken '
                   'directly from the raw data or looked up based on a full '
                   'country name provided in the raw data.'))
    geocoded_point = gis_models.PointField(
        null=True,
        help_text=('The geocoded location the facility address field taken '
                   'from the raw data.'))
    geocoded_address = models.CharField(
        max_length=1000,
        null=True,
        blank=True,
        help_text='The geocoded address of the facility.')
    facility = models.ForeignKey(
        'Facility',
        null=True,
        on_delete=models.PROTECT,
        help_text=('The facility created from this list item or the '
                   'previously existing facility to which this list '
                   'item was matched.'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return 'FacilityListItem {id} - {status}'.format(**self.__dict__)


class FacilityClaim(models.Model):
    """
    Data submitted from a user attempting to make a verified claim of a
    Facility to be evaluated by OAR moderators.
    """
    EMAIL = 'EMAIL'
    PHONE = 'PHONE'

    PREFERRED_CONTACT_CHOICES = (
        (EMAIL, EMAIL),
        (PHONE, PHONE),
    )

    PENDING = 'PENDING'
    APPROVED = 'APPROVED'
    DENIED = 'DENIED'
    REVOKED = 'REVOKED'

    # These status choices must be kept in sync with the client's
    # `facilityClaimStatusChoicesEnum`.
    STATUS_CHOICES = (
        (PENDING, PENDING),
        (APPROVED, APPROVED),
        (DENIED, DENIED),
        (REVOKED, REVOKED),
    )

    CUT_AND_SEW = 'Cut and Sew / RMG'
    DYEHOUSE = 'Dyehouse'
    EMBELLISHMENTS = 'Embellishments'
    FABRIC_MILL = 'Fabric Mill'
    FINISHING = 'Finishing'
    GINNING = 'Ginning'
    KNITTING = 'Knitting'
    LAUNDRY = 'Laundry'
    PACKING = 'Packing'
    SCOURING = 'Scouring'
    SCREENPRINTING = 'Screenprinting'
    STITCHING = 'Stitching (Shoes)'
    TANNERY = 'Tannery'
    WAREHOUSE = 'Warehouse'
    WEAVING = 'Weaving'
    OTHER = 'Other'

    FACILITY_TYPE_CHOICES = (
        (CUT_AND_SEW, CUT_AND_SEW),
        (DYEHOUSE, DYEHOUSE),
        (EMBELLISHMENTS, EMBELLISHMENTS),
        (FABRIC_MILL, FABRIC_MILL),
        (FINISHING, FINISHING),
        (GINNING, GINNING),
        (KNITTING, KNITTING),
        (LAUNDRY, LAUNDRY),
        (PACKING, PACKING),
        (SCOURING, SCOURING),
        (SCREENPRINTING, SCREENPRINTING),
        (STITCHING, STITCHING),
        (TANNERY, TANNERY),
        (WAREHOUSE, WAREHOUSE),
        (WEAVING, WEAVING),
        (OTHER, OTHER),
    )

    AFFILIATION_CHOICES = [
        (choice, choice)
        for choice in
        [
            Affiliations.BENEFITS_BUSINESS_WORKERS,
            Affiliations.BETTER_MILLS_PROGRAM,
            Affiliations.BETTER_WORK,
            Affiliations.CANOPY,
            Affiliations.ETHICAL_TRADING_INITIATIVE,
            Affiliations.FAIR_LABOR_ASSOCIATION,
            Affiliations.FAIR_WEAR_FOUNDATION,
            Affiliations.HERFINANCE,
            Affiliations.HERHEATH,
            Affiliations.HERRESPECT,
            Affiliations.SEDEX,
            Affiliations.SOCIAL_LABOR_CONVERGENCE_PLAN,
            Affiliations.SUSTAINABLE_APPAREL_COALITION,
            Affiliations.SWEATFREE_PURCHASING_CONSORTIUM,
            Affiliations.ZDHC,
        ]
    ]

    CERTIFICATION_CHOICES = [
        (choice, choice)
        for choice in
        [
            Certifications.BCI,
            Certifications.B_CORP,
            Certifications.BLUESIGN,
            Certifications.CANOPY,
            Certifications.CRADLE_TO_CRADLE,
            Certifications.EU_ECOLABEL,
            Certifications.FAIRTRADE_USA,
            Certifications.FSC,
            Certifications.GLOBAL_RECYCLING_STANDARD,
            Certifications.GOTS,
            Certifications.GREEN_BUTTON,
            Certifications.GREEN_SCREEN,
            Certifications.HIGG_INDEX,
            Certifications.IMO_CONTROL,
            Certifications.INTERNATIONAL_WOOL_TEXTILE,
            Certifications.ISO_9000,
            Certifications.IVN_LEATHER,
            Certifications.LEATHER_WORKING_GROUP,
            Certifications.NORDIC_SWAN,
            Certifications.OEKO_TEX_STANDARD,
            Certifications.OEKO_TEX_STEP,
            Certifications.OEKO_TEX_ECO_PASSPORT,
            Certifications.OEKO_TEX_MADE_IN_GREEN,
            Certifications.PEFC,
            Certifications.REACH,
            Certifications.RESPONSIBLE_DOWN_STANDARD,
            Certifications.RESPONSIBLE_WOOL_STANDARD,
            Certifications.SAB8000,
        ]
    ]

    contributor = models.ForeignKey(
        'Contributor',
        null=False,
        on_delete=models.PROTECT,
        help_text='The contributor who submitted this facility claim')
    facility = models.ForeignKey(
        'Facility',
        null=False,
        on_delete=models.PROTECT,
        help_text='The facility for which this claim has been submitted')
    contact_person = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        verbose_name='contact person',
        help_text='The contact person for the facility claim')
    job_title = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        help_text='The contact person\'s job title',
        verbose_name='contact person\'s job title',
        default='')
    email = models.EmailField(
        null=False,
        blank=False,
        verbose_name='email',
        help_text='The contact email for the facility claim')
    phone_number = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        verbose_name='phone number',
        help_text='The contact phone number for the facility claim')
    company_name = models.CharField(
        max_length=200,
        null=False,
        blank=True,
        verbose_name='company name',
        help_text='The company name for the facility')
    website = models.CharField(
        max_length=200,
        null=False,
        blank=True,
        verbose_name='website',
        help_text='The website for the facility')
    facility_description = models.TextField(
        null=False,
        blank=False,
        verbose_name='description',
        help_text='A description of the facility')
    linkedin_profile = models.URLField(
        null=False,
        blank=True,
        help_text='A LinkedIn profile for verifying the facility claim',
        verbose_name='verification LinkedIn profile')
    verification_method = models.TextField(
        null=False,
        blank=True,
        verbose_name='verification method',
        help_text='An explanation of how the facility can be verified')
    preferred_contact_method = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        choices=PREFERRED_CONTACT_CHOICES,
        verbose_name='preferred contact method',
        help_text='The preferred contact method: email or phone')
    status = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        choices=STATUS_CHOICES,
        default=PENDING,
        verbose_name='status',
        help_text='The current status of this facility claim')
    status_change_reason = models.TextField(
        null=True,
        blank=True,
        verbose_name='status change reason',
        help_text='The reason entered when changing the status of this claim.')
    status_change_by = models.ForeignKey(
        'User',
        null=True,
        on_delete=models.PROTECT,
        verbose_name='status changed by',
        help_text='The user who changed the status of this facility claim',
        related_name='approver_of_claim')
    status_change_date = models.DateTimeField(
        null=True,
        verbose_name='status change date',
    )
    facility_name_english = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The editable official English facility name for the claim.',
        verbose_name='facility name in English')
    facility_name_native_language = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The editable official native language facility name.',
        verbose_name='facility name in native language')
    facility_address = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        verbose_name='address',
        help_text='The editable facility address for this claim.')
    facility_phone_number = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        verbose_name='facility phone number',
        help_text='The editable facility phone number for this claim.')
    facility_phone_number_publicly_visible = models.BooleanField(
        null=False,
        default=False,
        verbose_name='is facility phone number publicly visible',
        help_text='Is the editable facility phone number publicly visible?')
    facility_website = models.URLField(
        null=True,
        blank=True,
        verbose_name='facility website',
        help_text='The editable facility website for this claim.')
    facility_website_publicly_visible = models.BooleanField(
        null=False,
        default=False,
        help_text='Is the website publicly visible?',
        verbose_name='facility website visible')
    facility_minimum_order_quantity = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        verbose_name='minimum order quantity',
        help_text='The editable facility min order quantity for this claim.')
    facility_average_lead_time = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        verbose_name='average lead time',
        help_text='The editable facilty avg lead time for this claim.')
    facility_workers_count = models.IntegerField(
        null=True,
        blank=True,
        help_text='The editable facility workers count for this claim.',
        verbose_name='facility workers count')
    facility_female_workers_percentage = models.IntegerField(
        null=True,
        blank=True,
        choices=[(i, i) for i in range(0, 101)],
        help_text=('Integer value indicating the facility\'s percentage of '
                   'female workers.'),
        verbose_name='percentage of female workers')
    facility_affiliations = postgres.ArrayField(
        models.CharField(
            null=False,
            blank=False,
            choices=AFFILIATION_CHOICES,
            max_length=50,
            help_text='A group the facility is affiliated with',
            verbose_name='facility affiliation',
        ),
        null=True,
        blank=True,
        help_text='The facility\'s affiliations',
        verbose_name='facility affilations',
    )
    facility_certifications = postgres.ArrayField(
        models.CharField(
            null=False,
            blank=False,
            choices=CERTIFICATION_CHOICES,
            max_length=50,
            help_text='A certification the facility has achieved',
            verbose_name='facility certification',
        ),
        null=True,
        blank=True,
        help_text='The facility\'s certifications',
        verbose_name='facility certifications',
    )
    facility_type = models.CharField(
        max_length=len(CUT_AND_SEW),
        null=True,
        blank=True,
        choices=FACILITY_TYPE_CHOICES,
        help_text='The editable facility type for this claim.',
        verbose_name='facility type')
    other_facility_type = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='Editable alternate text when facility type is OTHER.',
        verbose_name='description of other facility type')
    facility_product_types = postgres.ArrayField(
        models.CharField(
            null=False,
            blank=False,
            max_length=50,
            help_text='A product produced at the facility',
            verbose_name='product type',
        ),
        null=True,
        blank=True,
        help_text='The products produced at the facility',
        verbose_name='product types',
    )
    facility_production_types = postgres.ArrayField(
        models.CharField(
            null=False,
            blank=False,
            max_length=50,
            help_text='A production type associated with the facility',
            verbose_name='production type',
        ),
        null=True,
        blank=True,
        help_text='The production types associated with the facility',
        verbose_name='production types',
    )
    point_of_contact_person_name = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        verbose_name='contact person',
        help_text='The editable point of contact person name')
    point_of_contact_email = models.EmailField(
        null=True,
        blank=True,
        verbose_name='contact email',
        help_text='The editable point of contact email')
    point_of_contact_publicly_visible = models.BooleanField(
        null=False,
        default=False,
        verbose_name='is contact visible',
        help_text='Is the point of contact info publicly visible?')
    office_official_name = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        verbose_name='office official name',
        help_text='The editable office name for this claim.')
    office_address = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        verbose_name='office address',
        help_text='The editable office address for this claim.')
    office_country_code = models.CharField(
        max_length=2,
        null=True,
        blank=True,
        choices=COUNTRY_CHOICES,
        verbose_name='office country code',
        help_text='The editable office country code for this claim.')
    office_phone_number = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        verbose_name='office phone number',
        help_text='The editable office phone number for this claim.')
    office_info_publicly_visible = models.BooleanField(
        null=False,
        default=False,
        verbose_name='is office publicly visible',
        help_text='Is the office info publicly visible?')
    parent_company = models.ForeignKey(
        'Contributor',
        related_name='parent_company',
        null=True,
        default=None,
        on_delete=models.PROTECT,
        verbose_name='parent company / supplier group',
        help_text='The parent company / supplier group of this '
        'facility claim.')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    default_change_includes = (
        'facility_name_english',
        'facility_name_native_language',
        'facility_address',
        'facility_phone_number',
        'facility_website',
        'facility_minimum_order_quantity',
        'facility_average_lead_time',
        'facility_workers_count',
        'facility_female_workers_percentage',
        'facility_affiliations',
        'facility_certifications',
        'facility_product_types',
        'facility_production_types',
        'facility_type',
        'other_facility_type',
        'facility_description',
        'facility_minimum_order_quantity',
        'facility_average_lead_time',
        'point_of_contact_person_name',
        'point_of_contact_email',
        'office_official_name',
        'office_address',
        'office_country_code',
        'office_phone_number',
        'parent_company',
    )

    # A dictionary where the keys are field names and the values are predicate
    # functions that will be passed a FacilityClaim instance and should return
    # a boolean.
    change_conditions = defaultdict(
        lambda: lambda c: True,
        facility_phone_number=(
            lambda c: c.facility_phone_number_publicly_visible),
        facility_website=(
            lambda c: c.facility_website_publicly_visible),
        point_of_contact_person_name=(
            lambda c: c.point_of_contact_publicly_visible),
        point_of_contact_email=(
            lambda c: c.point_of_contact_publicly_visible),
        office_official_name=(
            lambda c: c.office_info_publicly_visible),
        office_address=(
            lambda c: c.office_info_publicly_visible),
        office_country_code=(
            lambda c: c.office_info_publicly_visible),
        office_phone_number=(
            lambda c: c.office_info_publicly_visible),
    )

    # A dictionary where the keys are field_names and the values are functions
    # that will be passed a FacilityClaim and should return a string
    change_value_serializers = defaultdict(
        lambda: lambda v: v,
        parent_company=lambda v: v and v.name,
        facility_affiliations=lambda v: ', '.join(v) if v is not None else '',
        facility_certifications=lambda v: ', '.join(v)
        if v is not None else '',
        facility_product_types=lambda v: ', '.join(v)
        if v is not None else '',
        facility_production_types=lambda v: ', '.join(v)
        if v is not None else '',
    )

    def get_changes(self, include=list(default_change_includes)):
        latest = self.history.latest()
        previous = latest.prev_record
        changes = None
        if previous is not None:
            for field in FacilityClaim._meta.fields:
                should_report_change_publicly = \
                    self.change_conditions[field.name](self)
                if field.name in include and should_report_change_publicly:
                    curr_value = self.change_value_serializers[field.name](
                        getattr(self, field.name))
                    prev_value = self.change_value_serializers[field.name](
                        getattr(previous.instance, field.name))
                    if curr_value != prev_value:
                        if changes is None:
                            changes = []
                        changes.append({
                            'name': field.name,
                            'verbose_name': field.verbose_name,
                            'previous': prev_value,
                            'current': curr_value,
                        })
        return changes


class FacilityClaimReviewNote(models.Model):
    """
    A note entered by an administrator when reviewing a FacilityClaim.
    """

    claim = models.ForeignKey(
        'FacilityClaim',
        null=False,
        on_delete=models.PROTECT,
        help_text='The facility claim for this note'
    )
    author = models.ForeignKey(
        'User',
        null=False,
        on_delete=models.PROTECT,
        help_text='The author of the facility claim review note')
    note = models.TextField(
        null=False,
        blank=False,
        help_text='The review note')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()


class FacilityManager(models.Manager):
    def filter_by_query_params(self, params):
        """
        Create a Facility queryset filtered by a list of request query params.

        Arguments:
        self (queryset) -- A queryset on the Facility model
        params (dict) -- Request query parameters whose potential choices are
                        enumerated in `api.constants.FacilitiesQueryParams`.

        Returns:
        A queryset on the Facility model
        """

        free_text_query = params.get(FacilitiesQueryParams.Q, None)

        name = params.get(FacilitiesQueryParams.NAME, None)

        contributors = params.getlist(FacilitiesQueryParams.CONTRIBUTORS)

        lists = params.getlist(FacilitiesQueryParams.LISTS)

        contributor_types = params \
            .getlist(FacilitiesQueryParams.CONTRIBUTOR_TYPES)

        countries = params.getlist(FacilitiesQueryParams.COUNTRIES)

        combine_contributors = params.get(
            FacilitiesQueryParams.COMBINE_CONTRIBUTORS, '')

        boundary = params.get(
            FacilitiesQueryParams.BOUNDARY, None
        )

        # The `ppe` query argument is defined as an optional boolean at the
        # swagger level which is the built in field type option that most
        # closely matches our desired behavior. Our intended use of the
        # argument is conditionally "switch on" a special section of filter
        # logic. To support that behavior we consider a missing value or any
        # value than the string "true" to be `False`.
        ppe = (True if params.get(FacilitiesQueryParams.PPE, '') == 'true'
               else False)

        facilities_qs = FacilityIndex.objects.all()

        if free_text_query is not None:
            if switch_is_active('ppe'):
                facilities_qs = facilities_qs \
                    .filter(Q(name__icontains=free_text_query) |
                            Q(id__icontains=free_text_query) |
                            Q(ppe__icontains=free_text_query))
            else:
                facilities_qs = facilities_qs \
                    .filter(Q(name__icontains=free_text_query) |
                            Q(id__icontains=free_text_query))

        # `name` is deprecated in favor of `q`. We keep `name` available for
        # backward compatibility.
        if name is not None:
            facilities_qs = facilities_qs.filter(Q(name__icontains=name) |
                                                 Q(id__icontains=name))

        if countries is not None and len(countries):
            facilities_qs = facilities_qs \
                .filter(country_code__in=countries)

        if len(contributor_types):
            facilities_qs = facilities_qs \
                .filter(contrib_types__overlap=contributor_types)

        if len(contributors):
            if combine_contributors.upper() == 'AND':
                facilities_qs = facilities_qs.filter(
                    contributors__contains=contributors)
            else:
                facilities_qs = facilities_qs.filter(
                    contributors__overlap=contributors)

        if len(lists):
            facilities_qs = facilities_qs.filter(lists__overlap=lists)

        if boundary is not None:
            facilities_qs = facilities_qs.filter(
                location__within=GEOSGeometry(boundary)
            )

        if ppe:
            # Include a facility if any of the PPE fields have a non-empty
            # value.
            facilities_qs = facilities_qs.filter(~Q(ppe=''))

        facility_ids = facilities_qs.values_list('id', flat=True)
        facilities_qs = Facility.objects.filter(id__in=facility_ids)

        print(facilities_qs.query)
        return facilities_qs


class Facility(PPEMixin):
    """
    An official OAR facility. Search results are returned from this table.
    """
    class Meta:
        verbose_name_plural = "facilities"

    id = models.CharField(
        max_length=32,
        primary_key=True,
        editable=False,
        help_text='The OAR ID of a facility.')
    name = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        help_text='The name of the facility.')
    address = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        help_text='The full street address of the facility.')
    country_code = models.CharField(
        max_length=2,
        null=False,
        blank=False,
        choices=COUNTRY_CHOICES,
        help_text='The ISO 3166-1 alpha-2 country code of the facility.')
    location = gis_models.PointField(
        null=False,
        help_text='The lat/lng point location of the facility')
    created_from = models.OneToOneField(
        'FacilityListItem',
        null=False,
        on_delete=models.PROTECT,
        related_name='created_facility',
        help_text=('The original uploaded list item from which this facility '
                   'was created.'))
    is_closed = models.BooleanField(
        null=True,
        help_text=('Whether this facility is closed.')
    )
    new_oar_id = models.CharField(
        max_length=32,
        null=True,
        help_text=('The new OAR ID where this facility can be found if it has'
                   'been moved.'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    history = HistoricalRecords()
    objects = FacilityManager()

    def __str__(self):
        return '{name} ({id})'.format(**self.__dict__)

    def save(self, *args, **kwargs):
        if self.id == '':
            new_id = None
            while new_id is None:
                new_id = make_oar_id(self.country_code)
                if Facility.objects.filter(id=new_id).exists():
                    new_id = None
            self.id = new_id
        super(Facility, self).save(*args, **kwargs)

    def other_names(self):
        facility_list_item_matches = [
            FacilityListItem.objects.get(pk=pk)
            for (pk,)
            in self
            .facilitymatch_set
            .filter(status__in=[FacilityMatch.AUTOMATIC,
                                FacilityMatch.CONFIRMED,
                                FacilityMatch.MERGED])
            .filter(is_active=True)
            .values_list('facility_list_item')
        ]

        return {
            item.name
            for item
            in facility_list_item_matches
            if len(item.name) != 0
            and item.name is not None
            and item.name != self.name
            and item.source.is_active
            and item.source.is_public
        }

    def other_addresses(self):
        facility_list_item_matches = [
            FacilityListItem.objects.get(pk=pk)
            for (pk,)
            in self
            .facilitymatch_set
            .filter(status__in=[FacilityMatch.AUTOMATIC,
                                FacilityMatch.CONFIRMED,
                                FacilityMatch.MERGED])
            .filter(is_active=True)
            .values_list('facility_list_item')
        ]

        return {
            match.address
            for match
            in facility_list_item_matches
            if len(match.address) != 0
            and match.address is not None
            and match.address != self.address
            and match.source.is_active
            and match.source.is_public
        }

    def complete_matches(self):
        return self \
            .facilitymatch_set \
            .filter(status__in=[FacilityMatch.AUTOMATIC,
                                FacilityMatch.CONFIRMED,
                                FacilityMatch.MERGED])

    def sources(self, user=None):
        sorted_matches = sorted(
            self.complete_matches()
                .exclude(facility_list_item__source__contributor=None)
                .prefetch_related(
                    'facility_list_item__source__contributor'
                ),
            key=lambda m: m.source.contributor.id
        )

        if user is not None and not user.is_anonymous:
            user_can_see_detail = user.can_view_full_contrib_details
        else:
            user_can_see_detail = True

        sources = []
        anonymous_sources = []
        for contributor, matches in groupby(sorted_matches,
                                            lambda m: m.source.contributor):
            # Convert the groupby result to a list to we can iterate over it
            # multiple times
            matches = list(matches)
            should_display_associations = \
                any([m.should_display_association for m in matches])
            if user_can_see_detail and should_display_associations:
                sources.extend(
                    [m.source
                     for m in matches
                     if m.should_display_association])
            else:
                anonymous_sources.append(contributor.contrib_type)

        anonymous_sources = [
            Contributor.prefix_with_count(name, len(list(x)))
            for name, x in groupby(sorted(anonymous_sources))
        ]
        return sources + anonymous_sources

    def get_created_from_match(self):
        return self.facilitymatch_set.filter(
            facility_list_item=self.created_from
        ).first()

    def get_other_matches(self):
        return self.facilitymatch_set.exclude(
            facility_list_item=self.created_from
        ).all().order_by('id')

    def get_approved_claim(self):
        return self.facilityclaim_set.filter(
            status=FacilityClaim.APPROVED).count() > 0

    def conditionally_set_ppe(self, item):
        """
        Copy PPE fields from the specified item if they are empty. `item` can
        be either a `Facility` or a `FacilityListItem` because they both
        inherit from `PPEMixin`. Returns True if any update to the model was
        made.
        """
        should_update_ppe_product_types = \
            item.has_ppe_product_types and not self.has_ppe_product_types
        if (should_update_ppe_product_types):
            self.ppe_product_types = item.ppe_product_types

        should_update_ppe_contact_phone = \
            item.has_ppe_contact_phone and not self.has_ppe_contact_phone
        if (should_update_ppe_contact_phone):
            self.ppe_contact_phone = item.ppe_contact_phone

        should_update_ppe_contact_email = \
            item.has_ppe_contact_email and not self.has_ppe_contact_email
        if (should_update_ppe_contact_email):
            self.ppe_contact_email = item.ppe_contact_email

        should_update_ppe_website = \
            item.has_ppe_website and not self.has_ppe_website
        if (should_update_ppe_website):
            self.ppe_website = item.ppe_website

        return (
            should_update_ppe_website
            or should_update_ppe_contact_phone
            or should_update_ppe_contact_email
            or should_update_ppe_website)

    def revert_ppe(self, item):
        """
        If the specified item has PPE data either:
        - Restore the PPE data on the Facility to the values copied from the
          original line item that created the facility.
        - If the facility created the item, clear the PPE fields.
        Return True if any update to the model was made.
        """
        if item == self.created_from:
            self.ppe_product_types = []
            self.ppe_contact_phone = ''
            self.ppe_contact_email = ''
            self.ppe_website = ''
        else:
            if item.has_ppe_product_types:
                self.ppe_product_types = self.created_from.ppe_product_types
            if item.has_ppe_contact_phone:
                self.ppe_contact_phone = self.created_from.ppe_contact_phone
            if item.has_ppe_contact_email:
                self.ppe_contact_email = self.created_from.ppe_contact_email
            if item.has_ppe_website:
                self.ppe_website = self.created_from.ppe_website

        return (item.has_ppe_website
                or item.has_ppe_contact_phone
                or item.has_ppe_contact_email
                or item.has_ppe_website)

    def current_tile_cache_key():
        timestamp = format(
            Facility.objects.latest('updated_at').updated_at,
            'U',
        )

        try:
            tile_version = Version \
                .objects \
                .get(name='tile_version') \
                .version
        except Version.DoesNotExist:
            tile_version = 0

        return '{}-{}'.format(timestamp, tile_version)

    def activity_reports(self):
        return FacilityActivityReport.objects \
                    .filter(facility=self.id,
                            status__in=[FacilityActivityReport.PENDING,
                                        FacilityActivityReport.CONFIRMED]) \
                    .order_by('-created_at')

    @staticmethod
    def post_save(sender, **kwargs):
        instance = kwargs.get('instance')
        index_facilities([instance.id])


class FacilityIndex(models.Model):
    """
    Stores denormalized indexes for the facility's name, id, country_code,
    location, contrib_types, contributors, ppe_product_types, and lists
    """
    id = models.CharField(
        max_length=32,
        primary_key=True,
        editable=False,
        db_index=True,
        help_text='The OAR ID of a facility.')
    name = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        db_index=True,
        help_text='The name of the facility.')
    country_code = models.CharField(
        max_length=2,
        null=False,
        blank=False,
        db_index=True,
        choices=COUNTRY_CHOICES,
        help_text='The ISO 3166-1 alpha-2 country code of the facility.')
    location = gis_models.PointField(
        null=False,
        db_index=True,
        help_text='The lat/lng point location of the facility')
    contrib_types = postgres.ArrayField(models.CharField(
        max_length=200,
        null=True,
        blank=False,
        choices=Contributor.CONTRIB_TYPE_CHOICES,
        help_text='The categories to which the contributors belong.'))
    contributors = postgres.ArrayField(models.IntegerField(
        null=True,
        help_text='The contributor who submitted the facility data.'))
    ppe = models.TextField(
            null=True,
            help_text=('A type of personal protective equipment produced at '
                       'the facility'),
            verbose_name='ppe product type')
    lists = postgres.ArrayField(models.IntegerField(
        null=True,
        editable=False,
        help_text='The related list if the type of the source is LIST.'))

    class Meta:
        indexes = [GinIndex(fields=['contrib_types', 'contributors', 'lists'])]


class FacilityMatch(models.Model):
    """
    Matches between existing facilities and uploaded facility list items.
    """
    class Meta:
        verbose_name_plural = "facility matches"

    PENDING = 'PENDING'
    AUTOMATIC = 'AUTOMATIC'
    CONFIRMED = 'CONFIRMED'
    REJECTED = 'REJECTED'
    MERGED = 'MERGED'

    # These values must stay in sync with the `facilityMatchStatusChoicesEnum`
    # in the client's constants.js file.
    STATUS_CHOICES = (
        (PENDING, PENDING),
        (AUTOMATIC, AUTOMATIC),
        (CONFIRMED, CONFIRMED),
        (REJECTED, REJECTED),
        (MERGED, MERGED),
    )

    facility_list_item = models.ForeignKey(
        'FacilityListItem',
        on_delete=models.PROTECT,
        help_text='The list item being matched to an existing facility.')
    facility = models.ForeignKey(
        'Facility',
        on_delete=models.PROTECT,
        help_text=('The existing facility that may match an uploaded list '
                   'item.'))
    results = postgres.JSONField(
        help_text='Diagnostic details from the matching process.')
    confidence = models.DecimalField(
        null=False,
        max_digits=5,
        decimal_places=2,
        default=0.0,
        help_text=('A numeric representation of how confident the app is that '
                   'the list item matches the existing facility. Larger '
                   'numbers are better.'))
    status = models.CharField(
        null=False,
        max_length=9,
        choices=STATUS_CHOICES,
        default=PENDING,
        help_text=('The current status of the match. AUTOMATIC if the '
                   'application made a match with high confidence. PENDING '
                   'if confirmation from the contributor admin is required. '
                   'CONFIRMED if the admin approves the match. REJECTED if '
                   'the admin rejects the match. Only one row for a given '
                   'and facility list item pair should have either AUTOMATIC '
                   'or CONFIRMED status'))
    is_active = models.BooleanField(
        null=False,
        default=True,
        help_text=('A facility match is_active if its associated list item '
                   'not been removed; when a list item is removed, this '
                   'field will be set to False.')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    def __init__(self, *args, **kwargs):
        super(FacilityMatch, self).__init__(*args, **kwargs)
        self.__original_is_active = self.is_active

    def save(self, force_insert=False, force_update=False, *args, **kwargs):
        super(FacilityMatch, self).save(
            force_insert, force_update, *args, **kwargs)

        if self.__original_is_active and not self.is_active:
            if self.facility.revert_ppe(self.facility_list_item):
                self.facility.save()

        self.__original_is_active = self.is_active

    @property
    def source(self):
        return self.facility_list_item.source

    @property
    def should_display_association(self):
        return (self.is_active
                and self.facility_list_item.source.is_active
                and self.facility_list_item.source.is_public)

    @staticmethod
    def post_save(sender, **kwargs):
        instance = kwargs.get('instance')
        index_facilities([instance.facility.id])

    def __str__(self):
        return '{0} - {1} - {2}'.format(self.facility_list_item, self.facility,
                                        self.status)


class FacilityAlias(models.Model):
    """
    Links the OAR ID of a no longer existing Facility to another Facility
    """
    class Meta:
        verbose_name_plural = "facility aliases"

    MERGE = 'MERGE'
    DELETE = 'DELETE'

    REASON_CHOICES = (
        (MERGE, MERGE),
        (DELETE, DELETE),
    )

    oar_id = models.CharField(
        max_length=32,
        primary_key=True,
        editable=False,
        help_text=('The OAR ID of a no longer existent Facility which should '
                   'be redirected to a different Facility.'))
    facility = models.ForeignKey(
        'Facility',
        null=False,
        on_delete=models.PROTECT,
        help_text='The facility now associated with the oar_id'
    )
    reason = models.CharField(
        null=False,
        max_length=6,
        choices=REASON_CHOICES,
        help_text='The reason why this alias was created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    def __str__(self):
        return '{} -> {}'.format(self.oar_id, self.facility)


class RequestLog(models.Model):
    """
    Logs non-webapp API requests by User
    """
    user = models.ForeignKey(
        'User',
        null=False,
        on_delete=models.CASCADE,
        help_text='The User account that made the request'
    )
    token = models.CharField(
        max_length=40,
        null=False,
        db_index=True,
        help_text='The API token used to make the request'
    )
    method = models.CharField(
        max_length=6,
        null=False,
        blank=False,
        help_text='The HTTP verb used to make the request'
    )
    path = models.CharField(
        max_length=2083,
        null=False,
        help_text='The requested resource path'
    )
    response_code = models.IntegerField(
        null=True,
        help_text='The HTTP status code returned to the requester'
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return '{} - {} - {} {} {} ({})'.format(
            self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            self.user.email,
            self.method,
            self.path,
            self.response_code,
            self.id)


class ProductType(models.Model):
    value = models.CharField(
        primary_key=True,
        max_length=50,
        null=False,
        blank=False,
        help_text='A suggested value for product type'
    )


class ProductionType(models.Model):
    value = models.CharField(
        primary_key=True,
        max_length=50,
        null=False,
        blank=False,
        help_text='A suggested value for production type'
    )


class DownloadLog(models.Model):
    """
    Log CSV download requests from the web client
    """
    user = models.ForeignKey(
        'User',
        null=False,
        on_delete=models.CASCADE,
        help_text='The User account that made the request'
    )
    path = models.CharField(
        max_length=2083,
        null=False,
        help_text='The requested resource path'
    )
    record_count = models.IntegerField(
        null=False,
        help_text='The number of records in the downloaded file'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class FacilityLocation(models.Model):
    """
    """
    facility = models.ForeignKey(
        'Facility',
        null=False,
        on_delete=models.CASCADE,
        help_text='The Facility on which the location is changing'
    )
    location = gis_models.PointField(
        null=False,
        help_text='The corrected lat/lng point location of the facility')
    notes = models.TextField(
        null=False,
        blank=True,
        help_text='Details regarding the location change process')
    created_by = models.ForeignKey(
        'User',
        null=False,
        on_delete=models.PROTECT,
        help_text='The superuser that submitted the new location'
    )
    contributor = models.ForeignKey(
        'Contributor',
        null=True,
        on_delete=models.PROTECT,
        help_text=('An optional reference to the contributor who submitted '
                   'the new location')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ApiLimit(models.Model):
    """
    Stores the number of requests a Contributor can make monthly.
    """
    contributor = models.OneToOneField(
        'Contributor',
        null=False,
        on_delete=models.CASCADE,
        help_text='The contributor to whom the limit applies.'
    )
    yearly_limit = models.PositiveIntegerField(
        null=False,
        blank=False,
        help_text='The number of requests a contributor can make per year.')
    period_start_date = models.DateTimeField(
        null=False,
        default=timezone.now,
        help_text='The date when the contract began.')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    def __str__(self):
        return 'ApiLimit {} - {} ({}) - limit {}'.format(
            self.id, self.contributor.name, self.contributor.id,
            self.yearly_limit)


class ApiBlock(models.Model):
    """
    Stores information regarding api blocks incurred by users.
    """
    contributor = models.ForeignKey(
        'Contributor',
        null=False,
        on_delete=models.CASCADE,
        help_text='The contributor to whom the block applies.'
    )
    until = models.DateTimeField(
        null=False,
        help_text='The time until which the block is enforced.'
    )
    active = models.BooleanField(
        default=True,
        help_text='Whether or not the block should restrict access.'
    )
    limit = models.PositiveIntegerField(
        null=False,
        blank=False,
        help_text='The limit value that was exceeded.')
    actual = models.PositiveIntegerField(
        null=False,
        blank=False,
        help_text='The count that exceeded the limit.')
    grace_limit = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='An ad-hoc increase in the limit.')
    grace_created_by = models.ForeignKey(
        'User',
        null=True,
        on_delete=models.SET_NULL,
        help_text='The person who set the grace_limit.')
    grace_reason = models.TextField(
        null=True,
        blank=True,
        help_text=(
            'For moderators to explain the interactions that led '
            'to the grace being granted.'))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    def __str__(self):
        return ('ApiBlock {id} - Contributor {contributor_id} until '
                '{until}').format(**self.__dict__)


class ContributorNotifications(models.Model):
    """
    Records notifications sent to contributors.
    """
    contributor = models.OneToOneField(
        'Contributor',
        null=False,
        on_delete=models.CASCADE,
        help_text='The contributor to whom the notification was sent.'
    )
    api_limit_warning_sent_on = models.DateTimeField(
        null=True,
        help_text='When a limit warning was sent to the contributor.')
    api_limit_exceeded_sent_on = models.DateTimeField(
        null=True,
        help_text='When a limit exceeded notice was sent to the contributor.')
    api_grace_limit_exceeded_sent_on = models.DateTimeField(
        null=True,
        help_text=('When a grace limit exceeded notice was sent '
                   'to the contributor.'))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    def __str__(self):
        return ('ContributorNotification {id} - Contributor {contributor_id} '
                'Warning: {api_limit_warning_sent_on}, '
                'Exceeded: {api_limit_exceeded_sent_on}, '
                'Grace exceeded: {api_grace_limit_exceeded_sent_on} '
                ).format(**self.__dict__)


class FacilityActivityReport(models.Model):
    """
    Report a facility as closed or reopened.
    """
    OPEN = 'OPEN'
    CLOSED = 'CLOSED'
    CLOSURE_STATES = ((OPEN, OPEN), (CLOSED, CLOSED))

    PENDING = 'PENDING'
    CONFIRMED = 'CONFIRMED'
    REJECTED = 'REJECTED'
    STATUS_CHOICES = (
        (PENDING, PENDING),
        (CONFIRMED, CONFIRMED),
        (REJECTED, REJECTED))

    facility = models.ForeignKey(
        'Facility',
        null=False,
        on_delete=models.CASCADE,
        help_text='The facility to which this report applies.'
    )
    reported_by_user = models.ForeignKey(
        'User',
        null=False,
        on_delete=models.PROTECT,
        verbose_name='reported by user',
        help_text='The user who reported the change.',
        related_name='reporter_of_activity'
    )
    reported_by_contributor = models.ForeignKey(
        'Contributor',
        null=False,
        on_delete=models.PROTECT,
        verbose_name='reported by contributor',
        help_text='The contributor who reported the change.'
    )
    reason_for_report = models.TextField(
        null=True,
        blank=True,
        verbose_name='reason for report',
        help_text=('The reason for requesting this status change.'))
    closure_state = models.CharField(
        max_length=6,
        null=False,
        blank=False,
        choices=CLOSURE_STATES,
        verbose_name='closure state',
        help_text='Whether the facility is open or closed.')
    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the report was approved, if applicable.')
    status = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        choices=STATUS_CHOICES,
        default=PENDING,
        help_text='The current status of the report.')
    status_change_reason = models.TextField(
        null=True,
        blank=True,
        verbose_name='status change reason',
        help_text=('The reason entered when changing '
                   'the status of this report.'))
    status_change_by = models.ForeignKey(
        'User',
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        verbose_name='status changed by',
        help_text='The user who changed the status of this report',
        related_name='changer_of_status')
    status_change_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='status change date',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    def __str__(self):
        return ('FacilityActivityReport {id} - Facility {facility_id}, '
                'Closure State: {closure_state}, '
                'Status: {status} '
                ).format(**self.__dict__)


class EmbedConfig(models.Model):
    """
    Configuration data for an embedded map
    """

    width = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        default='600',
        help_text='The width of the embedded map.')
    height = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        default='400',
        help_text='The height of the embedded map.')
    color = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The color of the embedded map.')
    font = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The font of the embedded map.')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return ('EmbedConfig {id}, '
                'Size: {width} x {height} '
                ).format(**self.__dict__)


class EmbedField(models.Model):
    """
    Data fields to include on facilities in an embedded map
    """
    class Meta:
        unique_together = ('embed_config', 'order')

    embed_config = models.ForeignKey(
        'EmbedConfig',
        null=False,
        on_delete=models.CASCADE,
        help_text='The embedded map configuration which uses this field'
    )
    column_name = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        help_text='The column name of the field.')
    display_name = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        help_text='The name to display for the field.')
    visible = models.BooleanField(
        default=False,
        help_text='Whether or not to display this field.'
    )
    order = models.IntegerField(
        null=False,
        blank=False,
        help_text='The sort order of the field.')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (
            'Column Name {column_name} - Order: {order} ').format(
            **self.__dict__)


class NonstandardField(models.Model):
    """
    Nonstandard data fields available to include on facilities in an
    embedded map
    """
    class Meta:
        unique_together = ('contributor', 'column_name')

    # Keys in this set must be kept in sync with
    # defaultNonstandardFieldLabels in app/src/app/util/embeddedMap.js
    DEFAULT_FIELDS = {
        'parent_company': 'Parent Company',
        'type_of_product': 'Type of Product',
        'number_of_workers': 'Number of Workers',
        'type_of_facility': 'Type of Facility',
    }

    contributor = models.ForeignKey(
        'Contributor',
        null=False,
        on_delete=models.CASCADE,
        help_text='The contributor who submitted this field'
    )
    column_name = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        help_text='The column name of the field.')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (
            'Contributor ID: {contributor_id} - ' +
            'Column Name: {column_name}').format(**self.__dict__)


@transaction.atomic
def index_facilities(facility_ids=list):
    # If passed an empty array, create or update all existing facilities
    if len(facility_ids) == 0:
        print('Indexing all facilities...')
        facility_ids = Facility.objects.all().values_list('id', flat=True)

    contrib_type = 'facility_list_item__source__contributor__contrib_type'
    contributor = 'facility_list_item__source__contributor'
    list = 'facility_list_item__source__facility_list_id'
    filter = (Q(is_active=True)
              & Q(status__in=[FacilityMatch.AUTOMATIC,
                              FacilityMatch.CONFIRMED,
                              FacilityMatch.MERGED])
              & Q(facility_list_item__source__is_active=True)
              & Q(facility_list_item__source__is_public=True))

    # Create a list of dictionaries in the structure of FacilityIndexes
    data = FacilityMatch.objects \
                        .filter(facility_id__in=facility_ids) \
                        .annotate(name=F('facility__name'),
                                  country_code=F('facility__country_code'),
                                  location=F('facility__location')) \
                        .values('name', 'country_code', 'location') \
                        .annotate(contrib_types=ArrayAgg(
                                    contrib_type,
                                    filter=filter),
                                  contributors=ArrayAgg(
                                    contributor,
                                    filter=filter),
                                  lists=ArrayAgg(
                                    list,
                                    filter=filter),
                                  id=F('facility_id'),
                                  ppe=Concat('facility__ppe_product_types',
                                             'facility__ppe_contact_phone',
                                             'facility__ppe_contact_email',
                                             'facility__ppe_website',
                                             output_field=CharField()))

    FacilityIndex.objects.filter(id__in=facility_ids).delete()
    FacilityIndex.objects.bulk_create([FacilityIndex(**kv) for kv in data])


post_save.connect(Facility.post_save, sender=Facility)
post_save.connect(Source.post_save, sender=Source)
post_save.connect(FacilityMatch.post_save, sender=FacilityMatch)
post_save.connect(Contributor.post_save, sender=Contributor)
