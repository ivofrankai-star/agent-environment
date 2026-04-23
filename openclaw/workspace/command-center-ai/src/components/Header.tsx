import { Settings } from 'lucide-react';
import { useAgents } from '@/hooks/useAgents';

const Header = () => {
  const { data: agents } = useAgents();
  const activeAgent = agents?.find(a => a.status === 'active') || agents?.[0];

  return (
    <header className="glass-card border-l-2 border-l-primary px-6 py-4 mb-6 flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🐾</span>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">AI Command Center</h1>
          <p className="text-sm text-muted-foreground">AI Agent Command Center</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span className={`status-dot-${activeAgent?.status || 'idle'}`} />
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{activeAgent?.emoji || '🤖'} {activeAgent?.name || 'Loading...'}: {activeAgent?.status === 'active' ? 'Online' : 'Offline'}</p>
            <p className="text-xs text-muted-foreground">Last seen: {activeAgent?.lastSeen || '--'}</p>
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};

export default Header;
