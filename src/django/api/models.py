from django.contrib.auth.models import (AbstractBaseUser,
                                        BaseUserManager,
                                        PermissionsMixin)
from django.contrib.gis.db import models as gis_models
from django.contrib.postgres import fields as postgres
from django.db import models
from allauth.account.models import EmailAddress
from simple_history.models import HistoricalRecords

from api.countries import COUNTRY_CHOICES
from api.oar_id import make_oar_id


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
        ('Auditor', 'Auditor'),
        ('Brand/Retailer', 'Brand/Retailer'),
        ('Civil Society Organization', 'Civil Society Organization'),
        ('Factory / Facility', 'Factory / Facility'),
        ('Manufacturing Group / Supplier / Vendor',
         'Manufacturing Group / Supplier / Vendor'),
        ('Multi Stakeholder Initiative', 'Multi Stakeholder Initiative'),
        ('Researcher / Academic', 'Researcher / Academic'),
        ('Service Provider', 'Service Provider'),
        ('Union', 'Union'),
        (OTHER_CONTRIB_TYPE, OTHER_CONTRIB_TYPE),
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    def __str__(self):
        return '{name} ({id})'.format(**self.__dict__)


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


class FacilityList(models.Model):
    """
    Metadata for an uploaded list of facilities.
    """
    contributor = models.ForeignKey(
        'Contributor',
        null=True,
        on_delete=models.SET_NULL,
        help_text='The contributor that uploaded this list.')
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
    is_active = models.BooleanField(
        null=False,
        default=True,
        help_text=('True if this list is current and has not been replaced '
                   'by another list'))
    is_public = models.BooleanField(
        null=False,
        default=True,
        help_text=('True if the public can see factories from this list '
                   'are associated with the contributor.'))
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
        return '{0} - {1} ({2})'.format(
            self.contributor.name, self.name, self.id)


class FacilityListItem(models.Model):
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

    # These status choices must be kept in sync with the client's
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

    class Meta:
        indexes = [
            models.Index(fields=['facility_list', 'row_index'],
                         name='api_fli_facility_list_row_idx'),
        ]

    facility_list = models.ForeignKey(
        'FacilityList',
        on_delete=models.CASCADE,
        help_text='The list that this line item is a part of.')
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
        help_text='The contact person for the facility claim')
    email = models.EmailField(
        null=False,
        blank=False,
        help_text='The contact email for the facility claim')
    phone_number = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        help_text='The contact phone number for the facility claim')
    company_name = models.CharField(
        max_length=200,
        null=False,
        blank=True,
        help_text='The company name for the facility')
    website = models.CharField(
        max_length=200,
        null=False,
        blank=True,
        help_text='The website for the facility')
    facility_description = models.TextField(
        null=False,
        blank=True,
        help_text='A description of the facility')
    verification_method = models.TextField(
        null=False,
        blank=True,
        help_text='An explanation of how the facility can be verified')
    preferred_contact_method = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        choices=PREFERRED_CONTACT_CHOICES,
        help_text='The preferred contact method: email or phone')
    status = models.CharField(
        max_length=200,
        null=False,
        blank=False,
        choices=STATUS_CHOICES,
        default=PENDING,
        help_text='The current status of this facility claim')
    status_change_reason = models.TextField(
        null=True,
        blank=True,
        help_text='The reason entered when changing the status of this claim.')
    status_change_by = models.ForeignKey(
        'User',
        null=True,
        on_delete=models.PROTECT,
        help_text='The user who changed the status of this facility claim',
        related_name='approver_of_claim')
    status_change_date = models.DateTimeField(null=True)
    facility_name = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The editable facility name for this claim.')
    facility_address = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The editable facility address for this claim.')
    facility_phone_number = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The editable facility phone number for this claim.')
    facility_phone_number_publicly_visible = models.BooleanField(
        null=False,
        default=False,
        help_text='Is the editable facility phone number publicly visible?')
    facility_website = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The editable facility website for this claim.')
    facility_minimum_order_quantity = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The editable facility min order quantity for this claim.')
    facility_average_lead_time = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The editable facilty avg lead time for this claim.')
    point_of_contact_person_name = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The editable point of contact person name')
    point_of_contact_email = models.EmailField(
        null=True,
        blank=True,
        help_text='The editable point of contact email')
    point_of_contact_publicly_visible = models.BooleanField(
        null=False,
        default=False,
        help_text='Is the point of contact info publicly visible?')
    office_official_name = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The editable office name for this claim.')
    office_address = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The editable office address for this claim.')
    office_country_code = models.CharField(
        max_length=2,
        null=True,
        blank=True,
        choices=COUNTRY_CHOICES,
        help_text='The editable office country code for this claim.')
    office_phone_number = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text='The editable office phone number for this claim.')
    office_info_publicly_visible = models.BooleanField(
        null=False,
        default=False,
        help_text='Is the office info publicly visible?')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()


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


class Facility(models.Model):
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

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
                                FacilityMatch.CONFIRMED])
            .values_list('facility_list_item')
        ]

        return {
            match.name
            for match
            in facility_list_item_matches
            if len(match.name) != 0
            and match.name is not None
            and match.name != self.name
            and match.facility_list.is_active
            and match.facility_list.is_public
        }

    def other_addresses(self):
        facility_list_item_matches = [
            FacilityListItem.objects.get(pk=pk)
            for (pk,)
            in self
            .facilitymatch_set
            .filter(status__in=[FacilityMatch.AUTOMATIC,
                                FacilityMatch.CONFIRMED])
            .values_list('facility_list_item')
        ]

        return {
            match.address
            for match
            in facility_list_item_matches
            if len(match.address) != 0
            and match.address is not None
            and match.address != self.address
            and match.facility_list.is_active
            and match.facility_list.is_public
        }

    def contributors(self):
        facility_list_item_matches = [
            FacilityListItem.objects.get(pk=pk)
            for (pk,)
            in self
            .facilitymatch_set
            .filter(status__in=[FacilityMatch.AUTOMATIC,
                                FacilityMatch.CONFIRMED])
            .order_by('updated_at')
            .values_list('facility_list_item')
        ]

        return [
            match.facility_list
            for match
            in facility_list_item_matches
            if match.facility_list.is_active
            and match.facility_list.is_public
            and match.facility_list.contributor is not None
        ]

    def get_created_from_match(self):
        return self.facilitymatch_set.filter(
            facility_list_item=self.created_from
        ).first()

    def get_other_matches(self):
        return self.facilitymatch_set.exclude(
            facility_list_item=self.created_from
        ).all()

    def get_approved_claim(self):
        return self.facilityclaim_set.filter(
            status=FacilityClaim.APPROVED).count() > 0


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

    # These values must stay in sync with the `facilityMatchStatusChoicesEnum`
    # in the client's constants.js file.
    STATUS_CHOICES = (
        (PENDING, PENDING),
        (AUTOMATIC, AUTOMATIC),
        (CONFIRMED, CONFIRMED),
        (REJECTED, REJECTED),
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    def __str__(self):
        return '{0} - {1} - {2}'.format(self.facility_list_item, self.facility,
                                        self.status)


class FacilityAlias(models.Model):
    """
    Links the OAR ID of a no longer existing Facility to another Facility
    """
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

    def __str__(self):
        return '{} -> {}'.format(self.oar_id, self.facility)
