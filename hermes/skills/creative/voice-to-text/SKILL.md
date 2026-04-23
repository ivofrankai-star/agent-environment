---
name: voice-to-text
description: Convert audio recordings to text using OpenAI Whisper. Local processing, no API key required.
version: 1.0.0
author: bbymama
license: MIT
dependencies: []
metadata:
  hermes:
    tags: [Audio, Speech, Transcription, STT, Voice, Whisper, ASR]
    related_skills: []
---

# Voice-to-Text with Whisper

Convert audio recordings to text using OpenAI Whisper (local, free, no API key).

---

## Quick Usage

### Transcribe an Audio File

```bash
# Download tiny model (39 MB) - fastest, lowest quality
whisper audio_file.mp3 --model tiny --language en

# Download base model (74 MB) - good balance
whisper audio_file.mp3 --model base --language en

# Download small model (244 MB) - better quality
whisper audio_file.mp3 --model small --language en
```

---

## Python Integration

```python
import subprocess
import os

def transcribe_audio(audio_path, model="base", language="en", output_format="txt"):
    """
    Transcribe audio file to text using Whisper
    
    Args:
        audio_path: Path to audio file (mp3, wav, m4a, ogg, etc.)
        model: Model size (tiny, base, small, medium, large-v3)
        language: Language code (en, de, fr, es, etc.)
        output_format: Output format (txt, srt, vtt, json, tsv)
    
    Returns:
        Transcribed text string
    """
    cmd = [
        "whisper",
        audio_path,
        "--model", model,
        "--language", language,
        "--output_format", output_format,
        "--output_dir", "/tmp"
    ]
    
    subprocess.run(cmd, check=True, capture_output=True)
    
    # Whisper saves output as {audio_name}.{format}
    base_name = os.path.splitext(os.path.basename(audio_path))[0]
    output_path = f"/tmp/{base_name}.{output_format}"
    
    with open(output_path, "r") as f:
        return f.read().strip()
```

---

## Audio Recording (Linux)

```bash
# Using arecord (ALSA)
arecord -d 5 -f cd -t wav /tmp/recording.wav

# Using ffmpeg
ffmpeg -f alsa -i default -t 5 -acodec pcm_s16le /tmp/recording.wav
```

---

## Model Comparison

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| tiny | 39 MB | Fastest | Okay | Quick tests |
| base | 74 MB | Fast | Good | Real-time capable |
| small | 244 MB | Medium | Better | Daily use |
| medium | 769 MB | Slower | Great | Accuracy priority |
| large-v3 | 2.9 GB | Slowest | Best | Maximum quality |

**Recommendation:** Start with `base` for most use cases.

---

## Supported Audio Formats

- MP3 (.mp3)
- WAV (.wav) - recommended
- FLAC (.flac)
- OGG (.ogg)
- M4A (.m4a)
- Many others via ffmpeg

---

## Platform Integration (Telegram, Discord, etc.)

Platforms handle audio recording. Just need to:

1. Save incoming voice message to file
2. Convert format if needed (via ffmpeg)
3. Run whisper
4. Return transcription

```python
def on_voice_message(audio_data):
    # Platform sends audio bytes
    audio_path = "/tmp/voice_msg.ogg"
    with open(audio_path, "wb") as f:
        f.write(audio_data)
    
    # Convert to wav (whisper prefers it)
    wav_path = "/tmp/voice_msg.wav"
    subprocess.run([
        "ffmpeg", "-i", audio_path, "-ar", "16000", wav_path
    ], check=True, capture_output=True)
    
    # Transcribe
    return transcribe_audio(wav_path, model="base")
```

---

## Current Status

✓ Whisper installed  
✓ ffmpeg available  
✓ arecord available  
✓ Local processing (no API keys)  
✓ 99 languages supported  

---

created: 2026-04-18
