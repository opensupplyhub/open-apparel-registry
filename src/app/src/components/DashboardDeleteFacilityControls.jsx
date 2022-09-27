import React, { useState, useEffect } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
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

const deleteControlsStyles = Object.freeze({
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
});

export default function DashboardDeleteFacilityControls({
    handleDelete,
    deleting,
    error,
    disabled,
    data,
}) {
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const [deletingFacility, setDeletingFacility] = useState(false);

    const deleteFacility = () => {
        setDeletingFacility(true);

        return handleDelete();
    };

    useEffect(() => {
        if (!deleting && deletingFacility) {
            setDialogIsOpen(false);
            setDeletingFacility(false);

            if (!error) {
                toast('Facility was deleted');
            }
        }
    }, [
        deleting,
        deletingFacility,
        error,
        setDialogIsOpen,
        setDeletingFacility,
    ]);

    return (
        <div style={deleteControlsStyles.containerStyles}>
            <Button
                onClick={() => setDialogIsOpen(true)}
                disabled={deleting || disabled}
                variant="contained"
                color="secondary"
                style={deleteControlsStyles.buttonStyles}
            >
                Delete facility
            </Button>
            {deleting && <CircularProgress />}
            {error && (
                <span style={{ color: 'red' }}>
                    An error prevented deleting that facility
                </span>
            )}
            <Dialog open={dialogIsOpen}>
                {dialogIsOpen ? (
                    <>
                        <DialogTitle>
                            Delete {get(data, 'properties.name', '')}?
                        </DialogTitle>
                        <DialogContent>
                            <Typography
                                style={deleteControlsStyles.labelStyles}
                            >
                                Do you really want to delete this facility?
                            </Typography>
                            <ul>
                                <li>
                                    <Typography
                                        style={deleteControlsStyles.labelStyles}
                                    >
                                        Name: {get(data, 'properties.name', '')}
                                    </Typography>
                                </li>
                                <li>
                                    <Typography
                                        style={deleteControlsStyles.labelStyles}
                                    >
                                        OS ID: {get(data, 'id', '')}
                                    </Typography>
                                </li>
                                <li>
                                    <Typography
                                        style={deleteControlsStyles.labelStyles}
                                    >
                                        Address:{' '}
                                        {get(data, 'properties.address', '')}
                                    </Typography>
                                </li>
                                <li>
                                    <Typography
                                        style={deleteControlsStyles.labelStyles}
                                    >
                                        Country:{' '}
                                        {get(
                                            data,
                                            'properties.country_name',
                                            '',
                                        )}
                                    </Typography>
                                </li>
                            </ul>
                            <Typography
                                style={deleteControlsStyles.labelStyles}
                            >
                                This action is irrevocable.
                            </Typography>
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
                                onClick={deleteFacility}
                            >
                                Delete facility
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

DashboardDeleteFacilityControls.defaultProps = {
    error: null,
    data: null,
};

DashboardDeleteFacilityControls.propTypes = {
    handleDelete: func.isRequired,
    deleting: bool.isRequired,
    error: arrayOf(string),
    disabled: bool.isRequired,
    data: facilityDetailsPropType,
};
