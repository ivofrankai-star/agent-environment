import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useLogEntries } from '@/hooks/useLogEntries';

const categoryStyles: Record<string, string> = {
  observation: 'bg-primary/15 text-primary border-primary/30',
  general: 'bg-muted text-muted-foreground border-muted-foreground/30',
  reminder: 'bg-warning/15 text-warning border-warning/30',
  fyi: 'bg-accent/15 text-accent border-accent/30',
};

const AILog = () => {
  const [filter, setFilter] = useState('all');
  const { data: logEntries, isLoading, error } = useLogEntries(50);

  const filtered = filter === 'all' ? logEntries : logEntries?.filter((e) => e.category === filter);

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-destructive">Failed to load log entries</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Agent Log</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px] bg-secondary/30 border-primary/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="observation">Observation</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
            <SelectItem value="fyi">FYI</SelectItem>
          </SelectContent>
        </Select>
  </div>
  <div className="space-y-3">
    {isLoading
      ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-card p-4 flex gap-3">
            <Skeleton className="w-6 h-6 rounded" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))
      : filtered?.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 flex items-start gap-3"
          >
            <span className="text-lg mt-0.5">{entry.agentEmoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">{entry.agentName}</span>
                <Badge variant="outline" className={`text-xs ${categoryStyles[entry.category]}`}>
                  {entry.category}
                </Badge>
                <span className="ml-auto text-xs text-muted-foreground">{entry.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground">{entry.message}</p>
      </div>
    </motion.div>
        ))}
  </div>
</div>
  );
};

export default AILog;
