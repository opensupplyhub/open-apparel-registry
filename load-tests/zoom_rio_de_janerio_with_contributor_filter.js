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
    const url = entry.request.url.replace(
        pattern,
        `${cacheKey}${__ENV.CACHE_KEY_SUFFIX}/$2/$3/$4.pbf?$5`
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

export const options = {
    // We want VUs and iterations to match the number of parallel request
    // batches we're going to issue so we can replay traffic 1:1.
    vus: batches.length,
    iterations: batches.length,

    discardResponseBodies: true,
    maxRedirects: 0,
    thresholds: {
        "failed requests": ["rate<0.1"],
    },
};

export default function () {
    // Sleep each Batch so that everything doesn't happen at once
    const firstBatchTime = batches[0];
    const thisBatchTime = batches[__VU - 1];
    sleep(Math.floor((thisBatchTime - firstBatchTime) / 1000));

    const responses = http.batch(requests[thisBatchTime]);

    responses.forEach((res) => {
        check(res, {
            "is status 200": (r) => r.status === 200,
        });

        failRate.add(res.status != 200);
    });
}
