import { combineReducers } from 'redux';

// Here for potentially persisting specific reducers,
// although we don't need to persist any yet:
//
// import { persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';

import MapReducer from './MapReducer';
import AuthReducer from './AuthReducer';
import ProfileReducer from './ProfileReducer';
import UploadReducer from './UploadReducer';
import FacilityListsReducer from './FacilityListsReducer';
import FilterOptionsReducer from './FilterOptionsReducer';
import FiltersReducer from './FiltersReducer';
import UIReducer from './UIReducer';

export default combineReducers({
    map: MapReducer,
    auth: AuthReducer,
    profile: ProfileReducer,
    upload: UploadReducer,
    facilityLists: FacilityListsReducer,
    filterOptions: FilterOptionsReducer,
    filters: FiltersReducer,
    ui: UIReducer,
});
