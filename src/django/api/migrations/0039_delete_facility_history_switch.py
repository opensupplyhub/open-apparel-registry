from django.db import migrations


def delete_facility_history_switch(apps, schema_editor):
    Switch = apps.get_model('waffle', 'Switch')
    Switch.objects.get(name='facility_history').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0038_add_facility_history_flag'),
    ]

    operations = [
        migrations.RunPython(delete_facility_history_switch)
    ]
