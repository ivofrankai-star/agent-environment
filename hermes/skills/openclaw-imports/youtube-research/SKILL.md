---
name: youtube-research
description: Search YouTube videos, extract transcripts, and analyze content using YouTube Data API v3. Use when the user asks to (1) search for YouTube videos on any topic, (2) get recent/popular videos about a subject, (3) transcribe or extract captions from videos, (4) get technical details (duration, views, resolution, etc.), (5) summarize video content, or (6) compare multiple videos. Works with video URLs or search queries.
---

# YouTube Research

Search, transcribe, and analyze YouTube content.

## Quick Start

```bash
# Search for videos
python scripts/youtube_search.py --search "python async" --max 5

# Get video details
python scripts/youtube_search.py --video VIDEO_ID --details

# Get transcript (from captions)
python scripts/youtube_search.py --video VIDEO_ID --transcript

# Transcribe audio offline (Vosk)
python scripts/youtube_search.py --video VIDEO_ID --transcribe-offline

# Full analysis (details + transcript)
python scripts/youtube_search.py --video VIDEO_ID --full
```

## Requirements

- `YOUTUBE_KEY` in `~/.openclaw/.env` (YouTube Data API v3 key)
- Python 3.6+ (standard library only for basic usage)
- `yt-dlp` for reliable caption extraction (bundled in the skill's `scripts/` folder)
- `vosk` for optional offline audio transcription (install via `pip install vosk` and download a model)

**Install yt-dlp (if needed):**
The skill includes a bundled copy of yt-dlp in `scripts/yt-dlp`. 
If you prefer to use a system-wide installation, you can install via:
```bash
# Option 1: pip (recommended)
pip install yt-dlp

# Option 2: apt (Linux)
sudo apt install yt-dlp

# Option 3: Download binary (any OS)
# See: https://github.com/yt-dlp/yt-dlp#installation
```

**Install Vosk (for offline transcription):**
```bash
pip install vosk
# Download a model, e.g., small English model:
mkdir -p skills/youtube-research/vosk_models
cd skills/youtube-research/vosk_models
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip
```
You can also point to an existing model via the `VOSK_MODEL_PATH` environment variable.

**Note:** Search and video details work without yt-dlp. Caption-based transcript extraction uses the bundled yt-dlp if available, otherwise falls back to system yt-dlp. Offline transcription requires Vosk and a model.

## Core Workflows

### 1. Search Videos

```bash
# By relevance (default)
python scripts/youtube_search.py --search "machine learning" --max 10

# Most recent first
python scripts/youtube_search.py --search "machine learning" --order date

# Most viewed
python scripts/youtube_search.py --search "machine learning" --order viewCount
```

Output includes: title, URL, channel, publish date, description preview.

### 2. Get Video Details

```bash
python scripts/youtube_search.py --video VIDEO_ID --details
```

Returns: title, description, duration, view count, likes, comments, resolution, caption availability, tags.

### 3. Get Transcript

```bash
python scripts/youtube_search.py --video VIDEO_ID --transcript
python scripts/youtube_search.py --video VIDEO_ID --transcript --lang es  # Spanish
```

Returns: full transcript text, timestamped segments, word count.

### 4. Summarize Content

After getting transcript, use the AI to summarize:

```
User: "Summarize the key points from this transcript"
User: "What are the 5 main takeaways?"
User: "Explain the section starting at 5:30"
```

## Common Patterns

### "What are the recent videos on X?"

1. Search with `--order date`
2. Present top 5 results briefly
3. Ask if user wants details/transcript on any

### "Summarize this video: URL"

1. Extract video ID from URL
2. Get details (for context)
3. Get transcript
4. Summarize key points
5. Offer to expand on sections

### "Compare the top 3 videos about X"

1. Search with `--max 3`
2. Get details for each
3. Get transcripts for each
4. Provide comparative analysis

### "What does this video say about Y?"

1. Get transcript
2. Search transcript for relevant keywords
3. Quote relevant sections with timestamps

## Video ID Extraction

The script handles these formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- Direct `VIDEO_ID`

## Output Formats

```bash
# Human-readable (default)
python scripts/youtube_search.py --search "topic" --max 5

# JSON for processing
python scripts/youtube_search.py --search "topic" --json

# Brief (one line per video)
python scripts/youtube_search.py --search "topic" --brief
```

## Limitations

- Transcript extraction depends on YouTube's caption availability
- Auto-generated captions may have errors
- Some videos have no captions available

### Fallback: yt-dlp

When transcript extraction fails:

```bash
yt-dlp --write-auto-sub --sub-lang en --skip-download "URL"
```

## Advanced Usage

See [references/advanced.md](references/advanced.md) for:
- Search query optimization
- Timestamp-based navigation
- Summarization patterns
- Rate limits and error handling
