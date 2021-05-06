import sortBy from 'lodash/sortBy';

import { OARFont } from './constants';

const DEFAULT_WIDTH = '1000';
const DEFAULT_HEIGHT = '800';

const getHeight = embedConfig =>
    embedConfig.height ? embedConfig.height : DEFAULT_HEIGHT;

const formatExistingWidth = ({ width = DEFAULT_WIDTH }) => {
    const fullWidth = width[width.length - 1] === '%';
    if (!width) {
        return { fullWidth, width: DEFAULT_WIDTH };
    }
    return { fullWidth, width };
};

export const formatExistingConfig = embedConfig => {
    if (!embedConfig) {
        return {
            width: DEFAULT_WIDTH,
            color: '#3d2f8c',
            font: OARFont,
            includeOtherContributorFields: false,
            height: DEFAULT_HEIGHT,
        };
    }
    return {
        ...embedConfig,
        ...formatExistingWidth(embedConfig),
        color: embedConfig.color ? embedConfig.color : '#3d2f8c',
        font: embedConfig.font ? embedConfig.font : OARFont,
        includeOtherContributorFields:
            embedConfig.show_other_contributor_information,
        height: getHeight(embedConfig),
    };
};

export const formatExistingFields = (fields = []) =>
    fields.map(field => ({
        columnName: field.column_name,
        displayName: field.display_name,
        visible: field.visible,
        order: field.order,
    }));

const doesExist = (field, existingFields) =>
    existingFields.some(f => f.columnName === field);

const filterAndFormatNonstandardFields = ({
    nonstandardFields,
    existingFields,
}) =>
    nonstandardFields
        .filter(field => !doesExist(field, existingFields))
        .map(field => ({
            columnName: field,
            displayName: field,
            visible: true,
        }));

export const combineEmbedAndNonstandardFields = (
    embedFields,
    nonstandardFields,
) => {
    const existingFields = formatExistingFields(embedFields);
    const newFields = filterAndFormatNonstandardFields({
        nonstandardFields,
        existingFields,
    });
    return sortBy([...existingFields, ...newFields], f => f.order).map(
        (f, i) => ({
            ...f,
            order: f.order || i,
        }),
    );
};

const formatEmbedFieldsForServer = fields =>
    sortBy(fields, f => f.order).map((f, i) => ({
        visible: f.visible,
        order: i,
        display_name: f.displayName,
        column_name: f.columnName,
    }));

const formatWidthForServer = ({ width, fullWidth }) => {
    if (fullWidth) return '100%';
    if (!width || width === '100%') return DEFAULT_WIDTH;
    return width;
};

export const formatEmbedConfigForServer = (embedConfig, embedFields) => ({
    ...embedConfig,
    show_other_contributor_information:
        embedConfig.includeOtherContributorFields,
    width: formatWidthForServer(embedConfig),
    height: getHeight(embedConfig),
    embed_fields: formatEmbedFieldsForServer(embedFields),
});

export const getErrorMessage = e => e.response.data || e.message;
