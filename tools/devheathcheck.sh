#!/bin/bash

while :
do
	curl -m 3 http://localhost:8081/health-check/;
	printf "\n"
	sleep 30;
done
