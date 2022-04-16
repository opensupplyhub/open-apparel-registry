from django.db import migrations
from api.extended_fields import (get_parent_company_extendedfield_value)


def index_parentcompany(apps, facility_ids=list):
    Facility = apps.get_model('api', 'Facility')
    ExtendedField = apps.get_model('api', 'ExtendedField')
    FacilityIndex = apps.get_model('api', 'FacilityIndex')

    # If passed an empty array, update all facilities (where applicable)
    if len(facility_ids) == 0:
        print('Indexing extended fields for all facilities...')
        facility_ids = Facility.objects.all().values_list('id', flat=True)

    fields = ExtendedField.objects.filter(facility__id__in=facility_ids,
                                          value__isnull=False)

    facilities = FacilityIndex.objects.filter(id__in=facility_ids) \
                                      .iterator()
    for facility in facilities:
        facility_fields = fields.filter(facility__id=facility.id)

        # Set parent_company_name and parent_company_id:
        parent_company_values = facility_fields.filter(
            field_name='parent_company',
            value__has_any_keys=['name', 'contributor_name',
                                 'contributor_id']) \
            .values('value__contributor_name', 'value__name',
                    'value__contributor_id')
        parent_company_name = set()
        parent_company_id = set()
        for parent_company in parent_company_values:
            contributor_name = parent_company.get('value__contributor_name',
                                                  None)
            name = parent_company.get('value__name', None)
            contributor_id = parent_company.get('value__contributor_id',
                                                None)
            if contributor_name is not None:
                parent_company_name.add(contributor_name)
            elif name is not None:
                parent_company_name.add(name)
            if contributor_id is not None:
                parent_company_id.add(contributor_id)
        facility.parent_company_name = list(parent_company_name)
        facility.parent_company_id = list(parent_company_id)

        facility.save()


def process_parent_company_field(apps, schema_editor): 
    ExtendedField = apps.get_model('api', 'ExtendedField')
    extended_fields = ExtendedField.objects.filter(field_name='parent_company')
    for extended_field in extended_fields.iterator():
        raw_parent_company_value = getattr(extended_field, 'value')['raw_value']
        parent_company_value = get_parent_company_extendedfield_value(
                    raw_parent_company_value
                )
        extended_field.value = parent_company_value
        extended_field.save()
    
    facility_ids_for_indexing = ExtendedField.objects \
                            .filter(field_name='parent_company') \
                            .values_list('facility_id', flat=True)
    index_parentcompany(apps, facility_ids_for_indexing)


def do_nothing_on_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0088_migrate_claim_fields'),
    ]

    operations = [
        migrations.RunPython(process_parent_company_field, do_nothing_on_reverse),
    ]
