FROM quay.io/azavea/django:2.0-python3.7-slim

RUN mkdir -p /usr/local/src
WORKDIR /usr/local/src

COPY . /usr/local/src
RUN pip install --no-cache-dir -r requirements.txt

CMD ["--help"]
