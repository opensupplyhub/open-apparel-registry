#!/bin/bash
while :
do
    CACHE_KEY_SUFFIX=$(echo $(date) | sha1sum | cut -c1-8) docker-compose -f docker-compose.yml run --rm   k6 run /scripts/zoom_rio_de_janerio_with_contributor_filter.js
    sleep 1
done
