import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import memoize from 'lodash/memoize';
import noop from 'lodash/noop';

import AppGrid from './AppGrid';
import Button from './Button';
import UserProfileField from './UserProfileField';
import UserAPITokens from './UserAPITokens';

import '../styles/css/specialStates.css';

import {
    profileFieldsEnum,
    profileFormFields,
    OTHER,
} from '../util/constants';

import {
    userPropType,
    profileFormValuesPropType,
    profileFormInputHandlersPropType,
} from '../util/propTypes';

import { getStateFromEventForEventType } from '../util/util';

import { updateProfileFormInput } from '../actions/profile';

const profileStyles = Object.freeze({
    image: Object.freeze({
        width: '100%',
        height: '100%',
        borderRadius: '100%',
    }),
    tempStyle: Object.freeze({
        marginTop: '10%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    }),
    appGridContainer: Object.freeze({
        justifyContent: 'space-between',
        marginBottom: '100px',
    }),
    submitButton: Object.freeze({
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '35px',
    }),
});

function TempNotCurrentUser({
    text,
}) {
    return (
        <div style={profileStyles.tempStyle}>
            <h1>
                {text}
            </h1>
        </div>
    );
}

TempNotCurrentUser.propTypes = {
    text: string.isRequired,
};

function UserProfile({
    user,
    fetching,
    profile,
    isEditable,
    inputUpdates,
    submitForm,
    match: {
        params: {
            id,
        },
    },
}) {
    if (fetching) {
        return null;
    }

    if (!user) {
        return <TempNotCurrentUser text="Not logged in" />;
    }

    if (user.id !== Number(id)) {
        return <TempNotCurrentUser text="Not current user" />;
    }

    const profileInputs = profileFormFields
        .map(field => (
            <UserProfileField
                key={field.id}
                id={field.id}
                label={field.label}
                type={field.type}
                options={field.options}
                value={profile[field.id]}
                handleChange={inputUpdates[field.id]}
                isHidden={
                    profile.contributorType !== OTHER &&
                    field.id === profileFieldsEnum.otherContributorType
                }
                disabled={!isEditable}
                required={field.required}
            />));

    return (
        <AppGrid
            title="My Profile"
            style={profileStyles.appGridContainer}
        >
            <Grid item xs={12} sm={7}>
                {profileInputs}
                <div style={profileStyles.submitButton}>
                    <Button
                        text="Save Changes"
                        onClick={submitForm}
                        disabled={!isEditable && fetching}
                        color="primary"
                        variant="contained"
                        disableRipple
                    >
                        Save Changes
                    </Button>
                </div>
                <UserAPITokens />
            </Grid>
        </AppGrid>
    );
}

UserProfile.defaultProps = {
    user: null,
};

UserProfile.propTypes = {
    user: userPropType,
    match: shape({
        params: shape({
            id: string.isRequired,
        }).isRequired,
    }).isRequired,
    fetching: bool.isRequired,
    profile: profileFormValuesPropType.isRequired,
    inputUpdates: profileFormInputHandlersPropType.isRequired,
    submitForm: func.isRequired,
    isEditable: bool.isRequired,
};

function mapStateToProps({
    auth: {
        user: {
            user,
        },
        session: {
            fetching,
        },
    },
    profile: {
        profile,
        isEditable,
    },
}) {
    return {
        user,
        fetching,
        profile,
        isEditable,
    };
}

const mapDispatchToProps = memoize((dispatch) => {
    const makeInputChangeHandler = (field, getStateFromEvent) => e =>
        dispatch(updateProfileFormInput({
            value: getStateFromEvent(e),
            field,
        }));

    const inputUpdates = Object
        .values(profileFieldsEnum)
        .reduce((acc, field) => {
            const { type } = profileFormFields.find(({ id }) => id === field);
            const getStateFromEvent = getStateFromEventForEventType[type];

            return Object.assign({}, acc, {
                [field]: makeInputChangeHandler(field, getStateFromEvent),
            });
        }, {});

    return {
        inputUpdates,
        submitForm: noop,
    };
});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
