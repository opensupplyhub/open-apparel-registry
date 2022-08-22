from django.core.management.base import BaseCommand

from api.matching import GazetteerCache

class Command(BaseCommand):
    help = 'Trains a new dedupe model'

    def handle(self, *args, **options):
        GazetteerCache._rebuild_gazetteer(train_model=True)
