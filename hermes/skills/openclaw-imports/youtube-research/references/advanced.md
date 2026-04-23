# YouTube Research - Advanced Usage

## Table of Contents

1. [Search Strategies](#search-strategies)
2. [Transcript Processing](#transcript-processing)
3. [Summarization Patterns](#summarization-patterns)
4. [Common Workflows](#common-workflows)

---

## Search Strategies

### Relevance vs Recency

```bash
# Best results (default)
python youtube_search.py --search "python async await" --order relevance

# Most recent videos
python youtube_search.py --search "python async await" --order date

# Most viewed
python youtube_search.py --search "python async await" --order viewCount
```

### Search Query Tips

- Use specific technical terms for better results
- Include version numbers for frameworks (e.g., "Next.js 14")
- Add "tutorial" or "course" for educational content
- Add "review" or "comparison" for analysis

### Extracting Video ID from URLs

The script handles these formats automatically:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `VIDEO_ID` (direct ID)

---

## Transcript Processing

### Timestamp-based Navigation

Transcripts include segment data with timestamps:

```json
{
  "segments": [
    {"start": 0.0, "duration": 5.2, "text": "Welcome to this video"},
    {"start": 5.2, "duration": 3.8, "text": "about Python async"}
  ]
}
```

### Language Support

```bash
# English (default)
python youtube_search.py --video VIDEO_ID --transcript --lang en

# Spanish
python youtube_search.py --video VIDEO_ID --transcript --lang es

# Auto-generated captions only work for languages YouTube supports
```

### When Transcript Fails

If the built-in method fails, use yt-dlp:

```bash
yt-dlp --write-auto-sub --sub-lang en --skip-download "https://youtube.com/watch?v=VIDEO_ID"
```

---

## Summarization Patterns

### For AI Summarization

After getting transcript, ask Codex to:

1. **Quick Summary (2-3 sentences)**
   - Ask: "Summarize the key points in 2-3 sentences"
   
2. **Detailed Summary**
   - Ask: "Create a detailed summary with main sections and bullet points"
   
3. **Key Takeaways**
   - Ask: "Extract 5 key takeaways from this transcript"
   
4. **Action Items**
   - Ask: "What action items or next steps does this video suggest?"

### Handling Long Transcripts

For videos >30 minutes:
- Transcript may be 5000+ words
- Ask for section-by-section analysis
- Use timestamps to navigate

---

## Common Workflows

### 1. Research a Topic

```
User: "What are the latest videos on Python 3.12 features?"

1. Search: --search "Python 3.12 new features" --order date --max 10
2. Present top results with brief summaries
3. User selects video
4. Get transcript and summarize
```

### 2. Deep Dive into One Video

```
User: "Summarize this video: https://youtube.com/watch?v=xxx"

1. Get details: --video xxx --details
2. Get transcript: --video xxx --transcript
3. Summarize key points
4. Offer to expand on specific sections
```

### 3. Compare Multiple Videos

```
User: "Compare the top 3 tutorials on React hooks"

1. Search: --search "React hooks tutorial" --max 3
2. Get details for each
3. Get transcripts for each
4. Provide comparative analysis
```

### 4. Extract Specific Information

```
User: "What does this video say about error handling?"

1. Get transcript
2. Search transcript for relevant sections
3. Quote relevant parts with timestamps
```

---

## Rate Limits

YouTube Data API v3 has quotas:
- 10,000 units per day (default)
- Search = 100 units
- Video details = 1 unit
- Transcript fetch = 0 units (not via API)

Monitor usage at: https://console.cloud.google.com/apis/api/youtube.googleapis.com

---

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `Video not found` | Invalid ID or deleted | Check URL |
| `Could not fetch transcript` | No captions available | Try yt-dlp |
| `Quota exceeded` | API limit reached | Wait 24h or request increase |
| `API key not found` | Missing YOUTUBE_KEY | Add to .env |
