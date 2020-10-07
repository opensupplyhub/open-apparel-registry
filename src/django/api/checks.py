from watchman.decorators import check
from api.matching import GazetteerCache


@check
def _check_gazetteercache():
    GazetteerCache.get_latest()
    return {'ok': True}


def gazetteercache():
    return {'gazetteercache': _check_gazetteercache()}
