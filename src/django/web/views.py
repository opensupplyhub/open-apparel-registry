import os

from django.conf import settings
from django.shortcuts import render

# Capture all REACT_APP_ variables into a dictionary for context
environment = {k: v
               for k, v in os.environ.items()
               if k.startswith('REACT_APP_')}

# Add Environment variable, lowered for easier comparison
# One of `development`, `testing`, `staging`, `production`
environment['ENVIRONMENT'] = settings.ENVIRONMENT.lower()

context = {'environment': environment}


def index(request):
    """
    The home page of the app, when accessing '/'
    """
    return render(request, 'main.html', context)


def handler404(request, exception):
    """
    A 404 is taken to be a client-side route.
    Render the home page, passing along the routing to it.
    """
    return render(request, 'index.html', context)
