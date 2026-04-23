import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured } from '@/lib/supabase';
import { useEffect, useRef } from 'react';

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  type: string;
  role: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  activity: string;
  lastSeen: string;
  tasksCompleted: number;
  accuracy: number;
  skills: string[];
  accentColor: string;
}

export const useAgents = () => {
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

			const channel = supabase.channel(`agents-${crypto.randomUUID?.() || Date.now()}`, {
          config: { broadcast: { ack: true } }
        });

        channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'agents' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
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
    queryKey: ['agents'],
    queryFn: async (): Promise<Agent[]> => {
      if (!supabase || !isConfigured) {
        return [];
      }

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        emoji: agent.emoji,
        type: agent.type,
        role: agent.role,
        status: agent.status,
        activity: agent.current_activity || 'Idle',
        lastSeen: formatLastSeen(agent.last_seen),
        tasksCompleted: agent.tasks_completed || 0,
        accuracy: agent.accuracy || 95,
        skills: agent.skills || [],
        accentColor: agent.accent_color || '#10b981',
      }));
    },
    retry: 2,
    retryDelay: 1000,
  });
};

function formatLastSeen(timestamp: string): string {
  const now = new Date();
  const lastSeen = new Date(timestamp);
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
