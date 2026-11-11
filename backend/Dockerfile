FROM python:3.11-slim
WORKDIR /srv
COPY backend/requirements.txt /srv/backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend/app /srv/backend/app
COPY backend/data /srv/backend/data
COPY backend/mock /srv/backend/mock
COPY train_models.py /srv/train_models.py
RUN python train_models.py && useradd --create-home app && chown -R app:app /srv
USER app
WORKDIR /srv/backend
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
