import axios from 'axios';

// Used to make authenticated HTTP requests to Django
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
const csrfRequest = axios.create({
    headers: {
        credentials: 'same-origin',
    },
});

// Not related to CSRF protection, but this is the appropriate place to set the
// client key header used to authenticate anonymous API requests.
csrfRequest.interceptors.request.use(config => Object.assign({}, config, {
    headers: Object.assign({}, config.headers, {
        'X-OAR-Client-Key': window.ENVIRONMENT.OAR_CLIENT_KEY,
    }),
}));

export default csrfRequest;
