import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, TrendingUp, CheckSquare, Clock, Search, Globe, Sparkles, ChevronDown, ChevronUp, ExternalLink, Share2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMeetings } from '@/hooks/useMeetings';
import DOMPurify from 'dompurify';

const typeColors: Record<string, string> = {
  '1-on-1': '#60a5fa',
  'external': '#a78bfa',
  'sales': '#34d399',
  'team': '#fb923c',
  'standup': '#818cf8',
  'planning': '#2dd4bf',
};

const typeBadgeStyles: Record<string, string> = {
  '1-on-1': 'bg-blue-500/15 text-blue-400',
  'external': 'bg-purple-500/15 text-purple-400',
  'sales': 'bg-emerald-500/15 text-emerald-400',
  'team': 'bg-orange-500/15 text-orange-400',
  'standup': 'bg-indigo-500/15 text-indigo-400',
  'planning': 'bg-teal-500/15 text-teal-400',
};

const MeetingIntelligence = () => {
  const { data: meetings, isLoading, error } = useMeetings();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('all');
  const [hasActionItems, setHasActionItems] = useState(false);
  const [externalOnly, setExternalOnly] = useState(false);

  const totalMeetings = meetings?.length || 0;
  const thisWeek = meetings?.filter((m) => new Date(m.date) > new Date(Date.now() - 7 * 86400000)).length || 0;
  const openActions = meetings?.reduce((sum, m) => sum + m.action_items.filter((a) => !a.done).length, 0) || 0;
  const avgDuration = meetings && meetings.length > 0 ? Math.round(meetings.reduce((s, m) => s + m.duration_minutes, 0) / meetings.length) : 0;

  const kpis = [
    { label: 'Total Meetings', value: totalMeetings, icon: Calendar },
    { label: 'This Week', value: thisWeek, icon: TrendingUp },
    { label: 'Open Action Items', value: openActions, icon: CheckSquare },
    { label: 'Avg Duration', value: `${avgDuration}m`, icon: Clock },
  ];

  const pieData = useMemo(() => {
    if (!meetings) return [];
    const counts: Record<string, number> = {};
    meetings.forEach((m) => { counts[m.meeting_type] = (counts[m.meeting_type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [meetings]);

  const barData = useMemo(() => {
    if (!meetings) return [];
    const months: Record<string, number> = {};
    meetings.forEach((m) => {
      const d = new Date(m.date);
      const key = d.toLocaleString('default', { month: 'short' });
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  }, [meetings]);

  const filtered = useMemo(() => {
    if (!meetings) return [];
    let list = [...meetings];
    if (search) list = list.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));
    if (hasActionItems) list = list.filter((m) => m.action_items.some((a) => !a.done));
    if (externalOnly) list = list.filter((m) => m.has_external_participants);
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const cutoff = new Date(Date.now() - days * 86400000);
      list = list.filter((m) => new Date(m.date) > cutoff);
    }
    list.sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      return b.duration_minutes - a.duration_minutes;
    });
    return list;
  }, [meetings, search, sortBy, dateRange, hasActionItems, externalOnly]);

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-destructive">Failed to load meetings</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  const getInitials = (name: string) => name.split(' ').map((w) => w[0]).join('').slice(0, 2);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card-hover p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10 glow-emerald"><k.icon className="w-5 h-5 text-primary" /></div>
              <span className="text-sm text-muted-foreground">{k.label}</span>
            </div>
            <p className="text-3xl font-bold font-mono text-foreground">{k.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Meeting Type Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={typeColors[entry.name] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f9fafb' }} />
              <Legend formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f9fafb' }} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search meetings..." className="pl-9 bg-secondary/30 border-primary/10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[120px] bg-secondary/30 border-primary/10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant={hasActionItems ? 'default' : 'outline'} size="sm" onClick={() => setHasActionItems(!hasActionItems)} className={hasActionItems ? '' : 'border-primary/20 text-muted-foreground'}>
          Action Items
        </Button>
        <Button variant={externalOnly ? 'default' : 'outline'} size="sm" onClick={() => setExternalOnly(!externalOnly)} className={externalOnly ? '' : 'border-primary/20 text-muted-foreground'}>
          <Globe className="w-3.5 h-3.5 mr-1" /> External
        </Button>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px] bg-secondary/30 border-primary/10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="longest">Longest Duration</SelectItem>
          </SelectContent>
        </Select>
      </div>

{/* Meeting list */}
<div className="space-y-3">
    {isLoading
      ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-card p-4">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
        ))
      : filtered.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card overflow-hidden">
            <button onClick={() => setExpanded(expanded === m.id ? null : m.id)} className="w-full p-4 flex items-center gap-4 text-left hover:bg-secondary/10 transition-colors">
              <Badge className={`text-xs shrink-0 ${typeBadgeStyles[m.meeting_type] || 'bg-muted text-muted-foreground'}`}>{m.meeting_type}</Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString()} · {m.duration_display}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {m.attendees.slice(0, 3).map((a) => (
                  <div key={a} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground">{getInitials(a)}</div>
                ))}
                {m.attendees.length > 3 && <span className="text-xs text-muted-foreground ml-1">+{m.attendees.length - 3}</span>}
              </div>
              {m.action_items.some((a) => !a.done) && <Badge variant="secondary" className="text-xs font-mono shrink-0">{m.action_items.filter((a) => !a.done).length}</Badge>}
              {m.has_external_participants && <Globe className="w-4 h-4 text-accent shrink-0" />}
              {expanded === m.id ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
            </button>
            <AnimatePresence>
              {expanded === m.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-4 border-t border-secondary/30 pt-4">
                    <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.summary.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')) }} />
                    {m.action_items.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-foreground mb-2">Action Items</h4>
                        <div className="space-y-1.5">
                          {m.action_items.map((ai, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={ai.done} readOnly className="rounded border-primary/30 accent-primary" />
                              <span className={ai.done ? 'line-through text-muted-foreground' : 'text-foreground'}>{ai.task}</span>
                              <span className="text-xs text-muted-foreground ml-auto">→ {ai.assignee}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      {m.ai_insights}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {m.fathom_url && <Button size="sm" variant="outline" className="border-primary/20 text-primary text-xs"><ExternalLink className="w-3 h-3 mr-1" />Open Recording</Button>}
                      {m.share_url && <Button size="sm" variant="outline" className="border-primary/20 text-primary text-xs"><Share2 className="w-3 h-3 mr-1" />Share Link</Button>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
      </motion.div>
        ))}
    </div>
  </div>
  );
};

export default MeetingIntelligence;
