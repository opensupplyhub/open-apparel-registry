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

const mergeControlsStyles = Object.freeze({
    containerStyles: Object.freeze({
        width: '100%',
        padding: '10px 0',
        margin: '10px 20px',
        display: 'flex',
        justifyContent: 'start',
    }),
    buttonStyles: Object.freeze({
        margin: '0 20px 10px 0',
    }),
    labelStyles: Object.freeze({
        fontSize: '16px',
    }),
    dialogContentStyles: Object.freeze({
        fontSize: '20px',
        padding: '5px',
        margin: '5px',
    }),
});

export default function DashboardMergeFacilityControls({
    handleMerge,
    handleFlip,
    merging,
    error,
    disabled,
    toMergeData,
    targetData,
}) {
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const [mergingFacilities, setMergingFacilities] = useState(false);

    const mergeFacilities = () => {
        setMergingFacilities(true);

        return handleMerge();
    };

    useEffect(() => {
        if (!merging && mergingFacilities) {
            setDialogIsOpen(false);
            setMergingFacilities(false);

            if (!error) {
                toast('Facilities were merged');
            }
        }
    }, [
        merging,
        mergingFacilities,
        error,
        setDialogIsOpen,
        setMergingFacilities,
    ]);

    const targetName = get(targetData, 'properties.name', '');
    const targetID = get(targetData, 'id', '');
    const toMergeName = get(toMergeData, 'properties.name', '');
    const toMergeID = get(toMergeData, 'id', '');

    return (
        <div style={mergeControlsStyles.containerStyles}>
            <Button
                onClick={() => setDialogIsOpen(true)}
                disabled={merging || disabled}
                variant="contained"
                color="secondary"
                style={mergeControlsStyles.buttonStyles}
            >
                Merge facilities
            </Button>
            <Button
                onClick={handleFlip}
                disabled={merging || disabled}
                variant="contained"
                color="primary"
                style={mergeControlsStyles.buttonStyles}
            >
                Flip facilities
            </Button>
            {merging && <CircularProgress />}
            {error && (
                <span style={{ color: 'red' }}>
                    An error prevented merging those facilities
                </span>
            )}
            <Dialog open={dialogIsOpen}>
                {dialogIsOpen ? (
                    <>
                        <DialogTitle>
                            Merge {get(toMergeData, 'properties.name', '')} into{' '}
                            {get(targetData, 'properties.name', '')}?
                        </DialogTitle>
                        <DialogContent>
                            <Typography
                                variant="body1"
                                style={mergeControlsStyles.dialogContentStyles}
                            >
                                This action will merge facility {toMergeID} into
                                facility {targetID}.
                            </Typography>
                            <Typography
                                variant="body1"
                                style={mergeControlsStyles.dialogContentStyles}
                            >
                                {toMergeName} will be deleted and its OS Hub ID
                                will point to {targetName}, {targetID}.
                            </Typography>
                            <Typography
                                variant="body1"
                                style={mergeControlsStyles.dialogContentStyles}
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
                                onClick={mergeFacilities}
                            >
                                Merge facilities
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

DashboardMergeFacilityControls.defaultProps = {
    error: null,
    toMergeData: null,
    targetData: null,
};

DashboardMergeFacilityControls.propTypes = {
    handleMerge: func.isRequired,
    handleFlip: func.isRequired,
    merging: bool.isRequired,
    error: arrayOf(string),
    disabled: bool.isRequired,
    toMergeData: facilityDetailsPropType,
    targetData: facilityDetailsPropType,
};
