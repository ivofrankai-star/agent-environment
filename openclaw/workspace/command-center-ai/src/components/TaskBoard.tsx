import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTasks, useUpdateTask, Task } from '@/hooks/useTasks';

const columns = [
  { id: 'todo' as const, label: 'To Do' },
  { id: 'doing' as const, label: 'Doing' },
  { id: 'needs-input' as const, label: 'Needs Input' },
  { id: 'done' as const, label: 'Done' },
];

const priorityColors: Record<string, string> = {
  low: 'bg-muted-foreground',
  medium: 'bg-primary',
  high: 'bg-warning',
  urgent: 'bg-destructive',
};

const TaskBoard = () => {
  const { data: taskList, isLoading, error } = useTasks();
  const updateTask = useUpdateTask();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDrop = (colId: Task['column']) => {
    if (!draggedId) return;
    updateTask.mutate({ taskId: draggedId, updates: { column: colId } });
    setDraggedId(null);
  };

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-destructive">Failed to load tasks</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto">
      {columns.map((col) => (
        <div
          key={col.id}
          className="glass-card p-4 min-h-[400px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(col.id)}
        >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
          <Badge variant="secondary" className="text-xs font-mono">
            {isLoading ? '...' : (taskList?.filter((t) => t.column === col.id).length || 0)}
          </Badge>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-secondary/30">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : (
            taskList
              ?.filter((t) => t.column === col.id)
              .map((task, i) => (
                <motion.div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg bg-secondary/30 border border-transparent hover:border-primary/20 cursor-grab active:cursor-grabbing transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                    <span className="text-xs text-muted-foreground capitalize">{task.priority}</span>
                    <span className="ml-auto text-sm">{task.agentEmoji}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  {task.progress !== undefined && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{task.progress}%</p>
                    </div>
                  )}
          </motion.div>
            ))
          )}
        </div>
        </div>
      ))}
    </div>
  );
};

export default TaskBoard;
