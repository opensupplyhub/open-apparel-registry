import http from "k6/http";
import crypto from "k6/crypto";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const har = JSON.parse(
    open("./zoom_rio_de_janerio_with_contributor_filter.har")
);

const requests = {};

// <cachekey>/<int:z>/<int:x>/<int:y>.pbf?<filters>
const pattern = new RegExp(/(.{8})\/(\d+)\/(\d+)\/(\d+)\.pbf\?(.+)/);

const FILTERS = __ENV.FILTERS || '$5';

har.log.entries.forEach((entry) => {
    const startedDateTime = new Date(entry.startedDateTime);
    startedDateTime.setMilliseconds(0);

    // // Ensure we're always busting the cache
    // const randomCacheKey = Math.random().toString(32).substring(5);
    // const url = entry.request.url.replace(pattern, `${randomCacheKey}/$2/$3/$4.pbf?$5`);

    // Cache key is a hash of the query string / filters
    const cacheKey = crypto
        .sha1(entry.request.url.match(pattern)[5], "hex")
        .slice(0, 8);
    // Including the __VU in the cache key should generate a worse situation
    // than typical. Each batch of requests is made by a separate VU and when
    // VU_MULTIPLIER is larger than 1, we repeat the same batch of requests a
    // number of times equal to VU_MULTIPLIER. Using __VU in the cache key means
    // subsequent requests for the same batch will not hit the cache.
    const url = entry.request.url.replace(
        pattern,
        `${cacheKey}-vu-${__VU}-${__ENV.CACHE_KEY_SUFFIX}/$2/$3/$4.pbf?${FILTERS}`
    );

    const referer = entry.request.headers.find(
        (header) => header.name === "Referer"
    ).value;

    // We want to batch requests that occured within the same second
    const batchTime = startedDateTime.getTime();

    if (!requests.hasOwnProperty(batchTime)) {
        requests[batchTime] = [];
    }

    requests[batchTime].push([
        "GET",
        url,
        null,
        {
            headers: {
                // Without this referer, CloudFront will throw a 401
                Referer: referer,
            },
            tags: {
                zoomLevel: url.match(pattern)[2],
            },
        },
    ]);
});

let batches = Object.keys(requests);

// Sort requests in ascending order
batches = batches.sort((a, b) => a - b);

const failRate = new Rate("failed requests");

const VU_MULTIPLIER = __ENV.VU_MULTIPLIER || 1;

export const options = {
    // We want VUs and iterations to match the number of parallel request
    // batches we're going to issue so we can replay traffic 1:1.
    vus: batches.length * VU_MULTIPLIER,
    iterations: batches.length * VU_MULTIPLIER,

    discardResponseBodies: true,
    maxRedirects: 0,
    thresholds: {
        "failed requests": ["rate<0.1"],
    },
};

export default function () {
    // Sleep each Batch so that everything doesn't happen at once
    const firstBatchTime = batches[0];
    const batchIndex = (__VU - 1) % batches.length;
    const thisBatchTime = batches[batchIndex];
    // Include a random number of milliseconds between 0 an 1000 to that batches
    // in parallel executions don't line up
    sleep(Math.floor((thisBatchTime - firstBatchTime) / 1000) + Math.random());

    const responses = http.batch(requests[thisBatchTime]);

    responses.forEach((res) => {
        check(res, {
            "is status 200": (r) => r.status === 200,
        });

        failRate.add(res.status != 200);
    });
}
