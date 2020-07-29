from django.db import migrations


def create_ppe_switch(apps, schema_editor):
    Switch = apps.get_model('waffle', 'Switch')
    Switch.objects.create(name='ppe', active=False)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0044_add_ppe_fields'),
    ]

    operations = [
        migrations.RunPython(create_ppe_switch)
    ]
