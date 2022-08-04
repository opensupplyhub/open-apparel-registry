import React from 'react';
import { bool, func } from 'prop-types';
import isEqual from 'lodash/isEqual';
import { connect } from 'react-redux';
import ReactSelect from 'react-select';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { toast } from 'react-toastify';

import ControlledTextInput from './ControlledTextInput';
import ShowOnly from './ShowOnly';

import '../styles/css/specialStates.css';

import {
    createContributorWebhook,
    updateContributorWebhook,
    updateWebhookField,
    resetWebhookChanges,
    confirmDeletingContributorWebhook,
} from '../actions/webhooks';
import { contributorWebhookNotificationChoices } from '../util/constants';
import { contributorWebhookPropType } from '../util/propTypes';

const isValid = form => form.url.trim() !== '' && !!form.notification_type;

const testNotification = url => {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event_type: 'TEST',
            event_time: new Date().toISOString(),
            event_details: {
                description: 'Webhook test event',
            },
        }),
    })
        .then(() => toast.success('Sent test notification'))
        .catch(() => toast.error('Unable to send test notification'));
};

function ContributorWebhookForm({
    form,
    webhook,
    creating,
    updating,
    createWebhook,
    updateWebhook,
    updateField,
    resetChanges,
    confirmDeleting,
}) {
    const isNew = !webhook;
    const formId = isNew ? 'new' : webhook.id;
    const isDirty = isNew || !isEqual(form, webhook);
    const disabled = creating || updating;
    const saveWebhook = isNew ? createWebhook : updateWebhook;

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                saveWebhook(form);
            }}
        >
            <div>
                <div className="form__field">
                    <label
                        htmlFor={`webhook-url-${formId}`}
                        className="form__label"
                    >
                        URL to notify
                    </label>
                    <ControlledTextInput
                        id={`webhook-url-${formId}`}
                        value={form.url}
                        onChange={e => updateField('url', e.target.value)}
                        disabled={disabled}
                    />
                </div>
            </div>
            <div className="control-panel__group">
                <div className="form__field">
                    <label
                        htmlFor={`webhook-type-${formId}`}
                        className="form__label"
                    >
                        Receive notifications for
                        <ReactSelect
                            id={`webhook-type-${formId}`}
                            onChange={option =>
                                updateField('notification_type', option.value)
                            }
                            value={contributorWebhookNotificationChoices.find(
                                opt => opt.value === form.notification_type,
                            )}
                            options={contributorWebhookNotificationChoices}
                            disabled={disabled}
                        />
                    </label>
                </div>
            </div>
            <div className="control-panel__group">
                <div className="form__field">
                    <label
                        htmlFor={`webhook-filter-${formId}`}
                        className="form__label"
                    >
                        Search query to apply as a filter to notifications
                    </label>
                    <ControlledTextInput
                        id={`webhook-filter-${formId}`}
                        value={form.filter_query_string}
                        onChange={e =>
                            updateField('filter_query_string', e.target.value)
                        }
                        disabled={disabled}
                        placeholder="?q=Brand name&countries=US"
                    />
                </div>
            </div>
            <div className="control-panel__group">
                <ShowOnly when={isNew}>
                    <Button
                        type="submit"
                        disabled={disabled || !isValid(form)}
                        color="primary"
                        variant="contained"
                        disableRipple
                    >
                        {creating ? <CircularProgress size={5} /> : 'Add'}
                    </Button>
                </ShowOnly>
                <ShowOnly when={!isNew && isDirty}>
                    <Button
                        type="submit"
                        disabled={disabled || !isValid(form)}
                        color="primary"
                        variant="contained"
                        disableRipple
                        style={{ marginRight: '1rem' }}
                    >
                        {updating ? <CircularProgress size={5} /> : 'Save'}
                    </Button>
                    <Button
                        type="button"
                        disabled={disabled}
                        color="primary"
                        variant="outlined"
                        disableRipple
                        onClick={() => resetChanges()}
                    >
                        Cancel
                    </Button>
                </ShowOnly>
                <ShowOnly when={!isDirty}>
                    <Button
                        type="button"
                        disabled={disabled}
                        color="secondary"
                        variant="contained"
                        disableRipple
                        onClick={() => confirmDeleting(webhook.id)}
                        style={{ marginRight: '1rem' }}
                    >
                        Delete
                    </Button>
                    <Button
                        type="button"
                        disabled={disabled}
                        color="primary"
                        variant="outlined"
                        disableRipple
                        onClick={() => testNotification(webhook.url)}
                    >
                        Test
                    </Button>
                </ShowOnly>
            </div>
        </form>
    );
}

ContributorWebhookForm.defaultProps = {
    webhook: null,
};

ContributorWebhookForm.propTypes = {
    webhook: contributorWebhookPropType,
    form: contributorWebhookPropType.isRequired,
    creating: bool.isRequired,
    updating: bool.isRequired,
    updateWebhook: func.isRequired,
    updateField: func.isRequired,
    resetChanges: func.isRequired,
    confirmDeleting: func.isRequired,
};

function mapStateToProps(
    { webhooks: { webhooks, creating, updating } },
    { index },
) {
    const isNew = !webhooks[index];
    const id = !isNew && webhooks[index].id;
    return {
        webhook: webhooks[index],
        creating: creating && isNew,
        updating: !!updating && updating === id,
    };
}

const mapDispatchToProps = (dispatch, { index }) => ({
    createWebhook: data => dispatch(createContributorWebhook(data)),
    updateWebhook: data => dispatch(updateContributorWebhook(data)),
    updateField: (field, value) =>
        dispatch(updateWebhookField({ index, field, value })),
    confirmDeleting: id => dispatch(confirmDeletingContributorWebhook(id)),
    resetChanges: () => dispatch(resetWebhookChanges(index)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ContributorWebhookForm);
