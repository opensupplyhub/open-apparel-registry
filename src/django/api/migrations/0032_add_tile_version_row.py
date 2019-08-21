from django.db import migrations


def create_tile_version_row(apps, schema_editor):
    Version = apps.get_model('api', 'Version')
    Version.objects.create(name='tile_version', version=1)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0031_add_version_table'),
    ]

    operations = [
        migrations.RunPython(create_tile_version_row)
    ]
