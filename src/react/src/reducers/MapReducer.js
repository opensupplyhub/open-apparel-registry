const initialState = {
  viewport: {
    lat: 34,
    lng: 5,
    zoom: 1.5
  },
  selectedFactory: null,
  factories: [],
  factoryGeojson: []
}

const MapReducer = (state = initialState, action) => {
  switch (action.type) {
  case 'SET_VIEWPORT':
    return { ...state, viewport: action.payload }
  case 'SELECT_FACTORY':
    return { ...state, selectedFactory: action.payload }
  case 'SET_FACTORIES':
    return { ...state, factories: action.payload }
  case 'SET_FACTORY_GEO':
    return { ...state, factoryGeojson: action.payload }
  case 'RESET':
    return initialState
  default:
    return state
  }
}

export default MapReducer
