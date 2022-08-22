from django.core.management.base import BaseCommand

from api.matching import train_gazetteer, get_model_data

class Command(BaseCommand):
    help = 'Trains a new dedupe model'

    def handle(self, *args, **options):
        messy, canonical = get_model_data()

        train_gazetteer(messy, canonical)
