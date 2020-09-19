#!/bin/bash

while :
do
	curl http://localhost:8081/health-check/;
	printf "\n"
	sleep 30;
done
