all: test
	rm -rf alert_sfn_failures.zip
	(cd src && zip -qXr ../alert_sfn_failures.zip .)

test: requirements
	(cd src && python3 -c "from alert_sfn_failures import handler" && cd ../)

requirements: requirements.txt.out

requirements.txt.out: requirements.txt
	git clean -qfdx src
	pip3 install -q -t src -r requirements.txt | tee requirements.txt.out

.PHONY: all test requirements
