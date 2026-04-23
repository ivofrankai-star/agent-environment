# INTEGRATION.md — Agent API Guide

This document teaches AI agents how to interact with the ClawBuddy dashboard.

---

## Connection

All API calls use this pattern:

```bash
curl -sS -X POST "${AGENT_COMMAND_API_URL}/functions/v1/ai-tasks" \
  -H "x-webhook-secret: ${AGENT_COMMAND_WEBHOOK_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## Environment Variables

Required:
- `AGENT_COMMAND_API_URL` — https://hbjpjbaabyavlruvmkfx.supabase.co
- `AGENT_COMMAND_WEBHOOK_SECRET` — Get from dashboard Integration page or .env.local

---

## Your Identity

Before making any calls, resolve your identity:
- `agent_name`: bbymama
- `agent_emoji`: 📈

Include these in every request.

---

## Quick Reference

### List Tasks

```json
{"action": "list", "payload": {}}
```

### Create Task

```json
{
  "action": "create",
  "payload": {
    "title": "Task title",
    "description": "Details",
    "column": "to_do",
    "priority": "High",
    "assignees": ["bbymama", "Ivek"]
  }
}
```

### Move Task

```json
{
  "action": "move",
  "payload": {
    "id": "task-uuid",
    "column": "doing"
  }
}
```

### Log Activity

```json
{
  "action": "log",
  "payload": {
    "message": "Starting task",
    "category": "general",
    "agent_name": "bbymama",
    "agent_emoji": "📈"
  }
}
```

### Update Status

```json
{
  "action": "status",
  "payload": {
    "agent_name": "bbymama",
    "status": "working"
  }
}
```

---

## Column Values (MUST BE LOWERCASE)

- `to_do`
- `doing`
- `needs_input`
- `done`
- `canceled`

## Priority Values

- `Low`
- `Medium`
- `High`
- `Urgent`

## Categories

- `general` — General activity
- `observation` — Notable findings
- `reminder` — Reminders
- `fyi` — For information

---

## Workflow

1. **Startup**: Log status "active"
   ```bash
   curl -X POST "${AGENT_COMMAND_API_URL}/functions/v1/ai-tasks" \
     -H "x-webhook-secret: ${AGENT_COMMAND_WEBHOOK_SECRET}" \
     -H "Content-Type: application/json" \
     -d '{"action":"status","payload":{"agent_name":"bbymama","status":"active"}}'
   ```

2. **Check for tasks**: List with column="to_do"
   ```bash
   curl -X POST "${AGENT_COMMAND_API_URL}/functions/v1/ai-tasks" \
     -H "x-webhook-secret: ${AGENT_COMMAND_WEBHOOK_SECRET}" \
     -H "Content-Type: application/json" \
     -d '{"action":"list","payload":{"column":"to_do"}}'
   ```

3. **Pick up task**: Move to "doing", log "Starting [task title]"

4. **Work**: Create subtasks, log progress every 5 min

5. **If blocked**: Move to "needs_input", post question

6. **Complete**: Move to "done", log "Completed [task title]"

7. **Shutdown**: Log status "idle"

---

## Examples

### Full Task Lifecycle

```bash
# 1. Check in
curl -X POST "https://hbjpjbaabyavlruvmkfx.supabase.co/functions/v1/ai-tasks" \
  -H "x-webhook-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"status","payload":{"agent_name":"bbymama","status":"active"}}'

# 2. List available tasks
curl -X POST "https://hbjpjbaabyavlruvmkfx.supabase.co/functions/v1/ai-tasks" \
  -H "x-webhook-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"list","payload":{"column":"to_do"}}'

# 3. Pick up first task (assuming task_id from response)
curl -X POST "https://hbjpjbaabyavlruvmkfx.supabase.co/functions/v1/ai-tasks" \
  -H "x-webhook-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"move","payload":{"id":"TASK_ID","column":"doing"}}'

# 4. Log progress
curl -X POST "https://hbjpjbaabyavlruvmkfx.supabase.co/functions/v1/ai-tasks" \
  -H "x-webhook-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"log","payload":{"message":"Starting task","category":"general","agent_name":"bbymama","agent_emoji":"📈"}}'

# 5. Complete task
curl -X POST "https://hbjpjbaabyavlruvmkfx.supabase.co/functions/v1/ai-tasks" \
  -H "x-webhook-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"move","payload":{"id":"TASK_ID","column":"done"}}'
```
