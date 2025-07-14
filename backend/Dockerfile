FROM python:3.13-slim-bookworm
COPY --from=ghcr.io/astral-sh/uv:0.7.19 /uv /bin/uv

# Sync the project into a new environment, using the frozen lockfile
WORKDIR /app/backend
COPY . /app/backend
RUN uv sync --dev
