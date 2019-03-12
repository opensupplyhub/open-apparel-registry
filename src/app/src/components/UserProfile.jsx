import React, { Component } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import { toast } from 'react-toastify';

import AppGrid from './AppGrid';
import AppOverflow from './AppOverflow';
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

import {
    getStateFromEventForEventType,
    makeSubmitFormOnEnterKeyPressFunction,
} from '../util/util';

import {
    updateProfileFormInput,
    fetchUserProfile,
    resetUserProfile,
    updateUserProfile,
} from '../actions/profile';

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
    errorMessagesStyles: Object.freeze({
        color: 'red',
        padding: '1rem',
    }),
});

class UserProfile extends Component {
    componentDidMount() {
        return this.props.fetchProfile();
    }

    componentDidUpdate(prevProps) {
        const {
            match: {
                params: {
                    id,
                },
            },
            fetchProfile,
            resetProfile,
            updatingProfile,
            errorsUpdatingProfile,
        } = this.props;

        if (prevProps.match.params.id !== id) {
            resetProfile();
            return fetchProfile();
        }

        if (errorsUpdatingProfile) {
            return null;
        }

        if (!updatingProfile && prevProps.updatingProfile) {
            return toast('Updated profile!');
        }

        return null;
    }

    componentWillUnmount() {
        return this.props.resetProfile();
    }

    render() {
        const {
            user,
            fetching,
            profile,
            inputUpdates,
            updateProfile,
            updatingProfile,
            errorsUpdatingProfile,
            submitFormOnEnterKeyPress,
            match: {
                params: {
                    id,
                },
            },
        } = this.props;

        if (fetching) {
            return <CircularProgress />;
        }

        const isEditableProfile =
            (user && [profile.id, Number(id)].every(val => val === user.id));

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
                    disabled={fetching}
                    required={field.required}
                    hideOnViewOnlyProfile={field.hideOnViewOnlyProfile}
                    isEditableProfile={isEditableProfile}
                    submitFormOnEnterKeyPress={submitFormOnEnterKeyPress}
                />));

        const title = isEditableProfile
            ? 'My Profile'
            : 'Profile';

        const showErrorMessages = isEditableProfile
            && errorsUpdatingProfile
            && errorsUpdatingProfile.length;

        const errorMessages = showErrorMessages
            ? (
                <ul style={profileStyles.errorMessagesStyles}>
                    {
                        errorsUpdatingProfile
                            .map(error => (
                                <li key={error}>
                                    {error}
                                </li>))
                    }
                </ul>)
            : null;

        const submitButton = isEditableProfile
            ? (
                <div style={profileStyles.submitButton}>
                    <Button
                        text="Save Changes"
                        onClick={updateProfile}
                        disabled={(!isEditableProfile && fetching) || updatingProfile}
                        color="primary"
                        variant="contained"
                        disableRipple
                    >
                        Save Changes
                    </Button>
                </div>)
            : null;

        const apiTokensSection = isEditableProfile
            ? <UserAPITokens />
            : null;

        return (
            <AppOverflow>
                <AppGrid
                    title={title}
                    style={profileStyles.appGridContainer}
                >
                    <Grid item xs={12} sm={7}>
                        {profileInputs}
                        {errorMessages}
                        {submitButton}
                        {apiTokensSection}
                    </Grid>
                </AppGrid>
            </AppOverflow>
        );
    }
}

UserProfile.defaultProps = {
    user: null,
    errorsUpdatingProfile: null,
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
    fetchProfile: func.isRequired,
    resetProfile: func.isRequired,
    updateProfile: func.isRequired,
    updatingProfile: bool.isRequired,
    errorsUpdatingProfile: arrayOf(string),
    submitFormOnEnterKeyPress: func.isRequired,
};

function mapStateToProps({
    auth: {
        user: {
            user,
        },
        session: {
            fetching: sessionFetching,
        },
    },
    profile: {
        profile,
        fetching,
        formSubmission: {
            fetching: updatingProfile,
            error: errorsUpdatingProfile,
        },
    },
}) {
    return {
        user,
        fetching: fetching || sessionFetching,
        profile,
        updatingProfile,
        errorsUpdatingProfile,
    };
}

const mapDispatchToProps = (dispatch, {
    match: {
        params: {
            id: profileID,
        },
    },
}) => {
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
        fetchProfile: () => dispatch(fetchUserProfile(Number(profileID))),
        resetProfile: () => dispatch(resetUserProfile()),
        updateProfile: () => dispatch(updateUserProfile(Number(profileID))),
        submitFormOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(
            () => dispatch(updateUserProfile(Number(profileID))),
        ),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
