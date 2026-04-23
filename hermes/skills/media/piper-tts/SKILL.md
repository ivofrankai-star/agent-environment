---
name: piper-tts
description: Local text-to-speech using Piper — fast, offline, many voices. Generate voice messages for Telegram.
version: 1.0
tags: [tts, piper, voice, audio, local, offline]
---

# Piper TTS — Local Text-to-Speech

## Overview
Piper is a fast, local neural TTS engine with many voice options. Runs fully offline, generates audio in real-time (0.05-0.34x real-time factor).

## Installation
Binary lives at: `~/piper/piper/piper`
Voice models at: `~/piper/voices/`
Already installed on this system as of 2026-04-19.

If reinstalling needed, download from Piper GitHub releases (2023.11.14-2 for Linux x86_64).

## Voice Models
Voice repo on HuggingFace: `rhasspy/piper-voices`
URL pattern: `https://huggingface.co/rhasspy/piper-voices/resolve/main/{lang_path}/{quality}/`

### Available EN voices (as of 2026-04):
**US:** amy, arctic, bryce, danny, hfc_female, hfc_male, joe, john, kathleen, kristin, kusal, l2arctic, lessac, libritts, libritts_r, ljspeech, norman, reza_ibrahim, ryan, sam
**GB:** alan, alba, aru, cori, jenny_dioco, northern_english_male, semaine, southern_english_female, vctk

### Quality levels: `low`, `medium`, `high`
- Higher quality = bigger model, slower inference, better sound
- Not all voices have all quality levels (e.g., danny only has `low`)
- Check file size after download — 15 bytes means the model doesn't exist at that quality

### Already downloaded voices (in ~/piper/voices/):
- en_US-lessac-medium.onnx
- en_GB-alan-medium.onnx
- en_US-joe-medium.onnx
- en_US-ryan-medium.onnx
- en_US-ryan-high.onnx
- en_US-danny-low.onnx
- en_US-john-medium.onnx
- en_US-norman-medium.onnx
- en_US-hfc_male-medium.onnx

### Ivek's preference: **Ryan** (clear, commanding vibe — Jarvis/Ultron aesthetic)

## Running Piper
```bash
cd ~/piper
export LD_LIBRARY_PATH=./piper:$LD_LIBRARY_PATH
echo "Your text here" | ./piper/piper --model ./voices/MODEL.onnx --output_file output.wav
```

### Pitfall: Don't assign LD_LIBRARY_PATH inline in a bash variable
This fails: `PIPER_CMD="LD_LIBRARY_PATH=./piper ./piper/piper"` then `$PIPER_CMD`
Instead: `export LD_LIBRARY_PATH=./piper:$LD_LIBRARY_PATH` then call directly.

## Converting for Telegram (ogg/opus):
```bash
ffmpeg -i output.wav -c:a libopus -b:a 48k output.ogg -y
```

## Full pipeline (text to ogg voice message):
```bash
cd ~/piper && export LD_LIBRARY_PATH=./piper:$LD_LIBRARY_PATH
echo "Hello world" | ./piper/piper --model ./voices/en_US-ryan-high.onnx --output_file /tmp/tts.wav && \
ffmpeg -i /tmp/tts.wav -c:a libopus -b:a 48k /tmp/tts.ogg -y
```
Then send: `MEDIA:/tmp/tts.ogg`

## Browsing available voices
Use the HuggingFace API to list voices under a language path. The tree endpoint returns JSON with path entries for each voice name.
