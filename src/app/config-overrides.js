const rewireReactHotLoader = require('react-app-rewire-hot-loader');

/* config-overrides.js */
module.exports = function override (config, env) {
    if (env === 'development') {
        // https://github.com/cdharris/react-app-rewire-hot-loader/issues/23#issuecomment-485193878
        config.resolve.alias['react-dom'] = '@hot-loader/react-dom';
    }

    return rewireReactHotLoader(config, env);
};
