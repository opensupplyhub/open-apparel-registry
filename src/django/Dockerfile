FROM quay.io/azavea/django:3.2-python3.7-slim

RUN mkdir -p /usr/local/src/static/static
WORKDIR /usr/local/src

COPY requirements.txt /usr/local/src/
RUN set -ex \
    && buildDeps=" \
    build-essential \
    " \
    && deps=" \
    postgresql-client-13 \
    " \
    && apt-get update && apt-get install -y $buildDeps $deps --no-install-recommends \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove $buildDeps

COPY . /usr/local/src

RUN GOOGLE_SERVER_SIDE_API_KEY="" \
    OAR_CLIENT_KEY="" \
    HUBSPOT_API_KEY="" \
    HUBSPOT_SUBSCRIPTION_ID="" \
    EXTERNAL_DOMAIN="" \
    python manage.py collectstatic --no-input

CMD ["-b :8080", \
    "--workers=1", \
    "--timeout=60", \
    "--access-logfile=-", \
    "--access-logformat=%({X-Forwarded-For}i)s %(h)s %(l)s %(u)s %(t)s \"%(r)s\" %(s)s %(b)s \"%(f)s\" \"%(a)s\"", \
    "--error-logfile=-", \
    "--log-level=info", \
    "--capture-output", \
    "oar.wsgi"]
