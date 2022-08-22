# Generated by Django 3.2.4 on 2022-08-22 15:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0111_alter_facilitylistitem_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='TrainedModel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dedupe_model', models.BinaryField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=False, help_text='True if this is the currently active version of the dedupe model')),
            ],
        ),
    ]
