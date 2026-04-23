# Edge Function Prompt for Lovable

Use this prompt to create the ai-tasks edge function:

---

Create a Supabase Edge Function for an AI agent task management system. The function should be created at `supabase/functions/ai-tasks/index.ts`.

## Requirements

### Authentication

- Check for `x-webhook-secret` header in all requests
- Compare against `AGENT_COMMAND_WEBHOOK_SECRET` environment variable
- Return 401 Unauthorized if secret doesn't match

### Request/Response Format

- All requests are POST with JSON body
- Request structure: `{ "action": "<action_type>", "payload": {...} }`
- Response structure: `{ "success": true, "data": {...} }` or `{ "success": false, "error": "message" }`

### Supported Actions

1. **list** - List tasks with optional filters
2. **create** - Create new task
3. **update** - Update task fields
4. **move** - Change task column (status)
5. **assign** - Add/remove assignees
6. **delete** - Delete task
7. **log** - Write to log_entries table
8. **status** - Update agent status
9. **upload_report** - Attach HTML artifact to task

### Database Schema

```sql
-- agents table
CREATE TABLE agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  emoji TEXT,
  status TEXT DEFAULT 'offline',
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  column TEXT DEFAULT 'to_do',
  priority TEXT DEFAULT 'Medium',
  due_date DATE,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- log_entries table
CREATE TABLE log_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  agent_name TEXT,
  agent_emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- task_assignees table
CREATE TABLE task_assignees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- subtasks table
CREATE TABLE subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false
);
```

### Implementation Details

- Use Deno runtime (Supabase Edge Functions use Deno)
- Import from: `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"`
- Use Supabase JS client: `import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'`
- Create Supabase client with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars
- Handle CORS for browser requests
- All column/status values must be LOWERCASE: to_do, doing, needs_input, done, canceled
- Priority values: Low, Medium, High, Urgent (case-sensitive)

### Error Handling

- Return 400 for unknown actions or invalid payloads
- Return 401 for authentication failures
- Return 500 for database errors
- Always include error message in response

### Example Implementation

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-webhook-secret, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Verify webhook secret
  const webhookSecret = req.headers.get('x-webhook-secret')
  if (webhookSecret !== Deno.env.get('AGENT_COMMAND_WEBHOOK_SECRET')) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Parse request
  const { action, payload } = await req.json()

  // Create Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    let result

    switch (action) {
      case 'list':
        // List tasks with optional filters
        let query = supabase.from('tasks').select('*, assignees:task_assignees(name), subtasks(*)')
        if (payload?.column) query = query.eq('column', payload.column)
        if (payload?.assignee) query = query.contains('assignees', [payload.assignee])
        const { data: tasks } = await query
        result = { tasks }
        break

      case 'create':
        // Create task
        const { data: task } = await supabase
          .from('tasks')
          .insert({
            title: payload.title,
            description: payload.description,
            column: payload.column || 'to_do',
            priority: payload.priority || 'Medium',
            due_date: payload.due_date
          })
          .select()
          .single()

        // Add assignees
        if (payload.assignees && task) {
          const assigneeRecords = payload.assignees.map(name => ({ task_id: task.id, name }))
          await supabase.from('task_assignees').insert(assigneeRecords)
        }
        result = { task }
        break

      case 'update':
        const { data: updated } = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', payload.id)
          .select()
          .single()
        result = { task: updated }
        break

      case 'move':
        const { data: moved } = await supabase
          .from('tasks')
          .update({ column: payload.column.toLowerCase() })
          .eq('id', payload.id)
          .select()
          .single()
        result = { task: moved }
        break

      case 'log':
        await supabase.from('log_entries').insert({
          message: payload.message,
          category: payload.category || 'general',
          agent_name: payload.agent_name,
          agent_emoji: payload.agent_emoji
        })
        result = { success: true }
        break

      case 'status':
        await supabase
          .from('agents')
          .upsert({
            name: payload.agent_name,
            status: payload.status,
            last_seen: new Date().toISOString()
          })
        result = { success: true }
        break

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### Deployment

After creating, deploy with:

```bash
supabase functions deploy ai-tasks
```

Set secrets with:

```bash
supabase secrets set AGENT_COMMAND_WEBHOOK_SECRET=<your-secret>
```
