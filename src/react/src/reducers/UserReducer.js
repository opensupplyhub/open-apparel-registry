const UserReducer = (state = { loaded: false }, action) => {
  switch (action.type) {
  case 'ADD_USER':
    return { ...state, ...action, loaded: true }
  case 'NO_USER':
    return { loaded: false, betaAccess: state.betaAccess }
  case 'UPDATE_PROFILE_PHOTO':
    return { ...state, photo: action.url }
  case 'UPLOAD_LIST_SUCCESS':
    return { ...state, successfullyUploaded: true }
  case 'CHECK_ACCESS':
    return { ...state, betaAccess: false }
  default:
    return state
  }
}

export default UserReducer
