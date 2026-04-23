#!/usr/bin/env python3
import requests

NOTION_KEY = "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"
PAGE_ID = "33299624-0a66-80f8-b532-f1326a1ce59c"

headers = {
    "Authorization": f"Bearer {NOTION_KEY}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
}

def create_block(block_type, content):
    """Create a block of specified type"""
    if block_type == "heading_1":
        return {"type": "heading_1", "heading_1": {"rich_text": [{"type": "text", "text": {"content": content}}]}}
    elif block_type == "heading_2":
        return {"type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": content}}]}}
    elif block_type == "heading_3":
        return {"type": "heading_3", "heading_3": {"rich_text": [{"type": "text", "text": {"content": content}}]}}
    elif block_type == "paragraph":
        return {"type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": content}}]}}
    elif block_type == "bullet":
        return {"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": content}}]}}
    elif block_type == "code":
        return {"type": "code", "code": {"rich_text": [{"type": "text", "text": {"content": content}}], "language": "plain text"}}

def main():
    blocks = []
    
    # Title
    blocks.append(create_block("heading_1", "📚 Mini Course: Prompt Engineering for Beginners"))
    blocks.append(create_block("paragraph", "A practical guide to communicating effectively with AI models. Learn to get better outputs, avoid common mistakes, and structure prompts like a pro."))
    
    # Module 1
    blocks.append(create_block("heading_2", "Module 1: What is Prompt Engineering?"))
    blocks.append(create_block("paragraph", "Prompt engineering is the art of crafting instructions that guide AI models to produce desired outputs. Think of it as learning to speak 'AI language' fluently."))
    blocks.append(create_block("heading_3", "Key Concepts:"))
    blocks.append(create_block("bullet", "Context: Background information that frames your request"))
    blocks.append(create_block("bullet", "Instructions: Clear, specific directions for what you want"))
    blocks.append(create_block("bullet", "Constraints: Rules and limitations (what NOT to do)"))
    blocks.append(create_block("bullet", "Examples: Sample inputs and outputs that demonstrate your intent"))
    
    # Module 2
    blocks.append(create_block("heading_2", "Module 2: The Anatomy of a Good Prompt"))
    blocks.append(create_block("paragraph", "A well-structured prompt follows this pattern:"))
    blocks.append(create_block("code", "[CONTEXT] + [SPECIFIC TASK] + [CONSTRAINTS] + [FORMAT]"))
    blocks.append(create_block("heading_3", "Example Breakdown:"))
    blocks.append(create_block("paragraph", "Bad: \"Write about dogs\""))
    blocks.append(create_block("paragraph", "Good: \"You are a veterinarian writing for new dog owners. Write a 200-word guide on feeding schedules for puppies. Use bullet points. Avoid medical jargon.\""))
    
    # Module 3
    blocks.append(create_block("heading_2", "Module 3: Common Mistakes to Avoid"))
    blocks.append(create_block("bullet", "Vague requests: \"Make it good\" → Be specific about what 'good' means"))
    blocks.append(create_block("bullet", "Overloading: Too many tasks in one prompt → Split into separate prompts"))
    blocks.append(create_block("bullet", "Ignoring format: Always specify how you want output structured (bullets, table, JSON)"))
    blocks.append(create_block("bullet", "No negative constraints: Tell the model what NOT to do (\"Do NOT use paragraphs\")"))
    
    # Module 4
    blocks.append(create_block("heading_2", "Module 4: Advanced Techniques"))
    blocks.append(create_block("heading_3", "1. Few-Shot Prompting"))
    blocks.append(create_block("paragraph", "Give the model examples to learn from:"))
    blocks.append(create_block("code", "Input: 'The movie was great'\nSentiment: Positive\n\nInput: 'Worst experience ever'\nSentiment: Negative\n\nInput: 'It was okay, nothing special'\nSentiment: Neutral"))
    blocks.append(create_block("heading_3", "2. Chain-of-Thought"))
    blocks.append(create_block("paragraph", "Ask the model to 'think step by step' for complex problems:"))
    blocks.append(create_block("code", "Solve this math problem step by step, explaining your reasoning at each stage."))
    blocks.append(create_block("heading_3", "3. Role Prompting"))
    blocks.append(create_block("paragraph", "Assign a specific persona to get specialized outputs:"))
    blocks.append(create_block("code", "You are a senior software architect. Review this code and suggest improvements focusing on scalability and maintainability."))
    
    # Module 5
    blocks.append(create_block("heading_2", "Module 5: Practical Exercises"))
    blocks.append(create_block("heading_3", "Exercise 1: Transform a Bad Prompt"))
    blocks.append(create_block("paragraph", "Bad prompt: \"Help me with my resume\""))
    blocks.append(create_block("paragraph", "Your task: Rewrite this using the [CONTEXT] + [TASK] + [CONSTRAINTS] + [FORMAT] structure."))
    blocks.append(create_block("heading_3", "Exercise 2: Create a Few-Shot Prompt"))
    blocks.append(create_block("paragraph", "Create a prompt that classifies customer feedback into categories (product quality, shipping, customer service, other) using 3 examples."))
    blocks.append(create_block("heading_3", "Exercise 3: Use Negative Constraints"))
    blocks.append(create_block("paragraph", "Write a prompt that explains quantum computing to a 10-year-old, with these rules: no math equations, no paragraphs longer than 2 sentences, must use bullet points."))
    
    # Quick Reference
    blocks.append(create_block("heading_2", "🎯 Quick Reference: Prompt Template"))
    template = """### CONTEXT
[Who you are, background, relevant information]

### TASK
[Specific, clear instruction]

### CONSTRAINTS
- Do NOT [specific thing to avoid]
- Keep response under [X] words
- Use [specific format]

### EXAMPLES
Input: [example input]
Output: [example output]

### OUTPUT FORMAT
[How you want the response structured]"""
    blocks.append(create_block("code", template))
    
    # Final Tips
    blocks.append(create_block("heading_2", "💡 Final Tips"))
    blocks.append(create_block("bullet", "Iterate: First attempt rarely perfect. Refine based on results."))
    blocks.append(create_block("bullet", "Be specific: \"3 bullet points\" > \"a few points\""))
    blocks.append(create_block("bullet", "Use delimiters: Separate sections with ### or --- for clarity"))
    blocks.append(create_block("bullet", "Temperature matters: Lower (0.1-0.3) for structured output, higher (0.7-1.0) for creative tasks"))
    blocks.append(create_block("bullet", "Save what works: Build a personal library of effective prompts"))
    
    # Add blocks to page
    url = f"https://api.notion.com/v1/blocks/{PAGE_ID}/children"
    payload = {"children": blocks}
    
    response = requests.patch(url, headers=headers, json=payload)
    if response.status_code == 200:
        print("✅ Mini course created successfully!")
        print(f"🔗 View here: https://www.notion.so/{PAGE_ID.replace('-', '')}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    main()
