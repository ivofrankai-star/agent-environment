import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '@/lib/supabase';

export const useAvgResponseTime = () => {
	return useQuery({
		queryKey: ['avg-response'],
		queryFn: async (): Promise<number> => {
			if (!supabase || !isConfigured) return 1.2;

			const { data, error } = await supabase
				.from('response_metrics')
				.select('response_time_seconds')
				.order('recorded_at', { ascending: false })
				.limit(50);

			if (error || !data?.length) return 1.2;

			return Math.round((data.reduce((s, r) => s + r.response_time_seconds, 0) / data.length) * 10) / 10;
		},
		refetchInterval: 5000,
	});
};
