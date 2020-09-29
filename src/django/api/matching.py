import dedupe
import logging
import os
import re
import sys
import traceback

from collections import defaultdict
from datetime import datetime
from django.conf import settings
from django.contrib.postgres.search import TrigramSimilarity
from django.db import transaction
from django.db.models import Q, Max
from unidecode import unidecode

from api.models import (Facility,
                        FacilityList,
                        FacilityListItem,
                        FacilityMatch,
                        HistoricalFacility,
                        HistoricalFacilityMatch)

logger = logging.getLogger(__name__)


def _try_reporting_error_to_rollbar(extra_data=dict):
    try:
        ROLLBAR = getattr(settings, 'ROLLBAR', {})
        if ROLLBAR:
            import rollbar
            rollbar.report_exc_info(
                sys.exc_info(),
                extra_data=extra_data)
    except Exception:
        logger.error('Failed to post exception to Rollbar: {} {}'.format(
            str(extra_data), traceback.format_exc()))


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


def match_detail_to_extended_facility_id(facility_id, match_id):
    return '{}_MATCH-{}'.format(facility_id, match_id)


def match_to_extended_facility_id(match):
    """
    We want manually confirmed matches to influence the matching process.
    We were not successful when adding them as training data so we add them
    to our list of canonical items with a synthetic ID. When post
    processing the matches we will drop the extension using the
    `normalize_extended_facility_id` function.
    """
    return match_detail_to_extended_facility_id(
        str(match.facility.id), str(match.id))


def normalize_extended_facility_id(facility_id):
        """
        Manually confirmed matches are added to the list of canonical
        facilities with a synthetic ID. This function converts one of these
        extended IDs back to a plain Facility ID. A plain Facility ID will pass
        through this function unchanged.
        """
        return facility_id.split('_')[0]


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

    items = {str(i['id']):
             {k: clean(i[k]) for k in i if k != 'id'}
             for i in facility_set}

    confirmed_items = {match_to_extended_facility_id(m): {
        'country': clean(m.facility_list_item.country_code),
        'name': clean(m.facility_list_item.name),
        'address': clean(m.facility_list_item.address),
    } for m in FacilityMatch.objects.filter(status=FacilityMatch.CONFIRMED)}

    items.update(confirmed_items)

    return items


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


def text_match_item(country_code, name, threshold=0.5):
    """
    Use simple fuzzy text matching rather than a dedupe model to find potential
    matches.

    Arguments:
    country -- A valid 2-character ISO code.
    name -- The name of the facility.
    threshold -- Value between 0.0 and 1.0. The minimum acceptable similarity
                 score. Defaults to 0.5.

    Returns:
    A Facility QuerySet that containing items with a matching country code and
    a name similar to the name argument.
    """
    return Facility.objects \
                   .annotate(similarity=TrigramSimilarity('name', name)) \
                   .filter(similarity__gte=threshold,
                           country_code=country_code) \
                   .order_by('-similarity')


def facility_values_to_dedupe_record(facility_dict):
    """
    Convert a dictionary with id, country, name, and address keys into a
    dictionary suitable for training and indexing a Dedupe model.

    Arguments:
    facility_dict -- A dict with id, country, name, and address key created
                     from a `Facility` values query.

    Returns:
    A dictionary with the id as the key and a dictionary of fields
    as the value.
    """
    return {
        str(facility_dict['id']): {
            "country": clean(facility_dict['country']),
            "name": clean(facility_dict['name']),
            "address": clean(facility_dict['address']),
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
    _gazetter = None
    _facility_version = None
    _match_version = None

    @classmethod
    def _rebuild_gazetteer(cls):
        logger.info('Rebuilding gazetteer')
        with transaction.atomic():
            db_facility_version = HistoricalFacility.objects.aggregate(
                max_id=Max('history_id')).get('max_id')
            db_match_version = HistoricalFacilityMatch.objects.aggregate(
                max_id=Max('history_id')).get('max_id')
            # We expect `get_canonical_items` to return a list rather than a
            # QuerySet so that we can close the transaction as quickly as
            # possible
            canonical = get_canonical_items()
            if len(canonical.keys()) == 0:
                raise NoCanonicalRecordsError()
            # We expect `get_messy_items_for_training` to return a list rather
            # than a QuerySet so that we can close the transaction as quickly
            # as possible
            messy = get_messy_items_for_training()

        cls._gazetter = train_gazetteer(messy, canonical, should_index=True)
        cls._facility_version = db_facility_version
        cls._match_version = db_match_version
        return cls._gazetter

    @classmethod
    @transaction.atomic
    def _get_new_facility_history(cls):
        facility_changes = []
        latest_facility_dedupe_records = {}

        db_facility_version = HistoricalFacility.objects.aggregate(
            max_id=Max('history_id')).get('max_id')

        if db_facility_version != cls._facility_version:
            if cls._facility_version is None:
                last_facility_version_id = 0
            else:
                last_facility_version_id = cls._facility_version
            # We call `list` so that we can get all the data and exit
            # the transaction as soon as possible
            facility_changes = list(
                HistoricalFacility
                .objects
                .filter(history_id__gt=last_facility_version_id)
                .order_by('history_id')
                .extra(select={'country': 'country_code'})
                .values('id', 'country', 'name', 'address',
                        'history_type', 'history_id'))

            changed_facility_ids_qs = HistoricalFacility \
                .objects \
                .filter(history_id__gt=last_facility_version_id) \
                .values_list('id', flat=True)

            # We use an dictionary comprehension so that we can load
            # all the data and exit the transaction as soon as possible
            latest_facility_dedupe_records = {
                f['id']: facility_values_to_dedupe_record(f) for f in
                Facility
                .objects
                .filter(id__in=changed_facility_ids_qs)
                .extra(select={'country': 'country_code'})
                .values('id', 'country', 'name', 'address')
            }

        return facility_changes, latest_facility_dedupe_records

    @classmethod
    @transaction.atomic
    def _get_new_match_history(cls):
        match_changes = []
        latest_match_records = {}
        latest_matched_facility_dedupe_records = {}

        db_match_version = HistoricalFacility.objects.aggregate(
            max_id=Max('history_id')).get('max_id')

        if db_match_version != cls._match_version:
            if cls._match_version is None:
                last_match_version_id = 0
            else:
                last_match_version_id = cls._match_version

            # We call `list` so that we can get all the data and exit
            # the transaction as soon as possible
            match_changes = list(
                HistoricalFacilityMatch
                .objects
                .filter(history_id__gt=last_match_version_id)
                .order_by('history_id')
                .values('id', 'facility', 'history_type', 'history_id'))

            # We use an dictionary comprehension so that we can load
            # all the data and exit the transaction as soon as possible
            latest_match_records = {
                m['id']: {
                    'facility': m['facility'],
                    'status': m['status'],
                    'is_active': m['is_active'],
                } for m in
                FacilityMatch
                .objects
                .filter(id__in=(
                    HistoricalFacilityMatch
                    .objects
                    .filter(history_id__gt=last_match_version_id)
                    .values_list('id', flat=True)
                ))
                .values('id', 'facility', 'status', 'is_active')}

            # We use an dictionary comprehension so that we can load
            # all the data and exit the transaction as soon as possible
            latest_matched_facility_dedupe_records = {
                f['id']: facility_values_to_dedupe_record(f) for f in
                Facility
                .objects
                .filter(id__in=(
                    HistoricalFacilityMatch
                    .objects
                    .filter(history_id__gt=last_match_version_id)
                    .values_list('facility', flat=True)
                ))
                .extra(select={'country': 'country_code'})
                .values('id', 'country', 'name', 'address')
            }

        return (match_changes, latest_match_records,
                latest_matched_facility_dedupe_records)

    @classmethod
    def get_latest(cls):
        try:
            if cls._gazetter is None:
                return cls._rebuild_gazetteer()

            facility_changes, latest_facility_dedupe_records = \
                cls._get_new_facility_history()

            for item in facility_changes:
                if item['history_type'] == '-':
                    record = facility_values_to_dedupe_record(item)
                    logger.debug(
                        'Unindexing facility {}'.format(str(record)))
                    cls._gazetter.unindex(record)
                else:
                    # The history record has old field values, so we use the
                    # updated version that we fetched. If we don't have a
                    # record for the ID, it means that the facility has been
                    # deleted. We don't need to index a deleted facility.
                    if item['id'] in latest_facility_dedupe_records:
                        record = latest_facility_dedupe_records[item['id']]
                        logger.debug(
                            'Indexing facility {}'.format(str(record)))
                        cls._gazetter.index(record)
                cls._facility_version = item['history_id']

            (match_changes, latest_match_records,
             latest_matched_facility_dedupe_records) = \
                cls._get_new_match_history()

            def dedupe_record_for_match_item(item):
                facility_id = item['facility']
                key = match_detail_to_extended_facility_id(
                    facility_id, item['id'])
                """
                The latest_matched_facility_dedupe_records dictionary looks
                like this:

                {
                    facility_id: {
                        facility_id: {
                            field1: value1,
                            field2, value2
                        }
                    }
                }

                We want to get the inner object and change the key from a real
                facility ID to a "synthetic" facility ID which we use to index
                confirmed matches.
                """
                value = (
                    latest_matched_facility_dedupe_records
                    [facility_id][facility_id]
                )
                return {key: value}

            for item in match_changes:
                match = (latest_match_records[item['id']]
                         if item['id'] in latest_match_records
                         else None)
                has_facility = (
                    item['facility'] in latest_matched_facility_dedupe_records)
                is_confirmed_match_with_facility = (
                    match
                    and match['status'] == FacilityMatch.CONFIRMED
                    and has_facility)
                if is_confirmed_match_with_facility:
                    if item['history_type'] == '-':
                        record = dedupe_record_for_match_item(item)
                        logger.debug('Unindexing match {}'.format(str(record)))
                        cls._gazetter.unindex(record)
                    else:
                        # The history record has old field values, so we us the
                        # updated version that we fetched. If we don't have a
                        # record for the ID, it means that the facility has
                        # been deleted. We don't need to index a deleted
                        # facility.
                        if match and match['is_active']:
                            record = dedupe_record_for_match_item(item)
                            logger.debug(
                                'Indexing match {}'.format(str(record)))
                            cls._gazetter.index(record)
                    cls._match_version = item['history_id']

        except Exception:
            extra_info = {
                'last_successful_facility_version': cls._facility_version,
                'last_successful_match_version': cls._match_version}
            _try_reporting_error_to_rollbar(extra_info)
            raise

        return cls._gazetter
