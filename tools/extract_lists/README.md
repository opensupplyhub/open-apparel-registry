# Extract Lists

The scripts in this directory are used for extracting facility list item data
from the Postgres database and splitting that extract into CSV files suitable
for submitting as facility lists.

## extract_lists.sql

This SQL script is designed to be run via the `psql` command and will write CSV
formatted data to standard out.

### Running

```
psql -h database-host -U openapparelregistry -d openapparelregistry -f extract_lists.sql > extracted_lists.csv
```

## split_extracted_lists.py

This executable Python 3 script takes the `extracted_lists.csv` file created by
`extracted_lists.sql`, creates a directory named `extracted_lists` and creates a
separate file for each individual list.

### Setup

- Python 3.7+ must be installed
- A file named `extracted_lists.csv` must be in the same directory as `split_extracted_lists.py`

### Running

`./split_extracted_lists.py`
