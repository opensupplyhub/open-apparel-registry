from django.db import migrations


def create_embedded_map_switch(apps, schema_editor):
    Switch = apps.get_model('waffle', 'Switch')
    Switch.objects.create(name='embedded_map', active=False)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0055_add_report_switch'),
    ]

    operations = [
        migrations.RunPython(create_embedded_map_switch)
    ]
