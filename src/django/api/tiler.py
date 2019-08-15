from django.contrib.gis.geos import Polygon
from django.db import connection
from mercantile import bounds

from api.models import Facility


def get_facilities_vector_tile(layer, z, x, y, params=None):
    tile_bounds = bounds(x, y, z)
    tile_width = tile_bounds.east - tile_bounds.west
    buffer_distance = tile_width * 0.2

    mvt_geom_query = """
        ST_AsMVTGeom(
            location,
            ST_Expand(
                ST_MakeEnvelope({xmin}, {ymin}, {xmax}, {ymax}, 4326),
                {buffer_distance}
            )
        ) """

    facilities = Facility.objects.filter(
        location__within=Polygon.from_bbox((
            tile_bounds.west, tile_bounds.south,
            tile_bounds.east, tile_bounds.north))
    ).extra(
        select={
            'location': mvt_geom_query.format(
                xmin=tile_bounds.west,
                ymin=tile_bounds.south,
                xmax=tile_bounds.east,
                ymax=tile_bounds.north,
                buffer_distance=buffer_distance
            )
        }
    ).values('location', 'id')

    query = facilities.query

    wrapped_query = \
        'SELECT ST_AsMVT(q, \'{}\') FROM ({}) AS q'.format(layer, query)

    with connection.cursor() as cursor:
        cursor.execute(wrapped_query)
        rows = cursor.fetchall()
        return rows[0][0]
