#!/usr/bin/env python3
"""
Convert Ivek's Todo List to a Notion Database with Live Progress Tracking
This creates a proper database with formula-based progress that updates instantly.
"""
import os
import requests
import json

NOTION_KEY = "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"
PAGE_ID = "331996240a6680268f4bc68282b2bba6"

headers = {
    "Authorization": f"Bearer {NOTION_KEY}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
}

def create_database():
    """Create a new database for todos"""
    print("📦 Creating new Todo Database...")
    
    # Create database under the page
    database_data = {
        "parent": {
            "type": "page_id",
            "page_id": PAGE_ID
        },
        "title": [
            {
                "type": "text",
                "text": {
                    "content": "✅ Task Tracker"
                }
            }
        ],
        "properties": {
            "Task": {
                "title": {}
            },
            "Status": {
                "select": {
                    "options": [
                        {"name": "📋 Not Started", "color": "gray"},
                        {"name": "🔄 In Progress", "color": "yellow"},
                        {"name": "✅ Done", "color": "green"},
                        {"name": "⏸️ Paused", "color": "blue"}
                    ]
                }
            },
            "Priority": {
                "select": {
                    "options": [
                        {"name": "🔴 High", "color": "red"},
                        {"name": "🟡 Medium", "color": "yellow"},
                        {"name": "🟢 Low", "color": "green"}
                    ]
                }
            },
            "Timeframe": {
                "select": {
                    "options": [
                        {"name": "📅 Daily", "color": "green"},
                        {"name": "📆 Monthly", "color": "blue"},
                        {"name": "🎯 Yearly", "color": "orange"}
                    ]
                }
            },
            "Progress": {
                "formula": {
                    "expression": 'if(prop("Status") == "✅ Done", 100, if(prop("Status") == "🔄 In Progress", 50, 0))'
                }
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

def add_task(database_id, task_name, timeframe, priority="🟡 Medium"):
    """Add a task to the database"""
    task_data = {
        "parent": {
            "database_id": database_id
        },
        "properties": {
            "Task": {
                "title": [
                    {
                        "type": "text",
                        "text": {
                            "content": task_name
                        }
                    }
                ]
            },
            "Status": {
                "select": {
                    "name": "📋 Not Started"
                }
            },
            "Priority": {
                "select": {
                    "name": priority
                }
            },
            "Timeframe": {
                "select": {
                    "name": timeframe
                }
            }
        }
    }
    
    url = "https://api.notion.com/v1/pages"
    response = requests.post(url, headers=headers, json=task_data)
    
    return response.status_code == 200

def add_progress_summary(database_id):
    """Add a progress summary section with live formula"""
    print("\n📊 Adding progress summary section...")
    
    # We'll add a linked database view that shows counts
    # First, let's add some summary blocks
    summary_data = {
        "children": [
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "📈 Live Progress Dashboard"
                            },
                            "annotations": {
                                "bold": True,
                                "color": "blue"
                            }
                        }
                    ]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "Progress updates instantly when you change task status! "
                            }
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": "👇 Scroll down to see the Task Tracker database."
                            },
                            "annotations": {
                                "italic": True,
                                "color": "gray"
                            }
                        }
                    ]
                }
            }
        ]
    }
    
    url = f"https://api.notion.com/v1/blocks/{PAGE_ID}/children"
    response = requests.patch(url, headers=headers, json=summary_data)
    
    if response.status_code == 200:
        print("✅ Added progress summary!")
    else:
        print(f"❌ Failed to add summary: {response.status_code}")

def populate_database(database_id):
    """Populate the database with existing todos"""
    print("\n📝 Adding tasks to database...")
    
    tasks = [
        # Daily
        ("🎯 Focus Block (2-4h) — One deep work session", "📅 Daily", "🔴 High"),
        ("🔨 Learn by Doing — Build, don't watch", "📅 Daily", "🔴 High"),
        ("📝 Capture Insights — Log in memory/", "📅 Daily", "🟡 Medium"),
        ("🔍 Review Alignment — On track for 12-mo goal?", "📅 Daily", "🟡 Medium"),
        ("🚫 No Shiny Objects — Finish current project first", "📅 Daily", "🟢 Low"),
        # Monthly
        ("🚀 Ship 1 Project — MVP counts", "📆 Monthly", "🔴 High"),
        ("🧠 Skill Deep Dive — Master 1 tool", "📆 Monthly", "🟡 Medium"),
        ("💰 Income Brainstorm — 3-5 ideas, pick 1", "📆 Monthly", "🟡 Medium"),
        ("🧹 Review & Purge — Drop stalled projects", "📆 Monthly", "🟢 Low"),
        # Yearly
        ("💸 1st Income Stream — $1+ from AI/automation", "🎯 Yearly", "🔴 High"),
        ("📁 Portfolio — 3-5 shipped projects", "🎯 Yearly", "🔴 High"),
        ("🏗️ Foundation — Coding fundamentals solid", "🎯 Yearly", "🔴 High"),
        ("👥 Audience — Build in public", "🎯 Yearly", "🟡 Medium"),
        ("💪 Self-Trust — Prove you can follow through", "🎯 Yearly", "🟡 Medium"),
    ]
    
    added = 0
    for task, timeframe, priority in tasks:
        if add_task(database_id, task, timeframe, priority):
            added += 1
            print(f"   ✅ {task[:40]}...")
    
    print(f"\n✅ Added {added} tasks to database!")

def create_views(database_id):
    """Create different views for the database"""
    print("\n🎨 Creating custom views...")
    
    # The Notion API doesn't support creating views directly
    # But we can instruct the user on how to set them up
    print("   ℹ️  Views need to be created manually in Notion:")
    print("   1. Board View - Group by 'Status' (Kanban)")
    print("   2. Board View - Group by 'Timeframe' (Daily/Monthly/Yearly)")
    print("   3. List View - Filter by 'Status ≠ Done' (Active tasks)")
    print("   4. Calendar View - If you add due dates")

def main():
    print("🚀 Converting Todo List to Database...")
    print("=" * 50)
    
    # Create database
    database_id = create_database()
    
    if database_id:
        # Add progress summary
        add_progress_summary(database_id)
        
        # Populate with tasks
        populate_database(database_id)
        
        # Instructions for views
        create_views(database_id)
        
        print("\n" + "=" * 50)
        print("🎉 DATABASE CREATED SUCCESSFULLY!")
        print("=" * 50)
        print("\n📋 Next Steps:")
        print("1. Open your Notion page")
        print("2. Find the new '✅ Task Tracker' database")
        print("3. Change view to 'Board' and group by 'Status'")
        print("4. Watch progress update LIVE when you change status!")
        print("\n💡 Pro tip: Status options update the formula:")
        print("   - 📋 Not Started = 0%")
        print("   - 🔄 In Progress = 50%")
        print("   - ✅ Done = 100%")
        print("\n🔥 Your progress is now LIVE!")

if __name__ == "__main__":
    main()