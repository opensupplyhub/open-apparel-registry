import React, { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import Routes from './Routes';
import { fetchEmbedConfig } from './actions/embeddedMap';
import { OARColor, OARSecondaryColor, OARActionColor } from './util/constants';
import EmbeddedMapUnauthorized from './components/EmbeddedMapUnauthorized';

import './App.css';

const configOrDefault = (configColor, defaultColor) =>
    !configColor || configColor === OARColor ? defaultColor : configColor;

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
                breakpoints: {
                    values: {
                        xs: 0,
                        sm: 700,
                        md: 900,
                        lg: 1280,
                        xl: 1920,
                    },
                },
                typography: {
                    fontFamily: config.font,
                },
                palette: {
                    primary: {
                        main: config.color || OARColor,
                        coloredBackground:
                            config.color === OARColor ? '#c7d2fa' : '',
                    },
                    secondary: {
                        main: configOrDefault(config.color, OARSecondaryColor),
                    },
                    action: {
                        main: configOrDefault(config.color, OARActionColor),
                        contrastText: 'rgba(0, 0, 0, 0.87)',
                        dark: configOrDefault(
                            config.color,
                            'rgb(178, 144, 44)',
                        ),
                        light: configOrDefault(
                            config.color,
                            'rgb(255, 216, 101)',
                        ),
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
