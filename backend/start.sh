#!/bin/sh
uv run app/manage.py migrate
uv run app/manage.py createsuperuser --noinput || true
cd app && DJANGO_SETTINGS_MODULE=config.settings uv run daphne -b 0.0.0.0 -p 8000 config.asgi:application
