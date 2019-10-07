from django.db import migrations


def create_facility_history_switch(apps, schema_editor):
    Switch = apps.get_model('waffle', 'Switch')
    Switch.objects.create(name='facility_history', active=False)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0034_facilitylocation'),
    ]

    operations = [
        migrations.RunPython(create_facility_history_switch)
    ]
