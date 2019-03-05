import React, { Component } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

import AppGrid from './AppGrid';
import AppOverflow from './AppOverflow';
import FacilityListsEmpty from './FacilityListsEmpty';
import FacilityListsTable from './FacilityListsTable';
import ShowOnly from './ShowOnly';

import {
    fetchUserFacilityLists,
    resetUserFacilityLists,
} from '../actions/facilityLists';

import { authLoginFormRoute } from '../util/constants';
import { makeMyFacilitiesRoute } from '../util/util';
import { facilityListPropType } from '../util/propTypes';

class FacilityLists extends Component {
    componentDidMount() {
        return this.props.fetchLists();
    }

    componentWillUnmount() {
        return this.props.resetLists();
    }

    render() {
        const {
            facilityLists,
            fetching,
            error,
            userHasSignedIn,
            fetchingSessionSignIn,
            myFacilitiesRoute,
        } = this.props;

        if (fetching || fetchingSessionSignIn || error || !userHasSignedIn) {
            const insetComponent = (() => {
                if (fetching || fetchingSessionSignIn) {
                    return <CircularProgress size={50} />;
                }

                if (!userHasSignedIn) {
                    return (
                        <Link
                            to={authLoginFormRoute}
                            href={authLoginFormRoute}
                        >
                            Sign in to view your Open Apparel Registry lists
                        </Link>
                    );
                }

                if (error && error.length) {
                    return (
                        <ul>
                            {
                                error
                                    .map(err => (
                                        <li
                                            key={err}
                                            style={{ color: 'red' }}
                                        >
                                            {err}
                                        </li>))
                            }
                        </ul>
                    );
                }

                return null;
            })();

            return (
                <AppGrid title="My Lists">
                    {insetComponent}
                </AppGrid>
            );
        }

        const tableComponent = facilityLists && facilityLists.length
            ? <FacilityListsTable facilityLists={facilityLists} />
            : <FacilityListsEmpty />;

        return (
            <AppOverflow>
                <AppGrid title="My Lists">
                    <ShowOnly when={!!myFacilitiesRoute}>
                        <Link
                            to={myFacilitiesRoute}
                            href={myFacilitiesRoute}
                            style={{ paddingBottom: '20px' }}
                        >
                            View my facilities
                        </Link>
                    </ShowOnly>
                    {tableComponent}
                </AppGrid>
            </AppOverflow>
        );
    }
}

FacilityLists.defaultProps = {
    error: null,
    myFacilitiesRoute: null,
};

FacilityLists.propTypes = {
    facilityLists: arrayOf(facilityListPropType).isRequired,
    fetching: bool.isRequired,
    error: arrayOf(string),
    fetchLists: func.isRequired,
    resetLists: func.isRequired,
    userHasSignedIn: bool.isRequired,
    fetchingSessionSignIn: bool.isRequired,
    myFacilitiesRoute: string,
};

function mapStateToProps({
    facilityLists: {
        facilityLists,
        fetching,
        error,
    },
    auth: {
        user: {
            user,
        },
        session: {
            fetching: fetchingSessionSignIn,
        },
    },
}) {
    return {
        facilityLists,
        fetching,
        error,
        userHasSignedIn: !!user,
        myFacilitiesRoute: (user && user.contributor_id)
            ? makeMyFacilitiesRoute(user.contributor_id)
            : null,
        fetchingSessionSignIn,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchLists: () => dispatch(fetchUserFacilityLists()),
        resetLists: () => dispatch(resetUserFacilityLists()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FacilityLists);
