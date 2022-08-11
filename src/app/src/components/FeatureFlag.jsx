import React from 'react';
import { arrayOf, bool, node } from 'prop-types';
import { connect } from 'react-redux';
import includes from 'lodash/includes';

import { featureFlagPropType } from '../util/propTypes';

import {
    convertFeatureFlagsObjectToListOfActiveFlags,
    filterFlagsIfAppIsEmbeded,
} from '../util/util';

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

    // eslint-disable-next-line react/jsx-no-useless-fragment
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

function mapStateToProps({
    featureFlags: { fetching, flags },
    embeddedMap: { embed: isEmbeded },
}) {
    const activeFeatureFlags = convertFeatureFlagsObjectToListOfActiveFlags(
        flags,
    );
    return {
        activeFeatureFlags: filterFlagsIfAppIsEmbeded(
            activeFeatureFlags,
            isEmbeded,
        ),
        fetching,
    };
}

export default connect(mapStateToProps)(FeatureFlag);
