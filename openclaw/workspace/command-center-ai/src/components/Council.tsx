import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ChevronUp, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useCouncilSessions } from '@/hooks/useCouncil';

const statusIcon = {
  done: <CheckCircle2 className="w-3.5 h-3.5 text-primary" />,
  pending: <Clock className="w-3.5 h-3.5 text-muted-foreground" />,
  active: <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />,
};

const statusBadge: Record<string, string> = {
  completed: 'bg-primary/15 text-primary',
  active: 'bg-accent/15 text-accent',
  pending: 'bg-warning/15 text-warning',
};

const Council = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: councilSessions, isLoading, error } = useCouncilSessions();

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-destructive">Failed to load council sessions</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading
        ? Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="glass-card p-5">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-96" />
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          ))
        : councilSessions?.map((session, i) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card overflow-hidden"
        >
          <button
            onClick={() => setExpanded(expanded === session.id ? null : session.id)}
            className="w-full p-5 flex items-start gap-4 text-left hover:bg-secondary/10 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`text-xs ${statusBadge[session.status]}`}>{session.status}</Badge>
              </div>
              <p className="text-sm font-medium text-foreground">{session.question}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {session.participants.map((p) => (
                  <div key={p.name} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/30 text-xs">
                    <span>{p.emoji}</span>
                    <span className="text-foreground">{p.name}</span>
                    <span className="text-muted-foreground font-mono">{p.sent}/{p.limit}</span>
                    {statusIcon[p.status]}
                  </div>
                ))}
              </div>
            </div>
            {expanded === session.id ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground mt-1" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground mt-1" />
            )}
          </button>
          <AnimatePresence>
            {expanded === session.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-3 border-t border-secondary/30 pt-4">
                  {session.messages.map((msg, mi) => (
                    <motion.div
                      key={mi}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: mi * 0.08 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20"
                    >
                      <span className="text-lg">{msg.agentEmoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{msg.agentName}</span>
                          <span className="text-xs text-muted-foreground font-mono">#{msg.messageNumber}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{msg.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{msg.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
      </AnimatePresence>
    </motion.div>
          ))}
  </div>
  );
};

export default Council;
