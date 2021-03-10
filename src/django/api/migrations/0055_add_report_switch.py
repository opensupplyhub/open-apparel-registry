from django.db import migrations


def create_report_switch(apps, schema_editor):
    Switch = apps.get_model('waffle', 'Switch')
    Switch.objects.create(name='report_a_facility', active=False)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0054_rename_taiwan_country_choice'),
    ]

    operations = [
        migrations.RunPython(create_report_switch)
    ]
