import logging
import os
import threading

from api.matching import GazetteerCache

logger = logging.getLogger(__name__)


def _initialize_gazetteer_cache():
    logger.info('Initializing the gazetteer cache...')
    GazetteerCache.get_latest()
    logger.info('Done initializing the gazetteer cache')


def run():
    # When `SERVER_SOFTWARE` is in the environment, we know that the app has
    # been loaded from gunicorn, not a management command.
    if os.environ.get('SERVER_SOFTWARE') is not None:
        # This run function is called the first time a request is made to the
        # app. In our deployments this will be the `/heath-check/` endpoint. We
        # do our model training in a thread so that the request does not
        # timeout.
        threading.Thread(target=_initialize_gazetteer_cache).start()
