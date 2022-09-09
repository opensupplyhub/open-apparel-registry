import os
from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = 'api'

    def ready(self):
        # When `SERVER_SOFTWARE` is in the environment, we know that the app
        # has been loaded from gunicorn, not a management command.
        if os.environ.get('SERVER_SOFTWARE') is not None:
            from .matching import GazetteerCache
            GazetteerCache.load_gazetteer_if_none()
