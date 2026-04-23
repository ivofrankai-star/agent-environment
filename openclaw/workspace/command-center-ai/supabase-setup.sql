-- ============================================
-- Command Center AI Dashboard - Supabase Setup
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_sessions ENABLE ROW LEVEL SECURITY;

-- 2. ANON READ POLICIES (drop first to avoid duplicates)
DROP POLICY IF EXISTS "anon read agents" ON agents;
DROP POLICY IF EXISTS "anon read tasks" ON tasks;
DROP POLICY IF EXISTS "anon read log_entries" ON log_entries;
DROP POLICY IF EXISTS "anon read council_sessions" ON council_sessions;

CREATE POLICY "anon read agents" ON agents FOR SELECT TO anon USING (true);
CREATE POLICY "anon read tasks" ON tasks FOR SELECT TO anon USING (true);
CREATE POLICY "anon read log_entries" ON log_entries FOR SELECT TO anon USING (true);
CREATE POLICY "anon read council_sessions" ON council_sessions FOR SELECT TO anon USING (true);

-- 3. ANON WRITE POLICIES (tasks table)
DROP POLICY IF EXISTS "anon insert tasks" ON tasks;
DROP POLICY IF EXISTS "anon update tasks" ON tasks;
DROP POLICY IF EXISTS "anon delete tasks" ON tasks;

CREATE POLICY "anon insert tasks" ON tasks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon update tasks" ON tasks FOR UPDATE TO anon USING (true);
CREATE POLICY "anon delete tasks" ON tasks FOR DELETE TO anon USING (true);

-- 4. RESPONSE METRICS TABLE (for live avg response metric)
CREATE TABLE IF NOT EXISTS response_metrics (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	agent_id UUID REFERENCES agents(id),
	response_time_seconds DECIMAL(6,2) NOT NULL,
	recorded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE response_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read response_metrics" ON response_metrics;
DROP POLICY IF EXISTS "anon insert response_metrics" ON response_metrics;

CREATE POLICY "anon read response_metrics" ON response_metrics FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert response_metrics" ON response_metrics FOR INSERT TO anon WITH CHECK (true);

-- 5. ADD TABLES TO REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE response_metrics;

-- 6. INSERT SAMPLE RESPONSE DATA (for demo)
INSERT INTO response_metrics (response_time_seconds) VALUES
	(1.1), (1.3), (0.9), (1.5), (1.2), (1.0), (1.4), (1.1), (0.8), (1.3);

-- 7. VERIFY PUBLICATION
SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
