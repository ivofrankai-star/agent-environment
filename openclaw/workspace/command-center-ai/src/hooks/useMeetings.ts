import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '@/lib/supabase';

export interface ActionItem {
  task: string;
  assignee: string;
  done: boolean;
}

export interface Meeting {
  id: string;
  type: string;
  title: string;
  date: string;
  duration_minutes: number;
  duration_display: string;
  attendees: string[];
  summary: string;
  action_items: ActionItem[];
  ai_insights: string;
  meeting_type: string;
  sentiment: string;
  has_external_participants: boolean;
  external_domains: string[];
  fathom_url: string | null;
  share_url: string | null;
}

export const useMeetings = () => {
  return useQuery({
    queryKey: ['meetings'],
    queryFn: async (): Promise<Meeting[]> => {
      if (!supabase || !isConfigured) {
        return [];
      }

      const { data: meetings, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const meetingsWithItems = await Promise.all(
        meetings.map(async (meeting: any) => {
          const { data: actionItems } = await supabase
            .from('action_items')
            .select('*')
            .eq('meeting_id', meeting.id);

          return {
            id: meeting.id,
            type: 'meeting',
            title: meeting.title,
            date: meeting.date,
            duration_minutes: meeting.duration_minutes,
            duration_display: formatDuration(meeting.duration_minutes),
            attendees: meeting.attendees || [],
            summary: meeting.summary || '',
            action_items: (actionItems || []).map((item: any) => ({
              task: item.task,
              assignee: item.assignee || 'Unassigned',
              done: item.done || false,
            })),
            ai_insights: meeting.ai_insights || '',
            meeting_type: meeting.meeting_type,
            sentiment: meeting.sentiment || 'neutral',
            has_external_participants: meeting.has_external_participants || false,
            external_domains: meeting.external_domains || [],
            fathom_url: null,
            share_url: null,
          };
        })
      );

      return meetingsWithItems;
    },
    retry: 2,
    retryDelay: 1000,
  });
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
