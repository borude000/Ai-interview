from fastapi import FastAPI, Request, UploadFile, File
from fastapi.responses import JSONResponse
from faster_whisper import WhisperModel
import tempfile
import os
import uvicorn

# Environment
MODEL_NAME = os.environ.get("WHISPER_MODEL", "base.en")  # tiny.en, base.en, small.en, medium.en
COMPUTE_TYPE = os.environ.get("WHISPER_COMPUTE", "int8")  # int8/int8_float16/float16

app = FastAPI()

# Load model once on startup
model = WhisperModel(MODEL_NAME, compute_type=COMPUTE_TYPE)

@app.post("/transcribe")
async def transcribe(request: Request):
    # Accept either raw octet-stream (preferred by Node proxy) or multipart file upload
    content_type = request.headers.get("content-type", "")
    ext = request.headers.get("x-audio-ext", "webm")
    lang_hdr = request.headers.get("x-lang")
    lang = None

    try:
        if content_type.startswith("application/octet-stream"):
            data = await request.body()
        else:
            # multipart
            form = await request.form()
            file = form.get("audio")
            # optional language from form
            lang_form = form.get("lang")
            if isinstance(lang_form, str) and lang_form:
                lang = lang_form
            if isinstance(file, UploadFile):
                data = await file.read()
                if file.filename and "." in file.filename:
                    ext = file.filename.split(".")[-1].lower()
            else:
                return JSONResponse({"text": ""})

        # Write to temp file with the correct extension for ffmpeg decode
        with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as tmp:
            tmp.write(data)
            tmp_path = tmp.name

        # Transcribe
        # Prefer explicit language if provided
        if lang is None and lang_hdr:
            lang = lang_hdr
        segments, info = model.transcribe(
            tmp_path,
            language=lang,              # hint language like 'en', 'hi', etc.
            beam_size=5,                # improve accuracy
            vad_filter=True,            # trim non-speech
            vad_parameters={"min_silence_duration_ms": 400},
            no_speech_threshold=0.5,
        )
        text = " ".join(seg.text.strip() for seg in segments).strip()
        os.unlink(tmp_path)
        return JSONResponse({"text": text})
    except Exception as e:
        return JSONResponse({"text": "", "error": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5001)
