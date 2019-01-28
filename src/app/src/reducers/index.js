import { combineReducers } from 'redux';

// Here for potentially persisting specific reducers,
// although we don't need to persist any yet:
//
// import { persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';

import NavbarReducer from './NavbarReducer';
import MapReducer from './MapReducer';
import SourceReducer from './SourceReducer';
import AuthReducer from './AuthReducer';
import ProfileReducer from './ProfileReducer';
import UploadReducer from './UploadReducer';
import FacilityListsReducer from './FacilityListsReducer';

export default combineReducers({
    nav: NavbarReducer,
    map: MapReducer,
    source: SourceReducer,
    auth: AuthReducer,
    profile: ProfileReducer,
    upload: UploadReducer,
    facilityLists: FacilityListsReducer,
});
