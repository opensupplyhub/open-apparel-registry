/* eslint-disable camelcase */
import get from 'lodash/get';
import fill from 'lodash/fill';
import isEmpty from 'lodash/isEmpty';
import flow from 'lodash/flow';

import { joinDataIntoCSVString } from './util';

import { facilityMatchStatusChoicesEnum } from './constants';

export const csvHeaders = Object.freeze([
    'row_index',
    'status',
    'country_code',
    'country_name',
    'name',
    'address',
    'matched_facility_oar_id',
    'matched_facility_name',
    'matched_facility_address',
    'matched_facility_lng',
    'matched_facility_lat',
    'potential_match_oar_id',
    'potential_match_name',
    'potential_match_address',
    'potential_match_lng',
    'potential_match_lat',
    'potential_match_confidence',
    'potential_match_status',
]);

const emptyPotentialMatchData = Object.freeze(fill(Array(7), ''));

export const createMatchRowFromListItem = ({
    row_index,
    status,
    country_code,
    country_name,
    name,
    address,
    matched_facility,
}) =>
    Object.freeze([
        row_index,
        status,
        country_code,
        country_name,
        name,
        address,
        get(matched_facility, 'oar_id', ''),
        get(matched_facility, 'name', ''),
        get(matched_facility, 'address', ''),
        get(matched_facility, 'location.lng', ''),
        get(matched_facility, 'location.lat', ''),
    ]);

export const formatPotentialMatchData = ({
    oar_id,
    name,
    address,
    confidence,
    status,
    location: { lng, lat },
}) => Object.freeze([oar_id, name, address, lng, lat, confidence, status]);

export const listItemReducer = (acc, next) => {
    if (isEmpty(next.matches)) {
        return acc.concat([
            createMatchRowFromListItem(next).concat(emptyPotentialMatchData),
        ]);
    }

    const matchRows = next.matches
        .filter(
            ({ status }) => status !== facilityMatchStatusChoicesEnum.REJECTED,
        )
        .reduce(
            (rows, nextRow) =>
                rows.concat([
                    createMatchRowFromListItem(next).concat(
                        formatPotentialMatchData(nextRow),
                    ),
                ]),
            [],
        );

    return acc.concat(matchRows);
};

export const formatDataForCSV = listItems =>
    listItems.reduce(listItemReducer, [csvHeaders]);

export const createListItemCSV = flow(formatDataForCSV, data =>
    joinDataIntoCSVString(data),
);
