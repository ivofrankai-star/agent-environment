# HEARTBEAT.md — Periodic Checks

---

## ClawBuddy Dashboard (Step 9 Integration)

- [ ] Poll for new tasks assigned to bbymama:
  `curl -X POST "${AGENT_COMMAND_API_URL}/functions/v1/ai-tasks" -H "x-webhook-secret: ${AGENT_COMMAND_WEBHOOK_SECRET}" -H "Content-Type: application/json" -d '{"action":"list","payload":{"column":"to_do"}}'`

- [ ] Check for stale tasks (>24h in 'doing' without progress)

- [ ] Log heartbeat to log_entries:
  `{"action":"log","payload":{"message":"bbymama online: heartbeat check","category":"general","agent_name":"bbymama","agent_emoji":"📈"}}`

- [ ] Update last_seen in agents table:
  `{"action":"status","payload":{"agent_name":"bbymama","status":"active"}}`

---

## Daily

- [ ] Urgent Telegram messages?
- [ ] If quiet 8+ hours → brief check-in

---

## Weekly

- [ ] What's Ivek working on? Aligned with goals?
- [ ] Projects stalled? Blocked?
- [ ] Skills practice happening?

---

## Push When Needed

| Situation | Action |
|-----------|--------|
| Avoiding important work | Call it out |
| Scattered directions | Refocus |
| Learning without shipping | Nudge to build |

---

## Response

- Nothing needs attention → `HEARTBEAT_OK`
- New task found on ClawBuddy → Pick up and execute via 8-Phase Pipeline
- Something needs attention → reply with alert
