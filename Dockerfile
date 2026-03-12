FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Data volume — exchange.db and config.json live here
RUN mkdir -p /data
VOLUME /data

EXPOSE 8080

ENV AHI_DATA_DIR=/data

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
