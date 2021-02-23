import { combineReducers } from 'redux';

// Here for potentially persisting specific reducers,
// although we don't need to persist any yet:
//
// import { persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';

import AuthReducer from './AuthReducer';
import ProfileReducer from './ProfileReducer';
import UploadReducer from './UploadReducer';
import FacilityListsReducer from './FacilityListsReducer';
import FacilityListDetailsReducer from './FacilityListDetailsReducer';
import FilterOptionsReducer from './FilterOptionsReducer';
import FiltersReducer from './FiltersReducer';
import UIReducer from './UIReducer';
import FacilitiesReducer from './FacilitiesReducer';
import FacilityCountReducer from './FacilityCountReducer';
import FeatureFlagsReducer from './FeatureFlagsReducer';
import ClientInfoReducer from './ClientInfoReducer';
import ClaimFacilityReducer from './ClaimFacilityReducer';
import ClaimFacilityDashboardReducer from './ClaimFacilityDashboardReducer';
import ClaimedFacilityDetailsReducer from './ClaimedFacilityDetailsReducer';
import ClaimedFacilitesReducer from './ClaimedFacilitesReducer';
import DashboardListsReducer from './DashboardListsReducer';
import DashboardApiBlocksReducer from './DashboardApiBlocksReducer';
import DashboardActivityReportsReducer from './DashboardActivityReportsReducer';
import DeleteFacilityReducer from './DeleteFacilityReducer';
import MergeFacilitiesReducer from './MergeFacilitiesReducer';
import AdjustFacilityMatchesReducer from './AdjustFacilityMatchesReducer';
import LogDownloadReducer from './LogDownloadReducer';
import VectorTileLayer from './VectorTileLayer';
import UpdateFacilityLocationReducer from './UpdateFacilityLocationReducer';
import EmbeddedMapReducer from './EmbeddedMapReducer';

export default combineReducers({
    auth: AuthReducer,
    profile: ProfileReducer,
    upload: UploadReducer,
    facilityLists: FacilityListsReducer,
    facilityListDetails: FacilityListDetailsReducer,
    filterOptions: FilterOptionsReducer,
    filters: FiltersReducer,
    ui: UIReducer,
    facilities: FacilitiesReducer,
    facilityCount: FacilityCountReducer,
    featureFlags: FeatureFlagsReducer,
    clientInfo: ClientInfoReducer,
    claimFacility: ClaimFacilityReducer,
    claimFacilityDashboard: ClaimFacilityDashboardReducer,
    claimedFacilityDetails: ClaimedFacilityDetailsReducer,
    claimedFacilities: ClaimedFacilitesReducer,
    dashboardLists: DashboardListsReducer,
    dashboardApiBlocks: DashboardApiBlocksReducer,
    dashboardActivityReports: DashboardActivityReportsReducer,
    deleteFacility: DeleteFacilityReducer,
    mergeFacilities: MergeFacilitiesReducer,
    adjustFacilityMatches: AdjustFacilityMatchesReducer,
    logDownload: LogDownloadReducer,
    vectorTileLayer: VectorTileLayer,
    updateFacilityLocation: UpdateFacilityLocationReducer,
    embeddedMap: EmbeddedMapReducer,
});
