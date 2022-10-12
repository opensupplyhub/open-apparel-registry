import os
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from django.core.files.base import File

from api.models import TrainedModel


class Command(BaseCommand):
    help = ('Create a basic TrainedModel')

    def handle(self, *args, **options):
        dedupe_file_path = os.path.join(settings.BASE_DIR, 'api', 'data',
                                        'dedupe_model.pickle')
        # Copy the file into the correct MEDIA_ROOT,
        # so when we use S3 Django is still able to find the file.
        with open(dedupe_file_path, 'rb') as f:
            dedupe_file = File(f, name='dedupe.pickle')

            # Create a model without a file to get a model id
            model = TrainedModel()
            model.save()

            # Add the file to the model, using the TrainedModel.id in the path
            model.dedupe_model = dedupe_file
            model.is_active = True
            model.activated_at = timezone.now()
            model.save()
