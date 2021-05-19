import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import Routes from './Routes';
import { fetchEmbedConfig } from './actions/embeddedMap';

import './App.css';

function App({ embed, contributor, getEmbedConfig, config }) {
    const contributorId = contributor?.value;
    useEffect(() => {
        if (embed && contributorId) {
            getEmbedConfig(contributorId);
        }
    }, [embed, contributorId]);

    const theme = useMemo(
        () =>
            createMuiTheme({
                typography: {
                    fontFamily: config.font,
                },
                palette: {
                    primary: {
                        main: config.color || OARColor,
                        coloredBackground:
                            config.color === OARColor ? '#c7d2fa' : '',
                    },
                },
            }),
        [config],
    );

    return (
        <MuiThemeProvider theme={theme}>
            <Routes />
        </MuiThemeProvider>
    );
}

function mapStateToProps({ embeddedMap: { embed, config }, filters }) {
    return {
        embed: !!embed,
        contributor: filters?.contributors[0],
        config,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getEmbedConfig: id => dispatch(fetchEmbedConfig(id)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
