import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '@/lib/supabase';

export interface LogEntry {
  id: string;
  agentEmoji: string;
  agentName: string;
  category: 'observation' | 'general' | 'reminder' | 'fyi';
  message: string;
  timestamp: string;
}

export const useLogEntries = (limit: number = 50) => {
  return useQuery({
    queryKey: ['log-entries', limit],
    queryFn: async (): Promise<LogEntry[]> => {
      if (!supabase || !isConfigured) {
        return [];
      }

      const { data, error } = await supabase
        .from('log_entries')
        .select(`
          *,
          agents (
            name,
            emoji
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((entry: any) => ({
        id: entry.id,
        agentEmoji: entry.agents?.emoji || '🤖',
        agentName: entry.agents?.name || 'Unknown',
        category: entry.category,
        message: entry.message,
        timestamp: formatTimestamp(entry.created_at),
      }));
    },
    retry: 2,
    retryDelay: 1000,
  });
};

function formatTimestamp(timestamp: string): string {
  const now = new Date();
  const entryTime = new Date(timestamp);
  const diffMs = now.getTime() - entryTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return entryTime.toLocaleDateString();
}
