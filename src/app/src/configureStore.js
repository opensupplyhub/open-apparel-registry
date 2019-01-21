import { compose, createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { persistStore } from 'redux-persist';
import thunkMiddleware from 'redux-thunk';
import isObject from 'lodash/isObject';

import rootReducer from './reducers';

const isDevelopment = process.env.NODE_ENV === 'development';

/* eslint-disable no-underscore-dangle */
const devtoolsExtensionCompose = isDevelopment
    && isObject(window)
    && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
/* eslint-enable no-underscore-dangle */

const middleware = isDevelopment
    ? [thunkMiddleware, createLogger({ diff: true, collapsed: true })]
    : [thunkMiddleware];

const composeEnhancers = devtoolsExtensionCompose || compose;
const enhancer = composeEnhancers(applyMiddleware(...middleware));

export const store = createStore(rootReducer, enhancer);
export const persistor = persistStore(store);
