from django.db import migrations


def create_add_allow_large_downloads_switch(apps, schema_editor):
    Switch = apps.get_model('waffle', 'Switch')
    Switch.objects.create(name='allow_large_downloads', active=False)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0108_sector'),
    ]

    operations = [
        migrations.RunPython(create_add_allow_large_downloads_switch)
    ]
