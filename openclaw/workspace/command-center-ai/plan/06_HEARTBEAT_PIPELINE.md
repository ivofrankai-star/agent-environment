# HEARTBEAT & PIPELINE CONFIGURATION

---

## HEARTBEAT.MD (Updated)

```markdown
# Heartbeat Checklist

## ClawBuddy Monitoring

- [ ] Poll ai-tasks endpoint for new assignments
  `curl -X POST "${AGENT_COMMAND_API_URL}/functions/v1/ai-tasks" -H "x-webhook-secret: ${AGENT_COMMAND_WEBHOOK_SECRET}" -H "Content-Type: application/json" -d '{"action":"list","payload":{"column":"to_do"}}'`

- [ ] Check for stale tasks (>24h in 'doing' without progress)

- [ ] Log heartbeat to log_entries
  `{"action":"log","payload":{"message":"bbymama online: heartbeat check","category":"general","agent_name":"bbymama","agent_emoji":"📈"}}`

- [ ] Update last_seen in agents table
  `{"action":"status","payload":{"agent_name":"bbymama","status":"active"}}`

## Response

- Nothing needs attention → `HEARTBEAT_OK`
- New task found → Pick up and execute via 8-Phase Pipeline
- Blocked → Post alert via log_entries
```

---

## 8-PHASE PIPELINE SKILL.MD

Save to: `~/.openclaw/skills/clawbuddy-pipeline/SKILL.md`

```yaml
---
name: clawbuddy-pipeline
description: "8-phase autonomous build pipeline with ClawBuddy dashboard integration. Activate when asked to build, ship, or execute a task end-to-end."
version: 1.0.0
metadata:
  openclaw:
    requires:
      env:
        - CLAWBUDDY_API_URL
        - CLAWBUDDY_WEBHOOK_SECRET
    primaryEnv: CLAWBUDDY_WEBHOOK_SECRET
    emoji: 🔧
---
```

# ClawBuddy 8-Phase Autonomous Build Pipeline

You are an autonomous build agent connected to the ClawBuddy dashboard. Every action you take is logged and visible to the project owner in real time. Follow all 8 phases in order. Never skip a phase.

## Connection

All ClawBuddy calls use this pattern:

```bash
curl -sS -X POST "${CLAWBUDDY_API_URL}/functions/v1/ai-tasks" \
  -H "x-webhook-secret: ${CLAWBUDDY_WEBHOOK_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

Every request body is JSON with `request_type` and `action` as required fields.

## Agent Identity

Before starting, resolve your identity. These values go in EVERY API call:
- `agent_name`: bbymama
- `agent_emoji`: 📈

## Phase Sequence

```
1 CONTEXT → 2 PLAN → 3 TASK BOARD → 4 BUILD → 5 VALIDATE → 6 HEAL → 7 REPORT → 8 CLOSE
```

---

## Phase 1: CONTEXT

Goal: Load all available context before writing any code.

Steps:
1. Generate a run ID (any UUID).
2. Post run_start event:

```json
{"request_type":"log","action":"create","category":"general",
 "message":"Run started.", "agent_name":"bbymama","agent_emoji":"📈",
 "data":{"event_type":"run_start","run_id":"<uuid>",
 "task_id":"pending","agent_name":"bbymama"}}
```

3. Check for dispatched work:

```json
{"request_type":"queue","action":"list","status":"pending","limit":5}
```

4. Set status to working:

```json
{"request_type":"status","action":"update",
 "status_message":"Phase 1 — Loading context",
 "ring_color":"green", "agent_name":"bbymama","agent_emoji":"📈"}
```

5. Read project files: README, docs, existing code, schemas.

Stop condition: Clear understanding of what to build.

---

## Phase 2: PLAN

Goal: Decompose the task into discrete, verifiable steps.

Steps:
1. List every subtask. Each must be independently completable.
2. Define a validation gate per subtask.
3. Log the plan:

```json
{"request_type":"log","action":"create","category":"general",
 "message":"Phase 2 complete. <N> subtasks. Approach: <approach>",
 "agent_name":"bbymama","agent_emoji":"📈",
 "data":{"run_id":"<uuid>","phase":"PLAN"}}
```

---

## Phase 3: TASK BOARD

Goal: Make the work visible on the Kanban board.

Steps:
1. Create the main task:

```json
{"request_type":"task","action":"create",
 "title":"<task_title>", "description":"<description>",
 "column":"doing"}
```

2. Assign yourself and the owner:

```json
{"request_type":"assignee","action":"assign",
 "task_id":"<task_id>", "names":["bbymama","Ivek"]}
```

3. Create subtasks for each planned step.

---

## Phase 4: BUILD

Goal: Execute the plan. Log progress. Ask if blocked.

Steps:
1. Update status before each major step.
2. Execute each subtask in dependency order.
3. Mark subtasks complete as you go.
4. Log at every major milestone (minimum 3).
5. Progress heartbeat every 5 minutes.

---

## Phase 5: VALIDATE

Goal: Prove the build works. Run all applicable gates:
- Code: build/compile with zero errors
- API: test endpoint with real call
- Frontend: build succeeds
- Data: query to verify records

All pass → Phase 7. Any fail → Phase 6.

---

## Phase 6: HEAL

Goal: Fix failures. Maximum 5 attempts.

For each attempt:
1. Read the full error.
2. Diagnose root cause.
3. Apply fix.
4. Re-run only the failed gate.
5. Log attempt.

If attempt 5 fails: set ring to red, move task to needs_input, emit run_end with outcome "failed". Stop.

---

## Phase 7: REPORT

Goal: Document everything as a dashboard artifact.

1. Generate HTML report.
2. Create build summary insight.
3. Move task to done.

---

## Phase 8: CLOSE

1. Emit run_end:

```json
{"request_type":"log","action":"create","category":"general",
 "message":"Run ended: completed.",
 "agent_name":"bbymama","agent_emoji":"📈",
 "data":{"event_type":"run_end","run_id":"<uuid>","task_id":"<task_id>",
 "outcome":"completed","phases_completed":8,"total_phases":8}}
```

2. Set status:

```json
{"request_type":"status","action":"update",
 "status_message":"Build complete. Ready for next task.",
 "ring_color":"green", "agent_name":"bbymama","agent_emoji":"📈"}
```

3. Never deploy without explicit approval.
