#!/usr/bin/env python3
"""
Example research workflow demonstrating how to use the research subagent skill.
This script shows different patterns for conducting research using available tools.
"""

import os
import subprocess
import json
from datetime import datetime

def run_command(command, description=None):
    """Run a shell command and return the result."""
    if description:
        print(f"🔧 {description}")
    print(f"   Running: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"   ✅ Success")
            return result.stdout.strip()
        else:
            print(f"   ❌ Error: {result.stderr.strip()}")
            return None
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return None

def youtube_research_example(topic, max_results=5):
    """Example of YouTube-focused research."""
    print(f"\n📺 YouTube Research: Finding videos on '{topic}'")
    
    # Search for videos
    cmd = f"python /home/ivo/.openclaw/workspace/skills/youtube-research/scripts/youtube_search.py --search \"{topic}\" --max {max_results} --brief"
    output = run_command(cmd, f"Searching YouTube for {max_results} videos on {topic}")
    
    if output:
        print(f"   Found videos:\n{output}")
        return output
    return None

def notebooklm_research_example(notebook_title, sources):
    """Example of NotebookLM-powered research."""
    print(f"\n📓 NotebookLM Research: Creating notebook '{notebook_title}'")
    
    # Create notebook
    cmd = f'nlm notebook create "{notebook_title}" --quiet'
    notebook_id = run_command(cmd, "Creating new notebook")
    
    if not notebook_id:
        print("   ❌ Failed to create notebook")
        return None
        
    print(f"   Created notebook ID: {notebook_id}")
    
    # Add sources
    for i, source in enumerate(sources, 1):
        print(f"   Adding source {i}/{len(sources)}: {source.get('title', source.get('url', 'Unknown'))}")
        
        if source['type'] == 'url':
            cmd = f'nlm source add {notebook_id} --url "{source["url"]}" --title "{source.get("title", "Untitled")}" --wait'
        elif source['type'] == 'text':
            cmd = f'nlm source add {notebook_id} --text "{source["content"]}" --title "{source.get("title", "Notes")}" --wait'
        elif source['type'] == 'youtube':
            cmd = f'nlm source add {notebook_id} --url "{source["url"]}" --wait'
            
        result = run_command(cmd, f"Adding {source['type']} source")
        if not result:
            print(f"   ⚠️  Failed to add source {i}")
    
    # Get notebook description
    run_command(f'nlm notebook describe {notebook_id}', "Getting AI summary and suggested topics")
    
    # Generate a report
    run_command(f'nlm report create {notebook_id} --confirm', "Generating study guide report")
    
    return notebook_id

def mixed_media_research_example(topic):
    """Example of mixed media research combining YouTube and web sources."""
    print(f"\n🔍 Mixed Media Research: Investigating '{topic}'")
    
    # Step 1: Search YouTube for educational content
    print("   Step 1: Searching YouTube for educational content")
    youtube_cmd = f"python /home/ivo/.openclaw/workspace/skills/youtube-research/scripts/youtube_search.py --search \"{topic} tutorial\" --max 3 --brief"
    youtube_results = run_command(youtube_cmd, "YouTube search")
    
    # Step 2: Create research notebook
    print("   Step 2: Creating research notebook")
    notebook_cmd = f'nlm notebook create "{topic} Research - {datetime.now().strftime(%Y-%m-%d)}" --quiet'
    notebook_id = run_command(notebook_cmd, "Creating notebook")
    
    if not notebook_id:
        return None
    
    # Step 3: Add YouTube sources (if any found)
    if youtube_results:
        print("   Step 3: Adding YouTube sources to notebook")
        # In a real implementation, we'd parse the youtube_results to get video IDs
        # For this example, we'll simulate adding a couple of sources
        pass
    
    # Step 4: Query the notebook
    print("   Step 4: Querying notebook for key insights")
    query_cmd = f'nlm notebook query {notebook_id} "What are the key concepts and best practices for {topic}?"'
    run_command(query_cmd, "Asking research question")
    
    # Step 5: Generate study materials
    print("   Step 5: Generating study materials")
    run_command(f'nlm flashcards create {notebook_id} --confirm', "Creating flashcards")
    run_command(f'nlm quiz create {notebook_id} --count 5 --difficulty 2 --confirm', "Creating quiz")
    
    return notebook_id

def main():
    """Main function demonstrating research subagent capabilities."""
    print("🚀 Research Subagent Skill - Example Workflows")
    print("=" * 50)
    
    # Example 1: YouTube-focused research
    print("\n📋 EXAMPLE 1: YouTube-Focused Research")
    youtube_research_example("Python async programming", 3)
    
    # Example 2: NotebookLM research
    print("\n📋 EXAMPLE 2: NotebookLM-Powered Research")
    sources = [
        {"type": "url", "url": "https://python.async.io/", "title": "Python Async Documentation"},
        {"type": "text", "content": "Async programming allows concurrent execution without blocking. Key concepts include event loops, coroutines, and await/async keywords.", "title": "Async Programming Basics"}
    ]
    notebooklm_research_example("Async Python Guide", sources)
    
    # Example 3: Mixed media research
    print("\n📋 EXAMPLE 3: Mixed Media Research")
    mixed_media_research_example("Machine Learning")
    
    print("\n✅ Example workflows completed!")
    print("\n💡 To use these patterns in your own research:")
    print("   1. Define your research question clearly")
    print("   2. Select appropriate tools (YouTube, NotebookLM, web search)")
    print("   3. Follow the workflow patterns shown above")
    print("   4. Adapt based on your specific needs and available sources")

if __name__ == "__main__":
    main()