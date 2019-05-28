import React, { Component } from 'react';
import { connect } from 'react-redux';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Link } from 'react-router-dom';
import head from 'lodash/head';
import last from 'lodash/last';

import FacilityDetailsStaticMap from './FacilityDetailsStaticMap';
import FacilityDetailSidebarInfo from './FacilityDetailSidebarInfo';
import FeatureFlag from './FeatureFlag';
import BadgeUnclaimed from './BadgeUnclaimed';

import {
    fetchSingleFacility,
    resetSingleFacility,
} from '../actions/facilities';

import { facilityDetailsPropType } from '../util/propTypes';

import { makeReportADataIssueEmailLink, makeClaimFacilityLink } from '../util/util';

import { CLAIM_A_FACILITY } from '../util/constants';

const detailsSidebarStyles = Object.freeze({
    headerButtonStyle: Object.freeze({
        width: '30px',
        marginRight: '14px',
        marginLeft: '8px',
    }),
    linkSectionStyle: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
    }),
    linkStyle: Object.freeze({
        display: 'inline-block',
        fontSize: '16px',
    }),
});

class FacilityDetailSidebar extends Component {
    componentDidMount() {
        return this.props.fetchFacility();
    }

    componentDidUpdate({
        match: {
            params: {
                oarID: prevOARID,
            },
        },
    }) {
        const {
            match: {
                params: {
                    oarID,
                },
            },
        } = this.props;

        return oarID !== prevOARID
            ? this.props.fetchFacility()
            : null;
    }

    componentWillUnmount() {
        return this.props.clearFacility();
    }

    render() {
        const {
            fetching,
            data,
            error,
            match: {
                params: {
                    oarID,
                },
            },
            history: {
                goBack,
                push,
            },
        } = this.props;

        if (fetching) {
            return (
                <div className="control-panel">
                    <div className="control-panel__content">
                        <CircularProgress />
                    </div>
                </div>
            );
        }

        if (error && error.length) {
            return (
                <div className="control-panel">
                    <div className="control-panel__content">
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
                    </div>
                </div>
            );
        }

        if (!data) {
            return (
                <div className="control-panel">
                    <div className="control-panel__content">
                        {`No facility found for OAR ID ${oarID}`}
                    </div>
                </div>
            );
        }

        const facilityLat = last(data.geometry.coordinates);
        const facilityLng = head(data.geometry.coordinates);

        return (
            <div className="control-panel facility-detail">
                <div className="panel-header display-flex">
                    <IconButton
                        aria-label="ArrowBack"
                        className="color-white"
                        style={detailsSidebarStyles.headerButtonStyle}
                        onClick={goBack}
                        disabled={fetching}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <div>
                        <h3 className="panel-header__title notranslate">
                            {data.properties.name}
                        </h3>
                        <p className="panel-header__subheading notranslate">
                            {data.properties.address} - {data.properties.country_name}
                        </p>
                    </div>
                    <FeatureFlag flag={CLAIM_A_FACILITY}>
                        <IconButton
                            aria-label="ArrowBack"
                            className="color-white"
                            style={detailsSidebarStyles.headerButtonStyle}
                            onClick={() => push(makeClaimFacilityLink(data.properties.oar_id))}
                            disabled={fetching}
                            title="Claim this facility"
                        >
                            <BadgeUnclaimed />
                        </IconButton>
                    </FeatureFlag>
                </div>
                <div className="facility-detail_data">
                    <FacilityDetailsStaticMap data={data} />
                    <div className="control-panel__content">
                        <div className="control-panel__group">
                            <h1 className="control-panel__heading">
                                OAR ID: &nbsp;
                            </h1>
                            <p className="control-panel__body">
                                {data.properties.oar_id}
                            </p>
                        </div>
                        <div className="control-panel__group">
                            <h1 className="control-panel__heading">
                                GPS Coordinates:
                            </h1>
                            <p className="control-panel__body">
                                {facilityLat}, {facilityLng}
                            </p>
                        </div>
                        <FacilityDetailSidebarInfo
                            data={data.properties.other_names}
                            label="Also known as:"
                        />
                        <FacilityDetailSidebarInfo
                            data={data.properties.other_addresses}
                            label="Other addresses:"
                        />
                        <FacilityDetailSidebarInfo
                            data={data.properties.contributors}
                            label="Contributors:"
                            isContributorsList
                        />
                        <div className="control-panel__group">
                            <div style={detailsSidebarStyles.linkSectionStyle}>
                                <a
                                    className="link-underline small"
                                    href={makeReportADataIssueEmailLink(data.properties.oar_id)}
                                    style={detailsSidebarStyles.linkStyle}
                                >
                                    Suggest a data edit
                                </a>
                                <FeatureFlag flag={CLAIM_A_FACILITY}>
                                    <Link
                                        className="link-underline small"
                                        to={makeClaimFacilityLink(data.properties.oar_id)}
                                        href={makeClaimFacilityLink(data.properties.oar_id)}
                                        style={detailsSidebarStyles.linkStyle}
                                    >
                                        Claim this facility
                                    </Link>
                                </FeatureFlag>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

FacilityDetailSidebar.defaultProps = {
    data: null,
    error: null,
};

FacilityDetailSidebar.propTypes = {
    data: facilityDetailsPropType,
    fetching: bool.isRequired,
    error: arrayOf(string),
    match: shape({
        params: shape({
            oarID: string.isRequired,
        }).isRequired,
    }).isRequired,
    history: shape({
        goBack: func.isRequired,
        push: func.isRequired,
    }).isRequired,
    fetchFacility: func.isRequired,
    clearFacility: func.isRequired,
};

function mapStateToProps({
    facilities: {
        singleFacility: {
            data,
            fetching,
            error,
        },
    },
}) {
    return {
        data,
        fetching,
        error,
    };
}

function mapDispatchToProps(dispatch, {
    match: {
        params: {
            oarID,
        },
    },
}) {
    return {
        fetchFacility: () => dispatch(fetchSingleFacility(oarID)),
        clearFacility: () => dispatch(resetSingleFacility()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FacilityDetailSidebar);
