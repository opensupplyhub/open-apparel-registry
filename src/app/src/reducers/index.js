import { combineReducers } from 'redux';

// Here for potentially persisting specific reducers,
// although we don't need to persist any yet:
//
// import { persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';

import NavbarReducer from './NavbarReducer';
import MapReducer from './MapReducer';
import ListsReducer from './ListsReducer';
import SourceReducer from './SourceReducer';
import AuthReducer from './AuthReducer';

export default combineReducers({
    nav: NavbarReducer,
    map: MapReducer,
    lists: ListsReducer,
    source: SourceReducer,
    auth: AuthReducer,
});
