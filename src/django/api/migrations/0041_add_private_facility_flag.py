from django.db import migrations

from api.constants import FeatureGroups


def create_can_submit_private_facility(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    submit_private_facility_group = Group.objects.create(
        name=FeatureGroups.CAN_SUBMIT_PRIVATE_FACILITY)

    Flag = apps.get_model('waffle', 'Flag')
    submit_private_facility_flag = Flag.objects.create(
        name=FeatureGroups.CAN_SUBMIT_PRIVATE_FACILITY,
        superusers=True,
        staff=False,
        note='Used for private facility submission API param authorization')

    submit_private_facility_flag.groups.set([submit_private_facility_group])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0040_add_submit_facility_flag'),
    ]

    operations = [
        migrations.RunPython(create_can_submit_private_facility),
    ]
