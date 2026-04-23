import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured } from '@/lib/supabase';
import { useEffect, useRef } from 'react';

export interface Task {
  id: string;
  title: string;
  description?: string;
  agentEmoji: string;
  agentName: string;
  column: 'todo' | 'doing' | 'needs-input' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  assigned_agent_id?: string | null;
}

export const useTasks = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!supabase || !isConfigured) return;

    let mounted = true;

    const setupRealtime = async () => {
      try {
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
        }

        if (!mounted) return;

			const channel = supabase.channel(`tasks-${crypto.randomUUID?.() || Date.now()}`, {
          config: { broadcast: { ack: true } }
        });

        channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
          }
        );

        if (mounted) {
          await channel.subscribe();
          channelRef.current = channel;
        }
      } catch (error) {
        console.warn('Realtime subscription failed:', error);
      }
    };

    setupRealtime();

    return () => {
      mounted = false;
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current).catch(() => {});
        channelRef.current = null;
      }
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<Task[]> => {
      if (!supabase || !isConfigured) {
        return [];
      }

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          agents!assigned_agent_id (
            name,
            emoji
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        agentEmoji: task.agents?.emoji || '🤖',
        agentName: task.agents?.name || 'Unassigned',
        column: task.status === 'needs_input' ? 'needs-input' : task.status,
        priority: task.priority,
        progress: task.progress || 0,
        assigned_agent_id: task.assigned_agent_id,
      }));
    },
    retry: 2,
    retryDelay: 1000,
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      if (!supabase || !isConfigured) {
        throw new Error('Supabase not configured');
      }

      const dbUpdates: any = {};
      
      if (updates.column) {
        dbUpdates.status = updates.column === 'needs-input' ? 'needs_input' : updates.column;
      }
      if (updates.priority) {
        dbUpdates.priority = updates.priority;
      }
      if (updates.progress !== undefined) {
        dbUpdates.progress = updates.progress;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: { title: string; priority?: string; assigned_agent_id?: string }) => {
      if (!supabase || !isConfigured) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          priority: task.priority || 'medium',
          status: 'todo',
          progress: 0,
          assigned_agent_id: task.assigned_agent_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!supabase || !isConfigured) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
