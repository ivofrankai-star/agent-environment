#!/usr/bin/env python3
"""
Dynamic Progress Bar for Notion Todo List
Run this script to update the progress bar based on completed todos.
"""
import os
import requests
import json
from datetime import datetime

# Load API key from .env
NOTION_KEY = "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"
PAGE_ID = "331996240a6680268f4bc68282b2bba6"

headers = {
    "Authorization": f"Bearer {NOTION_KEY}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
}

def count_todos():
    """Count total and completed todos"""
    url = f"https://api.notion.com/v1/blocks/{PAGE_ID}/children"
    response = requests.get(url, headers=headers)
    blocks = response.json().get('results', [])
    
    total = 0
    completed = 0
    
    for block in blocks:
        if block.get('type') == 'to_do':
            total += 1
            if block.get('to_do', {}).get('checked', False):
                completed += 1
    
    return total, completed

def generate_progress_bar(percentage, filled_char="▰", empty_char="▱", length=14):
    """Generate a visual progress bar"""
    filled = int((percentage / 100) * length)
    empty = length - filled
    
    bar = filled_char * filled + empty_char * empty
    return bar

def update_progress_block(total, completed):
    """Update the progress block in Notion"""
    percentage = int((completed / total) * 100) if total > 0 else 0
    progress_bar = generate_progress_bar(percentage)
    
    # Determine color based on progress
    if percentage >= 70:
        bar_color = "green"
        status_emoji = "🔥"
    elif percentage >= 40:
        bar_color = "yellow"
        status_emoji = "📈"
    else:
        bar_color = "default"
        status_emoji = "💪"
    
    # Get current blocks to find the progress paragraph
    url = f"https://api.notion.com/v1/blocks/{PAGE_ID}/children"
    response = requests.get(url, headers=headers)
    blocks = response.json().get('results', [])
    
    # Find the progress paragraph (contains "Progress:")
    progress_block_id = None
    for block in blocks:
        if block.get('type') == 'paragraph':
            text_list = block.get('paragraph', {}).get('rich_text', [])
            if text_list and "Progress:" in text_list[0].get('plain_text', ''):
                progress_block_id = block['id']
                break
    
    if progress_block_id:
        # Update existing progress block
        update_url = f"https://api.notion.com/v1/blocks/{progress_block_id}"
        
        update_data = {
            "paragraph": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": f"{status_emoji} Progress: ",
                            "link": None
                        },
                        "annotations": {
                            "bold": True,
                            "color": "default"
                        }
                    },
                    {
                        "type": "text",
                        "text": {
                            "content": progress_bar,
                            "link": None
                        },
                        "annotations": {
                            "bold": False,
                            "color": bar_color
                        }
                    },
                    {
                        "type": "text",
                        "text": {
                            "content": f" ({completed}/{total} = {percentage}%)",
                            "link": None
                        },
                        "annotations": {
                            "bold": False,
                            "color": "default"
                        }
                    }
                ],
                "color": "default"
            }
        }
        
        response = requests.patch(update_url, headers=headers, json=update_data)
        
        if response.status_code == 200:
            print(f"✅ Progress bar updated: {completed}/{total} ({percentage}%)")
            print(f"   Visual: {progress_bar}")
            return True
        else:
            print(f"❌ Failed to update progress bar: {response.status_code}")
            print(response.text)
            return False
    else:
        print("❌ Could not find progress block to update")
        return False

def add_new_progress_block(total, completed):
    """Add a new progress block if one doesn't exist"""
    percentage = int((completed / total) * 100) if total > 0 else 0
    progress_bar = generate_progress_bar(percentage)
    
    progress_data = {
        "children": [
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": f"📊 Progress: {progress_bar} ({completed}/{total} = {percentage}%)",
                                "link": None
                            },
                            "annotations": {
                                "bold": True,
                                "color": "blue"
                            }
                        }
                    ],
                    "color": "default"
                }
            }
        ]
    }
    
    url = f"https://api.notion.com/v1/blocks/{PAGE_ID}/children"
    response = requests.patch(url, headers=headers, json=progress_data)
    
    if response.status_code == 200:
        print(f"✅ Added new progress block: {completed}/{total} ({percentage}%)")
        return True
    else:
        print(f"❌ Failed to add progress block: {response.status_code}")
        return False

def main():
    print("🔄 Updating Notion Progress Bar...")
    print(f"   Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Count todos
    total, completed = count_todos()
    print(f"\n📊 Todo Statistics:")
    print(f"   Total: {total}")
    print(f"   Completed: {completed}")
    
    # Calculate percentage
    percentage = int((completed / total) * 100) if total > 0 else 0
    print(f"   Completion: {percentage}%")
    
    # Update progress bar
    print(f"\n🎨 Updating visual progress bar...")
    success = update_progress_block(total, completed)
    
    if success:
        print("\n✨ Progress bar is now fully functional!")
        print("   Run this script anytime to refresh the progress.")
    else:
        print("\n⚠️  Could not update existing block, adding new one...")
        add_new_progress_block(total, completed)
    
    print("\n🎉 Done! Check your Notion page.")

if __name__ == "__main__":
    main()