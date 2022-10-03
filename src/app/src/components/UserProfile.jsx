import React, { Component } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import ArrowBack from '@material-ui/icons/ArrowBackIos';
import CircularProgress from '@material-ui/core/CircularProgress';
import { toast } from 'react-toastify';

import AppGrid from './AppGrid';
import AppOverflow from './AppOverflow';
import Button from './Button';
import FacilityListSummary from './FacilityListSummary';
import UserProfileField from './UserProfileField';
import UserCookiePreferences from './UserCookiePreferences';
import BadgeVerified from './BadgeVerified';
import MapIcon from './MapIcon';
import ShowOnly from './ShowOnly';
import RouteNotFound from './RouteNotFound';
import COLOURS from '../util/COLOURS';

import '../styles/css/specialStates.css';

import {
    facilitiesRoute,
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
        backgroundColor: '#fff',
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
    titleStyles: Object.freeze({
        fontWeight: '900',
        fontSize: '56px',
        lineHeight: '60px',
        margin: 0,
    }),
    badgeVerifiedStyles: Object.freeze({
        padding: '10px',
    }),
});

class UserProfile extends Component {
    componentDidMount() {
        return this.props.fetchProfile();
    }

    componentDidUpdate(prevProps) {
        const {
            id,
            fetchProfile,
            resetProfile,
            updatingProfile,
            errorsUpdatingProfile,
        } = this.props;

        if (prevProps.id !== id) {
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
            errorFetchingProfile,
            id,
            allowEdits,
            history: { push },
        } = this.props;

        if (fetching) {
            return <CircularProgress />;
        }

        if (!profile) {
            return null;
        }

        if (errorFetchingProfile) {
            return <RouteNotFound />;
        }

        const isCurrentUsersProfile =
            user && [profile.id, Number(id)].every(val => val === user.id);

        const isEditableProfile = allowEdits && isCurrentUsersProfile;

        const profileInputs = profileFormFields
            // Only show the name field on the profile page of the current user.
            // On other profile pages the name is the title of the page.
            .filter(field => isEditableProfile || field.id !== 'name')
            .map((field, index) => (
                <UserProfileField
                    autoFocus={index === 1} // the first field is email & isn't an input
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    header={field.header}
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
                />
            ));

        const title = (
            <div>
                <h3
                    style={{
                        fontWeight: '900',
                        fontSize: '14px',
                        letterSpacing: '0.5px',
                        lineHeight: '14px',
                        textTransform: 'uppercase',
                    }}
                >
                    Organization
                </h3>
                <h2 style={profileStyles.titleStyles}>
                    {!isEditableProfile && profile.name}
                </h2>
                <ShowOnly when={profile.isVerified}>
                    <span
                        title="Verified"
                        style={profileStyles.badgeVerifiedStyles}
                    >
                        <BadgeVerified color={COLOURS.NAVY_BLUE} />
                    </span>
                </ShowOnly>
            </div>
        );

        const titleBar = (
            <div
                className="user-profile-title-bar"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                {title}
                <ShowOnly when={!isEditableProfile}>
                    <div>
                        <a
                            href={`/facilities?contributors=${profile.contributorId}`}
                            rel="noopener noreferrer"
                            style={{
                                backgroundColor: '#FFCF3F',
                                color: '#000',
                                fontSize: '18px',
                                fontWeight: '900',
                                lineHeight: '20px',
                                textDecoration: 'none',
                                padding: '16px',
                                gap: '8px',
                                display: 'flex',
                            }}
                        >
                            <MapIcon />
                            View map of facilities
                        </a>
                    </div>
                </ShowOnly>
            </div>
        );

        const toolbar =
            isCurrentUsersProfile && !allowEdits ? (
                <Link to="/settings" href="/settings">
                    Edit
                </Link>
            ) : null;

        const showErrorMessages =
            isEditableProfile &&
            errorsUpdatingProfile &&
            errorsUpdatingProfile.length;

        const errorMessages = showErrorMessages ? (
            <ul style={profileStyles.errorMessagesStyles}>
                {errorsUpdatingProfile.map(error => (
                    <li key={error}>{error}</li>
                ))}
            </ul>
        ) : null;

        const submitButton = isEditableProfile ? (
            <div style={profileStyles.submitButton}>
                <Button
                    text="Save Changes"
                    onClick={updateProfile}
                    disabled={
                        (!isEditableProfile && fetching) || updatingProfile
                    }
                    color="primary"
                    variant="contained"
                    disableRipple
                >
                    Save Changes
                </Button>
            </div>
        ) : null;

        const facilityLists =
            !isEditableProfile && profile.facilityLists.length > 0 ? (
                <React.Fragment>
                    <h3
                        style={{
                            fontWeight: '900',
                            fontSize: '14px',
                            letterSpacing: '0.5px',
                            lineHeight: '14px',
                            textTransform: 'uppercase',
                        }}
                    >
                        Facility Lists
                    </h3>
                    <p color="#191919">
                        The following lists have been provided by this
                        contributor:
                    </p>
                    {profile.facilityLists.map(list => (
                        <FacilityListSummary
                            key={list.id}
                            contributor={list.contributor_id}
                            {...list}
                        />
                    ))}
                </React.Fragment>
            ) : null;

        const cookiePreferences = isEditableProfile ? (
            <UserCookiePreferences />
        ) : null;

        return (
            <AppOverflow>
                <div style={{ backgroundColor: '#F9F7F7' }}>
                    <ShowOnly when={!isEditableProfile}>
                        <Button
                            style={{
                                backgroundColor: 'transparent',
                                color: '#8428FA',
                                fontSize: '18px',
                                fontWeight: '700',
                                lineHeight: '18px',
                                letterSpacing: '0.5px',
                                textTransform: 'none',
                            }}
                            Icon={ArrowBack}
                            text="Back to search results"
                            onClick={() => {
                                push(facilitiesRoute);
                            }}
                        />
                    </ShowOnly>
                    <AppGrid
                        title={titleBar}
                        style={profileStyles.appGridContainer}
                    >
                        <Grid item xs={12}>
                            {toolbar}
                            {profileInputs}
                            {facilityLists}
                            {errorMessages}
                            {submitButton}
                            {cookiePreferences}
                        </Grid>
                    </AppGrid>
                </div>
            </AppOverflow>
        );
    }
}

UserProfile.defaultProps = {
    user: null,
    errorsUpdatingProfile: null,
    errorFetchingProfile: null,
};

UserProfile.propTypes = {
    user: userPropType,
    id: string.isRequired,
    fetching: bool.isRequired,
    profile: profileFormValuesPropType.isRequired,
    inputUpdates: profileFormInputHandlersPropType.isRequired,
    fetchProfile: func.isRequired,
    resetProfile: func.isRequired,
    updateProfile: func.isRequired,
    updatingProfile: bool.isRequired,
    errorsUpdatingProfile: arrayOf(string),
    submitFormOnEnterKeyPress: func.isRequired,
    errorFetchingProfile: arrayOf(string),
};

function mapStateToProps({
    auth: {
        user: { user },
        session: { fetching: sessionFetching },
        fetching: authFetching,
    },
    profile: {
        profile,
        fetching,
        error: errorFetchingProfile,
        formSubmission: {
            fetching: updatingProfile,
            error: errorsUpdatingProfile,
        },
    },
}) {
    return {
        user,
        fetching: fetching || sessionFetching || authFetching,
        profile,
        updatingProfile,
        errorsUpdatingProfile,
        errorFetchingProfile,
    };
}

const mapDispatchToProps = (dispatch, { id: profileID }) => {
    const makeInputChangeHandler = (field, getStateFromEvent) => e =>
        dispatch(
            updateProfileFormInput({
                value: getStateFromEvent(e),
                field,
            }),
        );

    const inputUpdates = Object.values(profileFieldsEnum).reduce(
        (acc, field) => {
            const { type } = profileFormFields.find(({ id }) => id === field);
            const getStateFromEvent = getStateFromEventForEventType[type];

            return Object.assign({}, acc, {
                [field]: makeInputChangeHandler(field, getStateFromEvent),
            });
        },
        {},
    );

    return {
        inputUpdates,
        fetchProfile: () => dispatch(fetchUserProfile(Number(profileID))),
        resetProfile: () => dispatch(resetUserProfile()),
        updateProfile: () => dispatch(updateUserProfile(Number(profileID))),
        submitFormOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(() =>
            dispatch(updateUserProfile(Number(profileID))),
        ),
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(UserProfile),
);
