FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc g++ tzdata && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python -c "from pythainlp.tokenize import word_tokenize; word_tokenize('ทดสอบ', engine='newmm')"

COPY actions/ ./actions/
COPY data/ ./data/
COPY domain.yml config.yml credentials.yml endpoints.yml ./
COPY models/ ./models/

ENV PYTHONPATH=/app

EXPOSE 5005 5055
