import { createStore, applyMiddleware } from 'redux';
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

export const store = createStore(
    persistedReducer,
    applyMiddleware(thunkMiddleware)
);

export const persistor = persistStore(store);
