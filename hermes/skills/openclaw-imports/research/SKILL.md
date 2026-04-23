---
name: research
description: Create and manage research subagents to help with various research tasks. Use when you need to gather information, analyze content, summarize findings, or conduct deep research on topics using available tools like YouTube research, NotebookLM, web search, and document analysis.
---

# Research Subagent Skill

This skill provides guidance for creating and managing research subagents to assist with research tasks. It combines capabilities from various available tools to enable comprehensive research workflows.

## When to Use This Skill

Use this skill when you need to:
- Gather information on a topic from multiple sources
- Analyze and summarize content (videos, articles, documents)
- Conduct deep research with multiple steps
- Create research reports or summaries
- Track research progress and findings

## Available Research Tools

Based on the available skills in the workspace, you can leverage:

1. **YouTube Research** (`youtube-research` skill) - for video content research
2. **NotebookLM MCP** (`nlm-skill` skill) - for AI-powered research notebooks
3. **Web Search** - general web search capabilities
4. **Document Analysis** - for analyzing text documents

## Research Workflow Patterns

### 1. Topic Research & Information Gathering

```
Step 1: Define research scope and questions
Step 2: Search for relevant sources (YouTube, web, documents)
Step 3: Gather and organize sources
Step 4: Extract key information from sources
Step 5: Synthesize findings
```

### 2. Video Content Research

```
Step 1: Search for relevant YouTube videos
Step 2: Extract transcripts from promising videos
Step 3: Analyze transcripts for key points
Step 4: Summarize video content
Step 5: Compare multiple videos if needed
```

### 3. AI-Powered Research with NotebookLM

```
Step 1: Create a research notebook
Step 2: Add sources (URLs, text, YouTube videos, documents)
Step 3: Query the notebook with research questions
Step 4: Generate study materials (quizzes, flashcards, reports)
Step 5: Export findings
```

### 4. Deep Research Pipeline

```
Step 1: Start with broad web search
Step 2: Identify high-quality sources
Step 3: Add sources to research notebook
Step 4: Conduct targeted queries
Step 5: Generate comprehensive report
Step 6: Export and share findings
```

## Creating Research Subagents

To create a research subagent for a specific task:

1. **Define the research objective** - What specific question or topic needs investigation?
2. **Select appropriate tools** - Which research tools are best suited for this task?
3. **Create a workflow** - Outline the steps the subagent should follow
4. **Set up monitoring** - How will progress be tracked and reported?
5. **Define deliverables** - What format should the research findings take?

## Example Research Subagent Commands

### YouTube-Focused Research
```
Research subagent: Find and summarize top 5 recent videos on [topic]
Steps:
1. Search YouTube for "[topic]" ordered by date (max 10)
2. Select top 5 most relevant/recent videos
3. Extract transcripts for each video
4. Create summary of key points from each
5. Provide comparative analysis
```

### NotebookLM Research
```
Research subagent: Create research notebook on [topic] with web sources
Steps:
1. Create new notebook titled "[Topic] Research"
2. Add 5-10 relevant web sources on the topic
3. Wait for processing to complete
4. Generate AI summary and suggested topics
5. Create study guide report
6. Export to Google Docs
```

### Mixed Media Research
```
Research subagent: Research [topic] using videos and articles
Steps:
1. Search YouTube for educational content on [topic]
2. Search web for recent articles on [topic]
3. Add YouTube videos and web articles to NotebookLM notebook
4. Query notebook for key insights
5. Generate flashcards for key concepts
6. Create summary report
```

## Best Practices for Research Subagents

### 1. Clear Objectives
- Start with specific, measurable research questions
- Define what constitutes "complete" research for the task
- Set scope boundaries to prevent endless research

### 2. Source Quality
- Prioritize authoritative and recent sources
- Cross-reference information across multiple sources
- Note any biases or limitations in sources

### 3. Organization
- Use consistent naming conventions for notebooks and sources
- Tag sources by type, topic, or relevance
- Keep track of source URLs and access dates

### 4. Analysis Depth
- Don't just collect information - analyze and synthesize
- Look for patterns, contradictions, and insights
- Provide context for findings

### 5. Deliverable Focus
- Tailor output format to the intended audience
- Include actionable insights when appropriate
- Provide sources for verification

## Monitoring Research Progress

Research subagents should provide regular updates on:
- Sources gathered and processed
- Key findings discovered
- Any roadblocks or challenges
- Estimated completion time
- Next steps in the research process

## Error Handling and Fallbacks

If primary research methods fail:
- YouTube: Try different search terms or check video availability
- NotebookLM: Verify authentication and try again
- Web search: Use alternative search terms or sources
- Transcription: Fallback to available captions or skip video

## Integration with Other Skills

Research subagents can work with:
- **Notion skill** - to save research findings to databases
- **Weather skill** - for research requiring weather data
- **Healthcheck skill** - for technical research on system status
- **1Password skill** - for accessing research-related credentials

## Getting Started

To begin a research task:
1. Clearly state your research question or topic
2. Specify preferred research methods (YouTube, web search, document analysis, etc.)
3. Indicate desired output format (summary, report, presentation, etc.)
4. Set any constraints (time limit, source count, recency requirements)
5. The research subagent will then execute the defined workflow

Remember to follow the Search First Rule: check existing notes, bookmarks, and resources before starting new research.