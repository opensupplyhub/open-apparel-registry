export const setViewport = (lat, lng, zoom) => dispatch =>
    dispatch({ type: 'SET_VIEWPORT', payload: { lat, lng, zoom } });

export const selectFactory = factory => dispatch =>
    dispatch({ type: 'SELECT_FACTORY', payload: factory });

export const setFactories = factories => dispatch =>
    dispatch({ type: 'SET_FACTORIES', payload: factories });
export const setFactoryGeo = geo => dispatch =>
    dispatch({ type: 'SET_FACTORY_GEO', payload: geo });
export const resetMap = () => dispatch => dispatch({ type: 'RESET' });
