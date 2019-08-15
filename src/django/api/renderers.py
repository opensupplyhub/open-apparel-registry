from rest_framework import renderers


class MvtRenderer(renderers.BaseRenderer):
    media_type = 'application/vnd.mapbox-vector-tile'
    format = 'pbf'
    charset = None
    render_style = 'binary'

    def render(self, data, media_type=None, renderer_context=None):
        return data
