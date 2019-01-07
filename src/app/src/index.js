import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { unregister } from './registerServiceWorker';
import { store, persistor } from './configureStore';
import './index.css';
import App from './App';

// TODO: Remove store from window
window.store = store;

/* eslint-disable react/jsx-filename-extension */
render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <App />
        </PersistGate>
    </Provider>,
    document.getElementById('root'),
);
unregister();
/* eslint-enable react/jsx-filename-extension */
