# Generated by Django 3.2.4 on 2022-08-25 17:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0106_trainedmodel_unique_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='trainedmodel',
            name='activated_at',
            field=models.DateTimeField(null=True),
        ),
    ]