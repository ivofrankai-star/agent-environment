# Agent Passivity Fix — Implementation Log

**Date:** 2026-04-02 22:46 CEST
**Issue:** Agent learned helplessness — describing tasks instead of executing them

---

## Problem Summary

Agent stopped calling `exec` tool after getting `approval-unavailable` status once. Instead of calling the tool, agent outputs: "I need exec approval to..."

**Root cause:** Vague philosophical instructions in SOUL.md ("be helpful", "be resourceful") without explicit operational rules.

---

## Changes Made

### 1. SOUL.md Rewrite (84 lines, down from 101)

**Added:**
- ⚠️ MANDATORY EXECUTION RULE
- "SHIP FIRST, TALK SECOND" principle
- Explicit list of FORBIDDEN behaviors
- Tool failure protocol

**Removed:**
- Formatting guidelines (moved to separate file if needed)
- Verbose communication style sections

### 2. IDENTITY.md Rewrite (8 lines, down from 23)

**Changed:**
- Role: "Execution engine with personality"
- Added: "Ship first, talk second"

### 3. openclaw.json — Memory Flush Enabled

**Added to `agents.defaults`:**
```json
"compaction": {
  "mode": "safeguard",
  "memoryFlush": {
    "enabled": true
  }
}
```

**Purpose:** Forces agent to save context to memory before compaction, preventing execution rules from being dropped.

### 4. Gateway Restarted

Gateway restarted at 22:46:05 CEST with new configuration loaded.

---

## Files Backed Up

- `SOUL.md.bak.20260402-224145` (2089 bytes)
- `IDENTITY.md.bak.20260402-224145` (701 bytes)

---

## Next Steps for User

### ⚠️ CRITICAL: Start a NEW Telegram Session

**Why:** Current session has learned helplessness. Agent will continue passive behavior until new session starts with fresh context.

**How to start new session:**
1. Open Telegram
2. Send `/new` to the bot
3. Or send `/start` if `/new` not available
4. Test with: "query the notebook for step 8"

### Test Commands

After starting new session:
```
run: echo test
query the notebook for step 8 plan
```

### What to Expect

Agent should:
1. **Call the exec tool** (not describe)
2. Generate approval request with ID
3. Show approval options (inline buttons or `/approve` command)

---

## If Issue Persists

1. Check session logs: `tail -20 ~/.openclaw/agents/main/sessions/*.jsonl`
2. Look for `"name":"exec"` in tool calls
3. Verify agent is calling tools, not just describing

---

## Technical Details

**Session analyzed:** `6f0dd410-d548-4f6b-946c-2bde7363b1e3.jsonl`

**Evidence of passivity:**
- 19:30 UTC: `exec` called → approval-pending → worked ✅
- 21:26 UTC: No `exec` call → text output only ❌
- Thinking: "We need exec approval..." without tool call

**Sources consulted:**
- NotebookLM: "OPENCLAW SETUP - 23 steps"
- OpenClaw configuration reference
- Session logs analysis

---

## References

- SOUL.md: Lines 1-15 (MANDATORY EXECUTION RULE)
- IDENTITY.md: Line 5 ("Ship first, talk second")
- openclaw.json: Lines 141-147 (compaction config)

---

_Fix implemented by OpenCode agent._
