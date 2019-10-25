from django.db import migrations


def create_can_submit_facility(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    submit_facility_group = Group.objects.create(name='can_submit_facility')

    Flag = apps.get_model('waffle', 'Flag')
    submit_facility_flag = Flag.objects.create(
        name='can_submit_facility',
        superusers=True,
        staff=False,
        note='Used for single facility submission API endpoint authorization')

    submit_facility_flag.groups.set([submit_facility_group])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0039_delete_facility_history_switch'),
    ]

    operations = [
        migrations.RunPython(create_can_submit_facility),
    ]
