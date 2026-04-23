# STEP 9 - CONNECT OPENCLAW TO SUPABASE

## Master Execution Plan

### PREREQUISITE: Install Supabase CLI

```bash
# Linux
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase

# Login
supabase login

# Link project
cd /home/ivo/.openclaw/workspace/command-center-ai
supabase link --project-ref hdbpajoxsuctubeylzwm
```

---

## PHASE 1: DATABASE SETUP

### 1.1 Create Missing Tables

Run in Supabase Dashboard → SQL Editor:

```sql
-- response_metrics table (MISSING)
CREATE TABLE IF NOT EXISTS response_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  response_time_seconds DECIMAL(6,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE response_metrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "anon read response_metrics" ON response_metrics
  FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert response_metrics" ON response_metrics
  FOR INSERT TO anon WITH CHECK (true);

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE response_metrics;
```

### 1.2 Add Write Policies for log_entries

```sql
-- Allow agents to write logs
CREATE POLICY "anon insert log_entries" ON log_entries
  FOR INSERT TO anon WITH CHECK (true);
```

### 1.3 Register bbymama

```sql
INSERT INTO agents (name, emoji, status, last_seen)
VALUES ('bbymama', '📈', 'active', NOW());
```

---

## PHASE 2: EDGE FUNCTION

### 2.1 Create Directory

```bash
mkdir -p supabase/functions/ai-tasks
```

### 2.2 Use Edge Function Prompt

See `04_EDGE_FUNCTION_PROMPT.md`

### 2.3 Deploy

```bash
supabase functions deploy ai-tasks
```

---

## PHASE 3: ENVIRONMENT VARIABLES

### Add to .env.local

```bash
AGENT_COMMAND_API_URL=https://hdbpajoxsuctubeylzwm.supabase.co
AGENT_COMMAND_WEBHOOK_SECRET=<generated>
SUPABASE_URL=https://hdbpajoxsuctubeylzwm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Generate webhook secret

```bash
export AGENT_COMMAND_WEBHOOK_SECRET=$(openssl rand -hex 32)
echo $AGENT_COMMAND_WEBHOOK_SECRET
```

---

## PHASE 4: AGENT INTEGRATION

### 4.1 Create INTEGRATION.md

See `05_INTEGRATION_GUIDE.md`

### 4.2 Install 8-Phase Pipeline

See `06_HEARTBEAT_PIPELINE.md`

### 4.3 Update HEARTBEAT.md

Add ClawBuddy-specific checks

---

## PHASE 5: AUTOMATION

### 5.1 Create polling daemon

See scripts in MASTER_PLAN

### 5.2 Set up cron jobs

```bash
openclaw cron add --name "Morning Digest" ...
```

---

## EXECUTION ORDER

1. Install Supabase CLI
2. Link project
3. Run database migrations
4. Generate webhook secret
5. Create edge function (via Lovable)
6. Deploy edge function
7. Test API calls
8. Create INTEGRATION.md
9. Install 8-Phase Pipeline SKILL
10. Update HEARTBEAT.md
11. Test agent → dashboard connection
