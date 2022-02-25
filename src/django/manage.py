#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    if os.getenv('DEBUGPY') is not None:
        import debugpy
        debugpy.listen(('0.0.0.0', 3000))
        print('Ready for debugging!')

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "oar.settings")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
