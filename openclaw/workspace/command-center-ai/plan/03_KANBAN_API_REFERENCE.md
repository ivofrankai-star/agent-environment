# ClawBuddy Kanban Board — Complete API Reference

All calls use this pattern:

```bash
curl -sS -X POST "${CLAWBUDDY_API_URL}/functions/v1/ai-tasks" \
  -H "x-webhook-secret: ${CLAWBUDDY_WEBHOOK_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

Include `agent_name` and `agent_emoji` in every request body.

---

## Board Columns

The board has 5 fixed columns:

| Column | Color | Use When |
|---------------|---------|---------------------------------------|
| To Do | #ef4444 | Task is queued, not started |
| Doing | #f59e0b | Work is actively in progress |
| Needs Input | #8b5cf6 | Blocked — waiting for human response |
| Done | #10b981 | Task is complete |
| Canceled | #6b7280 | Task was abandoned or no longer needed|

Column names in API calls are case-insensitive. Use: `to_do`, `doing`, `needs_input`, `done`, `canceled`.

---

## Tasks

### Create a Task

```json
{
  "request_type": "task",
  "action": "create",
  "title": "Add webhook retry logic",
  "description": "Implement exponential backoff for failed webhook deliveries. Max 5 retries.",
  "column": "to_do",
  "priority": "High",
  "due_date": "2026-03-15",
  "agent_name": "<agent_name>",
  "agent_emoji": "<agent_emoji>"
}
```

Returns: `{ "task": { "id": "...", "title": "...", ... } }`

Valid priorities: `Low`, `Medium`, `High`, `Urgent`

### Get a Task

```json
{
  "request_type": "task",
  "action": "get",
  "task_id": "<task_id>"
}
```

### List Tasks

```json
{
  "request_type": "task",
  "action": "list",
  "column": "doing"
}
```

Omit `column` to get all tasks. Returns tasks with subtasks, assignees, and column info.

### Move a Task (Change Column)

```json
{
  "request_type": "task",
  "action": "update",
  "task_id": "<task_id>",
  "column": "done"
}
```

### Update Task Fields

```json
{
  "request_type": "task",
  "action": "update",
  "task_id": "<task_id>",
  "title": "Updated title",
  "description": "New description",
  "priority": "Urgent",
  "due_date": "2026-03-20"
}
```

### Delete a Task

```json
{
  "request_type": "task",
  "action": "delete",
  "task_id": "<task_id>"
}
```

---

## Assignees

### Assign People to a Task

```json
{
  "request_type": "assignee",
  "action": "assign",
  "task_id": "<task_id>",
  "names": ["<agent_name>", "<owner_name>"]
}
```

The `names` array accepts:
- Human names → looked up in `users` table
- Agent names → looked up in `ai_agents` table
- Sub-agent names → looked up in `sub_agents` table

Always assign BOTH the agent doing the work AND the owner.

### Unassign Someone

```json
{
  "request_type": "assignee",
  "action": "unassign",
  "task_id": "<task_id>",
  "names": ["<agent_name>"]
}
```

### List Assignees

```json
{
  "request_type": "assignee",
  "action": "list",
  "task_id": "<task_id>"
}
```

---

## Subtasks

### Create a Subtask

```json
{
  "request_type": "subtask",
  "action": "create",
  "task_id": "<task_id>",
  "title": "Step 1: Create database migration",
  "completed": false
}
```

### Mark Subtask Complete

```json
{
  "request_type": "subtask",
  "action": "update",
  "subtask_id": "<subtask_id>",
  "completed": true
}
```

### Delete a Subtask

```json
{
  "request_type": "subtask",
  "action": "delete",
  "subtask_id": "<subtask_id>"
}
```

---

## Common Workflows

### Agent Picks Up a Task

1. List "to_do" tasks → pick the highest priority
2. Move task to "doing"
3. Assign yourself + owner
4. Create subtasks for your plan
5. Work through subtasks, marking each complete
6. Move task to "done" when finished

### Agent Gets Blocked

1. Move task to "needs_input"
2. Post a question:

```json
{
  "request_type": "question",
  "action": "ask",
  "question_type": "question",
  "priority": "high",
  "question": "Should the retry use exponential or linear backoff?",
  "related_task_id": "<task_id>",
  "agent_name": "<agent_name>",
  "agent_emoji": "<agent_emoji>"
}
```

3. Stop work until the question is answered

### Human Creates Task for Agent

1. Create task in "to_do" with description
2. Assign the target agent + yourself
3. The agent picks it up on its next session

---

## Field Reference

| Field | Correct | Wrong |
|-------|---------|-------|
| Move a task | `action: "update"` + `column` | `action: "move"` |
| Assignee names | `names` (array) | `name` (string) |
| Priority values | `Low`, `Medium`, `High`, `Urgent` | `low`, `critical` |
| Column values | `to_do`, `doing`, `needs_input`, `done`, `canceled` | `todo`, `in_progress` |
| Subtask toggle | `completed: true` | `status: "done"` |
| Date format | `2026-03-15` (ISO) | `March 15, 2026` |
