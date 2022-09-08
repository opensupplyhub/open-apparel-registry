import React, { useMemo } from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import get from 'lodash/get';
import partition from 'lodash/partition';

import FacilityDetailsStaticMap from './FacilityDetailsStaticMap';
import FacilityDetailsItem from './FacilityDetailsItem';
import FacilityDetailsLocation from './FacilityDetailsLocation';

const locationFieldsStyles = theme =>
    Object.freeze({
        root: {
            color: '#191919',
            display: 'flex',
            justifyContent: 'center',
            borderTop: '2px solid #F9F7F7',
            borderBottom: '2px solid #F9F7F7',
        },
        contentContainer: {
            width: '100%',
            maxWidth: '1072px',
            paddingLeft: theme.spacing.unit * 3,
            paddingBottom: theme.spacing.unit * 3,
        },
    });

const FacilityDetailsLocationFields = ({
    classes,
    data,
    filterByUniqueField,
    createdFrom,
    embed,
}) => {
    const [addressField, otherAddresses] = useMemo(() => {
        const coreAddress = get(data, 'properties.address', '');
        const addressFields = filterByUniqueField(data, 'address');

        const [defaultAddressField, otherAddressFields] = partition(
            addressFields,
            field => field.primary === coreAddress,
        );
        if (!defaultAddressField.length && !!coreAddress) {
            return [
                {
                    primary: coreAddress,
                    secondary: createdFrom,
                    key: coreAddress + createdFrom,
                },
                otherAddressFields,
            ];
        }
        if (!defaultAddressField.length) {
            return [otherAddressFields[0], otherAddressFields.slice(1)];
        }
        return [defaultAddressField[0], otherAddressFields];
    }, [data, createdFrom, filterByUniqueField]);

    return (
        <div className={classes.root}>
            <Grid container className={classes.contentContainer}>
                <Grid item xs={12} md={6}>
                    <FacilityDetailsStaticMap data={data} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FacilityDetailsItem
                        label="Address"
                        {...addressField}
                        primary={`${addressField.primary} - ${get(
                            data,
                            'properties.country_name',
                            '',
                        )}`}
                        additionalContent={otherAddresses}
                        embed={embed}
                    />
                    <FacilityDetailsLocation data={data} embed={embed} />
                </Grid>
            </Grid>
        </div>
    );
};

export default withStyles(locationFieldsStyles)(FacilityDetailsLocationFields);
