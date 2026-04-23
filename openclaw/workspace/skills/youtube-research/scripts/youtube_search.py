#!/usr/bin/env python3
"""YouTube Research - Search, transcribe, and analyze YouTube videos.

Requires: YOUTUBE_KEY in environment or .env file
Install: pip install requests

Usage:
    python youtube_search.py --search "python async" --max 5
    python youtube_search.py --video VIDEO_ID --details
    python youtube_search.py --video VIDEO_ID --transcript
    python youtube_search.py --video VIDEO_ID --full
"""

import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.parse
from typing import Optional


def get_api_key() -> str:
    """Get YouTube API key from environment or .env file."""
    # Try environment first
    key = os.environ.get("YOUTUBE_KEY")
    if key:
        return key
    
    # Try .env file in workspace
    env_paths = [
        os.path.expanduser("~/.openclaw/workspace/.env"),
        ".env",
        os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
    ]
    
    for env_path in env_paths:
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("YOUTUBE_KEY="):
                        return line.split("=", 1)[1].strip()
    
    raise ValueError("YOUTUBE_KEY not found. Set YOUTUBE_KEY env var or add to .env file.")


def youtube_api_request(endpoint: str, params: dict) -> dict:
    """Make a YouTube Data API v3 request."""
    base_url = f"https://www.googleapis.com/youtube/v3/{endpoint}"
    params["key"] = get_api_key()
    
    query_string = urllib.parse.urlencode(params)
    url = f"{base_url}?{query_string}"
    
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode("utf-8"))


def search_videos(query: str, max_results: int = 5, order: str = "relevance") -> list:
    """Search YouTube videos by query.
    
    Args:
        query: Search query string
        max_results: Maximum number of results (1-50)
        order: Order by 'relevance', 'date', 'rating', 'viewCount'
    
    Returns:
        List of video dicts with id, title, description, channel, publishedAt, thumbnails
    """
    response = youtube_api_request("search", {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "order": order,
        "videoDefinition": "any",
    })
    
    videos = []
    for item in response.get("items", []):
        video = {
            "id": item["id"]["videoId"],
            "title": item["snippet"]["title"],
            "description": item["snippet"]["description"],
            "channel": item["snippet"]["channelTitle"],
            "channelId": item["snippet"]["channelId"],
            "publishedAt": item["snippet"]["publishedAt"],
            "thumbnails": item["snippet"]["thumbnails"],
            "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
        }
        videos.append(video)
    
    return videos


def get_video_details(video_id: str) -> dict:
    """Get detailed information about a video.
    
    Args:
        video_id: YouTube video ID
    
    Returns:
        Video details including statistics, contentDetails, and snippet
    """
    response = youtube_api_request("videos", {
        "part": "snippet,contentDetails,statistics",
        "id": video_id,
    })
    
    items = response.get("items", [])
    if not items:
        return {"error": f"Video not found: {video_id}"}
    
    item = items[0]
    snippet = item.get("snippet", {})
    content = item.get("contentDetails", {})
    stats = item.get("statistics", {})
    
    # Parse duration from ISO 8601 format
    duration_raw = content.get("duration", "PT0S")
    duration = parse_duration(duration_raw)
    
    return {
        "id": video_id,
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "title": snippet.get("title"),
        "description": snippet.get("description"),
        "channel": snippet.get("channelTitle"),
        "channelId": snippet.get("channelId"),
        "publishedAt": snippet.get("publishedAt"),
        "tags": snippet.get("tags", []),
        "categoryId": snippet.get("categoryId"),
        "thumbnails": snippet.get("thumbnails", {}),
        # Content details
        "duration": duration,
        "durationSeconds": duration_to_seconds(duration_raw),
        "dimension": content.get("dimension"),  # 2d or 3d
        "definition": content.get("definition"),  # sd, hd
        "caption": content.get("caption") == "true",  # has captions
        "licensedContent": content.get("licensedContent", False),
        "projection": content.get("projection"),  # rectangular or 360
        # Statistics
        "viewCount": int(stats.get("viewCount", 0)),
        "likeCount": int(stats.get("likeCount", 0)),
        "commentCount": int(stats.get("commentCount", 0)),
        "favoriteCount": int(stats.get("favoriteCount", 0)),
    }


def parse_duration(duration: str) -> str:
    """Parse ISO 8601 duration to human readable format."""
    # PT1H2M3S -> 1:02:03
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
    if not match:
        return "0:00"
    
    hours, minutes, seconds = match.groups()
    hours = int(hours) if hours else 0
    minutes = int(minutes) if minutes else 0
    seconds = int(seconds) if seconds else 0
    
    if hours:
        return f"{hours}:{minutes:02d}:{seconds:02d}"
    return f"{minutes}:{seconds:02d}"


def duration_to_seconds(duration: str) -> int:
    """Convert ISO 8601 duration to seconds."""
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
    if not match:
        return 0
    
    hours, minutes, seconds = match.groups()
    total = 0
    if hours:
        total += int(hours) * 3600
    if minutes:
        total += int(minutes) * 60
    if seconds:
        total += int(seconds)
    return total


def get_transcript(video_id: str, lang: str = "en") -> dict:
    """Fetch video transcript/captions.
    
    This extracts auto-generated or manual captions from YouTube.
    Uses yt-dlp if available for more reliable extraction.
    
    Args:
        video_id: YouTube video ID
        lang: Language code (default: en)
    
    Returns:
        Dict with transcript text, segments, and metadata
    """
    details = get_video_details(video_id)
    has_captions = details.get("caption", False)
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    
    transcript_text = ""
    segments = []
    
    # Method 1: Try yt-dlp (most reliable)
    try:
        import subprocess
        import tempfile
        
        # Prefer bundled yt-dlp in scripts folder
        script_dir = os.path.dirname(os.path.abspath(__file__))
        bundled_yt_dlp = os.path.join(script_dir, "yt-dlp")
        yt_dlp_cmd = "yt-dlp"
        if os.path.isfile(bundled_yt_dlp) and os.access(bundled_yt_dlp, os.X_OK):
            yt_dlp_cmd = bundled_yt_dlp
        
        # Check if yt-dlp is available
        result = subprocess.run(["which", yt_dlp_cmd.split()[0]], capture_output=True)
        if result.returncode == 0:
            with tempfile.TemporaryDirectory() as tmpdir:
                cmd = [
                    yt_dlp_cmd,
                    "--write-auto-sub",
                    "--sub-lang", lang,
                    "--skip-download",
                    "--sub-format", "vtt",
                    "-o", os.path.join(tmpdir, "video"),
                    video_url
                ]
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
                
                # Find the .vtt file
                for fname in os.listdir(tmpdir):
                    if fname.endswith(".vtt"):
                        vtt_path = os.path.join(tmpdir, fname)
                        transcript_text, segments = parse_vtt(vtt_path)
                        break
                
                if transcript_text:
                    return {
                        "video_id": video_id,
                        "url": video_url,
                        "title": details.get("title"),
                        "duration": details.get("duration"),
                        "channel": details.get("channel"),
                        "has_captions": has_captions,
                        "language": lang,
                        "transcript": transcript_text,
                        "segments": segments,
                        "word_count": len(transcript_text.split()),
                        "method": "yt-dlp",
                    }
    except Exception:
        pass  # Fall through to direct API method
    
    # Method 2: Direct timedtext API (less reliable)
    try:
        timedtext_url = "https://www.youtube.com/api/timedtext"
        
        # Try multiple variations
        urls_to_try = [
            f"{timedtext_url}?v={video_id}&lang={lang}",
            f"{timedtext_url}?v={video_id}&lang={lang}&kind=asr",
            f"{timedtext_url}?v={video_id}&lang={lang}&kind=&fmt=srv3",
        ]
        
        for url in urls_to_try:
            try:
                with urllib.request.urlopen(url, timeout=10) as response:
                    xml_content = response.read().decode("utf-8")
                    if xml_content and len(xml_content) > 100:
                        transcript_text, segments = parse_timedtext_xml(xml_content)
                        if transcript_text:
                            break
            except Exception:
                continue
                
    except Exception as e:
        pass
    
    if transcript_text:
        return {
            "video_id": video_id,
            "url": video_url,
            "title": details.get("title"),
            "duration": details.get("duration"),
            "channel": details.get("channel"),
            "has_captions": has_captions,
            "language": lang,
            "transcript": transcript_text,
            "segments": segments,
            "word_count": len(transcript_text.split()),
            "method": "timedtext_api",
        }
    
    # No transcript available
    return {
        "error": "Could not fetch transcript. The video may not have captions available.",
        "video_id": video_id,
        "url": video_url,
        "title": details.get("title"),
        "has_captions": has_captions,
        "suggestion": "Install yt-dlp for better transcript extraction: pip install yt-dlp",
    }


def transcribe_audio_with_vosk(video_id: str, lang: str = "en") -> dict:
    """Transcribe video audio using offline Vosk model.
    
    Steps:
    1. Download audio-only using yt-dlp
    2. Load Vosk model (small English model by default)
    3. Perform speech recognition and return transcript with segments
    
    Args:
        video_id: YouTube video ID
        lang: Language code (default: en) - used to select model
    
    Returns:
        Dict with transcript text, segments, and metadata
    """
    details = get_video_details(video_id)
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    
    # Check if vosk is available
    try:
        import vosk
        import wave
        import json
    except ImportError:
        return {
            "error": "Vosk not installed. Install with: pip install vosk",
            "video_id": video_id,
            "url": video_url,
            "title": details.get("title"),
            "suggestion": "Install vosk and download a model: https://alphacephei.com/vosk/models",
        }
    
    # Determine model path
    # Default to a small English model in the skill's vosk_models directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(script_dir, "vosk_models")
    model_name = "vosk-model-small-en-us-0.15"
    model_path = os.path.join(model_dir, model_name)
    
    # Allow override via environment variable
    env_model_path = os.environ.get("VOSK_MODEL_PATH")
    if env_model_path and os.path.isdir(env_model_path):
        model_path = env_model_path
    
    if not os.path.isdir(model_path):
        return {
            "error": f"Vosk model not found at {model_path}. Please download a model and set VOSK_MODEL_PATH or place it in {model_dir}",
            "video_id": video_id,
            "url": video_url,
            "title": details.get("title"),
            "suggestion": f"Download model from https://alphacephei.com/vosk/models and extract to {model_dir}",
        }
    
    # Download audio using yt-dlp
    try:
        import subprocess
        import tempfile
        
        # Prefer bundled yt-dlp
        bundled_yt_dlp = os.path.join(script_dir, "yt-dlp")
        yt_dlp_cmd = "yt-dlp"
        if os.path.isfile(bundled_yt_dlp) and os.access(bundled_yt_dlp, os.X_OK):
            yt_dlp_cmd = bundled_yt_dlp
        
        with tempfile.TemporaryDirectory() as tmpdir:
            audio_file = os.path.join(tmpdir, "audio.wav")
            cmd = [
                yt_dlp_cmd,
                "-x",  # extract audio
                "--audio-format", "wav",
                "--audio-quality", "0",  # best
                "-o", audio_file,
                video_url
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            if result.returncode != 0:
                return {
                    "error": f"Failed to download audio: {result.stderr}",
                    "video_id": video_id,
                    "url": video_url,
                    "title": details.get("title"),
                }
            # Convert to mono 16k PCM wav using ffmpeg
            converted_file = os.path.join(tmpdir, "audio_mono.wav")
            convert_cmd = [
                "ffmpeg",
                "-y",
                "-i", audio_file,
                "-ac", "1",
                "-ar", "16000",
                converted_file
            ]
            convert_result = subprocess.run(convert_cmd, capture_output=True, text=True, timeout=60)
            if convert_result.returncode != 0:
                return {
                    "error": f"Failed to convert audio: {convert_result.stderr}",
                    "video_id": video_id,
                    "url": video_url,
                    "title": details.get("title"),
                }
            audio_file = converted_file
            
            # Load Vosk model
            model = vosk.Model(model_path)
            
            # Open audio file
            wf = wave.open(audio_file, "rb")
            if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getcomptype() != "NONE":
                return {
                    "error": "Audio file must be WAV format mono PCM.",
                    "video_id": video_id,
                    "url": video_url,
                    "title": details.get("title"),
                }
            
            recognizer = vosk.KaldiRecognizer(model, wf.getframerate())
            recognizer.SetWords(True)
            
            # Process audio in chunks
            results = []
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                if recognizer.AcceptWaveform(data):
                    part_result = json.loads(recognizer.Result())
                    results.append(part_result)
            # Get final result
            part_result = json.loads(recognizer.FinalResult())
            results.append(part_result)
            
            # Build transcript and segments
            transcript_text = ""
            segments = []
            for res in results:
                if "text" in res and res["text"].strip():
                    transcript_text += res["text"] + " "
                if "result" in res:
                    for word in res["result"]:
                        segments.append({
                            "start": word.get("start", 0),
                            "end": word.get("end", 0),
                            "word": word.get("word", ""),
                            "confidence": word.get("conf", 0),
                        })
            
            wf.close()
            
            return {
                "video_id": video_id,
                "url": video_url,
                "title": details.get("title"),
                "duration": details.get("duration"),
                "channel": details.get("channel"),
                "has_captions": details.get("caption", False),
                "language": lang,
                "transcript": transcript_text.strip(),
                "segments": segments,
                "word_count": len(transcript_text.split()),
                "method": "vosk_offline",
            }
    except Exception as e:
        return {
            "error": f"Vosk transcription failed: {str(e)}",
            "video_id": video_id,
            "url": video_url,
            "title": details.get("title"),
        }


def parse_timedtext_xml(xml_content: str) -> tuple:
    """Parse YouTube's timedtext XML format."""
    import xml.etree.ElementTree as ET
    
    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError:
        return "", []
    
    segments = []
    text_parts = []
    
    for child in root:
        if child.tag == "text" or child.tag.endswith("}text"):
            start = float(child.get("start", 0))
            duration = float(child.get("dur", 0))
            text = child.text or ""
            text = text.strip().replace("\n", " ")
            
            if text:
                segments.append({
                    "start": start,
                    "duration": duration,
                    "text": text,
                })
                text_parts.append(text)
    
    return " ".join(text_parts), segments


def parse_vtt(vtt_path: str) -> tuple:
    """Parse WebVTT subtitle file."""
    segments = []
    text_parts = []
    
    with open(vtt_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # VTT format:
    # 00:00:00.000 --> 00:00:05.000
    # Text content here
    
    lines = content.split("\n")
    i = 0
    current_start = 0
    current_text = []
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Look for timestamp lines
        if "-->" in line:
            # Parse start time
            start_match = re.match(r"(\d+):(\d+):(\d+)\.(\d+)", line)
            if start_match:
                h, m, s, ms = map(int, start_match.groups())
                current_start = h * 3600 + m * 60 + s + ms / 1000
            else:
                # Try MM:SS.mmm format
                start_match = re.match(r"(\d+):(\d+)\.(\d+)", line)
                if start_match:
                    m, s, ms = map(int, start_match.groups())
                    current_start = m * 60 + s + ms / 1000
            
            # Get text lines following timestamp
            i += 1
            current_text = []
            while i < len(lines) and lines[i].strip() and "-->" not in lines[i]:
                text_line = lines[i].strip()
                # Remove VTT formatting tags
                text_line = re.sub(r"<[^>]+>", "", text_line)
                if text_line:
                    current_text.append(text_line)
                i += 1
            
            if current_text:
                text = " ".join(current_text)
                segments.append({
                    "start": current_start,
                    "duration": 0,
                    "text": text,
                })
                text_parts.append(text)
        else:
            i += 1
    
    # Merge consecutive short segments
    merged_text = []
    for seg in segments:
        merged_text.append(seg["text"])
    
    return " ".join(merged_text), segments


def get_channel_videos(channel_id: str, max_results: int = 10) -> list:
    """Get recent videos from a channel.
    
    Args:
        channel_id: YouTube channel ID
        max_results: Maximum number of results
    
    Returns:
        List of video dicts
    """
    # First get the uploads playlist ID
    channel_response = youtube_api_request("channels", {
        "part": "contentDetails",
        "id": channel_id,
    })
    
    items = channel_response.get("items", [])
    if not items:
        return []
    
    uploads_playlist_id = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]
    
    # Get videos from uploads playlist
    playlist_response = youtube_api_request("playlistItems", {
        "part": "snippet,contentDetails",
        "playlistId": uploads_playlist_id,
        "maxResults": max_results,
    })
    
    videos = []
    for item in playlist_response.get("items", []):
        video = {
            "id": item["contentDetails"]["videoId"],
            "title": item["snippet"]["title"],
            "description": item["snippet"].get("description", ""),
            "publishedAt": item["snippet"]["publishedAt"],
            "url": f"https://www.youtube.com/watch?v={item['contentDetails']['videoId']}",
        }
        videos.append(video)
    
    return videos


def format_search_results(videos: list, brief: bool = False) -> str:
    """Format search results as readable text."""
    lines = []
    
    for i, v in enumerate(videos, 1):
        if brief:
            lines.append(f"{i}. **{v['title']}**\n   {v['url']}\n   by {v['channel']}")
        else:
            lines.append(f"## {i}. {v['title']}")
            lines.append(f"**URL:** {v['url']}")
            lines.append(f"**Channel:** {v['channel']}")
            lines.append(f"**Published:** {v['publishedAt'][:10]}")
            if v.get('description'):
                desc = v['description'][:200] + "..." if len(v['description']) > 200 else v['description']
                lines.append(f"**Description:** {desc}")
            lines.append("")
    
    return "\n".join(lines)


def format_video_details(details: dict) -> str:
    """Format video details as readable text."""
    lines = [
        f"# {details['title']}",
        f"**URL:** {details['url']}",
        f"**Channel:** {details['channel']}",
        f"**Published:** {details['publishedAt'][:10]}",
        f"**Duration:** {details['duration']}",
        "",
        "## Statistics",
        f"- Views: {details['viewCount']:,}",
        f"- Likes: {details['likeCount']:,}",
        f"- Comments: {details['commentCount']:,}",
        "",
        "## Technical Details",
        f"- Definition: {details['definition'].upper()}",
        f"- Dimension: {details['dimension']}",
        f"- Projection: {details['projection']}",
        f"- Has Captions: {'Yes' if details['caption'] else 'No'}",
        f"- Licensed Content: {'Yes' if details['licensedContent'] else 'No'}",
    ]
    
    if details.get('tags'):
        lines.append(f"\n**Tags:** {', '.join(details['tags'][:10])}")
    
    if details.get('description'):
        lines.append(f"\n## Description\n{details['description']}")
    
    return "\n".join(lines)


def format_transcript(transcript: dict) -> str:
    """Format transcript as readable text."""
    if "error" in transcript:
        return f"**Error:** {transcript['error']}\n\n{transcript.get('suggestion', '')}"
    
    lines = [
        f"# Transcript: {transcript['title']}",
        f"**Video:** {transcript['url']}",
        f"**Duration:** {transcript['duration']}",
        f"**Word Count:** {transcript['word_count']:,}",
        "",
        "---",
        transcript['transcript'],
    ]
    
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="YouTube Research - Search, transcribe, and analyze YouTube videos",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Search for videos:
    python youtube_search.py --search "python async" --max 5
    python youtube_search.py --search "machine learning" --order date --max 10
  
  Get video details:
    python youtube_search.py --video dQw4w9WgXcQ --details
  
  Get transcript:
    python youtube_search.py --video dQw4w9WgXcQ --transcript
  
  Full analysis:
    python youtube_search.py --video dQw4w9WgXcQ --full
        """
    )
    
    # Search options
    parser.add_argument("--search", "-s", help="Search query")
    parser.add_argument("--max", "-m", type=int, default=5, help="Max results (default: 5)")
    parser.add_argument("--order", "-o", default="relevance", 
                        choices=["relevance", "date", "rating", "viewCount"],
                        help="Sort order")
    
    # Video options
    parser.add_argument("--video", "-v", help="Video ID or URL")
    parser.add_argument("--details", "-d", action="store_true", help="Get video details")
    parser.add_argument("--transcript", "-t", action="store_true", help="Get transcript (via captions)")
    parser.add_argument("--transcribe-offline", action="store_true", help="Transcribe audio using offline Vosk model")
    parser.add_argument("--full", "-f", action="store_true", help="Get full analysis (details + transcript)")
    parser.add_argument("--lang", "-l", default="en", help="Transcript language (default: en)")
    
    # Output options
    parser.add_argument("--json", "-j", action="store_true", help="Output as JSON")
    parser.add_argument("--brief", "-b", action="store_true", help="Brief output format")
    
    args = parser.parse_args()
    
    try:
        # Extract video ID from URL if needed
        if args.video:
            if "youtube.com" in args.video or "youtu.be" in args.video:
                # Extract ID from URL
                if "v=" in args.video:
                    args.video = args.video.split("v=")[1].split("&")[0]
                elif "youtu.be/" in args.video:
                    args.video = args.video.split("youtu.be/")[1].split("?")[0]
        
        if args.search:
            videos = search_videos(args.search, args.max, args.order)
            if args.json:
                print(json.dumps(videos, indent=2))
            else:
                print(format_search_results(videos, brief=args.brief))
        
        elif args.video:
            if args.full:
                details = get_video_details(args.video)
                transcript = get_transcript(args.video, args.lang)
                
                if args.json:
                    output = {"details": details, "transcript": transcript}
                    print(json.dumps(output, indent=2))
                else:
                    print(format_video_details(details))
                    print("\n" + "="*50 + "\n")
                    print(format_transcript(transcript))
            
            elif args.details:
                details = get_video_details(args.video)
                if args.json:
                    print(json.dumps(details, indent=2))
                else:
                    print(format_video_details(details))
            
            elif args.transcript:
                transcript = get_transcript(args.video, args.lang)
                if args.json:
                    print(json.dumps(transcript, indent=2))
                else:
                    print(format_transcript(transcript))
            
            elif args.transcribe_offline:
                transcript = transcribe_audio_with_vosk(args.video, args.lang)
                if args.json:
                    print(json.dumps(transcript, indent=2))
                else:
                    # Reuse format_transcript for Vosk output (same structure)
                    print(format_transcript(transcript))
            
            else:
                # Default to details if video specified but no action
                details = get_video_details(args.video)
                if args.json:
                    print(json.dumps(details, indent=2))
                else:
                    print(format_video_details(details))
        
        else:
            parser.print_help()
            
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
