from django.db import migrations

from api.constants import FeatureGroups


def create_can_view_full_contrib_detail(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    view_full_contrib_detial_group = Group.objects.create(
        name=FeatureGroups.CAN_VIEW_FULL_CONTRIB_DETAIL)

    Flag = apps.get_model('waffle', 'Flag')
    view_full_contrib_detail_flag = Flag.objects.create(
        name=FeatureGroups.CAN_VIEW_FULL_CONTRIB_DETAIL,
        superusers=True,
        staff=False,
        note='Used for full contributor detail authorization')

    view_full_contrib_detail_flag.groups.set([view_full_contrib_detial_group])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0041_add_private_facility_flag'),
    ]

    operations = [
        migrations.RunPython(create_can_view_full_contrib_detail),
    ]
