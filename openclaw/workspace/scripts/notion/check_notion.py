#!/usr/bin/env python3
import os
import requests
import json

# Get Notion API key from environment
NOTION_KEY = "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"
PAGE_ID = "331996240a6680268f4bc68282b2bba6"

headers = {
    "Authorization": f"Bearer {NOTION_KEY}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
}

# Get page content
url = f"https://api.notion.com/v1/blocks/{PAGE_ID}/children"
print(f"Fetching page content from: {url}")

try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    
    print(f"Page has {len(data.get('results', []))} blocks")
    
    print("\n=== Page Blocks ===")
    for i, block in enumerate(data.get('results', [])):
        block_type = block.get('type')
        print(f"{i+1}. Type: {block_type}")
        
        if block_type == 'paragraph':
            text = block.get('paragraph', {}).get('rich_text', [])
            if text:
                print(f"   Text: {text[0].get('plain_text', '')[:50]}...")
        elif block_type == 'to_do':
            text = block.get('to_do', {}).get('rich_text', [])
            checked = block.get('to_do', {}).get('checked', False)
            status = "✅" if checked else "⬜"
            if text:
                print(f"   Todo: {status} {text[0].get('plain_text', '')[:50]}...")
        elif block_type == 'heading_1':
            text = block.get('heading_1', {}).get('rich_text', [])
            if text:
                print(f"   Heading 1: {text[0].get('plain_text', '')[:50]}...")
        elif block_type == 'heading_2':
            text = block.get('heading_2', {}).get('rich_text', [])
            if text:
                print(f"   Heading 2: {text[0].get('plain_text', '')[:50]}...")
        elif block_type == 'heading_3':
            text = block.get('heading_3', {}).get('rich_text', [])
            if text:
                print(f"   Heading 3: {text[0].get('plain_text', '')[:50]}...")
        elif block_type == 'divider':
            print(f"   Divider")
        else:
            print(f"   Data: {json.dumps(block, indent=2)[:100]}...")
        
    print("\n=== End of Blocks ===")
    
    # Also get page title
    page_url = f"https://api.notion.com/v1/pages/{PAGE_ID}"
    page_resp = requests.get(page_url, headers=headers)
    page_data = page_resp.json()
    title = "Untitled"
    if 'properties' in page_data:
        for prop in page_data['properties'].values():
            if prop.get('type') == 'title':
                title_text = prop.get('title', [])
                if title_text:
                    title = title_text[0].get('plain_text', 'Untitled')
    print(f"\nPage Title: {title}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()