from django.contrib.gis.geos import Polygon
from django.db import connection
from mercantile import bounds

from api.models import Facility


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
    tile_bounds = bounds(x, y, z)

    mvt_geom_query = """
        ST_AsMVTGeom(
            location,
            ST_MakeEnvelope({xmin}, {ymin}, {xmax}, {ymax}, 4326),
            4096,
            1000,
            true
        ) """

    filter_polygon = Polygon.from_bbox((
        tile_bounds.west, tile_bounds.south,
        tile_bounds.east, tile_bounds.north)).buffer(1000)

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
                )
            }
        ) \
        .values('location', 'id') \
        .query \
        .sql_with_params()

    st_asmvt_query = \
        'SELECT ST_AsMVT(q, \'{}\') FROM ({}) AS q'.format(layer, query)

    with connection.cursor() as cursor:
        cursor.execute(st_asmvt_query, params_for_sql)
        rows = cursor.fetchall()
        return rows[0][0]
