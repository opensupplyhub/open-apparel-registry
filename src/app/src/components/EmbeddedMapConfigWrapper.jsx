import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';

import { userPropType } from '../util/propTypes';
import { makeNonStandardFieldsURL, makeEmbedConfigURL } from '../util/util';
import apiRequest from '../util/apiRequest';
import EmbeddedMapConfig from './EmbeddedMapConfig';
import {
    formatExistingConfig,
    formatExistingFields,
    combineEmbedAndNonstandardFields,
    formatEmbedConfigForServer,
    getErrorMessage,
} from '../util/embeddedMap';

function EmbeddedMapConfigWrapper({ user }) {
    const [loading, setLoading] = useState(true);
    // The iframe preview isn't aware when the embed config styles are updated.
    // Using a timestamp in the iframe src forces a refresh when the config
    // is changed.
    const [timestamp, setTimestamp] = useState(Date.now());
    // Used for field-specific validation errors
    const [errors, setError] = useState(null);
    const [embedConfig, setEmbedConfig] = useState(
        formatExistingConfig(user.embed_config),
    );
    const [embedFields, setEmbedFields] = useState(
        formatExistingFields(embedConfig.embed_fields),
    );

    const handleError = e => {
        const errorMessage = getErrorMessage(e);
        if (Array.isArray(errorMessage)) {
            toast.error(`Error: ${errorMessage.join(', ')}`, {
                position: 'bottom-left',
            });
        } else {
            setError(errorMessage);
        }
        setLoading(false);
    };

    const handleSuccess = () => {
        setLoading(false);
        setError(null);
        setTimestamp(Date.now());
    };

    const fetchFields = useCallback(() => {
        setLoading(true);
        apiRequest
            .get(makeNonStandardFieldsURL())
            .then(({ data }) => {
                setEmbedFields(
                    combineEmbedAndNonstandardFields(
                        user.embed_config.embed_fields,
                        data,
                    ),
                );
                handleSuccess();
            })
            .catch(e => handleError(e));
    }, [user]);

    const createConfig = () => {
        setLoading(true);
        apiRequest
            .post(
                makeEmbedConfigURL(),
                formatEmbedConfigForServer(embedConfig, embedFields),
            )
            .then(({ data }) => {
                setEmbedConfig(formatExistingConfig(data));
                handleSuccess();
            })
            .catch(e => handleError(e));
    };

    const updateConfig = () => {
        setLoading(true);
        apiRequest
            .put(
                makeEmbedConfigURL(embedConfig.id),
                formatEmbedConfigForServer(embedConfig, embedFields),
            )
            .then(({ data }) => {
                setEmbedConfig(formatExistingConfig(data));
                handleSuccess();
            })
            .catch(e => handleError(e));
    };

    // Fetches and merges nonstandard fields from the database with fields
    // from the user's EmbedConfig
    useEffect(() => fetchFields(), [user, fetchFields]);

    /* eslint-disable react-hooks/exhaustive-deps */
    // Disabled exhaustive dependencies warning because we don't want to rerun
    // in response to the loading state changing
    // When the embed config or fields are updated, wait for 500ms. If no
    // additional changes are made, update/create the embed config in the database.
    useEffect(() => {
        const handler = setTimeout(() => {
            if (loading) return;
            if (embedConfig.id) {
                updateConfig();
            } else {
                createConfig();
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [embedConfig, embedFields]);

    return (
        <EmbeddedMapConfig
            user={user}
            embedConfig={embedConfig}
            setEmbedConfig={setEmbedConfig}
            fields={embedFields}
            setFields={setEmbedFields}
            errors={errors}
            timestamp={timestamp}
        />
    );
}

EmbeddedMapConfigWrapper.defaultProps = {
    user: null,
};

EmbeddedMapConfigWrapper.propTypes = {
    user: userPropType,
};

function mapStateToProps({
    auth: {
        user: { user },
    },
}) {
    return {
        user,
    };
}

export default connect(mapStateToProps)(EmbeddedMapConfigWrapper);
