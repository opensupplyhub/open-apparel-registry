# Dedupe Examples for OAR

These examples are based on the
[dedupe-example](https://github.com/dedupeio/dedupe-examples/) scripts.

## Requirements

- python 3.4+

## Setup

- `cd {PROJECT-ROOT}/research/dedupe`
- `pip install -r requirements.txt`

## dedupe

### Scripts

#### merge_lists.py

Usage: `python merge_lists.py /path/to/csv/directory facility_list_items.csv`

Creates `facility_list_items.csv` in the current working directory by combining
all the facility list CSVs in the specified source directory.

#### oar_dedupe_example.py

Usage: `python oar_dedupe_example.py`

Reads `facility_list_items.csv` from the current working directory runs through
an interactive training session and produces the following outputs:

  - facilities_output.csv - A copy of the input with additional columns with the
    output of the matching process.
  - facilities_training.json - The results of the interactive training session
  - facilities_learned_settings - The trained data model
  - facilities_deduped.csv - Deduplicated output where a winner is chosen from
    each cluster where the match confidence exceeds a threshold.
