from mercantile import bounds


def handle_tile_request(request, layer, z, x, y, params=None):
    tile_bounds = bounds(x, y, z)
    raise Exception("{}, {}, {}".format(layer, tile_bounds, params))
