const SourceReducer = (state = { source: [] }, action) => {
  switch (action.type) {
  case 'SET_SOURCE':
    return { ...state, source: action.payload }
  default:
    return state
  }
}

export default SourceReducer
