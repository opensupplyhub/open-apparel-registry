const proxy = require('http-proxy-middleware');
const _ = require('lodash');

const pathsToProxy = Object.freeze([
    '/api',
    '/web',
    '/api-auth',
    '/rest-auth',
    '/user-login',
    '/user-logout',
    '/user-signup',
    '/user-profile',
    '/api-token-auth',
    '/api-feature-flags',
]);

const djangoProxyTarget = Object.freeze({ target: 'http://django:8081' });

const createProxies = app => _.forEach(
    pathsToProxy,
    path => app.use(proxy(path, djangoProxyTarget)),
);

module.exports = createProxies;
