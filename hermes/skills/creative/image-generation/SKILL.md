---
name: image-generation
description: Generate AI images via CLI using Pollinations.ai - completely free, no API key required. Works with simple HTTP requests.
version: 1.0.0
author: bbymama
license: MIT
dependencies: []
metadata:
  hermes:
    tags: [AI, Images, Generation, Art, CLI, Free]
    related_skills: [ascii-art, excalidraw]
---

# AI Image Generation via Pollinations.ai

Generate high-quality AI images directly from terminal - zero setup, zero cost, zero API keys.

---

## Quick Command

```python
import urllib.request
import urllib.parse

prompt = "A cute golden retriever in a meadow"
encoded = urllib.parse.quote(prompt)
url = f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=1024&nologo=true"
urllib.request.urlretrieve(url, "/tmp/image.jpg")
```

---

## Full Function

```python
import urllib.request
import urllib.parse
import os

def generate_image(prompt, width=1024, height=1024, seed=None, 
                   output_path="/tmp/generated_image.jpg", nologo=True):
    """
    Generate AI image using Pollinations.ai
    
    Args:
        prompt: Image description (string)
        width: Width in pixels (default: 1024)
        height: Height in pixels (default: 1024)  
        seed: Random seed for reproducibility (optional)
        output_path: Where to save image
        nologo: Remove watermark (default: True)
    
    Returns:
        Path to saved image file
    """
    encoded = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded}?width={width}&height={height}"
    
    if seed:
        url += f"&seed={seed}"
    if nologo:
        url += "&nologo=true"
    
    urllib.request.urlretrieve(url, output_path)
    return output_path

# Example usage
image_path = generate_image(
    "A majestic eagle soaring over mountains at sunset",
    width=1024,
    height=1024,
    seed=42,  # Same seed = same image
    output_path="~/Photos/eagle.jpg"
)
print(f"Image saved: {image_path}")
print(f"Size: {os.path.getsize(image_path)} bytes")
```

---

## URL Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | int | 1024 | Image width (max 2048) |
| `height` | int | 1024 | Image height (max 2048) |
| `seed` | int | random | For reproducible results |
| `nologo` | bool | false | Remove Pollinations watermark |

---

## Advanced Examples

### Multiple Images with Same Seed
```python
# Generate variations with consistent style
base_seed = 12345
prompts = [
    "portrait of a medieval knight",
    "portrait of a medieval sorceress", 
    "portrait of a medieval archer"
]

for i, prompt in enumerate(prompts):
    path = generate_image(prompt, seed=base_seed+i, 
                         output_path=f"/tmp/character_{i}.jpg")
```

### Style Modifiers
Add these to prompts for better results:

| Modifier | Effect |
|----------|--------|
| "photorealistic, 8k, professional photography" | High quality photos |
| "anime style, studio ghibli" | Japanese animation |
| "oil painting, renaissance style" | Classic art |
| "cinematic lighting, film grain" | Movie still look |
| "digital art, concept art" | Illustration style |
| "minimalist, flat design" | Simple graphics |

### Negative Prompts
Prevent unwanted elements:
```
"A beautiful landscape, avoid: blurry, low quality, distorted"
```

---

## Why Pollinations.ai?

| Feature | Pollinations |
|---------|--------------|
| Cost | 100% Free |
| API Key | Not required |
| Signup | Not required |
| Rate Limits | Generous |
| Commercial Use | Allowed |
| Model | FLUX.1 (fast, quality) |

---

## Alternative Services

| Service | Auth Required | Free Tier |
|---------|---------------|-----------|
| Pollinations.ai | ❌ None | ✅ Unlimited |
| DeepAI | Optional | ✅ Limited |
| Replicate | API Key | $5 credits |
| Together AI | API Key | $5 credits |
| Bing Image Creator | Microsoft | 100/day |

Pollinations.ai is recommended for zero-friction usage.

---

## Troubleshooting

**Timeout:**
```python
# Use requests with timeout
import requests
response = requests.get(url, timeout=60)
with open(output_path, "wb") as f:
    f.write(response.content)
```

**URL Encoding Issues:**
```python
# Manually encode special characters
from urllib.parse import quote
safe_prompt = quote(prompt, safe="")
```

**Large Images:**
- Max supported: 2048x2048
- Larger = slower generation
- 1024x1024 is the sweet spot

---

## Provider Info

**Website:** https://pollinations.ai  
**Models:** FLUX.1 [schnell] and others  
**Docs:** https://github.com/pollinations/pollinations  
**Discord:** https://discord.gg/pollinations

---

## Example Prompts

```
A serene Japanese garden with cherry blossoms, golden hour
Cyberpunk city street at night, neon reflections in wet pavement  
Portrait of an elderly craftsman, natural window lighting
Minimalist tech startup logo, blue gradient, vector style
Fantasy landscape with floating islands and waterfalls
Vintage 1950s diner interior with chrome details
Underwater coral reef with tropical fish, sunlight rays
Space station orbiting Earth with aurora visible
```

created: 2026-04-18
