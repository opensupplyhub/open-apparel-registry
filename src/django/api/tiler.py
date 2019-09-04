import mercantile

from django.contrib.gis.geos import Polygon
from django.db import connection

from api.models import Facility

GRID_ZOOM_FACTOR = 3


def tile_to_grid_table_values(tile, tile_bounds):
    llb = mercantile.bounds(tile)
    geom = 'ST_MakeEnvelope({xmin}, {ymin}, {xmax}, {ymax}, 4326)'.format(
        xmin=llb.west, ymin=llb.south, xmax=llb.east, ymax=llb.north
    )
    mvt_geom = (
        'ST_AsMVTGeom({geom}, ST_MakeEnvelope('
        '{xmin}, {ymin}, {xmax}, {ymax}, 4326))').format(
            geom=geom, xmin=tile_bounds.west, ymin=tile_bounds.south,
            xmax=tile_bounds.east, ymax=tile_bounds.north)

    return '({geom}, {mvt_geom}, {z}, {x}, {y})'.format(
        geom=geom, mvt_geom=mvt_geom, z=tile.z, x=tile.x, y=tile.y)


def get_facility_grid_vector_tile(params, layer, z, x, y):
    tile_bounds = mercantile.bounds(x, y, z)
    grid_tiles = mercantile.children((x, y, z), zoom=z+GRID_ZOOM_FACTOR)
    tile_values = [
        tile_to_grid_table_values(t, tile_bounds)
        for t in grid_tiles]

    grid_query = (
        'CREATE TEMP TABLE grid (geom, mvt_geom, z, x, y) '
        'AS (VALUES {})')
    grid_query = grid_query.format(
        ','.join(tile_values)
    )

    grid_idx_query = 'CREATE INDEX grid_idx ON grid USING gist (geom)'

    location_query, location_params = Facility \
        .objects \
        .filter_by_query_params(params) \
        .values('location') \
        .query \
        .sql_with_params()

    if location_query.find('WHERE') >= 0:
        where_clause = location_query[location_query.find('WHERE'):]
    else:
        where_clause = ''

    join_query = (
        'SELECT grid.mvt_geom, count(location), grid.z, grid.x, grid.y '
        'FROM grid '
        'JOIN api_facility ON ST_Contains(grid.geom, location) '
        ' {where_clause} '
        'GROUP BY grid.mvt_geom, grid.z, grid.x, grid.y')
    join_query = join_query.format(where_clause=where_clause)

    st_asmvt_query = \
        'SELECT ST_AsMVT(q, \'{}\') FROM ({}) AS q'.format(layer, join_query)

    full_query = ';\n'.join([grid_query, grid_idx_query, st_asmvt_query])

    with connection.cursor() as cursor:
        cursor.execute(full_query, location_params)
        rows = cursor.fetchall()
        return rows[0][0]


def get_facilities_vector_tile(params, layer, z, x, y):
    """
    Create a vector tile for a layer generated via PostGIS's `ST_AsMVT`
    function, filtered by params.

    Arguments:
    params (dict) -- Request query parameters whose potential choices are
                     enumerated in `api.constants.FacilitiesQueryParams`
    layer (string) -- The name of the tile layer. Currently only "facilities"
                      is supported.
    z (int) -- Zoom level.
    x (int) -- X (horizontal) position for requested tile on a grid.
    y (int) -- Y (vertical) position for requested tile on a grid.

    Returns:
    A vector tile.
    """
    tile_bounds = mercantile.bounds(x, y, z)

    mvt_geom_query = """
        ST_AsMVTGeom(
            location,
            ST_MakeEnvelope({xmin}, {ymin}, {xmax}, {ymax}, 4326),
            4096,
            1024,
            true
        ) """

    filter_buffer_percent = 0.2
    ew_buffer = \
        abs(tile_bounds.east - tile_bounds.west) * filter_buffer_percent
    ns_buffer = \
        abs(tile_bounds.north - tile_bounds.south) * filter_buffer_percent

    filter_polygon = Polygon.from_bbox((
        tile_bounds.west - ew_buffer,
        tile_bounds.south - ns_buffer,
        tile_bounds.east + ew_buffer,
        tile_bounds.north + ns_buffer))

    query, params_for_sql = Facility \
        .objects \
        .filter_by_query_params(params) \
        .filter(location__within=filter_polygon) \
        .extra(
            select={
                'location': mvt_geom_query.format(
                    xmin=tile_bounds.west,
                    ymin=tile_bounds.south,
                    xmax=tile_bounds.east,
                    ymax=tile_bounds.north,
                ),
                'x': x,
                'y': y,
                'z': z,
            }
        ) \
        .values('location', 'id', 'name', 'address', 'x', 'y', 'z') \
        .query \
        .sql_with_params()

    st_asmvt_query = \
        'SELECT ST_AsMVT(q, \'{}\') FROM ({}) AS q'.format(layer, query)

    with connection.cursor() as cursor:
        cursor.execute(st_asmvt_query, params_for_sql)
        rows = cursor.fetchall()
        return rows[0][0]
