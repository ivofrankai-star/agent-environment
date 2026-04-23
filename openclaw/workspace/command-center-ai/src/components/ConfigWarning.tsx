import { AlertTriangle } from 'lucide-react';
import { isConfigured } from '@/lib/supabase';

export const ConfigWarning = () => {
  if (isConfigured) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-destructive/90 text-destructive-foreground px-4 py-3 flex items-center justify-center gap-2 z-50">
      <AlertTriangle className="w-5 h-5" />
      <span className="text-sm font-medium">
        Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.
      </span>
    </div>
  );
};
