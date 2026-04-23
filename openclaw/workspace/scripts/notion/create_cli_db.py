#!/usr/bin/env python3
import os
import requests
import json
from datetime import datetime

NOTION_KEY = "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"
# Use the page found in search
PARENT_PAGE_ID = "33299624-0a66-80f8-b532-f1326a1ce59c"

headers = {
    "Authorization": f"Bearer {NOTION_KEY}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
}

def create_database():
    """Create a new database for CLI agents resources"""
    print("📦 Creating CLI Agents Resources Database...")
    
    database_data = {
        "parent": {
            "type": "page_id",
            "page_id": PARENT_PAGE_ID
        },
        "title": [
            {
                "type": "text",
                "text": {
                    "content": "🚀 CLI Agents Resources"
                }
            }
        ],
        "properties": {
            "Name": {
                "title": {}
            },
            "Source": {
                "url": {}
            },
            "Type": {
                "select": {
                    "options": [
                        {"name": "Article", "color": "blue"},
                        {"name": "Repository", "color": "green"},
                        {"name": "Guide", "color": "yellow"},
                        {"name": "Video", "color": "purple"},
                        {"name": "Other", "color": "gray"}
                    ]
                }
            },
            "Summary": {
                "rich_text": {}
            },
            "Key Points": {
                "rich_text": {}
            },
            "Date Added": {
                "date": {}
            }
        }
    }
    
    url = "https://api.notion.com/v1/databases"
    response = requests.post(url, headers=headers, json=database_data)
    
    if response.status_code == 200:
        database_id = response.json()['id']
        print(f"✅ Database created! ID: {database_id}")
        return database_id
    else:
        print(f"❌ Failed to create database: {response.status_code}")
        print(response.text)
        return None

def add_resource(database_id, name, source, resource_type, summary, key_points):
    """Add a resource to the database"""
    resource_data = {
        "parent": {
            "database_id": database_id
        },
        "properties": {
            "Name": {
                "title": [
                    {
                        "type": "text",
                        "text": {
                            "content": name
                        }
                    }
                ]
            },
            "Source": {
                "url": source
            },
            "Type": {
                "select": {
                    "name": resource_type
                }
            },
            "Summary": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": summary
                        }
                    }
                ]
            },
            "Key Points": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": key_points
                        }
                    }
                ]
            },
            "Date Added": {
                "date": {
                    "start": datetime.now().isoformat()
                }
            }
        }
    }
    
    url = "https://api.notion.com/v1/pages"
    response = requests.post(url, headers=headers, json=resource_data)
    
    if response.status_code == 200:
        print(f"   ✅ Added: {name}")
        return True
    else:
        print(f"   ❌ Failed to add {name}: {response.status_code}")
        print(response.text)
        return False

def main():
    print("🚀 Populating Notion with CLI Agents Resources...")
    print("=" * 60)
    
    # Create database
    database_id = create_database()
    
    if not database_id:
        return
    
    # Resource 1: Awesome CLI Coding Agents
    add_resource(
        database_id=database_id,
        name="Awesome CLI Coding Agents",
        source="https://github.com/bradAGI/awesome-cli-coding-agents",
        resource_type="Repository",
        summary="A curated list of 80+ CLI coding agents — AI-powered tools that live in your terminal, read/edit repos, and run commands — plus the harnesses that orchestrate, sandbox, or extend them.",
        key_points="• Includes terminal-native agents (OpenCode, Pi, Aider, Goose) and platform agents (Claude Code, Codex, Gemini CLI)\n• Covers harnesses, orchestrators, session managers, and parallel runners\n• Last updated: 2026-03-18\n• Defines CLI coding agents as AI-powered tools with direct filesystem, shell, and dev tools access"
    )
    
    # Resource 2: The 2026 Guide to Coding CLI Tools
    add_resource(
        database_id=database_id,
        name="The 2026 Guide to Coding CLI Tools: 15 AI Agents Compared",
        source="https://www.tembo.io/blog/coding-cli-tools-comparison",
        resource_type="Guide",
        summary="A practical guide comparing 15 notable CLI AI coding agents, helping developers choose the right terminal-based AI agent for their workflow.",
        key_points="• Compares Big-Lab native tools (Claude Code, Codex, Gemini CLI) vs open-source agents (Aider, Goose, etc.)\n• Breakdown by autonomy, model flexibility, ecosystem integration, pricing, and terminal vs IDE-like features\n• Provides decision matrix for matching tools to specific workflows (rapid prototyping, enterprise integration, full-local control)\n• Highlights the shift back to the terminal as the center of gravity for AI-assisted coding"
    )
    
    print("\n" + "=" * 60)
    print("🎉 FINISHED POPULATING NOTION!")
    print(f"🔗 View your database: https://www.notion.so/{PARENT_PAGE_ID}")
    print("=" * 60)

if __name__ == "__main__":
    main()