import dedupe
import logging
import os
import re
import threading

from collections import defaultdict
from datetime import datetime
from django.conf import settings
from django.db import transaction
from django.db.models import Q, Max
from unidecode import unidecode

from api.models import (Facility,
                        FacilityList,
                        FacilityListItem,
                        HistoricalFacility)

logger = logging.getLogger(__name__)


def clean(column):
    """
    Remove punctuation and excess whitespace from a value before using it to
    find matches. This should be the same function used when developing the
    training data read from training.json as part of train_gazetteer.
    """
    column = unidecode(column)
    column = re.sub('\n', ' ', column)
    column = re.sub('-', '', column)
    column = re.sub('/', ' ', column)
    column = re.sub("'", '', column)
    column = re.sub(",", '', column)
    column = re.sub(":", ' ', column)
    column = re.sub(' +', ' ', column)
    column = column.strip().strip('"').strip("'").lower().strip()
    if not column:
        column = None
    return column


def get_canonical_items():
    """
    Fetch all `Facility` items and create a dictionary suitable for use by a
    Dedupe model.

    Returns:
    A dictionary. The key is the `Facility` OAR ID. The value is a dictionary
    of clean field values keyed by field name (country, name, address). A
    "clean" value is one which has been passed through the `clean` function.
    """
    facility_set = Facility.objects.all().extra(
        select={'country': 'country_code'}).values(
            'id', 'country', 'name', 'address')
    return {str(i['id']): {k: clean(i[k]) for k in i if k != 'id'}
            for i in facility_set}


def get_messy_items_from_facility_list(facility_list):
    """
    Fetch all `FacilityListItem` objects that belong to the specified
    `FacilityList` and create a dictionary suitable for use by a Dedupe model.

    Arguments:
    facility_list -- A `FacilityList`.

    Returns:
    A dictionary. The key is the `FacilityListItem` ID. The value is a
    dictionary of clean field values keyed by field name (country, name,
    address). A "clean" value is one which has been passed through the `clean`
    function.
    """
    facility_list_item_set = facility_list.source.facilitylistitem_set.filter(
        Q(status=FacilityListItem.GEOCODED)
        | Q(status=FacilityListItem.GEOCODED_NO_RESULTS)).extra(
            select={'country': 'country_code'}).values(
                'id', 'country', 'name', 'address')
    return {str(i['id']): {k: clean(i[k]) for k in i if k != 'id'}
            for i in facility_list_item_set}


def get_messy_items_for_training(mod_factor=5):
    """
    Fetch a subset of `FacilityListItem` objects that have been parsed and are
    not in an error state.

    Arguments:
    mod_factor -- Used to partition a subset of `FacilityListItem` records. The
                  larger the value, the fewer records will be contained in the
                  subset.

    Returns:
    A dictionary. The key is the `FacilityListItem` ID. The value is a
    dictionary of clean field values keyed by field name (country, name,
    address). A "clean" value is one which has been passed through the `clean`
    function.
    """
    facility_list_item_set = FacilityListItem.objects.exclude(
        Q(status=FacilityListItem.UPLOADED)
        | Q(status=FacilityListItem.ERROR)
        | Q(status=FacilityListItem.ERROR_PARSING)
        | Q(status=FacilityListItem.ERROR_GEOCODING)
        | Q(status=FacilityListItem.ERROR_MATCHING)
    ).extra(
            select={'country': 'country_code'}).values(
                'id', 'country', 'name', 'address')
    records = [record for (i, record) in enumerate(facility_list_item_set)
               if i % mod_factor == 0]
    return {str(i['id']): {k: clean(i[k]) for k in i if k != 'id'}
            for i in records}


def train_gazetteer(messy, canonical, model_settings=None, should_index=False):
    """
    Train and return a dedupe.Gazetteer using the specified messy and canonical
    dictionaries. The messy and canonical objects should have the same
    structure:
      - The key is a unique ID
      - The value is another dictionary of field:value pairs. This dictionary
        must contain at least 'country', 'name', and 'address' keys.

    Reads a training.json file containing positive and negative matches.
    """
    if model_settings:
        gazetteer = dedupe.StaticGazetteer(model_settings)
    else:
        fields = [
            {'field': 'country', 'type': 'Exact'},
            {'field': 'name', 'type': 'String'},
            {'field': 'address', 'type': 'String'},
        ]

        gazetteer = dedupe.Gazetteer(fields)
        gazetteer.sample(messy, canonical, 15000)
        training_file = os.path.join(settings.BASE_DIR, 'api', 'data',
                                     'training.json')
        with open(training_file) as tf:
            gazetteer.readTraining(tf)
        gazetteer.train()
        gazetteer.cleanupTraining()

    if should_index:
        index_start = datetime.now()
        logger.info('Indexing started')
        gazetteer.index(canonical)
        index_duration = datetime.now() - index_start
        logger.info('Indexing finished ({})'.format(index_duration))
        logger.info('Cleanup training')

    return gazetteer


class MatchDefaults:
    AUTOMATIC_THRESHOLD = 0.8
    GAZETTEER_THRESHOLD = 0.5
    RECALL_WEIGHT = 1.0


class NoCanonicalRecordsError(Exception):
    pass


def match_items(messy,
                automatic_threshold=MatchDefaults.AUTOMATIC_THRESHOLD,
                gazetteer_threshold=MatchDefaults.GAZETTEER_THRESHOLD,
                recall_weight=MatchDefaults.RECALL_WEIGHT):
    """
    Attempt to match each of the "messy" items specified with a "canonical"
    item.

    This function reads from but does not update the database.

    When an argument description mentions a "clean" value it is referring to a
    value that has been passed through the `clean` function.

    Arguments:
    messy -- A dictionary. The key is the unique identifier of each item to be
             matched. The value is a dictionary of clean field values keyed by
             field name (country, name, address).
    automatic_threshold -- A number from 0.0 to 1.0. A match with a confidence
                           score greater than this value will be assigned
                           automatically.
    gazetteer_threshold -- A number from 0.0 to 1.0. A match with a confidence
                           score between this value and the
                           `automatic_threshold` will be considers a match that
                           requires confirmation.
    recall_weight -- Sets the tradeoff between precision and recall. A value of
                     1.0 give an equal weight to precision and recall.
                     https://en.wikipedia.org/wiki/Precision_and_recall
                     https://docs.dedupe.io/en/latest/Choosing-a-good-threshold.html

    Returns:
    An dict containing the results of the matching process and contains the
    following keys:

    processed_list_item_ids -- A list of all the keys in `messy` that were
                               considered for matching.
    item_matches -- A dictionary where the keys are `messy` keys and the values
                    are lists of tuples where the first element is a key from
                    `canonical` representing an item that is a potential match
                    and the second element is the confidence score of the
                    match.
    results -- A dictionary containing additional information about the
               matching process that pertains to all the `messy` items and
               contains the following keys:
        gazetteer_threshold -- The threshold computed from the trained model
        automatic_threshold -- The value of the automatic_threshold parameter
                               returned for convenience
        recall_weight -- The value of the recall_weight parameter returned for
                         convenience.
        code_version -- The value of the GIT_COMMIT setting.
    started -- The date and time at which the training and matching was
               started.
    finished -- The date and time at which the training and matching was
                finished.
    """
    started = str(datetime.utcnow())
    if len(messy.keys()) > 0:
        no_geocoded_items = False
        try:
            gazetteer = GazetteerCache.get_latest()
            gazetteer.threshold(messy, recall_weight=recall_weight)
            results = gazetteer.match(messy, threshold=gazetteer_threshold,
                                      n_matches=None, generator=True)
            no_gazetteer_matches = False
        except NoCanonicalRecordsError:
            results = []
            no_gazetteer_matches = True
        except dedupe.core.BlockingError:
            results = []
            no_gazetteer_matches = True
    else:
        results = []
        no_gazetteer_matches = Facility.objects.count() == 0
        no_geocoded_items = len(messy.keys()) == 0

    finished = str(datetime.utcnow())

    item_matches = defaultdict(list)
    for matches in results:
        for (messy_id, canon_id), score in matches:
            item_matches[messy_id].append((canon_id, score))

    return {
        'processed_list_item_ids': list(messy.keys()),
        'item_matches': item_matches,
        'results': {
            'no_gazetteer_matches': no_gazetteer_matches,
            'no_geocoded_items': no_geocoded_items,
            'gazetteer_threshold': gazetteer_threshold,
            'automatic_threshold': automatic_threshold,
            'recall_weight': recall_weight,
            'code_version': settings.GIT_COMMIT
        },
        'started': started,
        'finished': finished
    }


def match_facility_list_items(
        facility_list,
        automatic_threshold=MatchDefaults.AUTOMATIC_THRESHOLD,
        gazetteer_threshold=MatchDefaults.GAZETTEER_THRESHOLD,
        recall_weight=MatchDefaults.RECALL_WEIGHT):
    """
    Fetch items from the specified `FacilityList` and match them to the current
    list of facilities.

    Arguments:
    facility_list -- A FacilityList instance
    automatic_threshold -- A number from 0.0 to 1.0. A match with a confidence
                           score greater than this value will be assigned
                           automatically.
    gazetteer_threshold -- A number from 0.0 to 1.0. A match with a confidence
                           score between this value and the
                           `automatic_threshold` will be considers a match that
                           requires confirmation.
    recall_weight -- Sets the tradeoff between precision and recall. A value of
                     1.0 give an equal weight to precision and recall.
                     https://en.wikipedia.org/wiki/Precision_and_recall
                     https://docs.dedupe.io/en/latest/Choosing-a-good-threshold.html

    Returns:
    See `match_items`.

    """
    if type(facility_list) != FacilityList:
        raise ValueError('Argument must be a FacilityList')

    return match_items(get_messy_items_from_facility_list(facility_list),
                       automatic_threshold=automatic_threshold,
                       gazetteer_threshold=gazetteer_threshold,
                       recall_weight=recall_weight)


def match_item(country,
               name,
               address,
               id='id',
               automatic_threshold=MatchDefaults.AUTOMATIC_THRESHOLD,
               gazetteer_threshold=MatchDefaults.GAZETTEER_THRESHOLD,
               recall_weight=MatchDefaults.RECALL_WEIGHT):
    """
    Match the details of a single facility to the list of existing facilities.

    Arguments:
    country -- A valid country name or 2-character ISO code.
    name -- The name of the facility.
    address -- The address of the facility.
    id -- The key value in the returned match results.
    automatic_threshold -- A number from 0.0 to 1.0. A match with a confidence
                           score greater than this value will be assigned
                           automatically.
    gazetteer_threshold -- A number from 0.0 to 1.0. A match with a confidence
                           score between this value and the
                           `automatic_threshold` will be considers a match that
                           requires confirmation.
    recall_weight -- Sets the tradeoff between precision and recall. A value of
                     1.0 give an equal weight to precision and recall.
                     https://en.wikipedia.org/wiki/Precision_and_recall
                     https://docs.dedupe.io/en/latest/Choosing-a-good-threshold.html

    Returns:
    See `match_items`.
    """
    return match_items(
        {
            str(id): {
                "country": clean(country),
                "name": clean(name),
                "address": clean(address)
            }
        },
        automatic_threshold=automatic_threshold,
        gazetteer_threshold=gazetteer_threshold,
        recall_weight=recall_weight)


def facility_to_dedupe_record(facility):
    """
    Convert a `Facility` into a dictionary suitable for training and indexing a
    Dedupe model.

    Arguments:
    facility -- A `Facility` object.

    Returns:
    A dictionary with the `Facility` id as the key and a dictionary of fields
    as the value.
    """
    return {
        str(facility.id): {
            "country": clean(facility.country_code),
            "name": clean(facility.name),
            "address": clean(facility.address),
        }
    }


class GazetteerCacheTimeoutError(Exception):
    pass


class GazetteerCache:
    """
    A container for holding a single, trained and indexed Gazetteer in memory,
    which is updated with any `Facility` rows that have been added, updated, or
    removed since the previous call to the `get_latest` class method.

    Note that the first time `get_latest` is called it will be slow, as it
    needs to train a model and index it with all the `Facility` items.
    """
    _lock = threading.Lock()
    _gazetter = None
    _version = None

    @classmethod
    @transaction.atomic
    def get_latest(cls):
        lock_aquired = cls._lock.acquire(timeout=10)
        if not lock_aquired:
            raise GazetteerCacheTimeoutError

        try:
            db_version = HistoricalFacility.objects.aggregate(
                max_id=Max('history_id')).get('max_id')
            if cls._gazetter is None:
                canonical = get_canonical_items()
                if len(canonical.keys()) == 0:
                    raise NoCanonicalRecordsError()
                cls._gazetter = train_gazetteer(get_messy_items_for_training(),
                                                canonical,
                                                should_index=True)
                cls._version = db_version
            if db_version != cls._version:
                if cls._version is None:
                    last_version_id = 0
                else:
                    last_version_id = cls._version
                changes = HistoricalFacility \
                    .objects \
                    .filter(history_id__gt=last_version_id) \
                    .order_by('history_id') \
                    .extra(select={'country': 'country_code'}) \
                    .values('id', 'country', 'name', 'address',
                            'history_type')
                for item in changes:
                    if item['history_type'] == '-':
                        cls._gazetter.unindex({
                            item['id']: {
                                'country': clean(item['country']),
                                'name': clean(item['name']),
                                'address': clean(item['address']),
                            }
                        })
                    else:
                        # The history record has old field values, so we
                        # fetch the latest version
                        try:
                            facility = Facility.objects.get(id=item['id'])
                            cls._gazetter.index(
                                facility_to_dedupe_record(facility))
                        except Facility.DoesNotExist:
                            # If the facility no longer exists, just skip
                            # indexing.
                            pass
                cls._version = db_version
        finally:
            cls._lock.release()

        return cls._gazetter
