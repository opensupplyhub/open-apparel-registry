import dedupe
import logging
import os
import sys
import traceback
import io
import json

from collections import defaultdict
from datetime import datetime
from django.conf import settings
from django.contrib.postgres.search import TrigramSimilarity
from django.db import transaction, connection
from django.db.models import Q
from django.db.models.signals import post_save
from django.utils import timezone

from api.models import (Facility,
                        FacilityList,
                        FacilityListItem,
                        FacilityMatch,
                        TrainedModel)
from api.helpers import clean
from api.gazetteer import OgrGazetteer, OgrStaticGazetteer, ModelOutOfDate

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


def sort_exact_matches(exact_matches, active_item_ids, contributor):
    def sort_order(f):
        is_active = f['id'] in active_item_ids
        has_same_contributor = f['source__contributor_id'] == contributor.id
        updated_at = f.get('updated_at', None)
        return (is_active,
                has_same_contributor,
                updated_at)

    return sorted(exact_matches, key=sort_order, reverse=True)


def exact_match_items(messy, contributor):
    started = str(timezone.now())

    matched_items = FacilityListItem.objects \
        .filter(status__in=[FacilityListItem.MATCHED,
                            FacilityListItem.CONFIRMED_MATCH]) \
        .exclude(facility_id=None)
    active_item_ids = FacilityMatch.objects \
        .filter(status__in=[FacilityMatch.AUTOMATIC,
                            FacilityMatch.CONFIRMED,
                            FacilityMatch.MERGED],
                is_active=True,
                facility_list_item__source__is_active=True) \
        .values_list('facility_list_item', flat=True)

    results = dict()

    for messy_id, item in messy.items():
        clean_name = clean(item.get('name', ''))
        clean_address = clean(item.get('address', ''))
        country_code = item.get('country', '').upper()
        empty_text_fields = Q(Q(clean_name__isnull=True) |
                              Q(clean_name__exact='') |
                              Q(clean_address__isnull=True) |
                              Q(clean_address__exact=''))
        exact_matches = matched_items.filter(clean_name=clean_name,
                                             clean_address=clean_address,
                                             country_code=country_code) \
            .exclude(empty_text_fields) \
            .values('id', 'facility_id', 'source__contributor_id',
                    'updated_at')

        if len(exact_matches) > 0:
            if len(exact_matches) > 1:
                exact_matches = sort_exact_matches(exact_matches,
                                                   active_item_ids,
                                                   contributor)

            results[messy_id] = exact_matches

    finished = str(timezone.now())

    return {
        'processed_list_item_ids': list(results.keys()),
        'item_matches': results,
        'started': started,
        'finished': finished
    }


def identify_exact_matches(facility_list):
    messy = get_messy_items_from_facility_list(facility_list)
    contributor = facility_list.source.contributor

    return exact_match_items(messy, contributor)


def exact_match_item(country, name, address, contributor, id='id'):
    return exact_match_items(
        {
            str(id): {
                "country": country,
                "name": name,
                "address": address
            }
        },
        contributor)


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


def load_gazetteer():
    """
    Load a preexisting dedupe.Gazetteer model by using the TrainedModel
    object in the Django ORM.
    """
    active_model = TrainedModel.objects.get_active()
    input_stream = io.BytesIO(active_model.dedupe_model)
    gazetteer = OgrStaticGazetteer(input_stream)
    gazetteer.trained_model = active_model

    return gazetteer


class ModelNotActivated(Exception):
    pass


def train_and_activate_gazetteer(messy, canonical):
    fields = [
        {'field': 'country', 'type': 'Exact'},
        {'field': 'name', 'type': 'String'},
        {'field': 'address', 'type': 'String'},
    ]

    gazetteer = OgrGazetteer(fields)
    training_file = os.path.join(settings.BASE_DIR, 'api', 'data',
                                 'training.json')
    with open(training_file) as tf:
        gazetteer.prepare_training(messy, canonical, tf, 15000)
    gazetteer.train(index_predicates=False)
    output_stream = io.BytesIO()
    gazetteer.write_settings(output_stream)
    output_stream.seek(0)
    active_model = TrainedModel(dedupe_model=output_stream.read())
    active_model.save()
    gazetteer.trained_model = active_model
    gazetteer.cleanup_training()
    gazetteer.build_index_table(canonical)
    try:
        prev_active_model_id = active_model.activate()
    except ModelNotActivated:
        pass
    with connection.cursor() as cursor:
        cursor.execute(
            """SELECT record_id, record_data
               FROM dedupe_indexed_records_{} d1
               WHERE NOT EXISTS
                (SELECT *
                    FROM dedupe_indexed_records d2
                    WHERE d1.record_id = d2.record_id)
                    """.format(prev_active_model_id)
        )
        while True:
            records = cursor.fetchmany(1000)
            if not records:
                break
            for record in records:
                item = {record[0]: json.loads(record[1])}
                gazetteer.index(item)


def train_gazetteer(messy, canonical, should_index=False):
    """
    Train and return a dedupe.Gazetteer using the specified messy and canonical
    dictionaries. The messy and canonical objects should have the same
    structure:
      - The key is a unique ID
      - The value is another dictionary of field:value pairs. This dictionary
        must contain at least 'country', 'name', and 'address' keys.

    Reads a training.json file containing positive and negative matches.
    """
    fields = [
        {'field': 'country', 'type': 'Exact'},
        {'field': 'name', 'type': 'String'},
        {'field': 'address', 'type': 'String'},
    ]

    gazetteer = OgrGazetteer(fields)
    training_file = os.path.join(settings.BASE_DIR, 'api', 'data',
                                 'training.json')
    with open(training_file) as tf:
        gazetteer.prepare_training(messy, canonical, tf, 15000)
    # Messy and canonical aren't doing anything if index_predicates are off?
    gazetteer.train(index_predicates=False)
    output_stream = io.BytesIO()
    gazetteer.write_settings(output_stream)
    output_stream.seek(0)
    model_object = TrainedModel(dedupe_model=output_stream.read())
    model_object.save()
    gazetteer.trained_model = model_object
    gazetteer.cleanup_training()

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
    started = str(timezone.now())
    if len(messy.keys()) > 0:
        no_geocoded_items = False
        try:
            results = GazetteerCache.search(
                messy, threshold=gazetteer_threshold, n_matches=None,
                generator=False)
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

    finished = str(timezone.now())

    item_matches = defaultdict(list)
    for messy_id, matches in results:
        for canon_id, score in matches:
            # The gazetteer matcher obtained from the GazetteerCache may have
            # encountered an exception raised by Dedupe while unindexing
            # records and could therefore return matches for facility IDs that
            # no longer exist due to merging or deleting.
            facility_exists = Facility \
                .objects \
                .filter(pk=normalize_extended_facility_id(canon_id)) \
                .exists()
            if facility_exists:
                item_matches[messy_id].append((canon_id, score))
    if len(item_matches.keys()) == 0:
        no_gazetteer_matches = True

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
    _gazetteer = None

    @classmethod
    def load_gazetteer_if_none(cls):
        if cls._gazetteer is None:
            cls._gazetteer = load_gazetteer()
        return cls._gazetteer

    @classmethod
    def load_latest_gazetteer(cls):
        cls._gazetteer = load_gazetteer()
        return cls._gazetteer

    @classmethod
    def index(cls, data):
        gazetteer = cls.load_gazetteer_if_none()
        try:
            return gazetteer.index(data)
        except ModelOutOfDate:
            gazetteer = cls.load_latest_gazetteer()
            return gazetteer.index(data)

    @classmethod
    def unindex(cls, data):
        gazetteer = cls.load_gazetteer_if_none()
        try:
            return gazetteer.unindex(data)
        except ModelOutOfDate:
            gazetteer = cls.load_latest_gazetteer()
            return gazetteer.unindex(data)

    @classmethod
    def search(cls, messy, threshold, n_matches, generator):
        gazetteer = cls.load_gazetteer_if_none()
        try:
            return gazetteer.search(messy, threshold, n_matches, generator)
        except ModelOutOfDate:
            gazetteer = cls.load_latest_gazetteer()
            return gazetteer.search(messy, threshold, n_matches, generator)


def get_model_data():
    with transaction.atomic():
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

    return messy, canonical


def should_index_match_with_dedupe(match):
    if match.is_active:
        if match.status == FacilityMatch.AUTOMATIC:
            return match.facility.created_from == match.facility_list_item
        if match.status == FacilityMatch.CONFIRMED:
            return True
    return False


def should_unindex_match_from_dedupe(match):
    if not match.is_active:
        return match.facility.created_from != match.facility_list_item
    return False


def dedupe_record_for_match(match):
    record_id = (
        match.facility.id
        if match.facility.created_from == match.facility_list_item
        else match_to_extended_facility_id(match))
    return {record_id: {
        'country': clean(match.facility_list_item.country_code),
        'name': clean(match.facility_list_item.name),
        'address': clean(match.facility_list_item.address),
    }}


def facilitymatch_post_save(sender, **kwargs):
    instance = kwargs.get('instance')
    if should_index_match_with_dedupe(instance):
        GazetteerCache.index(dedupe_record_for_match(instance))
    if should_unindex_match_from_dedupe(instance):
        GazetteerCache.unindex(dedupe_record_for_match(instance))


post_save.connect(facilitymatch_post_save, sender=FacilityMatch)
