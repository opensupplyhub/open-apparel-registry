export const OTHER = 'Other';

// This choices must be kept in sync with the identical list
// kept in the Django API's models.py file
export const contributorTypeOptions = Object.freeze([
    'Auditor',
    'Brand/Retailer',
    'Civil Society Organization',
    'Factory / Facility',
    'Manufacturing Group / Supplier / Vendor',
    'Multi Stakeholder Initiative',
    'Researcher / Academic',
    'Service Provider',
    'Union',
    OTHER,
]);

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
    [registrationFieldsEnum.contributorType]: registrationFieldsEnum.contributorType,
    [registrationFieldsEnum.otherContributorType]: registrationFieldsEnum.otherContributorType,
    [registrationFieldsEnum.password]: registrationFieldsEnum.password,
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
    label: 'Account Name',
    type: inputTypesEnum.text,
    required: true,
    hint: `Your account name will appear as the contributor name on all
facilities that you upload as the data source for each facility
contributed.`,
    modelFieldName: 'name',
});

const accountDescriptionField = Object.freeze({
    id: registrationFieldsEnum.description,
    label: 'Account Description',
    type: inputTypesEnum.text,
    required: true,
    hint: `Enter a description of your account. This will appear in your
account profile`,
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

const accountNewsletterField = Object.freeze({
    id: registrationFieldsEnum.newsletter,
    label: 'Sign up for OAR newsletter',
    modelFieldName: 'should_receive_newsletter',
    type: inputTypesEnum.checkbox,
});

const accountTOSField = Object.freeze({
    id: registrationFieldsEnum.tos,
    label: 'Terms of Service',
    link: Object.freeze({
        prefixText: 'Agree to ',
        url: 'https://info.openapparel.org/tos/',
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
    accountPasswordField,
]);

export const mainRoute = '/';
export const authLoginFormRoute = '/auth/login';
export const authRegisterFormRoute = '/auth/register';
export const authResetPasswordFormRoute = '/auth/resetpassword/:uid';
export const authConfirmRegistrationRoute = '/auth/confirm/:uid';
export const contributeRoute = '/contribute';
export const listsRoute = '/lists';
export const facilityListItemsRoute = '/lists/:listID';
export const facilitiesRoute = '/facilities';
export const facilityDetailsRoute = '/facilities/:oarID';
export const profileRoute = '/profile/:id';

export const contributeCSVTemplate =
    'country,name,address\nEgypt,Elite Merchandising Corp.,St. 8 El-Amrya Public Free Zone Alexandria Iskandariyah 23512 Egypt';

export const contributeFieldsEnum = Object.freeze({
    name: 'name',
    description: 'description',
});

export const contributeFileName = Object.freeze({
    id: contributeFieldsEnum.name,
    label: 'Enter the name for this facility list',
    hint: 'example: \'Alpha Brand Facility List June 2018\'',
    type: inputTypesEnum.text,
    placeholder: 'Facility List Name',
});

export const contributeFileDescription = Object.freeze({
    id: contributeFieldsEnum.description,
    label: `Enter a description of this facility list and include a timeframe
for the list's validity`,
    hint: `example: 'This is the Alpha Brand list of suppliers for their apparel
products valid from June 2018 to Sept 2018'`,
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
        tab: filterSidebarTabsEnum.search,
        label: 'Search',
    }),
    Object.freeze({
        tab: filterSidebarTabsEnum.facilities,
        label: 'Facilities',
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
    ERROR: 'ERROR',
    ERROR_PARSING: 'ERROR_PARSING',
    ERROR_GEOCODING: 'ERROR_GEOCODING',
    ERROR_MATCHING: 'ERROR_MATCHING',
});

export const facilityListItemErrorStatuses = Object.freeze([
    facilityListItemStatusChoicesEnum.ERROR,
    facilityListItemStatusChoicesEnum.ERROR_PARSING,
    facilityListItemStatusChoicesEnum.ERROR_GEOCODING,
    facilityListItemStatusChoicesEnum.ERROR_MATCHING,
]);

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
});

export const emptyFeatureCollection = Object.freeze({
    type: FEATURE_COLLECTION,
    features: Object.freeze([]),
});

export const ENTER_KEY = 'Enter';
