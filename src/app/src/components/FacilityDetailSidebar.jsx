import React from 'react';

import FacilityDetailSidebarOriginal from './FacilityDetailSidebarOriginal';
import FacilityDetailSidebarExtended from './FacilityDetailSidebarExtended';
import FeatureFlag from './FeatureFlag';

import { EXTENDED_PROFILE_FLAG } from '../util/constants';

const FacilityDetailSidebar = props => (
    <FeatureFlag
        flag={EXTENDED_PROFILE_FLAG}
        alternative={<FacilityDetailSidebarOriginal {...props} />}
    >
        <FacilityDetailSidebarExtended {...props} />
    </FeatureFlag>
);

export default FacilityDetailSidebar;
