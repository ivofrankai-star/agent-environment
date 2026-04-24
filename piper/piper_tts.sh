#!/bin/bash
# Piper TTS wrapper for Hermes
# Usage: echo "text" | piper_tts.sh [output_path]
# Output: ogg file path (for Telegram voice messages)

MODEL="/home/user/piper/voices/en_US-kusal-medium.onnx"
PIPER_DIR="/home/user/piper"
export LD_LIBRARY_PATH="$PIPER_DIR/piper:$LD_LIBRARY_PATH"

OUTPUT="${1:-/tmp/piper_tts_output.wav}"

# Read input text from stdin
TEXT=$(cat)

if [ -z "$TEXT" ]; then
    echo "Error: No text provided" >&2
    exit 1
fi

# Generate WAV with Piper
echo "$TEXT" | "$PIPER_DIR/piper/piper" --model "$MODEL" --output_file "$OUTPUT" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "Error: Piper generation failed" >&2
    exit 1
fi

# Convert to OGG for Telegram
OGG_OUTPUT="${OUTPUT%.wav}.ogg"
ffmpeg -i "$OUTPUT" -c:a libopus -b:a 48k "$OGG_OUTPUT" -y -loglevel quiet 2>/dev/null

# Output the ogg path
echo "$OGG_OUTPUT"
