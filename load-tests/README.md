# Load Testing

This [k6](https://k6.io/) based load testing project is focused on automating
user requests that are known to stress parts of the application. All of the
components necessary to execute a load test are encapsulated in this directory.

## Variables

- `K6_CLOUD_TOKEN`: An Auth Token for interacting with the k6 Cloud (optional)

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
     output: -

  scenarios: (100.00%) 1 executors, 10 max VUs, 10m30s max duration (incl. graceful stop):
           * default: 10 iterations shared among 10 VUs (maxDuration: 10m0s, gracefulStop: 30s)

WARN[0071] Request Failed                                error="Get \"https://staging.openapparel.org/tile/facilitygrid/1599754827-76-gfg9fiq4/4/5/7.pbf?contributors=139\": context deadline exceeded"

running (01m26.1s), 00/10 VUs, 10 complete and 0 interrupted iterations
default ✓ [======================================] 10 VUs  01m25.9s/10m0s  10/10 shared iters


    ✗ is status 200
     ↳  80% — ✓ 76 / ✗ 19

    checks.....................: 80.00% ✓ 76   ✗ 19
    data_received..............: 363 kB 4.2 kB/s
    data_sent..................: 32 kB  366 B/s
  ✗ failed requests............: 20.00% ✓ 19   ✗ 76
    http_req_blocked...........: avg=3.23ms   min=2.79µs  med=5.44µs  max=132.72ms p(90)=14.84ms  p(95)=18.14ms
    http_req_connecting........: avg=645µs    min=0s      med=0s      max=6.3ms    p(90)=4.33ms   p(95)=5.97ms
    http_req_duration..........: avg=31.28s   min=89.44ms med=23.56s  max=1m0s     p(90)=58.03s   p(95)=58.64s
    http_req_receiving.........: avg=128.94µs min=0s      med=93.94µs max=608.2µs  p(90)=176.17µs p(95)=385.93µs
    http_req_sending...........: avg=117.37µs min=41.62µs med=115.8µs max=282.79µs p(90)=155.71µs p(95)=168.57µs
    http_req_tls_handshaking...: avg=2.32ms   min=0s      med=0s      max=104.72ms p(90)=8.47ms   p(95)=12.2ms
    http_req_waiting...........: avg=31.28s   min=88.9ms  med=23.56s  max=1m0s     p(90)=58.03s   p(95)=58.64s
    http_reqs..................: 95     1.103427/s
    iteration_duration.........: avg=1m12s    min=31.46s  med=1m16s   max=1m25s    p(90)=1m25s    p(95)=1m25s
    iterations.................: 10     0.11615/s
    vus........................: 0      min=0  max=10
    vus_max....................: 10     min=10 max=10

ERRO[0087] some thresholds have failed
```

To invoke an instance of the load test streaming output to the k6 Cloud:

```console
$ export K6_CLOUD_TOKEN=...
$ docker-compose \
    -f docker-compose.k6.yml \
    run --rm k6 run -o cloud scripts/zoom_rio_de_janerio_with_contributor_filter.js
```
