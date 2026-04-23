import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, Kanban, ScrollText, MessagesSquare, CalendarDays } from 'lucide-react';
import Header from '@/components/Header';
import CommandDeck from '@/components/CommandDeck';
import AgentProfiles from '@/components/AgentProfiles';
import TaskBoard from '@/components/TaskBoard';
import AILog from '@/components/AILog';
import Council from '@/components/Council';
import MeetingIntelligence from '@/components/MeetingIntelligence';

const tabs = [
  { id: 'command', label: 'Command Deck', icon: LayoutDashboard },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'tasks', label: 'Task Board', icon: Kanban },
  { id: 'log', label: 'AI Log', icon: ScrollText },
  { id: 'council', label: 'Council', icon: MessagesSquare },
  { id: 'meetings', label: 'Meetings', icon: CalendarDays },
];

const tabContent: Record<string, React.ReactNode> = {
  command: <CommandDeck />,
  agents: <AgentProfiles />,
  tasks: <TaskBoard />,
  log: <AILog />,
  council: <Council />,
  meetings: <MeetingIntelligence />,
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('command');

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <Header />
      <nav className="glass-card p-1.5 mb-6 flex gap-1 overflow-x-auto">
        {tabs.map((tab, i) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </motion.button>
        ))}
      </nav>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
