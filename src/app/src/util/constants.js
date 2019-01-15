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

export const registrationFormFields = Object.freeze([
    Object.freeze({
        id: registrationFieldsEnum.email,
        label: 'Email Address',
        type: inputTypesEnum.text,
        required: true,
        hint: null,
        modelFieldName: 'email',
    }),
    Object.freeze({
        id: registrationFieldsEnum.name,
        label: 'Account Name',
        type: inputTypesEnum.text,
        required: true,
        hint: `Your account name will appear as the contributor name on all
facilities that you upload as the data source for each facility
contributed.`,
        modelFieldName: 'name',
    }),
    Object.freeze({
        id: registrationFieldsEnum.description,
        label: 'Account Description',
        type: inputTypesEnum.text,
        required: true,
        hint: `Enter a description of your account. This will appear in your
account profile`,
        modelFieldName: 'description',
    }),
    Object.freeze({
        id: registrationFieldsEnum.website,
        label: 'Website (Optional)',
        type: inputTypesEnum.text,
        required: false,
        hint: null,
        modelFieldName: 'website',
    }),
    Object.freeze({
        id: registrationFieldsEnum.contributorType,
        label: 'Contributor Type',
        type: inputTypesEnum.select,
        options: contributorTypeOptions,
        required: true,
        modelFieldName: 'contributor_type',
    }),
    Object.freeze({
        id: registrationFieldsEnum.otherContributorType,
        label: 'Other Contributor Type',
        type: inputTypesEnum.text,
        required: false,
        hint: 'Please specify',
        modelFieldName: 'other_contributor_type',
    }),
    Object.freeze({
        id: registrationFieldsEnum.password,
        label: 'Password',
        type: inputTypesEnum.password,
        required: true,
        modelFieldName: 'password',
    }),
    Object.freeze({
        id: registrationFieldsEnum.confirmPassword,
        label: 'Confirm Password',
        type: inputTypesEnum.password,
        required: true,
        modelFieldName: 'confirmPassword',
    }),
    Object.freeze({
        id: registrationFieldsEnum.newsletter,
        label: 'Sign up for OAR newsletter',
        modelFieldName: 'newsletter',
        type: inputTypesEnum.checkbox,
    }),
    Object.freeze({
        id: registrationFieldsEnum.tos,
        label: 'Terms of Service',
        link: Object.freeze({
            prefixText: 'Agree to ',
            url: 'https://info.openapparel.org/tos/',
        }),
        required: true,
        modelFieldName: 'tos',
        type: inputTypesEnum.checkbox,
    }),
]);

export const authLoginFormRoute = '/auth/login';
export const authRegisterFormRoute = '/auth/register';
export const contributeRoute = '/contribute';
