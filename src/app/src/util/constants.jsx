import React from 'react';
import includes from 'lodash/includes';
import { checkWhetherUserHasDashboardAccess } from './util';

export const OTHER = 'Other';

export const FACILITIES_REQUEST_PAGE_SIZE = 50;
export const FACILITIES_DOWNLOAD_DEFAULT_LIMIT = 10000;
export const FACILITIES_DOWNLOAD_REQUEST_PAGE_SIZE = 10;

export const WEB_HEADER_HEIGHT = '160px';
export const MOBILE_HEADER_HEIGHT = '140px';
export const GOOGLE_TRANSLATE_BAR_HEIGHT = '44px';

export const InfoLink = 'https://info.opensupplyhub.org';

export const InfoPaths = {
    storiesResources: 'stories-resources',
    privacyPolicy: 'privacy-policy',
    contribute: 'resources/preparing-data',
    dataQuality: 'resources/a-free-universal-id-matching-algorithm',
    claimedFacilities: 'stories-resources/claim-a-facility',
    termsOfUse: 'terms-of-use',

    // How It Works
    home: '',
    faqs: 'faqs',
    brands: 'brands',
    civilSociety: 'civil-society',
    facilities: 'facilities',
    multiStakeholderInitiatives: 'msis',
    researchers: 'researchers',
    serviceProviders: 'service-providers',
    sectors: 'sectors',
    technology: 'technology',
    developerResources: 'developer-resources',
    api: 'api',
    embeddedMap: 'embedded-map',
    donate: 'donate',

    // About Us
    mission: 'mission',
    supporters: 'supporters',
    press: 'press',
    financials: 'financials',
    governanceAndPolicies: 'governance-policies',
    team: 'team',
    boardOfDirectors: 'board',
    workWithUs: 'work-with-us',
    contactUs: 'contact-us',

    // Other
    resources: 'resources',

    // Footer
    termsOfService: 'terms-of-use',
    mediaHub: 'media-hub',
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

export const facilityListStatusChoicesEnum = Object.freeze({
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    MATCHED: 'MATCHED',
});
export const facilityListStatusChoices = [
    { value: facilityListStatusChoicesEnum.MATCHED, label: 'Matched' },
    { value: facilityListStatusChoicesEnum.PENDING, label: 'Pending' },
    { value: facilityListStatusChoicesEnum.APPROVED, label: 'Approved' },
    { value: facilityListStatusChoicesEnum.REJECTED, label: 'Rejected' },
];

// These choices must be kept in sync with the identical list
// kept in the Django API's constants.py file
export const matchResponsibilityEnum = Object.freeze({
    MODERATOR: 'moderator',
    CONTRIBUTOR: 'contributor',
});
export const matchResponsibilityChoices = [
    { value: 'moderator', label: 'OS Hub Admins' },
    { value: 'contributor', label: 'The contributor' },
];

// These choices must be kept in sync with the identical list
// kept in the Django API's models.py file
export const contributorWebhookNotificationChoices = [
    { value: 'ALL_FACILITIES', label: 'All events' },
    { value: 'ASSOCIATED', label: 'Events for associated facilities' },
];

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
    label: 'Organization Name',
    type: inputTypesEnum.text,
    required: true,
    hint: `If you are uploading a supplier list on behalf of the organization
you work for, you should add the organization name here, not your personal name.
Your organization name will appear publicly on all facilities that you upload as
the data source for each facility contributed.`,
    modelFieldName: 'name',
});

const accountDescriptionField = Object.freeze({
    id: registrationFieldsEnum.description,
    label: 'Organization Description',
    type: inputTypesEnum.text,
    required: true,
    hint: `Enter a description of the organization. This will appear in your
public organization profile.`,
    modelFieldName: 'description',
});

const accountWebsiteField = Object.freeze({
    id: registrationFieldsEnum.website,
    label: 'Website',
    type: inputTypesEnum.text,
    required: false,
    hint: null,
    modelFieldName: 'website',
});

const accountContributorTypeField = Object.freeze({
    id: registrationFieldsEnum.contributorType,
    label: 'Organization Type',
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
        "I'd like to receive important email updates about OS Hub features and data.",
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
    accountWebsiteField,
    accountContributorTypeField,
    accountOtherContributorTypeField,
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
export const facilityDetailsRoute = '/facilities/:osID';
export const claimFacilityRoute = '/facilities/:osID/claim';
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
export const dashboardLinkOsIdRoute = '/dashboard/linkid';
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
    hint: `example: 'This is the Alpha Company list of suppliers for their retail products valid from Jan 2023 to June 2023'`,
    type: inputTypesEnum.text,
    placeholder: 'Facility List Description',
});

export const contributeFormFields = Object.freeze([
    contributeFileName,
    contributeFileDescription,
]);

export const contributeReplacesNoneSelectionID = -1;

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
    DUPLICATE: 'DUPLICATE',
    ITEM_REMOVED: 'ITEM_REMOVED',
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
        label: facilityListItemStatusChoicesEnum.DUPLICATE,
        value: facilityListItemStatusChoicesEnum.DUPLICATE,
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
    REJECTED: 'This list was rejected and with not be processed.',
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
    uploaded: 'Total number of items that have been uploaded.',
    duplicates:
        'Number of items identified as a duplicate of another item in the same list.',
    errors: 'Number of items that have encountered errors during processing',
    status: 'Processing status of this list.',
});

export const ALLOW_LARGE_DOWNLOADS = 'allow_large_downloads';
export const CLAIM_A_FACILITY = 'claim_a_facility';
export const VECTOR_TILE = 'vector_tile';
export const PPE = 'ppe';
export const REPORT_A_FACILITY = 'report_a_facility';
export const EMBEDDED_MAP_FLAG = 'embedded_map';
export const EXTENDED_PROFILE_FLAG = 'extended_profile';
export const DEFAULT_SEARCH_TEXT = 'Facility Name or OS ID';

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
        in this list consider inviting them to register with the Open Supply Hub.`,
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
    [0, '#C0EBC7'],
    [10, '#81D690'],
    [40, '#4A9957'],
    [160, '#19331D'],
]);

export const PPE_FIELD_NAMES = Object.freeze([
    'ppe_product_types',
    'ppe_contact_phone',
    'ppe_contact_email',
    'ppe_website',
]);

export const OARFont = "'Darker Grotesque',sans-serif";
export const OARColor = '#8428FA';
export const SelectedMarkerColor = '#FFCF3F';

// A CSS size value that is used to set a lower bound on the iframe height
// when the width is set to 100%
export const minimum100PercentWidthEmbedHeight = '500px';

export const DONATE_LINK = 'https://givebutter.com/opensupplyhub2022';

export const NavbarItems = [
    {
        type: 'link',
        label: 'Explore',
        href: '/',
        internal: true,
    },
    {
        type: 'submenu',
        label: 'How It Works',
        columns: [
            [
                {
                    label: 'What is OS Hub?',
                    items: [
                        {
                            type: 'link',
                            label: 'Introduction',
                            href: InfoLink,
                        },
                        {
                            type: 'link',
                            label: 'FAQs',
                            href: `${InfoLink}/${InfoPaths.faqs}`,
                        },
                        {
                            type: 'button',
                            label: 'Donate',
                            href: DONATE_LINK,
                        },
                    ],
                },
            ],
            [
                {
                    label: 'Who is it for?',
                    items: [
                        {
                            type: 'link',
                            label: 'Brands & Retailers',
                            href: `${InfoLink}/${InfoPaths.brands}`,
                        },
                        {
                            type: 'link',
                            label: 'Civil Society',
                            href: `${InfoLink}/${InfoPaths.civilSociety}`,
                        },
                        {
                            type: 'link',
                            label: 'Facilities',
                            href: `${InfoLink}/${InfoPaths.facilities}`,
                        },
                        {
                            type: 'link',
                            label: 'Multi-Stakeholder Initiatives',
                            href: `${InfoLink}/${InfoPaths.multiStakeholderInitiatives}`,
                        },
                        {
                            type: 'link',
                            label: 'Researchers',
                            href: `${InfoLink}/${InfoPaths.researchers}`,
                        },
                        {
                            type: 'link',
                            label: 'Service Providers',
                            href: `${InfoLink}/${InfoPaths.serviceProviders}`,
                        },
                    ],
                },
            ],
            [
                {
                    label: 'What does it cover?',
                    items: [
                        {
                            type: 'link',
                            label: 'Sectors',
                            href: `${InfoLink}/${InfoPaths.sectors}`,
                        },
                    ],
                },
            ],
            [
                {
                    label: 'The Technology',
                    items: [
                        {
                            type: 'link',
                            label: 'Overview',
                            href: `${InfoLink}/${InfoPaths.technology}`,
                        },
                        {
                            type: 'link',
                            label: 'Developer Resources',
                            href: `${InfoLink}/${InfoPaths.developerResources}`,
                        },
                    ],
                },
                {
                    label: 'Premium Features',
                    items: [
                        {
                            type: 'link',
                            label: 'API',
                            href: `${InfoLink}/${InfoPaths.api}`,
                        },
                        {
                            type: 'link',
                            label: 'Embedded Map',
                            href: `${InfoLink}/${InfoPaths.embeddedMap}`,
                        },
                    ],
                },
            ],
        ],
    },
    {
        type: 'submenu',
        label: 'About Us',
        columns: [
            [
                {
                    label: 'Organization',
                    items: [
                        {
                            type: 'link',
                            label: 'Mission',
                            href: `${InfoLink}/${InfoPaths.mission}`,
                        },
                        {
                            type: 'link',
                            label: 'Supporters',
                            href: `${InfoLink}/${InfoPaths.supporters}`,
                        },
                        {
                            type: 'link',
                            label: 'Press',
                            href: `${InfoLink}/${InfoPaths.press}`,
                        },
                        {
                            type: 'link',
                            label: 'Financials',
                            href: `${InfoLink}/${InfoPaths.financials}`,
                        },
                        {
                            type: 'link',
                            label: 'Governance & Policies',
                            href: `${InfoLink}/${InfoPaths.governanceAndPolicies}`,
                        },
                    ],
                },
            ],
            [
                {
                    label: 'People',
                    items: [
                        {
                            type: 'link',
                            label: 'Team',
                            href: `${InfoLink}/${InfoPaths.team}`,
                        },
                        {
                            type: 'link',
                            label: 'Board of Directors',
                            href: `${InfoLink}/${InfoPaths.boardOfDirectors}`,
                        },
                        {
                            type: 'link',
                            label: 'Work with Us',
                            href: `${InfoLink}/${InfoPaths.workWithUs}`,
                        },
                    ],
                },
            ],
            [
                {
                    label: 'Connect',
                    items: [
                        {
                            type: 'link',
                            label: 'Contact Us',
                            href: `${InfoLink}/${InfoPaths.contactUs}`,
                        },
                        {
                            type: 'button',
                            label: 'Donate',
                            href: DONATE_LINK,
                        },
                    ],
                },
            ],
        ],
    },
    {
        type: 'link',
        label: 'Resources',
        href: `${InfoLink}/${InfoPaths.resources}`,
    },
    { type: 'international' },
    { type: 'auth' },
    {
        type: 'button',
        label: 'Upload Data',
        href: '/contribute',
        internal: true,
    },
];

// Move the Upload to the front of the list
export const MobileNavbarItems = [
    NavbarItems[NavbarItems.length - 1],
    ...NavbarItems.slice(0, -1),
];

export const EmbeddedMapInfoLink = `${InfoLink}/${InfoPaths.embeddedMap}`;

export const FooterLinks = [
    { label: 'Donate', href: DONATE_LINK },
    { label: 'Privacy Policy', href: `${InfoLink}/${InfoPaths.privacyPolicy}` },
    { label: 'FAQs', href: `${InfoLink}/${InfoPaths.faqs}` },
    {
        label: 'Terms of Service',
        href: `${InfoLink}/${InfoPaths.termsOfService}`,
    },
    { label: 'Media Hub', href: `${InfoLink}/${InfoPaths.mediaHub}` },
    { label: 'Contact Us', href: `${InfoLink}/${InfoPaths.contactUs}` },
    { label: 'Reporting Line', href: 'https://opensupplyhub.allvoices.co/' },
];

export const SocialMediaLinks = [
    {
        label: 'LinkedIn',
        Icon: () => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
            >
                <path
                    d="M4.477 19.996H.33V6.646h4.147v13.35ZM2.4 4.825C1.076 4.825 0 3.727 0 2.4a2.402 2.402 0 0 1 4.802 0c0 1.326-1.075 2.424-2.4 2.424Zm17.595 15.17h-4.138v-6.498c0-1.549-.031-3.535-2.156-3.535-2.155 0-2.486 1.683-2.486 3.423v6.61H7.074V6.646h3.977v1.822h.058c.554-1.049 1.906-2.156 3.923-2.156 4.196 0 4.968 2.763 4.968 6.351v7.334h-.004Z"
                    fill="#FFF"
                    fillRule="nonzero"
                />
            </svg>
        ),
        href: 'https://www.linkedin.com/company/open-supply-hub/',
    },
    {
        label: 'Twitter',
        Icon: () => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="17"
                viewBox="0 0 20 17"
            >
                <path
                    d="M17.944 4.048c.013.178.013.356.013.533 0 5.419-4.124 11.663-11.663 11.663-2.322 0-4.48-.673-6.294-1.84.33.038.647.05.99.05a8.21 8.21 0 0 0 5.089-1.75A4.106 4.106 0 0 1 2.246 9.86c.254.038.508.064.774.064.368 0 .736-.05 1.079-.14A4.1 4.1 0 0 1 .812 5.761v-.05c.546.304 1.18.495 1.853.52A4.096 4.096 0 0 1 .838 2.817c0-.761.203-1.46.558-2.068a11.651 11.651 0 0 0 8.452 4.29 4.627 4.627 0 0 1-.102-.94A4.097 4.097 0 0 1 13.846 0a4.09 4.09 0 0 1 2.994 1.294 8.07 8.07 0 0 0 2.602-.99 4.088 4.088 0 0 1-1.802 2.26A8.217 8.217 0 0 0 20 1.928a8.811 8.811 0 0 1-2.056 2.12Z"
                    fill="#FFF"
                    fillRule="nonzero"
                />
            </svg>
        ),
        href: 'https://twitter.com/OpenSupplyHub',
    },
    {
        label: 'YouTube',
        Icon: () => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="19"
                viewBox="0 0 27 19"
            >
                <path
                    d="M2.932.583c4.39-.916 19.522-.62 21.084-.017A3.379 3.379 0 0 1 26.4 2.95c.823 3.318.769 9.591.017 12.961a3.379 3.379 0 0 1-2.385 2.385c-3.283.812-17.99.712-21.084 0a3.379 3.379 0 0 1-2.385-2.385C-.212 12.75-.158 6.062.547 2.968A3.379 3.379 0 0 1 2.932.583Zm7.95 4.804v8.088l7.05-4.044-7.05-4.044Z"
                    fill="#FFF"
                    fillRule="nonzero"
                />
            </svg>
        ),
        href: 'https://www.youtube.com/channel/UCZ8Qn5HvFHX453JfI4dhYpA',
    },
    {
        label: 'Github',
        Icon: () => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
            >
                <path
                    d="M11 0C4.923 0 0 4.923 0 11c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.128-1.554-.384-.206-.934-.715-.013-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.447-.275-5.005-1.224-5.005-5.431 0-1.197.426-2.187 1.128-2.957-.11-.275-.495-1.402.11-2.915 0 0 .92-.288 3.024 1.128.88-.248 1.816-.372 2.75-.372.936 0 1.87.124 2.75.372 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.22 2.64.11 2.915.702.77 1.128 1.747 1.128 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .288.206.632.756.522C18.851 19.98 22 15.854 22 11c0-6.077-4.922-11-11-11Z"
                    fill="#FFF"
                    fillRule="evenodd"
                />
            </svg>
        ),
        href: 'https://github.com/opensupplyhub/pyoshub',
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
                  label: 'Dashboard',
                  href: dashboardRoute,
              }),
          ])
        : [];

    const claimedFacilityLinks = includes(activeFeatureFlags, CLAIM_A_FACILITY)
        ? Object.freeze([
              Object.freeze({
                  label: 'My Facilities',
                  href: '/claimed',
              }),
          ])
        : [];

    const userLinks = Object.freeze([
        Object.freeze({
            label: 'My Lists',
            href: '/lists',
        }),
        Object.freeze({
            label: 'Settings',
            href: '/settings',
        }),
    ]);

    const logoutLinks = Object.freeze([
        Object.freeze({
            label: 'Log Out',
            action: logoutAction,
        }),
    ]);

    return dashboardLink
        .concat(claimedFacilityLinks)
        .concat(userLinks)
        .concat(logoutLinks);
};

export const facilityDetailsActions = {
    SUGGEST_AN_EDIT: 'Suggest an Edit',
    REPORT_AS_DUPLICATE: 'Report as Duplicate',
    REPORT_AS_CLOSED: 'Report as Closed',
    REPORT_AS_REOPENED: 'Report as Reopened',
    DISPUTE_CLAIM: 'Dispute Claim',
    CLAIM_FACILITY: 'Claim this Facility',
    VIEW_ON_OAR: 'View on the Open Supply Hub',
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
        formatValue: v =>
            v.matched_values.map(val => val[2]).filter(val => val),
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
            max === min ? `${max}` : `${min}-${max}`,
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

export const EXTENDED_FIELDS_EXPLANATORY_TEXT =
    'These fields were added to OS Hub in March 2022. As more data is contributed, more results will become available.';
