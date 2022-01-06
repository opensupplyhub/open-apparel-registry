from django.db import migrations, models
from api.matching import clean


def populate_cleaned_fields(apps, schema_editor):
    print('')
    print('Started filling clean name and address')
    count = 0
    FacilityListItem = apps.get_model('api', 'FacilityListItem')
    for list_item in FacilityListItem.objects.exclude(name='', address='').iterator():
        list_item.clean_name = clean(list_item.name) or ''
        list_item.clean_address = clean(list_item.address) or ''
        list_item.save()
        count += 1
        if count % 1000 == 0:
            print('Filled ' + str(count))
    print('Finished filling clean name and address')


def do_nothing_on_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0075_add_clean_name_and_address'),
    ]

    operations = [
        migrations.RunPython(populate_cleaned_fields, do_nothing_on_reverse),
    ]
