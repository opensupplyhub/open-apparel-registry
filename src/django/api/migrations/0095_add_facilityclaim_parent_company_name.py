# Generated by Django 2.2.24 on 2022-07-22 21:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0094_merge_20220629_1928'),
    ]

    def fill_parent_company_name(apps, schema_editor):
        FacilityClaim = apps.get_model('api', 'FacilityClaim')
        for c in FacilityClaim.objects.all():
            if c.parent_company:
                c.parent_company_name = c.parent_company.name
                c.save()

    def do_nothing_on_reverse(apps, schema_editor):
        pass

    operations = [
        migrations.AddField(
            model_name='facilityclaim',
            name='parent_company_name',
            field=models.CharField(blank=True, help_text='The parent company / supplier group of this facility claim.', max_length=200, null=True, verbose_name='parent company / supplier group'),
        ),
        migrations.AddField(
            model_name='historicalfacilityclaim',
            name='parent_company_name',
            field=models.CharField(blank=True, help_text='The parent company / supplier group of this facility claim.', max_length=200, null=True, verbose_name='parent company / supplier group'),
        ),
        migrations.AlterField(
            model_name='facilityclaim',
            name='parent_company',
            field=models.ForeignKey(default=None, help_text='The contributor parent company / supplier group of thisfacility claim.', null=True, on_delete=django.db.models.deletion.PROTECT, related_name='parent_company', to='api.Contributor', verbose_name='contributor parent company / supplier group'),
        ),
        migrations.AlterField(
            model_name='historicalfacilityclaim',
            name='parent_company',
            field=models.ForeignKey(blank=True, db_constraint=False, default=None, help_text='The contributor parent company / supplier group of thisfacility claim.', null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='api.Contributor', verbose_name='contributor parent company / supplier group'),
        ),
        migrations.RunPython(fill_parent_company_name, do_nothing_on_reverse),
    ]
