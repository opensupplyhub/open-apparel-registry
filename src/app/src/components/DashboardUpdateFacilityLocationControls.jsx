import React, { useState, useEffect } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import { toast } from 'react-toastify';
import get from 'lodash/get';

import { facilityDetailsPropType } from '../util/propTypes';

const styles = Object.freeze({
    containerStyles: Object.freeze({
        width: '100%',
        padding: '10px 0',
        margin: '10px 20px',
        display: 'flex',
        justifyContent: 'start',
        alignItems: 'center',
    }),
    buttonStyles: Object.freeze({
        margin: '0 20px 10px 0',
    }),
    labelStyles: Object.freeze({
        fontSize: '20px',
    }),
    errorStyles: Object.freeze({
        color: 'red',
    }),
});

export default function DashboardUpdateFacilityLocationControls({
    handleUpdate,
    updating,
    error,
    disabled,
    facility,
    newLocation,
}) {
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const [updatingFacility, setUpdatingFacility] = useState(false);

    const updateFacility = () => {
        setUpdatingFacility(true);

        return handleUpdate();
    };

    useEffect(() => {
        if (!updating && updatingFacility) {
            setDialogIsOpen(false);
            setUpdatingFacility(false);

            if (!error) {
                toast('Facility location was updated');
            }
        }
    }, [
        updating,
        updatingFacility,
        error,
        setDialogIsOpen,
        setUpdatingFacility,
    ]);

    return (
        <div style={styles.containerStyles}>
            <Button
                onClick={() => setDialogIsOpen(true)}
                disabled={updating || disabled}
                variant="contained"
                color="secondary"
                style={styles.buttonStyles}
            >
                Update location
            </Button>
            {updating && <CircularProgress />}

            {error && (
                <span style={styles.errorStyles}>
                    An error prevented updating the facility location
                </span>
            )}

            {error && error.length && (
                <ul style={styles.errorStyles}>
                    {error.map(err => (
                        <li key={err}>
                            <span style={styles.errorStyles}>{err}</span>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog open={dialogIsOpen}>
                {dialogIsOpen ? (
                    <>
                        <DialogTitle>
                            Update {get(facility, 'properties.name', '')}?
                        </DialogTitle>
                        <DialogContent>
                            <Typography style={styles.labelStyles}>
                                Do you really want to update the facility
                                location?
                            </Typography>
                            <ul>
                                <li>
                                    <Typography style={styles.labelStyles}>
                                        Name:{' '}
                                        {get(facility, 'properties.name', '')}
                                    </Typography>
                                </li>
                                <li>
                                    <Typography style={styles.labelStyles}>
                                        OAR ID: {get(facility, 'id', '')}
                                    </Typography>
                                </li>
                                <li>
                                    <Typography style={styles.labelStyles}>
                                        Old Location:{' '}
                                        {get(
                                            facility,
                                            'geometry.coordinates',
                                            [],
                                        ).join(', ')}
                                    </Typography>
                                </li>
                                <li>
                                    <Typography style={styles.labelStyles}>
                                        New Location:{' '}
                                        {[
                                            get(newLocation, 'lng', ''),
                                            get(newLocation, 'lat', ''),
                                        ].join(', ')}
                                    </Typography>
                                </li>
                            </ul>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => setDialogIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={updateFacility}
                            >
                                Update location
                            </Button>
                        </DialogActions>
                    </>
                ) : (
                    <div style={{ display: 'none' }} />
                )}
            </Dialog>
        </div>
    );
}

DashboardUpdateFacilityLocationControls.defaultProps = {
    error: null,
    facility: null,
    newLocation: null,
};

DashboardUpdateFacilityLocationControls.propTypes = {
    handleUpdate: func.isRequired,
    updating: bool.isRequired,
    error: arrayOf(string),
    disabled: bool.isRequired,
    facility: facilityDetailsPropType,
    newLocation: shape({
        lat: string,
        lng: string,
    }),
};
