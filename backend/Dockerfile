FROM python:3.9

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update --allow-releaseinfo-change && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY . .

RUN pip3 install --no-cache-dir yt-dlp fastapi uvicorn

RUN mkdir -p downloads

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
