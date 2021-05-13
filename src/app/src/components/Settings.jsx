import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import includes from 'lodash/includes';

import UserProfile from './UserProfile';
import UserAPITokens from './UserAPITokens';
import AppOverflow from './AppOverflow';
import AppGrid from './AppGrid';
import EmbeddedMapConfigWrapper from './EmbeddedMapConfigWrapper';

import { userPropType } from '../util/propTypes';
import { authLoginFormRoute, EMBEDDED_MAP_FLAG } from '../util/constants';
import { convertFeatureFlagsObjectToListOfActiveFlags } from '../util/util';

const PROFILE_TAB = 'Profile';
const EMBED_TAB = 'Embed';
const TOKEN_TAB = 'Tokens';

const getTabs = ({ fetchingFlags, activeFeatureFlags }) => {
    if (fetchingFlags || !includes(activeFeatureFlags, EMBEDDED_MAP_FLAG)) {
        return [PROFILE_TAB, TOKEN_TAB];
    }

    return [PROFILE_TAB, EMBED_TAB, TOKEN_TAB];
};

function Settings({
    user,
    fetchingSessionSignIn,
    activeFeatureFlags,
    fetchingFlags,
}) {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const handleTabChange = (e, tab) => setActiveTabIndex(tab);

    const tabs = getTabs({ fetchingFlags, activeFeatureFlags });

    if (fetchingSessionSignIn) {
        return (
            <AppGrid title="Settings">
                <Grid container className="margin-bottom-64">
                    <Grid item xs={12}>
                        <CircularProgress />
                    </Grid>
                </Grid>
            </AppGrid>
        );
    }

    if (!user) {
        return (
            <AppGrid title="Settings">
                <Grid container className="margin-bottom-64">
                    <Grid item xs={12}>
                        <Link to={authLoginFormRoute} href={authLoginFormRoute}>
                            Log in to update your settings
                        </Link>
                    </Grid>
                </Grid>
            </AppGrid>
        );
    }

    return (
        <React.Fragment>
            <AppGrid title="Settings">
                <Tabs
                    value={activeTabIndex}
                    onChange={handleTabChange}
                    classes={{
                        root: 'tabs',
                        indicator: 'tabs-indicator-color',
                    }}
                >
                    {tabs.map(tab => (
                        <Tab label={tab} key={tab} className="tab-minwidth" />
                    ))}
                </Tabs>
            </AppGrid>
            <AppOverflow>
                {user && tabs[activeTabIndex] === PROFILE_TAB && (
                    <UserProfile allowEdits id={user.id.toString()} />
                )}
                {tabs[activeTabIndex] === EMBED_TAB && (
                    <EmbeddedMapConfigWrapper />
                )}
                {tabs[activeTabIndex] === TOKEN_TAB && (
                    <AppGrid>
                        <UserAPITokens />
                    </AppGrid>
                )}
            </AppOverflow>
        </React.Fragment>
    );
}

Settings.defaultProps = {
    user: null,
};

Settings.propTypes = {
    user: userPropType,
};

function mapStateToProps({
    auth: {
        user: { user },
        session: { fetching },
    },
    featureFlags: { fetching: fetchingFlags, flags },
}) {
    return {
        user,
        fetchingSessionSignIn: fetching,
        activeFeatureFlags: convertFeatureFlagsObjectToListOfActiveFlags(flags),
        fetchingFlags,
    };
}

export default connect(mapStateToProps)(Settings);
