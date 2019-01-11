export const OTHER = 'Other';

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
    }),
    Object.freeze({
        id: registrationFieldsEnum.name,
        label: 'Account Name',
        type: inputTypesEnum.text,
        required: true,
        hint: `Your account name will appear as the contributor name on all
facilities that you upload as the data source for each facility
contributed.`,
    }),
    Object.freeze({
        id: registrationFieldsEnum.description,
        label: 'Account Description',
        type: inputTypesEnum.text,
        required: true,
        hint: `Enter a description of your account. This will appear in your
account profile`,
    }),
    Object.freeze({
        id: registrationFieldsEnum.website,
        label: 'Website (Optional)',
        type: inputTypesEnum.text,
        required: false,
        hint: null,
    }),
    Object.freeze({
        id: registrationFieldsEnum.contributorType,
        label: 'Contributor Type',
        type: inputTypesEnum.select,
        options: contributorTypeOptions,
        required: false,
    }),
    Object.freeze({
        id: registrationFieldsEnum.otherContributorType,
        label: 'Other Contributor Type',
        type: inputTypesEnum.text,
        required: false,
        hint: 'Please specify',
    }),
    Object.freeze({
        id: registrationFieldsEnum.password,
        label: 'Password',
        type: inputTypesEnum.password,
        required: true,
    }),
    Object.freeze({
        id: registrationFieldsEnum.confirmPassword,
        label: 'Confirm Password',
        type: inputTypesEnum.password,
        required: true,
    }),
]);
