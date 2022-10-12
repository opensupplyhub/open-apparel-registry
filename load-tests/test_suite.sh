#! /bin/bash

mkdir -p logs

# tile request load w\ 5 times the number of parallel requests and
# a random cache key suffix to avoid CloudFront
runtime="10 minutes"
endtime=$(date -ud "$runtime" +%s)

echo "Start Time: `date +%H:%M:%S`"
while [[ $(date -u +%s) -le $endtime ]]
do
    VU_MULTIPLIER=5 \
CACHE_KEY_SUFFIX=$(echo $(date) | shasum | cut -c1-8) \
  docker-compose -f docker-compose.yml run --rm \
    k6 run /scripts/zoom_rio_de_janerio_with_contributor_filter.js \
    &> logs/tile_test.log &
done
echo "End Time: `date +%H:%M:%S`"

# homepage load with 5 concurrent users each running the test 250 times
CLIENT_KEY=bbd21248d53d958583f36a87b84067d5 \
docker-compose -f docker-compose.yml \
  run --rm k6 run -u 5 -i 250 /scripts/browse_homepage.js \
  &> logs/browse_homepage.log &

# To invoke the facility download load test with a custom filter
CLIENT_KEY=bbd21248d53d958583f36a87b84067d5 FILTERS="contributors=699" \
docker-compose -f docker-compose.yml \
  run --rm k6 run  /scripts/download_facilities.js \
  &> logs/download_facilities.log &

# facility creation test w\ 5 contributors POSTing 1000
# random facilities each
TOKEN=54758be3b5daa42f3abd4c83fb54a9615c8e1d74 \
docker-compose -f docker-compose.yml \
  run --rm k6 run -u 5 -i 5000  /scripts/post_facility.js \
  &> logs/post_facility.log &
