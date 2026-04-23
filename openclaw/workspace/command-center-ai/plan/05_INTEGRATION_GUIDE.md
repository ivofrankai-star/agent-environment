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
- `AGENT_COMMAND_API_URL` — https://hdbpajoxsuctubeylzwm.supabase.co
- `AGENT_COMMAND_WEBHOOK_SECRET` — Get from dashboard Integration page

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

---

## Workflow

1. **Startup**: Log status "active"
2. **Check for tasks**: List with column="to_do", assignee="bbymama"
3. **Pick up task**: Move to "doing", log "Starting [task title]"
4. **Work**: Create subtasks, log progress every 5 min
5. **If blocked**: Move to "needs_input", post question
6. **Complete**: Move to "done", log "Completed [task title]"
7. **Shutdown**: Log status "idle"
