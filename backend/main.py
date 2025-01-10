from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel, validator
import re
import subprocess
import uuid
import os
import threading
import time
from typing import Optional
from fastapi.responses import FileResponse
import mimetypes
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import urlparse, quote

# --- Seguridad: Dominios permitidos y regex para tiempo ---
ALLOWED_DOMAINS = {"youtube.com", "youtu.be"}
time_pattern = re.compile(r"^[0-9]+:[0-5]\d:[0-5]\d$")

# Escapar caracteres no válidos para URLs
SAFE_URL_CHARS = re.compile(r"[^a-zA-Z0-9._~:/?#\[\]@!$&'()*+,;=%-]")

def escape_url(url: str) -> str:
    return SAFE_URL_CHARS.sub("", url)

def is_valid_domain(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return any(domain in parsed.netloc for domain in ALLOWED_DOMAINS)
    except:
        return False

def is_valid_time(timestr: str) -> bool:
    if not timestr:
        return True
    return bool(time_pattern.match(timestr))

# --- Directorio de descargas y base de datos en memoria ---
DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)
downloads = {}
DOWNLOAD_EXPIRATION = 900  # Configurable expiration time

# --- Modelos de datos ---
class DownloadRequest(BaseModel):
    url: str
    start: Optional[str] = "0:00:00"
    end_or_length: Optional[str] = None
    type: Optional[str] = "video_start_end"

    @validator('url')
    def url_must_be_valid(cls, v):
        if len(v) > 2048:
            raise ValueError("URL demasiado larga.")
        if not is_valid_domain(v):
            raise ValueError("URL no permitida o dominio no válido.")
        return escape_url(v)

    @validator('start', 'end_or_length')
    def times_must_match_format(cls, v):
        if v and not is_valid_time(v):
            raise ValueError("Formato de tiempo inválido (HH:MM:SS).")
        return v

    @validator('type')
    def type_must_be_valid(cls, v):
        allowed_types = {"video_start_end", "video_start_length", "audio_start_end", "audio_start_length"}
        if v not in allowed_types:
            raise ValueError("Tipo de descarga no válido.")
        return v

class DownloadStatus(BaseModel):
    id: str
    status: str
    progress: Optional[str]
    filepath: Optional[str]

# --- Función auxiliar ---
def find_file_by_id(download_id):
    for file in os.listdir(DOWNLOAD_DIR):
        if file.startswith(download_id):
            return os.path.join(DOWNLOAD_DIR, file)
    return None

# --- Instancia de la app ---
app = FastAPI()

# --- Middleware CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints ---
@app.post("/download", response_model=DownloadStatus)
def start_download(request: DownloadRequest):
    download_id = str(uuid.uuid4())
    downloads[download_id] = {
        "status": "pending",
        "filepath": None,
        "progress": "0%",
        "start_time": time.time()
    }

    output_file = os.path.join(DOWNLOAD_DIR, f"{download_id}.%(ext)s")
    url = escape_url(request.url)
    start = request.start
    end_or_length = request.end_or_length if request.end_or_length else ""

    if request.type == "video_start_end":
        command = [
            "yt-dlp",
            f"--download-sections=*{start}-{end_or_length}",
            "-f", "bestvideo+bestaudio",
            url,
            "-o", output_file
        ]
    elif request.type == "video_start_length":
        command = [
            "yt-dlp",
            f"--download-sections=*{start}+{end_or_length}",
            "-f", "bestvideo+bestaudio",
            url,
            "-o", output_file
        ]
    elif request.type == "audio_start_end":
        command = [
            "yt-dlp",
            f"--download-sections=*{start}-{end_or_length}",
            "-f", "bestaudio",
            "--extract-audio",
            "--audio-format", "mp3",
            "--audio-quality", "0",
            url,
            "-o", output_file
        ]
    else:
        command = [
            "yt-dlp",
            f"--download-sections=*{start}+{end_or_length}",
            "-f", "bestaudio",
            "--extract-audio",
            "--audio-format", "mp3",
            "--audio-quality", "0",
            url,
            "-o", output_file
        ]

    def run_download():
        downloads[download_id]["status"] = "in_progress"
        try:
            process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True
            )
            for line in process.stdout:
                if "[download]" in line and "%" in line:
                    progress = line.split("%")[0].split()[-1] + "%"
                    downloads[download_id]["progress"] = progress
            process.wait()
            if process.returncode == 0:
                downloads[download_id]["status"] = "completed"
                downloads[download_id]["filepath"] = output_file.replace(
                    "%(ext)s",
                    "mp4" if "video" in request.type else "mp3"
                )
            else:
                downloads[download_id]["status"] = "error"
        except Exception as e:
            downloads[download_id]["status"] = "error"
            print(f"Error en descarga {download_id}: {e}")

    threading.Thread(target=run_download).start()

    return DownloadStatus(
        id=download_id,
        status="pending",
        progress="0%",
        filepath=None
    )

@app.get("/download/{download_id}", response_model=DownloadStatus)
def check_status(download_id: str, response: Response):
    if download_id not in downloads:
        raise HTTPException(status_code=404, detail="Download ID not found")

    download_info = downloads[download_id]

    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    if download_info["status"] == "completed":
        if time.time() - download_info["start_time"] > DOWNLOAD_EXPIRATION:
            filepath = download_info.get("filepath")
            if filepath and os.path.exists(filepath):
                os.remove(filepath)
            downloads.pop(download_id, None)
            raise HTTPException(status_code=404, detail="Download expired")

    return DownloadStatus(
        id=download_id,
        status=download_info["status"],
        progress=download_info.get("progress", "0%"),
        filepath=(
            download_info["filepath"]
            if download_info["status"] == "completed"
            else None
        )
    )

@app.get("/download/{download_id}/file")
def download_file(download_id: str):
    if download_id not in downloads:
        raise HTTPException(status_code=404, detail="Download ID not found")

    download_info = downloads[download_id]
    if download_info["status"] != "completed":
        raise HTTPException(status_code=400, detail="File not ready for download")

    filepath = find_file_by_id(download_id)
    if not filepath or not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")

    mime_type, _ = mimetypes.guess_type(filepath)
    if not mime_type:
        mime_type = "application/octet-stream"

    response = FileResponse(
        filepath,
        media_type=mime_type,
        filename=os.path.basename(filepath)
    )

    def remove_file():
        time.sleep(1)
        if os.path.exists(filepath):
            os.remove(filepath)

    threading.Thread(target=remove_file).start()

    downloads.pop(download_id, None)
    return response

def cleanup_expired_downloads():
    while True:
        time.sleep(60)
        now = time.time()
        expired_ids = [
            download_id for download_id, info in downloads.items()
            if info["status"] == "completed" and now - info["start_time"] > DOWNLOAD_EXPIRATION
        ]
        for download_id in expired_ids:
            filepath = downloads[download_id].get("filepath")
            if filepath and os.path.exists(filepath):
                os.remove(filepath)
            downloads.pop(download_id, None)

threading.Thread(target=cleanup_expired_downloads, daemon=True).start()
