import { compose, createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { persistStore } from 'redux-persist';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers';

const middleware = process.env.NODE_ENV === 'development'
    ? [thunkMiddleware, createLogger({ diff: true, collapsed: true })]
    : [thunkMiddleware];

const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);

export const store = compose(createStoreWithMiddleware(rootReducer, {}));
export const persistor = persistStore(store);
