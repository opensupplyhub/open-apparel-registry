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
    required: false,
    hint: 'Please specify',
    modelFieldName: 'other_contributor_type',
});

const accountPasswordField = Object.freeze({
    id: registrationFieldsEnum.password,
    label: 'Password',
    type: inputTypesEnum.password,
    required: true,
    modelFieldName: 'password',
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
    modelFieldName: 'newsletter',
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
    modelFieldName: 'tos',
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

export const authLoginFormRoute = '/auth/login';
export const authRegisterFormRoute = '/auth/register';
export const contributeRoute = '/contribute';
export const listsRoute = '/lists';

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
