import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import Routes from './Routes';
import { fetchEmbedConfig } from './actions/embeddedMap';
import { OARColor } from './util/constants';
import EmbeddedMapUnauthorized from './components/EmbeddedMapUnauthorized';

import './App.css';

function App({
    embed,
    contributor,
    getEmbedConfig,
    config,
    embedError,
    embedLoading,
}) {
    const contributorId = contributor?.value;
    useEffect(() => {
        if (embed && contributorId) {
            getEmbedConfig(contributorId);
        }
    }, [embed, contributorId, getEmbedConfig]);

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

    if (embed && embedLoading) {
        return null;
    }

    if (embed && embedError) {
        return <EmbeddedMapUnauthorized error={embedError} />;
    }

    return (
        <MuiThemeProvider theme={theme}>
            <Routes />
        </MuiThemeProvider>
    );
}

function mapStateToProps({
    embeddedMap: { embed, config, error, loading },
    filters,
}) {
    return {
        embed: !!embed,
        contributor: filters?.contributors[0],
        config,
        embedError: error,
        embedLoading: loading,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getEmbedConfig: id => dispatch(fetchEmbedConfig(id)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
