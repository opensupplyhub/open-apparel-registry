// polyfills for IE11
import 'core-js';
import React from 'react';
import { render } from 'react-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { Provider } from 'react-redux';
import { unregister } from './registerServiceWorker';
import { store } from './configureStore';
import './index.css';
import App from './App';
import { OARFont } from './util/constants';

const theme = createMuiTheme({
    typography: {
        fontFamily: OARFont,
    },
    palette: {
        primary: {
            main: '#0427a4',
        },
    },
});

/* eslint-disable react/jsx-filename-extension */
render(
    <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <App />
        </MuiThemeProvider>
    </Provider>,
    document.getElementById('root'),
);
unregister();
/* eslint-enable react/jsx-filename-extension */
