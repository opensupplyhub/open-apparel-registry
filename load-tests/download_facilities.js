import { check, sleep, group } from 'k6';
import http from 'k6/http';

export const options = {
    userAgent: 'k6LoadTest',
};

const check2xx = res => {
    const resArray = Array.isArray(res) ? res : [res];
    resArray.forEach(res =>
        check(res, {
            'is status 2xx': (r) => r.status >= 200 && r.status < 300,
        })
    );
};

const referer = 'https://prd.fb84e0f7529f2737.openapparel.org/';

// rootUrl should NOT have a trailing slash
const rootUrl = 'https://prd.fb84e0f7529f2737.openapparel.org';

const apiHeaders = {
    accept: 'application/json, text/plain, */*',
    'x-oar-client-key': __ENV.CLIENT_KEY || 'NOT_SPECIFIED',
    credentials: 'same-origin',
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    referer,
};

const buildGet = (url, headers) => {
    return {
        method: 'GET',
        url,
        params: {
            headers: headers || apiHeaders,
        }
    };
};

const FILTERS = __ENV.FILTERS || 'contributors=699&detail=true&lists=929';

export default function main() {
    let responses;
    let next;
    responses = http.batch([buildGet(`${rootUrl}/api/facilities/?detail=true&pageSize=10&${FILTERS}`)]);
    check2xx(responses);
    next = JSON.parse(responses[0].body).next;
    while (next) {
        responses = http.batch([buildGet(next)]);
        check2xx(responses);
        next = JSON.parse(responses[0].body).next;
    }
}
