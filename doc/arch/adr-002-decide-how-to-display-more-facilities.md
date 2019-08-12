# Determine How to Display All Facilities on the Map

## Context

The Open Apparel Registry currently includes more than 18,000 facilities. For
performance reasons, we have paginated the facilities data API endpoint data so
that it will [return a maximum of 500 results][pagination-pr] for any single
request. In turn this means that the frontend client will only ever display a
maximum of 500 facilities at a time, rendered as clustered Leaflet markers via
React-Leaflet. Facilities API requests are currently filtered using Django
querysets whose inputs are querystring parameters included in the API requests.

To enable users to view all of the OAR's facilities on the map simultaneously,
we'll need to update how the API returns facilities for display and how the
client renders them on the map. At present this means updating the application
so that it can display 18,000+ facilities simultaneously. Following upcoming MSI
integration work, we anticipate that the number of OAR facilities will increase
to around 100,000 -- which the application should be able to map. In addition,
we also want users to be able to filter these vector tiles by query parameters
like contributor, facility name, and country, along with the map bounding box.

To accomplish this we have decided to use vector tiles generated, ultimately,
by PostGIS's [`ST_AsMVT`][st-asmvt] function, rendering them in the frontend
with [Leaflet Vector Grid][leaflet-vector-grid] (possibly via
[react-leaflet-vector-grid][react-leaflet-vector-grid]). We've decided to have
the vector tiles cluster facilities by zoom level, which would limit the number
of actual points the frontend needs to display at any given time.

This ADR documents a subsequent decision between setting up a dedicated
`ST_AsMVT`-based vector tile server, like [Martin][martin] or adding a new
vector tile endpoint to the existing Django web application which would make
the `ST_AsMVT` query.

## Four Rejected Options

Before landing on an `ST_AsMVT`-based solution, we did consider a few other
options which we ultimately rejected outright:

### Reusing Existing /facilities API Endpoint

In theory we could remove the `MAX_PAGE_SIZE` limit on the `/facilities` API
endpoint. In practice this would cause performance problems as the size of the
GeoJSON response -- and the number of Leaflet markers -- increased. The web app
would have to serialize tens of thousands of markers for each request, the
GeoJSON payload for each request could be several megabytes in size, and the
client would have to put tens of thousands of Leaflet markers in browser
memory.

### Using Windshaft

While we could potentially use a combination of [Windshaft][windshaft] and
[Leaflet.utfgrid][leaflet-utfgrid] to render facilities, there wasn't much
enthusiasm for setting up and maintaining a Windshaft tiler for a few specific
reasons:

- using Windshaft requires adding another service
- Windshaft is pretty costly to configure and maintain
- Windshaft's documentation isn't great

### Creating Static Vector Tiles

We ruled out the idea of creating a static set of vector tiles because the
OAR's facilities data changes frequently.

### Using a Lambda Function Tiler

Azavea has undertaken some research work to determine the viability of using
a tiler based on a Lambda function which can connect to PostGIS and call
`ST_AsMVT`. However, the research has discovered a few limits on this approach,
such as dealing with function warmup times and handling concurrent database
connections.

## Two `ST_AsMVT`-Based Approaches

An `ST_AsMVT`-based approach to generate vector tiles dynamically seemed to be
promising. While the vector tiles working group's report did note some
uncertainty around how performant it would be to generate tiles in PostGIS,
OAR's traffic is such that it may not encounter performance problems which
could emerge for a higher traffic site.

We considered two ways to generate tiles using `ST_AsMVT`:

- using a dedicated vector tile server like [Martin][martin], [t-rex][trex], or
[tegola][tegola]
- adding a vector tiles endpoint to the existing Django web app

### Using Martin (or t-rex or Tegola) as a Vector Tile Server

Martin, t-rex, and Tegola are open-source vector tile servers which can connect
directly to PostGIS and render vector tiles. Judging by their documentation,
each of them appear to be fairly straightforward to configure and operate. Each
has a slightly different API.

We considered Martin most seriously as an option in part because it had good
documentation around how to write PL/pgSQL functions for requesting tiles with
data filtered by a set of query parameters. Here's [Martin's function sources example][martin-function-sources]:

```plpgsql
CREATE OR REPLACE FUNCTION public.function_source(z integer, x integer, y integer, query_params json) RETURNS BYTEA AS $$
DECLARE
  bounds GEOMETRY(POLYGON, 3857) := TileBBox(z, x, y, 3857);
  mvt BYTEA;
BEGIN
  SELECT INTO mvt ST_AsMVT(tile, 'public.function_source', 4096, 'geom') FROM (
    SELECT
      ST_AsMVTGeom(geom, bounds, 4096, 64, true) AS geom
    FROM public.table_source
    WHERE geom && bounds
  ) as tile WHERE geom IS NOT NULL;

  RETURN mvt;
END
$$ LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE;
```

#### Pros

##### Configuration

Martin appears fairly straightforward to configure and its documentation
encompassed most of what we'd want to do.

##### Performance

Martin touts being "suitable for large databases" which indicates that it
might obviate some of the performance concerns around using `ST_AsMVT`.

#### Cons

##### PL/pgSQL Function Sources

Since Martin uses PL/pgSQL functions for its filtering, we would have to
rewrite some facility filtering logic that currently exists in Django querysets
in the web app to work in PL/pgSQL. Moreover, each time we added a new filter
or search option to the web application, we'd have to write a version of the
same query in PL/pgSQL for the tiler.

##### Security

Martin's `query_params` appear to be passed in to the database as strings, which
opens a security hole. While we could create a PostGIS role or user with a
limited, readonly set of permissions to use solely for the Martin instance,
doing so requires taking on some additional risk and complexity.

Likewise, adding PostGIS-based security just for the tiler may also compel us to
have to figure out how to duplicate features like API key authentication or
facilities-data request logging -- which we've already written once in Django.

##### Unfamiliarity

We don't have any experience running Martin in production. We've also got
limited experience using Rust, the language in which Martin is written.
Together this means a Martin-based tile server may be difficult to operate and
debug.

### Adding a Vector Tile Endpoint to the Existing Django Web App

Adding a vector tile endpoint to the existing web app seemed like a promising
approach, since it would enable trying out `ST_AsMVT` while reusing the app's
database connection and Django's querysets for filtering. In this approach we
would add a `/tile/{layer}/{z}/{x}/{y}/` endpoint to the Django application,
then update the client to make tile requests there rather than rendering the
`/facilities` GeoJSON response as Leaflet markers.

#### Pros

##### Provides Access to the Existing Django Queryset Apparatus

While using Martin (or a similar solution) would compel writing new versions of
the facilities queries in PL/pgSQL, placing a vector tile endpoint in Django
lets us reuse some of the existing query code and also provides access to
Django models and querysets. Likewise, we would not have to write new code for
new filter and search options in two different languages.

##### Already Has a Secure Database Connection

The Django web application already has a secure database connection, so we
would not have to create a solution for securing Martin or another PostGIS-backed
tile server.

##### Enables Switching from `ST_AsMVT` to Another Python Vector Tile Option

There remains some question about the viability of using `ST_AsMVT`. If it turns
out that this is not a performant solution, having the tile endpoint in Django
makes it possible to drop out of using `ST_AsMVT` altogether and to switch to
an alternate Python library for generating vector tiles.

##### Doesn't Require Creating & Deploying a Different Service

Adding Martin or another vector tile server would increase the number of
different kinds of services running as part of the OAR, which adds to the
application's complexity. Keeping the tile endpoint in Django does not require
adding a new service.

##### Allows Scaling by Increasing the Number of App Instances

Adding a tile endpoint to the Django app also enables continuing to scale the
application in the usual way: by increasing the number of app instances
available to serve requests.

#### Cons

##### Mingles Tile Request Traffic with Other App Traffic

The biggest downside of adding a vector tile endpoint to the Django app is
that it would mean mingling tile request traffic with other app traffic.
While we plan to limit the size of tile request responses by clusting facilities
at different zoom levels, tile request traffic will likely be more frequent and
sustained than requests to the current `/facilities` endpoint.

## Decision

We have decided to add a vector tile endpoint to the existing Django app.

While Martin, in particular, seemed like a compelling solution, we had enough
open questions about it to discourage us from taking on the complexity of
using it here.

Our main apprehension about adding a tile endpoint to the existing web app is
that it'll mingle tile requests with other requests in a way that could cause
performance problems. However, given the size of the OAR's traffic and the
possibility of addressing traffic increases by scaling the number of app
instances, this seemed like an acceptable tradeoff.

## Consequences

As a consequence of this decision, we will need to:

- add a new `/tile` endpoint to the API.
- determine an aggregation strategy for clustering facilities at
different zoom levels
- adjust the Leaflet map to use this tile endpoint and determine symbology
- make necessary adjustments to the frontend for sending selected filters
and searches to the `/tile` endpoint.
- determine whether to adjust the Gunicorn configuration to change the number of
workers per instance or the worker type
- decide whether to add caching HTTP headers to `/tile` and to replicate any
changes in CloudFront

[pagination-pr]: https://github.com/open-apparel-registry/open-apparel-registry/pull/509
[st-asmvt]: https://postgis.net/docs/ST_AsMVT.html
[leaflet-vector-grid]: https://github.com/Leaflet/Leaflet.VectorGrid
[react-leaflet-vector-grid]: https://github.com/mhasbie/react-leaflet-vectorgrid
[windshaft]: https://github.com/CartoDB/Windshaft
[leaflet-utfgrid]: https://github.com/danzel/Leaflet.utfgrid
[trex]: https://github.com/t-rex-tileserver/t-rex
[tegola]: https://tegola.io/
[martin]: https://github.com/urbica/martin
[martin-function-sources]: https://github.com/urbica/martin#function-sources
