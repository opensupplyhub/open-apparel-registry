from django.db import migrations


def create_can_get_facility_history(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    history_group = Group.objects.create(name='can_get_facility_history')

    Flag = apps.get_model('waffle', 'Flag')
    history_flag = Flag.objects.create(name='can_get_facility_history',
                                       superusers=True,
                                       staff=False,
                                       note='Used for history API endpoint authorization')

    history_flag.groups.set([history_group])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0037_remove_facility_list_fields_20191002_2323'),
    ]

    operations = [
        migrations.RunPython(create_can_get_facility_history),
    ]
