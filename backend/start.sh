#!/bin/sh
uv run app/manage.py migrate
uv run app/manage.py createsuperuser --noinput || true
uv run app/manage.py runserver 0.0.0.0:8000
