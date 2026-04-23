# SETUP COMMANDS — Terminal Reference

---

## 1. Install Supabase CLI

```bash
# Linux (via Homebrew)
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase

# Verify
supabase --version
```

---

## 2. Login to Supabase

```bash
supabase login
```

Follow prompts to authenticate via browser.

---

## 3. Link Project

```bash
cd /home/ivo/.openclaw/workspace/command-center-ai
supabase link --project-ref hdbpajoxsuctubeylzwm
```

---

## 4. Generate Secrets

```bash
# Webhook secret
export AGENT_COMMAND_WEBHOOK_SECRET=$(openssl rand -hex 32)
echo "AGENT_COMMAND_WEBHOOK_SECRET: $AGENT_COMMAND_WEBHOOK_SECRET"

# Save to .env.local
echo "AGENT_COMMAND_WEBHOOK_SECRET=$AGENT_COMMAND_WEBHOOK_SECRET" >> .env.local
```

---

## 5. Set Supabase Secrets

```bash
supabase secrets set AGENT_COMMAND_WEBHOOK_SECRET=$AGENT_COMMAND_WEBHOOK_SECRET
```

Or via Dashboard:
- Project Settings → Edge Functions → Secrets
- Add `AGENT_COMMAND_WEBHOOK_SECRET`

---

## 6. Deploy Edge Function

After creating the function via Lovable:

```bash
supabase functions deploy ai-tasks
```

---

## 7. Run Database Migrations

```bash
# If using Supabase migrations
supabase db push

# Or run SQL directly in Dashboard → SQL Editor
```

---

## 8. Add Environment Variables

```bash
# Add to .env.local
cat >> .env.local << 'EOF'
AGENT_COMMAND_API_URL=https://hdbpajoxsuctubeylzwm.supabase.co
SUPABASE_URL=https://hdbpajoxsuctubeylzwm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkYnBham94c3VjdHViZXlsendtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzIzMDMsImV4cCI6MjA5MDA0ODMwM30.vJGTDC08hRnr8ScuQv_EhJkqleFcgm9MZa-ptXF6Anc
EOF
```

---

## 9. Test API

```bash
curl -X POST "https://hdbpajoxsuctubeylzwm.supabase.co/functions/v1/ai-tasks" \
  -H "x-webhook-secret: $AGENT_COMMAND_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"list","payload":{}}'
```

Expected: `{"success":true,"data":{"tasks":[]}}`

---

## 10. Register Agent in Database

Via Supabase Dashboard → SQL Editor:

```sql
INSERT INTO agents (name, emoji, status, last_seen)
VALUES ('bbymama', '📈', 'active', NOW());
```

---

## 11. Install SKILL.md

```bash
mkdir -p ~/.openclaw/skills/clawbuddy-pipeline
# Copy SKILL.md content from 06_HEARTBEAT_PIPELINE.md
```

---

## 12. Update HEARTBEAT.md

Replace `~/.openclaw/workspace/HEARTBEAT.md` with content from 06_HEARTBEAT_PIPELINE.md

---

## 13. Set Up Cron Jobs

```bash
# Morning digest
openclaw cron add --name "Morning Digest" \
  --cron "0 7 * * *" \
  --tz "Europe/Ljubljana" \
  --session isolated \
  --message "Morning briefing. Check Kanban board for new tasks." \
  --deliver announce --channel telegram --to "chat:6735239700"

# Evening report
openclaw cron add --name "Evening Report" \
  --cron "0 18 * * 1-5" \
  --tz "Europe/Ljubljana" \
  --session isolated \
  --message "End of day summary." \
  --deliver announce --channel telegram --to "chat:6735239700"
```
