import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '@/lib/supabase';

export interface CouncilMessage {
  agentEmoji: string;
  agentName: string;
  messageNumber: number;
  text: string;
  timestamp: string;
}

export interface CouncilParticipant {
  emoji: string;
  name: string;
  sent: number;
  limit: number;
  status: 'done' | 'pending' | 'active';
}

export interface CouncilSession {
  id: string;
  question: string;
  status: 'active' | 'completed' | 'pending';
  participants: CouncilParticipant[];
  messages: CouncilMessage[];
}

export const useCouncilSessions = () => {
  return useQuery({
    queryKey: ['council-sessions'],
    queryFn: async (): Promise<CouncilSession[]> => {
      if (!supabase || !isConfigured) {
        return [];
      }

      const { data: sessions, error } = await supabase
        .from('council_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sessionsWithData = await Promise.all(
        sessions.map(async (session: any) => {
          const [participants, messages] = await Promise.all([
            supabase
              .from('council_participants')
              .select(`
                *,
                agents (
                  name,
                  emoji
                )
              `)
              .eq('session_id', session.id),
            supabase
              .from('council_messages')
              .select(`
                *,
                agents (
                  name,
                  emoji
                )
              `)
              .eq('session_id', session.id)
              .order('created_at', { ascending: true }),
          ]);

          return {
            id: session.id,
            question: session.question,
            status: session.status,
            participants: (participants.data || []).map((p: any) => ({
              emoji: p.agents?.emoji || '🤖',
              name: p.agents?.name || 'Unknown',
              sent: p.messages_sent || 0,
              limit: p.messages_limit || 3,
              status: mapParticipantStatus(p.status),
            })),
            messages: (messages.data || []).map((m: any) => ({
              agentEmoji: m.agents?.emoji || '🤖',
              agentName: m.agents?.name || 'Unknown',
              messageNumber: m.message_number,
              text: m.content,
              timestamp: formatTimestamp(m.created_at),
            })),
          };
        })
      );

      return sessionsWithData;
    },
    retry: 2,
    retryDelay: 1000,
  });
};

function mapParticipantStatus(status: string): 'done' | 'pending' | 'active' {
  if (status === 'complete') return 'done';
  if (status === 'sent') return 'active';
  return 'pending';
}

function formatTimestamp(timestamp: string): string {
  const now = new Date();
  const msgTime = new Date(timestamp);
  const diffMs = now.getTime() - msgTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
