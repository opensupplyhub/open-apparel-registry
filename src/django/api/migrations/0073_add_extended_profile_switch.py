from django.db import migrations


def create_extended_profile_switch(apps, schema_editor):
    Switch = apps.get_model('waffle', 'Switch')
    Switch.objects.create(name='extended_profile', active=False)


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0072_make_extendedfield_facility_nullable'),
    ]

    operations = [
        migrations.RunPython(create_extended_profile_switch)
    ]
