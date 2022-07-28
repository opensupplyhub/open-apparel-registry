import React, { useEffect } from 'react';
import { arrayOf, bool, func, number, string } from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';

import AppOverflow from './AppOverflow';
import ContributorWebhookForm from './ContributorWebhookForm';
import ShowOnly from './ShowOnly';

import '../styles/css/specialStates.css';

import {
    confirmDeletingContributorWebhook,
    deleteContributorWebhook,
    fetchContributorWebhooks,
} from '../actions/webhooks';
import { contributorWebhookPropType } from '../util/propTypes';

const styles = Object.freeze({
    container: Object.freeze({
        width: '100%',
    }),
    errorMessagesStyles: Object.freeze({
        color: 'red',
        padding: '1rem',
    }),
});

function UserNotifications({
    fetching,
    formData,
    error,
    confirmDelete,
    fetchWebhooks,
    closeDeleteDialog,
    deleteWebhook,
}) {
    // Fetch user webhooks on load
    useEffect(() => {
        fetchWebhooks();
    }, [fetchWebhooks]);

    if (fetching) {
        return <CircularProgress />;
    }

    const deleteDialog = (
        <Dialog
            open={!!confirmDelete}
            aria-labelledby="delete-webhook-dialog-title"
            aria-describedby="delete-webhook-dialog-description"
        >
            <DialogTitle id="delete-webhook-dialog-title">
                Delete this webhook?
            </DialogTitle>
            <DialogContent id="delete-webhook-dialog-description">
                After deleting this webhook you will stop recieving
                notifications at this URL.
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={closeDeleteDialog}
                >
                    No, cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => deleteWebhook(confirmDelete)}
                >
                    Yes, confirm
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Grid container>
            <Grid
                item
                xs={12}
                sm={9}
                style={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}
            >
                {deleteDialog}
                <AppOverflow>
                    <div className="margin-bottom" style={styles.container}>
                        <ShowOnly when={error !== null}>
                            <div style={styles.errorMessagesStyles}>
                                {error?.join('\n')}
                            </div>
                        </ShowOnly>
                        {formData.map((form, index) => (
                            <ContributorWebhookForm
                                form={form}
                                key={form.id || 'new'}
                                index={index}
                            />
                        ))}
                    </div>
                </AppOverflow>
            </Grid>
        </Grid>
    );
}

UserNotifications.defaultProps = {
    error: null,
    confirmDelete: null,
};

UserNotifications.propTypes = {
    error: arrayOf(string.isRequired),
    formData: arrayOf(contributorWebhookPropType).isRequired,
    fetching: bool.isRequired,
    fetchWebhooks: func.isRequired,
    closeDeleteDialog: func.isRequired,
    confirmDelete: number,
};

function mapStateToProps({
    webhooks: { formData, fetching, confirmDelete, error },
}) {
    return {
        error,
        formData,
        fetching,
        confirmDelete,
    };
}

const mapDispatchToProps = dispatch => ({
    fetchWebhooks: () => dispatch(fetchContributorWebhooks()),
    closeDeleteDialog: () => dispatch(confirmDeletingContributorWebhook(null)),
    deleteWebhook: id => dispatch(deleteContributorWebhook(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserNotifications);
