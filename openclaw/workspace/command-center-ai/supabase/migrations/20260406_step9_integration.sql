-- Add RLS policies for agent writes
-- Run this in Supabase Dashboard → SQL Editor

-- Enable RLS on log_entries if not already
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;

-- Allow anon to read log_entries
DROP POLICY IF EXISTS "anon read log_entries" ON log_entries;
CREATE POLICY "anon read log_entries" ON log_entries
  FOR SELECT TO anon USING (true);

-- Allow anon to insert log_entries (for agent activity logging)
DROP POLICY IF EXISTS "anon insert log_entries" ON log_entries;
CREATE POLICY "anon insert log_entries" ON log_entries
  FOR INSERT TO anon WITH CHECK (true);

-- Create response_metrics table if not exists
CREATE TABLE IF NOT EXISTS response_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  response_time_seconds DECIMAL(6,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on response_metrics
ALTER TABLE response_metrics ENABLE ROW LEVEL SECURITY;

-- Allow anon to read response_metrics
DROP POLICY IF EXISTS "anon read response_metrics" ON response_metrics;
CREATE POLICY "anon read response_metrics" ON response_metrics
  FOR SELECT TO anon USING (true);

-- Allow anon to insert response_metrics
DROP POLICY IF EXISTS "anon insert response_metrics" ON response_metrics;
CREATE POLICY "anon insert response_metrics" ON response_metrics
  FOR INSERT TO anon WITH CHECK (true);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE response_metrics;

-- Add unique constraint on agents.name if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'agents_name_key'
  ) THEN
    ALTER TABLE agents ADD CONSTRAINT agents_name_key UNIQUE (name);
  END IF;
END $$;

-- Register bbymama agent (type and role are required)
INSERT INTO agents (name, emoji, type, role, status, last_seen)
VALUES ('bbymama', '📈', 'code', 'main', 'active', NOW())
ON CONFLICT (name) DO UPDATE SET
  status = 'active',
  last_seen = NOW();
