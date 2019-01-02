import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers';

const persistConfig = {
    key: 'root',
    storage,
    blacklist: ['lists', 'map'], // lists will not be persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const middleware = process.env.NODE_ENV === 'development'
    ? [thunkMiddleware, createLogger({ diff: true, collapsed: true })]
    : [thunkMiddleware];

export const store = createStore(
    persistedReducer,
    applyMiddleware(...middleware),
);

export const persistor = persistStore(store);
