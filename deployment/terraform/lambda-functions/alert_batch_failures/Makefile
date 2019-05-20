all: requirements
	rm -rf alert_batch_failures.zip
	(cd src && zip -qXr ../alert_batch_failures.zip .)

requirements: requirements.txt.out

requirements.txt.out: requirements.txt
	git clean -qfdx src
	pip install -q -t src -r requirements.txt | tee requirements.txt.out

.PHONY: all requirements
