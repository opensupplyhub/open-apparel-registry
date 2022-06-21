# Anonymize the Database

This script can be used to anonymize a clone of the production database for use
with load testing.

## Requirements

- Python 3+
- PostgreSQL Client Tools

## Running

Create a virtual environment to install dependencies.

```bash
python3 -m venv ./venv
source ./venv/bin/activate
pip install -r requirements.txt
```

In another window, establish an SSH tunnel with the Bastion.

```bash
ssh -i ~/.ssh/oar-stg.pem -L 5433:database.service.osh.internal:5432 -N ec2-user@bastion.oshstaging.openapparel.org
```

Invoke `generate_anon_queries` to generate an SQL file containing queries that
will anonymize user data.
Optionally, you may specify a space-separated list of email addresses to exclude from anonymization.

```bash
PGPASSWORD="" \
ALLOWED_EMAILS="person@example.com contributor@example.co.uk" \
    generate_anon_queries > queries.sql
```

Run the SQL file with `psql`.

```bash
psql -h localhost -p 5433 -U openapparelregistry < queries.sql
```
