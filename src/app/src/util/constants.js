import includes from 'lodash/includes';
import { checkWhetherUserHasDashboardAccess } from './util';

export const OTHER = 'Other';

export const FACILITIES_REQUEST_PAGE_SIZE = 50;

export const WEB_HEADER_HEIGHT = '80px';
export const MOBILE_HEADER_HEIGHT = '68px';

export const InfoLink = 'https://info.openapparel.org';

export const InfoPaths = {
    home: '',
    gettingStarted: 'getting-started',
    dataTechnology: 'data-technology',
    api: 'api',
    embeddedMap: 'embedded-map',
    faqs: 'faqs',
    aboutUs: 'about-us',
    funding: 'funding',
    press: 'press',
    workWithUs: 'work-with-us',
    contactUs: 'contact-us',
    storiesResources: 'stories-resources',
    privacyPolicy: 'privacy-policy',
    termsOfUse: 'terms-of-use',
    contribute: 'stories-resources/how-to-contribute-data-to-the-oar',
    dataQuality: 'how-the-oar-improves-data-quality',
    claimedFacilities: 'stories-resources/claim-a-facility',
};

// This choices must be kept in sync with the identical list
// kept in the Django API's models.py file
export const contributorTypeOptions = Object.freeze([
    'Academic / Researcher / Journalist / Student',
    'Auditor / Certification Scheme / Service Provider',
    'Brand / Retailer',
    'Civil Society Organization',
    'Facility / Factory / Manufacturing Group / Supplier / Vendor',
    'Multi-Stakeholder Initiative',
    'Union',
    OTHER,
]);

// These choices must be kept in sync with the identical list
// kept in the Django API's models.py file
export const facilityClaimStatusChoicesEnum = Object.freeze({
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    DENIED: 'DENIED',
    REVOKED: 'REVOKED',
});

export const inputTypesEnum = Object.freeze({
    text: 'text',
    password: 'password',
    select: 'select',
    checkbox: 'checkbox',
});

export const registrationFieldsEnum = Object.freeze({
    email: 'email',
    name: 'name',
    description: 'description',
    website: 'website',
    contributorType: 'contributorType',
    otherContributorType: 'otherContributorType',
    password: 'password',
    confirmPassword: 'confirmPassword',
    tos: 'tos',
    newsletter: 'newsletter',
});

export const profileFieldsEnum = Object.freeze({
    [registrationFieldsEnum.email]: registrationFieldsEnum.email,
    [registrationFieldsEnum.name]: registrationFieldsEnum.name,
    [registrationFieldsEnum.description]: registrationFieldsEnum.description,
    [registrationFieldsEnum.wesbite]: registrationFieldsEnum.website,
    [registrationFieldsEnum.contributorType]:
        registrationFieldsEnum.contributorType,
    [registrationFieldsEnum.otherContributorType]:
        registrationFieldsEnum.otherContributorType,
    currentPassword: 'currentPassword',
    newPassword: 'newPassword',
    confirmNewPassword: 'confirmNewPassword',
});

export const profileSummaryFieldsEnum = Object.freeze({
    facilityLists: 'facilityLists',
});

const accountEmailField = Object.freeze({
    id: registrationFieldsEnum.email,
    label: 'Email Address',
    type: inputTypesEnum.text,
    required: true,
    hint: null,
    modelFieldName: 'email',
    hideOnViewOnlyProfile: true,
});

const accountNameField = Object.freeze({
    id: registrationFieldsEnum.name,
    label: 'Contributor Name',
    type: inputTypesEnum.text,
    required: true,
    hint: `If you are uploading a supplier list on behalf of the organisation
you work for, you should add the organisation name here, not your personal name.
Your contributor name will appear publicly on all facilities that you upload as
the data source for each facility contributed.`,
    modelFieldName: 'name',
});

const accountDescriptionField = Object.freeze({
    id: registrationFieldsEnum.description,
    label: 'Contributor Description',
    type: inputTypesEnum.text,
    required: true,
    hint: `Enter a description of the contributor. This will appear in your
public contributor profile.`,
    modelFieldName: 'description',
});

const accountWebsiteField = Object.freeze({
    id: registrationFieldsEnum.website,
    label: 'Website (Optional)',
    type: inputTypesEnum.text,
    required: false,
    hint: null,
    modelFieldName: 'website',
});

const accountContributorTypeField = Object.freeze({
    id: registrationFieldsEnum.contributorType,
    label: 'Contributor Type',
    type: inputTypesEnum.select,
    options: contributorTypeOptions,
    required: true,
    modelFieldName: 'contributor_type',
});

const accountOtherContributorTypeField = Object.freeze({
    id: registrationFieldsEnum.otherContributorType,
    label: 'Other Contributor Type',
    type: inputTypesEnum.text,
    required: true,
    hint: 'Please specify',
    modelFieldName: 'other_contributor_type',
});

const accountPasswordField = Object.freeze({
    id: registrationFieldsEnum.password,
    label: 'Password',
    type: inputTypesEnum.password,
    required: true,
    modelFieldName: 'password',
    hideOnViewOnlyProfile: true,
});

const accountConfirmPasswordField = Object.freeze({
    id: registrationFieldsEnum.confirmPassword,
    label: 'Confirm Password',
    type: inputTypesEnum.password,
    required: true,
    modelFieldName: 'confirmPassword',
});

const accountCurrentPasswordField = Object.freeze({
    id: profileFieldsEnum.currentPassword,
    label: 'Current Password',
    header:
        'If you do not need to change your password leave these three password fields empty.',
    type: inputTypesEnum.password,
    modelFieldName: 'current_password',
    hideOnViewOnlyProfile: true,
    required: false,
});

const accountNewPasswordField = Object.freeze({
    id: profileFieldsEnum.newPassword,
    label: 'New Password',
    type: inputTypesEnum.password,
    modelFieldName: 'new_password',
    hideOnViewOnlyProfile: true,
    required: false,
});

const accountConfirmNewPasswordField = Object.freeze({
    id: profileFieldsEnum.confirmNewPassword,
    label: 'Confirm New Password',
    type: inputTypesEnum.password,
    modelFieldName: 'confirm_new_password',
    hideOnViewOnlyProfile: true,
    required: false,
});

const accountNewsletterField = Object.freeze({
    id: registrationFieldsEnum.newsletter,
    label:
        "I'd like to receive important email updates about OAR features and data.",
    modelFieldName: 'should_receive_newsletter',
    type: inputTypesEnum.checkbox,
});

const accountTOSField = Object.freeze({
    id: registrationFieldsEnum.tos,
    label: 'Terms of Service',
    link: Object.freeze({
        prefixText: 'Agree to ',
        url: `${InfoLink}/${InfoPaths.termsOfUse}`,
    }),
    required: true,
    modelFieldName: 'has_agreed_to_terms_of_service',
    type: inputTypesEnum.checkbox,
});

export const registrationFormFields = Object.freeze([
    accountEmailField,
    accountNameField,
    accountDescriptionField,
    accountWebsiteField,
    accountContributorTypeField,
    accountOtherContributorTypeField,
    accountPasswordField,
    accountConfirmPasswordField,
    accountNewsletterField,
    accountTOSField,
]);

export const profileFormFields = Object.freeze([
    accountEmailField,
    accountNameField,
    accountDescriptionField,
    accountContributorTypeField,
    accountOtherContributorTypeField,
    accountWebsiteField,
    accountCurrentPasswordField,
    accountNewPasswordField,
    accountConfirmNewPasswordField,
]);

export const mainRoute = '/';
export const settingsRoute = '/settings';
export const authLoginFormRoute = '/auth/login';
export const authRegisterFormRoute = '/auth/register';
export const authResetPasswordFormRoute = '/auth/resetpassword/:uid';
export const authConfirmRegistrationRoute = '/auth/confirm/:uid';
export const contributeRoute = '/contribute';
export const listsRoute = '/lists';
export const facilityListItemsRoute = '/lists/:listID';
export const facilitiesRoute = '/facilities';
export const facilityDetailsRoute = '/facilities/:oarID';
export const claimFacilityRoute = '/facilities/:oarID/claim';
export const profileRoute = '/profile/:id';
export const aboutProcessingRoute = `${InfoLink}/${InfoPaths.dataQuality}`;
export const dashboardRoute = '/dashboard';
export const dashboardListsRoute = '/dashboard/lists';
export const dashboardApiBlocksRoute = '/dashboard/apiblocks';
export const dashboardApiBlockRoute = '/dashboard/apiblocks/:blockId';
export const dashboardClaimsRoute = '/dashboard/claims';
export const dashboardDeleteFacilityRoute = '/dashboard/deletefacility';
export const dashboardMergeFacilitiesRoute = '/dashboard/mergefacilities';
export const dashboardAdjustFacilityMatchesRoute =
    '/dashboard/adjustfacilitymatches';
export const dashboardUpdateFacilityLocationRoute =
    '/dashboard/updatefacilitylocation';
export const dashboardActivityReportsRoute = '/dashboard/activityreports';
export const dashboardLinkOarIdRoute = '/dashboard/linkid';
export const dashboardGeocoderRoute = '/dashboard/geocoder';
export const claimedFacilitiesRoute = '/claimed';
export const claimedFacilitiesDetailRoute = '/claimed/:claimID';
export const dashboardClaimsDetailsRoute = '/dashboard/claims/:claimID';
export const aboutClaimedFacilitiesRoute = `${InfoLink}/${InfoPaths.claimedFacilities}`;

export const contributeFieldsEnum = Object.freeze({
    name: 'name',
    description: 'description',
});

export const contributeFileName = Object.freeze({
    id: contributeFieldsEnum.name,
    label: 'Enter the name for this facility list',
    hint: "example: 'Alpha Brand Facility List June 2021'",
    type: inputTypesEnum.text,
    placeholder: 'Facility List Name',
});

export const contributeFileDescription = Object.freeze({
    id: contributeFieldsEnum.description,
    label: `Enter a description of this facility list and include a timeframe
for the list's validity`,
    hint: `example: 'This is the Alpha Brand list of suppliers for their apparel products valid from June 2021 to Sept 2021'`,
    type: inputTypesEnum.text,
    placeholder: 'Facility List Description',
});

export const contributeFormFields = Object.freeze([
    contributeFileName,
    contributeFileDescription,
]);

export const contributeReplacesNoneSelectionID = -1;

export const filterSidebarTabsEnum = Object.freeze({
    guide: 'guide',
    search: 'search',
    facilities: 'facilities',
});

export const filterSidebarTabs = Object.freeze([
    Object.freeze({
        tab: filterSidebarTabsEnum.guide,
        label: 'Guide',
    }),
    Object.freeze({
        tab: filterSidebarTabsEnum.facilities,
        label: 'Facilities',
    }),
    Object.freeze({
        tab: filterSidebarTabsEnum.search,
        label: 'Search',
    }),
]);

// These values must be kept in sync with the tuple of STATUS_CHOICES
// declared on the API's FacilityListItem model. See:
// https://github.com/open-apparel-registry/open-apparel-registry/blob/a6e68960d3e1c547c7c2c1935fd28fde6108e3c6/src/django/api/models.py#L224

export const facilityListItemStatusChoicesEnum = Object.freeze({
    UPLOADED: 'UPLOADED',
    PARSED: 'PARSED',
    GEOCODED: 'GEOCODED',
    GEOCODED_NO_RESULTS: 'GEOCODED_NO_RESULTS',
    MATCHED: 'MATCHED',
    POTENTIAL_MATCH: 'POTENTIAL_MATCH',
    CONFIRMED_MATCH: 'CONFIRMED_MATCH',
    NEW_FACILITY: 'NEW_FACILITY', // This is not a status that appears in the database
    ERROR: 'ERROR',
    ERROR_PARSING: 'ERROR_PARSING',
    ERROR_GEOCODING: 'ERROR_GEOCODING',
    ERROR_MATCHING: 'ERROR_MATCHING',
    DELETED: 'DELETED',
    REMOVED: 'REMOVED', // This is not a status that appears in the database
});

export const facilityListItemErrorStatuses = Object.freeze([
    facilityListItemStatusChoicesEnum.ERROR,
    facilityListItemStatusChoicesEnum.ERROR_PARSING,
    facilityListItemStatusChoicesEnum.ERROR_GEOCODING,
    facilityListItemStatusChoicesEnum.ERROR_MATCHING,
]);

export const facilityListStatusFilterChoices = Object.freeze([
    {
        label: facilityListItemStatusChoicesEnum.UPLOADED,
        value: facilityListItemStatusChoicesEnum.UPLOADED,
    },
    {
        label: facilityListItemStatusChoicesEnum.PARSED,
        value: facilityListItemStatusChoicesEnum.PARSED,
    },
    {
        label: facilityListItemStatusChoicesEnum.GEOCODED,
        value: facilityListItemStatusChoicesEnum.GEOCODED,
    },
    {
        label: facilityListItemStatusChoicesEnum.GEOCODED_NO_RESULTS,
        value: facilityListItemStatusChoicesEnum.GEOCODED_NO_RESULTS,
    },
    {
        label: facilityListItemStatusChoicesEnum.MATCHED,
        value: facilityListItemStatusChoicesEnum.MATCHED,
    },
    {
        label: facilityListItemStatusChoicesEnum.POTENTIAL_MATCH,
        value: facilityListItemStatusChoicesEnum.POTENTIAL_MATCH,
    },
    {
        label: facilityListItemStatusChoicesEnum.CONFIRMED_MATCH,
        value: facilityListItemStatusChoicesEnum.CONFIRMED_MATCH,
    },
    {
        label: facilityListItemStatusChoicesEnum.NEW_FACILITY,
        value: facilityListItemStatusChoicesEnum.NEW_FACILITY,
    },
    {
        label: facilityListItemStatusChoicesEnum.ERROR,
        value: facilityListItemStatusChoicesEnum.ERROR,
    },
    {
        label: facilityListItemStatusChoicesEnum.ERROR_PARSING,
        value: facilityListItemStatusChoicesEnum.ERROR_PARSING,
    },
    {
        label: facilityListItemStatusChoicesEnum.ERROR_GEOCODING,
        value: facilityListItemStatusChoicesEnum.ERROR_GEOCODING,
    },
    {
        label: facilityListItemStatusChoicesEnum.ERROR_MATCHING,
        value: facilityListItemStatusChoicesEnum.ERROR_MATCHING,
    },
    {
        label: facilityListItemStatusChoicesEnum.DELETED,
        value: facilityListItemStatusChoicesEnum.DELETED,
    },
    {
        label: facilityListItemStatusChoicesEnum.REMOVED,
        value: facilityListItemStatusChoicesEnum.REMOVED,
    },
]);

export const facilityListSummaryStatusMessages = Object.freeze({
    ERROR: 'Some items failed to be processed.',
    AWAITING: 'Some potential matches require your feedback.',
    PROCESSING: 'The list is still being processed.',
    COMPLETED: 'This list has been processed successfully.',
});

export const DEFAULT_PAGE = 1;
export const DEFAULT_ROWS_PER_PAGE = 20;
export const rowsPerPageOptions = Object.freeze([
    DEFAULT_ROWS_PER_PAGE,
    50,
    100,
]);

export const FEATURE = 'Feature';
export const POINT = 'Point';
export const FEATURE_COLLECTION = 'FeatureCollection';

// These values must be kept in sync with the tuple of STATUS_CHOICES
// declared on the API's FacilityMatch model.
export const facilityMatchStatusChoicesEnum = Object.freeze({
    PENDING: 'PENDING',
    AUTOMATIC: 'AUTOMATIC',
    CONFIRMED: 'CONFIRMED',
    REJECTED: 'REJECTED',
    MERGED: 'MERGED',
});

export const emptyFeatureCollection = Object.freeze({
    type: FEATURE_COLLECTION,
    features: Object.freeze([]),
});

export const ENTER_KEY = 'Enter';

export const facilitiesListTableTooltipTitles = Object.freeze({
    total: 'Total number of items in this list.',
    uploaded: 'Number of items that have been uploaded but not yet processed.',
    parsed:
        'Number of items that have had their addresses parsed but have not yet been geocoded.',
    geocoded: 'Number of items that have been geocoded but not yet matched.',
    matched:
        'Number of items that have been matched with an existing facility or created a new facility.',
    error: 'Number of items that have encountered errors during processing',
    potentialMatch:
        'Number of items with potential matches to confirm or reject.',
    deleted: 'Number of items where the related facility has been deleted.',
});

export const CLAIM_A_FACILITY = 'claim_a_facility';
export const VECTOR_TILE = 'vector_tile';
export const PPE = 'ppe';
export const REPORT_A_FACILITY = 'report_a_facility';
export const EMBEDDED_MAP_FLAG = 'embedded_map';
export const EXTENDED_PROFILE_FLAG = 'extended_profile';
export const DEFAULT_SEARCH_TEXT = 'Facility Name or OAR ID';

export const COUNTRY_CODES = Object.freeze({
    default: 'IE',
    china: 'CN',
});

export const claimAFacilityFormFields = Object.freeze({
    contactName: Object.freeze({
        id: 'contact-full-name',
        label: 'Contact person full name',
    }),
    contactEmail: Object.freeze({
        id: 'contact-email-address',
        label: 'Email',
    }),
    contactPhone: Object.freeze({
        id: 'contact-phone-number',
        label: 'Phone number',
    }),
    contactJobTitle: Object.freeze({
        id: 'contact-job-title',
        label: 'Job title',
    }),
    companyName: Object.freeze({
        id: 'company-name',
        label: 'Official name of LLC or company registered',
    }),
    parentCompany: Object.freeze({
        id: 'parent-company',
        label: 'Parent company / supplier group',
        aside: `If you cannot find the parent company / supplier group
        in this list consider inviting them to register with the Open Apparel
        Registry.`,
    }),
    website: Object.freeze({
        id: 'website',
        label: 'Facility website',
    }),
    facilityDescription: Object.freeze({
        id: 'facility-description',
        label: 'Facility bio/description',
    }),
    verificationMethod: Object.freeze({
        id: 'verification-method',
        label: 'Any additional details?',
    }),
    preferredContactMethod: Object.freeze({
        id: 'preferred-contact',
        label: 'Preferred method of contact',
    }),
    linkedinProfile: Object.freeze({
        id: 'linkedin-profile',
        label: 'LinkedIn profile URL',
    }),
});

export const claimAFacilityPreferredContactOptions = Object.freeze([
    Object.freeze({
        value: 'email',
        label: 'Email',
    }),
    Object.freeze({
        value: 'phone',
        label: 'Phone',
    }),
]);

export const GRID_COLOR_RAMP = Object.freeze([
    [0, '#009EE6'],
    [10, '#0086D8'],
    [40, '#0256BE'],
    [160, '#0427A4'],
]);

export const PPE_FIELD_NAMES = Object.freeze([
    'ppe_product_types',
    'ppe_contact_phone',
    'ppe_contact_email',
    'ppe_website',
]);

export const OARFont = "'DM Sans',sans-serif";
export const OARColor = '#0427a4';

// A CSS size value that is used to set a lower bound on the iframe height
// when the width is set to 100%
export const minimum100PercentWidthEmbedHeight = '500px';

export const EmbeddedMapInfoLink = `${InfoLink}/${InfoPaths.embeddedMap}`;

export const SubmenuLinks = {
    'How It Works': [
        {
            url: InfoPaths.home,
            text: 'Home',
            external: true,
        },
        {
            url: InfoPaths.gettingStarted,
            text: 'Getting Started',
            external: true,
        },
        {
            url: InfoPaths.dataTechnology,
            text: 'Data & Technology',
            external: true,
        },
        { url: InfoPaths.api, text: 'API', external: true },
        {
            url: InfoPaths.embeddedMap,
            text: 'Embedded Map',
            external: true,
        },
        { url: InfoPaths.faqs, text: 'FAQs', external: true },
    ],
    'About Us': [
        { url: InfoPaths.aboutUs, text: 'About Us', external: true },
        { url: InfoPaths.funding, text: 'Funding', external: true },
        { url: InfoPaths.press, text: 'Press', external: true },
        {
            url: InfoPaths.workWithUs,
            text: 'Work With Us',
            external: true,
        },
        { url: InfoPaths.contactUs, text: 'Contact Us', external: true },
    ],
    More: [
        {
            text: 'Cookie Preferences',
            button: true,
        },
        {
            url: InfoPaths.privacyPolicy,
            text: 'Privacy policy',
            external: true,
        },
        {
            url: InfoPaths.termsOfUse,
            text: 'Terms of use',
            external: true,
        },
    ],
};

export const FooterLinks = [
    {
        href: 'https://www.azavea.com/',
        prefix: 'Built by ',
        text: 'Azavea',
        external: true,
        newTab: true,
    },
    {
        text: 'Cookie Preferences',
        button: true,
    },
    {
        href: `${InfoLink}/${InfoPaths.contactUs}`,
        text: 'Contact us',
        external: true,
        newTab: true,
    },
    {
        href: `${InfoLink}/${InfoPaths.workWithUs}`,
        text: 'Work with us',
        external: true,
        newTab: true,
    },
    {
        href: `${InfoLink}/${InfoPaths.faqs}`,
        text: 'FAQs',
        external: true,
        newTab: true,
    },
    {
        href: `${InfoLink}/${InfoPaths.privacyPolicy}`,
        text: 'Privacy policy',
        external: true,
        newTab: true,
    },
    {
        href: `${InfoLink}/${InfoPaths.termsOfUse}`,
        text: 'Terms of use',
        external: true,
        newTab: true,
    },
];

export const createUserDropdownLinks = (
    user,
    logoutAction,
    activeFeatureFlags,
) => {
    const dashboardLink = checkWhetherUserHasDashboardAccess(user)
        ? Object.freeze([
              Object.freeze({
                  text: 'Dashboard',
                  url: dashboardRoute,
                  type: 'link',
              }),
          ])
        : [];

    const claimedFacilityLinks = includes(activeFeatureFlags, CLAIM_A_FACILITY)
        ? Object.freeze([
              Object.freeze({
                  text: 'My Facilities',
                  url: '/claimed',
                  type: 'link',
              }),
          ])
        : [];

    const userLinks = Object.freeze([
        Object.freeze({
            text: 'My Lists',
            url: '/lists',
            type: 'link',
        }),
        Object.freeze({
            text: 'Settings',
            url: '/settings',
            type: 'link',
        }),
    ]);

    const logoutLinks = Object.freeze([
        Object.freeze({
            text: 'Log Out',
            type: 'button',
            action: logoutAction,
        }),
    ]);

    return dashboardLink
        .concat(claimedFacilityLinks)
        .concat(userLinks)
        .concat(logoutLinks);
};

export const facilitySidebarActions = {
    SUGGEST_AN_EDIT: 'Suggest an edit',
    REPORT_AS_DUPLICATE: 'Report as duplicate',
    REPORT_AS_CLOSED: 'Report as closed',
    REPORT_AS_REOPENED: 'Report as reopened',
    DISPUTE_CLAIM: 'Dispute claim',
    CLAIM_FACILITY: 'Claim this facility',
    VIEW_ON_OAR: 'View on the Open Apparel Registry',
};

export const EXTENDED_FIELD_TYPES = [
    {
        label: 'Parent Company',
        fieldName: 'parent_company',
        formatValue: v => v.contributor_name || v.name || v.raw_value,
    },
    {
        label: 'Processing Type',
        fieldName: 'processing_type',
        formatValue: v => {
            const rawValues = Array.isArray(v.raw_values)
                ? v.raw_values
                : v.raw_values.toString().split('|');
            return v.matched_values.map((val, i) =>
                val[3] !== null ? val[3] : rawValues[i],
            );
        },
    },
    {
        label: 'Facility Type',
        fieldName: 'facility_type',
        formatValue: v => {
            const rawValues = Array.isArray(v.raw_values)
                ? v.raw_values
                : v.raw_values.toString().split('|');
            return v.matched_values.map((val, i) =>
                val[2] !== null ? val[2] : rawValues[i],
            );
        },
    },
    {
        label: 'Product Type',
        fieldName: 'product_type',
        formatValue: v => v.raw_values,
    },
    {
        label: 'Number of Workers',
        fieldName: 'number_of_workers',
        formatValue: ({ min, max }) =>
            max === min ? `${max} workers` : `${min}-${max} workers`,
    },
    {
        label: 'Native Language Name',
        fieldName: 'native_language_name',
        formatValue: v => v,
    },
];

export const SILVER_MAP_STYLE = [
    {
        elementType: 'geometry',
        stylers: [
            {
                color: '#f5f5f5',
            },
        ],
    },
    {
        elementType: 'labels.icon',
        stylers: [
            {
                visibility: 'off',
            },
        ],
    },
    {
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#616161',
            },
        ],
    },
    {
        elementType: 'labels.text.stroke',
        stylers: [
            {
                color: '#f5f5f5',
            },
        ],
    },
    {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#bdbdbd',
            },
        ],
    },
    {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
            {
                color: '#eeeeee',
            },
        ],
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#757575',
            },
        ],
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [
            {
                color: '#e5e5e5',
            },
        ],
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#9e9e9e',
            },
        ],
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
            {
                color: '#ffffff',
            },
        ],
    },
    {
        featureType: 'road.arterial',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#757575',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [
            {
                color: '#dadada',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#616161',
            },
        ],
    },
    {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#9e9e9e',
            },
        ],
    },
    {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [
            {
                color: '#e5e5e5',
            },
        ],
    },
    {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [
            {
                color: '#eeeeee',
            },
        ],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
            {
                color: '#c9c9c9',
            },
        ],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#9e9e9e',
            },
        ],
    },
];
