from django.db.models import F

from api.constants import ProcessingAction, FacilityHistoryActions
from api.models import FacilityMatch, FacilityClaim


def create_associate_match_string(facility_str, contributor_str, list_str):
    return 'Associate facility {} with contributor {} via list {}'.format(
        facility_str,
        contributor_str,
        list_str,
    )


def create_associate_match_change_reason(list_item, facility):
    return create_associate_match_string(
        facility.id,
        list_item.facility_list.contributor.id,
        list_item.facility_list.id,
    )


def create_associate_match_entry_detail(match, facility_id):
    return create_associate_match_string(
        facility_id,
        match.facility_list_item.facility_list.contributor.name,
        match.facility_list_item.facility_list.name,
    )


def create_dissociate_match_string(facility_str, contributor_str, list_str):
    return 'Dissociate facility {} from contributor {} via list {}'.format(
        facility_str,
        contributor_str,
        list_str,
    )


def create_dissociate_match_change_reason(list_item, facility):
    return create_dissociate_match_string(
        facility.id,
        list_item.facility_list.contributor.id,
        list_item.facility_list.id,
    )


def create_dissociate_match_entry_detail(match, facility_id):
    return create_dissociate_match_string(
        facility_id,
        match.facility_list_item.facility_list.contributor.name,
        match.facility_list_item.facility_list.name,
    )


def create_geojson_diff_for_location_change(entry):
    return {
        'old': {
            'type': 'Point',
            'coordinates': [
                entry.prev_record.location.x,
                entry.prev_record.location.y,
            ],
        },
        'new': {
            'type': 'Point',
            'coordinates': [
                entry.location.x,
                entry.location.y,
            ],
        },
    }


def get_change_diff_for_history_entry(entry):
    if entry.prev_record is None:
        return {}

    delta = entry.diff_against(entry.prev_record)
    changes = {}

    for change in delta.changes:
        if change.field not in ['created_at', 'updated_at']:
            changes[change.field] = {
                'old': change.old,
                'new': change.new,
            }

    return changes


def create_facility_history_dictionary(entry):
    updated_at = str(entry.history_date)
    change_reason = entry.history_change_reason or ''
    history_type_display = entry.get_history_type_display()
    changes = get_change_diff_for_history_entry(entry)

    if 'FacilityLocation' in change_reason:
        changes['location'] = create_geojson_diff_for_location_change(entry)

        return {
            'updated_at': updated_at,
            'action': FacilityHistoryActions.UPDATE,
            'detail': change_reason,
            'changes': changes,
        }
    elif 'Merged with' in change_reason:
        return {
            'updated_at': updated_at,
            'action': FacilityHistoryActions.MERGE,
            'detail': change_reason,
            'changes': changes,
        }
    elif 'Promoted' in change_reason:
        changes['location'] = create_geojson_diff_for_location_change(entry)

        return {
            'updated_at': updated_at,
            'action': FacilityHistoryActions.UPDATE,
            'detail': change_reason,
            'changes': changes,
        }
    elif 'Created' in history_type_display:
        return {
            'updated_at': updated_at,
            'action': FacilityHistoryActions.CREATE,
            'detail': history_type_display,
            'changes': changes,
        }
    elif 'Deleted' in history_type_display:
        return {
            'updated_at': updated_at,
            'action': FacilityHistoryActions.DELETE,
            'detail': history_type_display,
            'changes': changes,
        }
    else:
        return {
            'updated_at': updated_at,
            'action': FacilityHistoryActions.OTHER,
            'detail': history_type_display,
            'changes': changes,
        }


def maybe_get_split_action_time_from_processing_results(item):
    split_processing_times = [
        r.get('finished_at', None)
        for r
        in item.processing_results
        if r.get('action', None) == ProcessingAction.SPLIT_FACILITY
    ]

    return next(iter(split_processing_times), None)


def processing_results_has_split_action_for_oar_id(list_item, facility_id):
    return facility_id in [
        r.get('previous_facility_oar_id', None)
        for r
        in list_item.processing_results
        if r.get('action', None) == ProcessingAction.SPLIT_FACILITY
    ]


def create_facility_claim_entry(claim):
    if claim.status == FacilityClaim.REVOKED:
        return {
            'updated_at': str(claim.updated_at),
            'action': FacilityHistoryActions.CLAIM_REVOKE,
            'detail': 'Claim on facility {} by {} was revoked'.format(
                claim.facility.id,
                claim.contributor.name,
            ),
        }

    if claim.status == FacilityClaim.APPROVED \
       and claim.prev_record.status == FacilityClaim.PENDING:
        return {
            'updated_at': str(claim.updated_at),
            'action': FacilityHistoryActions.CLAIM,
            'detail': 'Facility {} was claimed by {}'.format(
                claim.facility.id,
                claim.contributor.name,
            ),
        }

    if claim.status == FacilityClaim.APPROVED:
        public_claim_data_keys = [
            'facility_description',
            'facility_name_english',
            'facility_name_native_language',
            'facility_minimum_order',
            'facility_average_lead_time',
            'facility_workers_count',
            'facility_female_workers_percentage',
            'facility_type',
            'other_facility_type',
            'facility_affiliations',
            'facility_product_types',
            'facility_production_types',
            'facility_parent_company',
        ]

        public_changes = {
            k: v
            for k, v
            in get_change_diff_for_history_entry(claim).items()
            if k in public_claim_data_keys
        }

        if any(public_changes):
            return {
                'updated_at': str(claim.updated_at),
                'action': FacilityHistoryActions.CLAIM_UPDATE,
                'detail': 'Facility {} claim public data was updated'.format(
                    claim.facility.id,
                ),
                'changes': public_changes,
            }

    return None


def create_facility_history_list(entries, facility_id):
    facility_split_entries = [
        {
            'updated_at': maybe_get_split_action_time_from_processing_results(
                m.facility_list_item
            ),
            'action': FacilityHistoryActions.SPLIT,
            'detail': '{} was split from {}'.format(
                m.facility.id,
                facility_id,
            )
        }
        for m
        in FacilityMatch
        .objects
        .annotate(
            processing_results=F('facility_list_item__processing_results'))
        .extra(
            where=['processing_results @> \'[{"action": "split_facility"}]\''])
        if processing_results_has_split_action_for_oar_id(
            m.facility_list_item,
            facility_id,
        )
    ]

    facility_match_entries = [
        {
            'updated_at': str(m.updated_at),
            'action': FacilityHistoryActions.ASSOCIATE
            if m.is_active else FacilityHistoryActions.DISSOCIATE,
            'detail': create_associate_match_entry_detail(m, facility_id)
            if m.is_active else create_dissociate_match_entry_detail(
                    m,
                    facility_id,
            ),
        }
        for m
        in FacilityMatch
        .history
        .filter(status__in=[
            FacilityMatch.CONFIRMED,
            FacilityMatch.AUTOMATIC,
        ])
        .filter(facility_id=facility_id)
    ]

    facility_claim_entries = [
        create_facility_claim_entry(c)
        for c
        in FacilityClaim
        .history
        .filter(status__in=[
            FacilityClaim.APPROVED,
            FacilityClaim.REVOKED,
        ])
        if c.facility.id == facility_id
        if create_facility_claim_entry(c) is not None
    ]

    history_entries = [
        create_facility_history_dictionary(entry)
        for entry
        in entries
    ]

    return sorted(history_entries + facility_split_entries +
                  facility_match_entries + facility_claim_entries,
                  key=lambda entry: entry['updated_at'], reverse=True)
