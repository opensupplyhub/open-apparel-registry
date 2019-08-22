from django.db import migrations


def create_vector_tile_switch(apps, schema_editor):
    Switch = apps.get_model('waffle', 'Switch')
    Switch.objects.create(name='vector_tile', active=False)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0028_create_downloadlog'),
    ]

    operations = [
        migrations.RunPython(create_vector_tile_switch)
    ]
