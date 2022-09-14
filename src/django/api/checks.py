from watchman.decorators import check
from api.matching import GazetteerCache


@check
def _check_gazetteercache():
    GazetteerCache.load_gazetteer_if_none()
    return {'ok': True}


def gazetteercache():
    return {'gazetteercache': _check_gazetteercache()}
