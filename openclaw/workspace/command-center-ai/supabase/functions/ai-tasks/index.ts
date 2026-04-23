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
  const expectedSecret = Deno.env.get('AGENT_COMMAND_WEBHOOK_SECRET')
  
  if (!webhookSecret || webhookSecret !== expectedSecret) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Parse request
  let action: string
  let payload: Record<string, unknown>
  
  try {
    const body = await req.json()
    action = body.action
    payload = body.payload || {}
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Create Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    let result: Record<string, unknown>

    switch (action) {
      case 'list': {
        // List tasks with optional filters
        let query = supabase
          .from('tasks')
          .select('*')
        
        if (payload.column) {
          // Map column to status
          const statusMap: Record<string, string> = {
            'to_do': 'todo',
            'doing': 'doing',
            'needs_input': 'needs_input',
            'done': 'done',
            'canceled': 'canceled'
          }
          const status = statusMap[String(payload.column).toLowerCase()] || payload.column
          query = query.eq('status', status)
        }
        
        const { data: tasks, error } = await query
        
        if (error) throw error
        result = { tasks }
        break
      }

      case 'create': {
        // Create task - map column to status
        const statusMap: Record<string, string> = {
          'to_do': 'todo',
          'doing': 'doing',
          'needs_input': 'needs_input',
          'done': 'done',
          'canceled': 'canceled'
        }
        
        const columnValue = String(payload.column || 'to_do').toLowerCase()
        const status = statusMap[columnValue] || columnValue
        
        const taskData: Record<string, unknown> = {
          title: payload.title,
          description: payload.description || null,
          status: status,
          priority: (payload.priority || 'medium').toLowerCase(),
        }
        
        if (payload.due_date) {
          taskData.due_date = payload.due_date
        }
        
        if (payload.assigned_agent_id) {
          taskData.assigned_agent_id = payload.assigned_agent_id
        }
        
        const { data: task, error: taskError } = await supabase
          .from('tasks')
          .insert(taskData)
          .select()
          .single()

        if (taskError) throw taskError
        result = { task }
        break
      }

      case 'update': {
        if (!payload.id) {
          throw new Error('Task ID required')
        }
        
        const updateData: Record<string, unknown> = {}
        if (payload.title) updateData.title = payload.title
        if (payload.description !== undefined) updateData.description = payload.description
        if (payload.priority) updateData.priority = payload.priority.toLowerCase()
        if (payload.due_date) updateData.due_date = payload.due_date
        if (payload.progress !== undefined) updateData.progress = payload.progress

        const { data: task, error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', payload.id)
          .select()
          .single()

        if (error) throw error
        result = { task }
        break
      }

      case 'move': {
        if (!payload.id || !payload.column) {
          throw new Error('Task ID and column required')
        }
        
        // Map column to status
        const statusMap: Record<string, string> = {
          'to_do': 'todo',
          'doing': 'doing',
          'needs_input': 'needs_input',
          'done': 'done',
          'canceled': 'canceled'
        }
        
        const columnValue = String(payload.column).toLowerCase()
        const status = statusMap[columnValue] || columnValue
        
        const { data: task, error } = await supabase
          .from('tasks')
          .update({ status })
          .eq('id', payload.id)
          .select()
          .single()

        if (error) throw error
        result = { task }
        break
      }

      case 'delete': {
        if (!payload.id) {
          throw new Error('Task ID required')
        }
        
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', payload.id)

        if (error) throw error
        result = { success: true }
        break
      }

case 'log': {
        const logData: Record<string, unknown> = {
          message: payload.message,
          category: payload.category || 'general',
        }
        
        // Get agent_id from agent_name if provided
        if (payload.agent_name) {
          const { data: agent } = await supabase
            .from('agents')
            .select('id')
            .eq('name', payload.agent_name)
            .single()
          
          if (agent) {
            logData.agent_id = agent.id
          }
        }

        const { error } = await supabase
          .from('log_entries')
          .insert(logData)

        if (error) throw error
        result = { success: true }
        break
      }

      case 'status': {
        if (!payload.agent_name) {
          throw new Error('Agent name required')
        }

        // First get existing agent to preserve required fields
        const { data: existingAgent } = await supabase
          .from('agents')
          .select('emoji, type, role')
          .eq('name', payload.agent_name)
          .single()

        const statusData: Record<string, unknown> = {
          name: payload.agent_name,
          status: payload.status || 'active',
          last_seen: new Date().toISOString()
        }

        // Preserve existing values or use defaults
        statusData.emoji = payload.agent_emoji || existingAgent?.emoji || '🤖'
        statusData.type = existingAgent?.type || 'code'
        statusData.role = existingAgent?.role || 'main'

        const { error } = await supabase
          .from('agents')
          .upsert(statusData, { onConflict: 'name' })

        if (error) throw error
        result = { success: true }
        break
      }

      case 'upload_report': {
        if (!payload.task_id) {
          throw new Error('Task ID required')
        }
        
        // For now, just log the report
        // In production, this would store the HTML in a reports table
        const { error } = await supabase
          .from('log_entries')
          .insert({
            message: `Report uploaded: ${payload.title || 'Untitled'}`,
            category: 'general',
            agent_name: payload.agent_name || 'unknown',
            agent_emoji: payload.agent_emoji || '📄'
          })

        if (error) throw error
        result = { success: true }
        break
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error)
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: message, details: error }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
