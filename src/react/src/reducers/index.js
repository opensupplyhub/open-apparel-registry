import { combineReducers } from 'redux'
import UserReducer from './UserReducer'
import NavbarReducer from './NavbarReducer'
import MapReducer from './MapReducer'
import ListsReducer from './ListsReducer'
import SourceReducer from './SourceReducer'

export default combineReducers({
  user: UserReducer,
  nav: NavbarReducer,
  map: MapReducer,
  lists: ListsReducer,
  source: SourceReducer
})
