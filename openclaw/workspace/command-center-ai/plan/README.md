# STEP 9 IMPLEMENTATION - COMMAND CENTER AI

## ✅ COMPLETED

### 1. Plan Documentation
- Created `/home/ivo/.openclaw/workspace/command-center-ai/plan/` folder
- All prompts and documentation ready for Lovable

### 2. Supabase CLI
- Installed via Homebrew (v2.84.2)

### 3. Edge Function
- Created `supabase/functions/ai-tasks/index.ts`
- Full implementation with all actions:
  - list, create, update, move, assign, delete
  - log, status, upload_report
- Authentication via webhook secret

### 4. Database Migration
- Created `supabase/migrations/20260406_step9_integration.sql`
- Includes:
  - response_metrics table
  - RLS policies for log_entries and response_metrics
  - Agent registration for bbymama

### 5. Environment Variables
- Generated webhook secret: `328ab488efe837ffa459ce74a9c3ce27efa55b7c6712d2303694c2cca5df4ee0`
- Added to `.env.local` (dashboard)
- Added to `.env` (OpenClaw)

### 6. Agent Integration
- Created `workspace/INTEGRATION.md` - API guide for agents
- Created `skills/clawbuddy-pipeline/SKILL.md` - 8-Phase Pipeline
- Updated `HEARTBEAT.md` - ClawBuddy checks
- Updated `openclaw.json` - heartbeat config (30min, 08:00-20:00)

---

## 🔴 ACTION REQUIRED

### 1. Run Database Migration
Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Copy content from:
-- /home/ivo/.openclaw/workspace/command-center-ai/supabase/migrations/20260406_step9_integration.sql
```

Or copy the SQL directly from the migration file.

### 2. Deploy Edge Function
This requires linking the project first (needs Supabase login):

```bash
cd /home/ivo/.openclaw/workspace/command-center-ai
supabase login
supabase link --project-ref hdbpajoxsuctubeylzwm
supabase functions deploy ai-tasks --no-verify-jwt
```

### 3. Set Webhook Secret in Supabase
After deploying, set the secret:

```bash
supabase secrets set AGENT_COMMAND_WEBHOOK_SECRET=328ab488efe837ffa459ce74a9c3ce27efa55b7c6712d2303694c2cca5df4ee0
```

Or via Dashboard:
- Project Settings → Edge Functions → Secrets
- Add: `AGENT_COMMAND_WEBHOOK_SECRET` = `328ab488efe837ffa459ce74a9c3ce27efa55b7c6712d2303694c2cca5df4ee0`

---

## 📋 LOVABLE PROMPTS

All prompts are in `/plan/02_LOVABLE_PROMPTS.md`:

1. **Edge Function** - Use this if you want Lovable to create the function
2. **Integration Page** - Add Integration tab to dashboard
3. **Update Dashboard Hooks** - Switch to edge function
4. **Agent Status Widget** - Live status indicator

---

## 🧪 TESTING

After deployment, test:

```bash
# Set the secret
export AGENT_COMMAND_WEBHOOK_SECRET=328ab488efe837ffa459ce74a9c3ce27efa55b7c6712d2303694c2cca5df4ee0

# List tasks
curl -X POST "https://hdbpajoxsuctubeylzwm.supabase.co/functions/v1/ai-tasks" \
  -H "x-webhook-secret: $AGENT_COMMAND_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"list","payload":{}}'

# Expected: {"success":true,"data":{"tasks":[]}}
```

---

## 📂 FILES CREATED

| Location | Purpose |
|----------|---------|
| `command-center-ai/plan/` | All documentation |
| `command-center-ai/supabase/config.toml` | Supabase config |
| `command-center-ai/supabase/functions/ai-tasks/index.ts` | Edge function |
| `command-center-ai/supabase/migrations/20260406_step9_integration.sql` | Database migration |
| `command-center-ai/.env.local` | Dashboard env vars |
| `workspace/INTEGRATION.md` | Agent API guide |
| `skills/clawbuddy-pipeline/SKILL.md` | 8-Phase Pipeline |
| `.env` | OpenClaw env vars |

---

## 🎯 NEXT STEPS

1. Run SQL migration in Supabase Dashboard
2. Link project: `supabase link --project-ref hdbpajoxsuctubeylzwm`
3. Deploy edge function: `supabase functions deploy ai-tasks`
4. Set webhook secret: `supabase secrets set AGENT_COMMAND_WEBHOOK_SECRET=...`
5. Test API call
6. (Optional) Use Lovable prompts to enhance dashboard
