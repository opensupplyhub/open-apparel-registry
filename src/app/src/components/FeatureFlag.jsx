import React from 'react';
import { arrayOf, bool, node } from 'prop-types';
import { connect } from 'react-redux';
import includes from 'lodash/includes';

import { featureFlagPropType } from '../util/propTypes';

import { convertFeatureFlagsObjectToListOfActiveFlags } from '../util/util';

function FeatureFlag({
    flag,
    children,
    alternative,
    activeFeatureFlags,
    fetching,
}) {
    if (fetching) {
        return null;
    }

    if (!includes(activeFeatureFlags, flag)) {
        return alternative;
    }

    return <React.Fragment>{children}</React.Fragment>;
}

FeatureFlag.defaultProps = {
    alternative: null,
};

FeatureFlag.propTypes = {
    flag: featureFlagPropType.isRequired,
    children: node.isRequired,
    alternative: node,
    activeFeatureFlags: arrayOf(featureFlagPropType).isRequired,
    fetching: bool.isRequired,
};

function mapStateToProps({ featureFlags: { fetching, flags } }) {
    return {
        activeFeatureFlags: convertFeatureFlagsObjectToListOfActiveFlags(flags),
        fetching,
    };
}

export default connect(mapStateToProps)(FeatureFlag);
