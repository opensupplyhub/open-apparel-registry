// polyfills for IE11
import 'core-js';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { unregister } from './registerServiceWorker';
import { store } from './configureStore';
import './index.css';
import App from './App';

/* eslint-disable react/jsx-filename-extension */
render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'),
);
unregister();
/* eslint-enable react/jsx-filename-extension */
