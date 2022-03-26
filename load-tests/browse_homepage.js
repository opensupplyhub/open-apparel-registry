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

const referer = 'https://staging.openapparel.org/';

// rootUrl should NOT have a trailing slash
const rootUrl = 'https://staging.openapparel.org';

const staticHeaders = {
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    referer,
};

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
            headers: headers || staticHeaders,
        }
    };
};

export default function main() {
    let responses;

    // Wait up to 5 seconds so that the iterations aren't exactly overlapping
    sleep(Math.random() * 5);

    group('https://staging.openapparel.org/', function () {
        responses = http.batch([
            buildGet(`${rootUrl}/web/environment.js`),
            buildGet(`${rootUrl}/static/css/2.037bc208.chunk.css`),
            buildGet(`${rootUrl}/static/css/main.cfc7f5ef.chunk.css`),
            buildGet(`${rootUrl}/static/js/2.27e1f047.chunk.js`),
            buildGet(`${rootUrl}/static/js/main.602f4e63.chunk.js`),
        ]);
        check2xx(responses);

        // This was inserted by k6.io when converting the recording. We assume
        // it sumulates JS parsing
        sleep(1.2);

        responses = http.batch([
            buildGet(`${rootUrl}/static/media/Creative-Commons-Attribution-ShareAlike-40-International-Public.03c38fcb.png`),
        ]);
        check2xx(responses);

        responses = http.batch([
            buildGet(`${rootUrl}/api/contributors/`, apiHeaders),
            buildGet(`${rootUrl}/api/countries/`, apiHeaders),
            buildGet(`${rootUrl}/api/contributor-lists/`, apiHeaders),
            buildGet(`${rootUrl}/api/api-feature-feature-flags/`, apiHeaders),
        ]);
        check2xx(responses);

        responses = http.batch([
            buildGet(`${rootUrl}/user-login/`, apiHeaders),
        ]);
        // We do NOT check for a 2xx response here because for an
        // unauthenticated user this will return 4xx

        // TODO: Consider how to break the tile cache in a way that is a
        // reasonable simulation
        responses = http.batch([
            buildGet(`${rootUrl}/tile/facilitygrid/1647621241-89-aec180a4/2/1/1.pbf`),
            buildGet(`${rootUrl}/tile/facilitygrid/1647621241-89-aec180a4/2/2/1.pbf`),
            buildGet(`${rootUrl}/tile/facilitygrid/1647621241-89-aec180a4/2/1/0.pbf`),
            buildGet(`${rootUrl}/tile/facilitygrid/1647621241-89-aec180a4/2/2/0.pbf`),
            buildGet(`${rootUrl}/tile/facilitygrid/1647621241-89-aec180a4/2/1/2.pbf`),
            buildGet(`${rootUrl}/tile/facilitygrid/1647621241-89-aec180a4/2/2/2.pbf`),
        ]);
        check2xx(responses);

        responses = http.batch([
            buildGet(`${rootUrl}/tile/facilitygrid/1647621241-89-aec180a4/2/0/1.pbf`),
            buildGet(`${rootUrl}/tile/facilitygrid/1647621241-89-aec180a4/2/3/1.pbf`),
            buildGet(`${rootUrl}/tile/facilitygrid/1647621241-89-aec180a4/2/0/0.pbf`),
            buildGet(`${rootUrl}/tile/facilitygrid/1647621241-89-aec180a4/2/3/0.pbf`),
            buildGet(`${rootUrl}/tile/facilitygrid/1647621241-89-aec180a4/2/0/2.pbf`),
            buildGet(`${rootUrl}/tile/facilitygrid/1647621241-89-aec180a4/2/3/2.pbf`),
        ]);
        check2xx(responses);

        responses = http.batch([
            // TODO There are 2 for contributors in the HAR file made from
            // browsing the home page. This should be fixed in the app then
            // removed from the load test
            buildGet(`${rootUrl}/api/contributors/`, apiHeaders),
            buildGet(`${rootUrl}/api/current_tile_cache_key`, apiHeaders),
        ]);
        check2xx(responses);

        responses = http.batch([
            buildGet(`${rootUrl}/api/facilities/?&pageSize=50`, apiHeaders),
        ]);
        check2xx(responses);

        // This was inserted by the HAR conversion
        sleep(1.4);

        responses = http.batch([
            buildGet(`${rootUrl}/favicon/site.webmanifest`),
            buildGet(`${rootUrl}/favicon/favicon-32x32.png`),
        ]);
        check2xx(responses);
    });
}
