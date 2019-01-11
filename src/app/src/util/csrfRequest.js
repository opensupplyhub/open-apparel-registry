import axios from 'axios';

// Used to make authenticated HTTP requests to Django
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
const csrfRequest = axios.create({
    headers: {
        credentials: 'same-origin',
    },
});

export default csrfRequest;
