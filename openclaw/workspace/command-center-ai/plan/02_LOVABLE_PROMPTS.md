# LOVABLE PROMPTS FOR STEP 9

---

## PROMPT 1: Edge Function for ai-tasks

**Use this in Lovable to create the edge function:**

---

Create a Supabase Edge Function at `supabase/functions/ai-tasks/index.ts` that serves as the API layer for an AI agent task management system. This function replaces direct database access with a validated REST API contract.

### Authentication

- Check for `x-webhook-secret` header
- Compare against `AGENT_COMMAND_WEBHOOK_SECRET` environment variable
- Return 401 if mismatch

### Request Format

All requests are POST with JSON body:

```json
{
  "action": "<action_type>",
  "payload": { ... }
}
```

### Supported Actions

#### 1. LIST - Retrieve tasks

```json
{
  "action": "list",
  "payload": {
    "column": "to_do", // optional filter
    "assignee": "bbymama" // optional filter
  }
}
```

Returns: Array of tasks with subtasks and assignees

#### 2. CREATE - Create new task

```json
{
  "action": "create",
  "payload": {
    "title": "Task title",
    "description": "Task description",
    "column": "to_do",
    "priority": "High", // Low, Medium, High, Urgent
    "due_date": "2026-04-10",
    "assignees": ["bbymama", "Ivek"]
  }
}
```

Returns: Created task object with ID

#### 3. UPDATE - Modify task fields

```json
{
  "action": "update",
  "payload": {
    "id": "task-uuid",
    "title": "Updated title",
    "description": "Updated description",
    "priority": "Urgent"
  }
}
```

#### 4. MOVE - Change task column

```json
{
  "action": "move",
  "payload": {
    "id": "task-uuid",
    "column": "doing" // MUST be lowercase: to_do, doing, needs_input, done, canceled
  }
}
```

#### 5. ASSIGN - Add/remove assignees

```json
{
  "action": "assign",
  "payload": {
    "task_id": "task-uuid",
    "names": ["bbymama", "Ivek"],
    "operation": "add" // or "remove"
  }
}
```

#### 6. DELETE - Remove task

```json
{
  "action": "delete",
  "payload": {
    "id": "task-uuid"
  }
}
```

#### 7. LOG - Write to log_entries

```json
{
  "action": "log",
  "payload": {
    "message": "Task started",
    "category": "general", // general, observation, reminder, fyi
    "agent_name": "bbymama",
    "agent_emoji": "📈"
  }
}
```

#### 8. STATUS - Update agent status

```json
{
  "action": "status",
  "payload": {
    "agent_name": "bbymama",
    "status": "active", // active, idle, working, offline
    "current_task": "Building dashboard"
  }
}
```

#### 9. UPLOAD_REPORT - Attach artifact

```json
{
  "action": "upload_report",
  "payload": {
    "task_id": "task-uuid",
    "title": "Build Report",
    "html_content": "<html>...</html>"
  }
}
```

### Database Tables

- `agents` - id, name, emoji, status, last_seen
- `tasks` - id, title, description, column, priority, due_date, position
- `log_entries` - id, message, category, agent_name, agent_emoji, created_at
- `response_metrics` - id, agent_id, response_time_seconds, recorded_at
- `task_assignees` - id, task_id, name
- `subtasks` - id, task_id, title, completed

### Error Handling

- Return 400 for unknown actions
- Return 401 for invalid webhook secret
- Return 500 for database errors
- Include error message in response

### CORS

Allow all origins for development.

---

## PROMPT 2: Integration Page

**Add an Integration Guide page to the dashboard:**

Create a new tab called "Integration" in the ClawBuddy dashboard. This page displays the API reference for AI agents.

### Layout

- Dark theme matching existing dashboard
- Glass-morphic cards
- Monospace font for code blocks

### Content Sections

#### 1. Environment Variables

Display these variables (read from Supabase settings):

- `AGENT_COMMAND_API_URL`
- `AGENT_COMMAND_WEBHOOK_SECRET`

With copy buttons.

#### 2. Quick Start

Minimal example for agents:

```bash
curl -X POST "${AGENT_COMMAND_API_URL}/functions/v1/ai-tasks" \
  -H "x-webhook-secret: ${AGENT_COMMAND_WEBHOOK_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"action": "list", "payload": {}}'
```

#### 3. API Reference

Full documentation for all actions (list, create, update, move, assign, delete, log, status, upload_report)

Each action shows:
- Description
- Request format
- Response format
- Example

#### 4. One-Click Copy

Button that copies the entire integration guide as markdown for pasting into agent sessions.

---

## PROMPT 3: Update Dashboard to Use Edge Function

**Modify existing hooks to use edge function instead of direct PostgREST:**

Update the React hooks (useTasks, useAgents, useLogEntries) to call the edge function instead of direct Supabase queries.

### Example for useTasks.ts:

```typescript
// OLD: Direct PostgREST
const { data } = await supabase.from('tasks').select('*')

// NEW: Via edge function
const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-tasks`, {
  method: 'POST',
  headers: {
    'x-webhook-secret': WEBHOOK_SECRET,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ action: 'list', payload: {} })
})
const { data } = await response.json()
```

Keep realtime subscriptions working via Supabase client.

---

## PROMPT 4: Agent Status Widget

**Add a live agent status indicator:**

In the dashboard header, show:

- Agent name (bbymama)
- Status dot (green=active, yellow=working, gray=idle, red=error)
- Current activity text
- Last seen timestamp

Pull from `agents` table via realtime subscription.
