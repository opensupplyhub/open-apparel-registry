# Rubota Data Download

A script to download data from the https://suppliers.rubota.com API.

## Requirements

- node 8+

## Setup

- `cd {PROJECT-ROOT}/research/rubota`
- `npm install`

## Scripts

### fetch_rubota_facilities.js

Usage: `node fetch_rubota_facilities.js`

Downloads a facilities from a list of countries and writes the country, name,
and address of each facility to `rubota_facilities.csv` in the current working
directory.
