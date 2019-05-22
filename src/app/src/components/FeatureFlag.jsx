import React from 'react';
import { arrayOf, node } from 'prop-types';
import { connect } from 'react-redux';
import includes from 'lodash/includes';

import { featureFlagPropType } from '../util/propTypes';

import { convertFeatureFlagsObjectToListOfActiveFlags } from '../util/util';

function FeatureFlag({
    flag,
    children,
    activeFeatureFlags,
}) {
    if (!includes(activeFeatureFlags, flag)) {
        return null;
    }

    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    );
}

FeatureFlag.propTypes = {
    flag: featureFlagPropType.isRequired,
    children: node.isRequired,
    activeFeatureFlags: arrayOf(featureFlagPropType).isRequired,
};

function mapStateToProps({
    featureFlags,
}) {
    return {
        activeFeatureFlags: convertFeatureFlagsObjectToListOfActiveFlags(featureFlags),
    };
}

export default connect(mapStateToProps)(FeatureFlag);
