# Load Testing

This [k6](https://k6.io/) based load testing project is focused on automating
user requests that are known to stress parts of the application. All of the
components necessary to execute a load test are encapsulated in this directory.

## Variables

- `K6_CLOUD_TOKEN`: An Auth Token for interacting with the k6 Cloud (optional)
- `CACHE_KEY_SUFFIX`: A suffix to append in the path to ensure tile requests miss the cache (optional)
- `VU_MULTIPLER`: An integer number of parallel executions of each batch of requests

## Running

Below is an example of how to invoke an instance of the load test with Docker
Compose:

```console
$ docker-compose run --rm k6

          /\      |‾‾|  /‾‾/  /‾/
     /\  /  \     |  |_/  /  / /
    /  \/    \    |      |  /  ‾‾\
   /          \   |  |‾\  \ | (_) |
  / __________ \  |__|  \__\ \___/ .io

  execution: local
     script: /scripts/zoom_rio_de_janerio_with_contributor_filter.js
     output: cloud (https://app.k6.io/runs/809959)

  scenarios: (100.00%) 1 executors, 10 max VUs, 10m30s max duration (incl. graceful stop):
           * default: 10 iterations shared among 10 VUs (maxDuration: 10m0s, gracefulStop: 30s)

. . .

running (01m39.1s), 00/10 VUs, 10 complete and 0 interrupted iterations
default ✓ [======================================] 10 VUs  01m38.9s/10m0s  10/10 shared iters


    ✗ is status 200
     ↳  15% — ✓ 15 / ✗ 80

    checks.....................: 15.78% ✓ 15   ✗ 80
    data_received..............: 331 kB 3.3 kB/s
    data_sent..................: 33 kB  336 B/s
  ✗ failed requests............: 84.21% ✓ 80   ✗ 15
    http_req_blocked...........: avg=3.86ms   min=2.72µs   med=5.44µs   max=57.99ms  p(90)=27.22ms  p(95)=27.95ms
    http_req_connecting........: avg=1.31ms   min=0s       med=0s       max=12.56ms  p(90)=10.62ms  p(95)=11.42ms
    http_req_duration..........: avg=43.95s   min=114.49ms med=59.97s   max=1m0s     p(90)=1m0s     p(95)=1m0s
    http_req_receiving.........: avg=69.82µs  min=0s       med=0s       max=592.2µs  p(90)=166.43µs p(95)=326.99µs
    http_req_sending...........: avg=122.86µs min=43.58µs  med=109.51µs max=390.14µs p(90)=169.59µs p(95)=230.21µs
    http_req_tls_handshaking...: avg=1.91ms   min=0s       med=0s       max=20.26ms  p(90)=14.85ms  p(95)=16.02ms
    http_req_waiting...........: avg=43.95s   min=114.26ms med=59.97s   max=1m0s     p(90)=1m0s     p(95)=1m0s
    http_reqs..................: 95     0.958233/s
    iteration_duration.........: avg=1m27s    min=1m5s     med=1m34s    max=1m38s    p(90)=1m38s    p(95)=1m38s
    iterations.................: 10     0.100867/s
    vus........................: 5      min=5  max=10
    vus_max....................: 10     min=10 max=10

ERRO[0101] some thresholds have failed
```

To invoke an instance of the load test running with 10 times the number of
parallel requests and a random cache key suffix to avoid CloudFront

```console
VU_MULTIPLIER=10 \
CACHE_KEY_SUFFIX=$(echo $(date) | sha1sum | cut -c1-8) \
docker-compose -f docker-compose.yml run --rm \
  k6 run /scripts/zoom_rio_de_janerio_with_contributor_filter.js
```

To invoke an instance of the load test streaming output to the k6 Cloud:

```console
$ export K6_CLOUD_TOKEN=...
$ docker-compose \
    -f docker-compose.k6.yml \
    run --rm k6 run -o cloud scripts/zoom_rio_de_janerio_with_contributor_filter.js
```
