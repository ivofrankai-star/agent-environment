export interface Agent {
  id: string;
  name: string;
  emoji: string;
  type: string;
  role: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  activity: string;
  lastSeen: string;
  tasksCompleted: number;
  accuracy: number;
  skills: string[];
  accentColor: string;
}

export interface Task {
  id: string;
  title: string;
  agentEmoji: string;
  agentName: string;
  column: 'todo' | 'doing' | 'needs-input' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
}

export interface LogEntry {
  id: string;
  agentEmoji: string;
  agentName: string;
  category: 'observation' | 'general' | 'reminder' | 'fyi';
  message: string;
  timestamp: string;
}

export interface CouncilMessage {
  agentEmoji: string;
  agentName: string;
  messageNumber: number;
  text: string;
  timestamp: string;
}

export interface CouncilSession {
  id: string;
  question: string;
  status: 'active' | 'completed' | 'pending';
  participants: { emoji: string; name: string; sent: number; limit: number; status: 'done' | 'pending' | 'active' }[];
  messages: CouncilMessage[];
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
  action_items: { task: string; assignee: string; done: boolean }[];
  ai_insights: string;
  meeting_type: string;
  sentiment: string;
  has_external_participants: boolean;
  external_domains: string[];
  fathom_url: string | null;
  share_url: string | null;
}

export const agents: Agent[] = [
  {
    id: '1', name: 'Agent Alpha', emoji: '🤖', type: 'Code Agent', role: 'Lead Engineer',
    status: 'active', activity: 'Refactoring auth module', lastSeen: 'Just now',
    tasksCompleted: 342, accuracy: 97.2,
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL'],
    accentColor: '#10b981',
  },
  {
    id: '2', name: 'Dispatch Bot', emoji: '📋', type: 'Coordinator', role: 'Operations Director',
    status: 'idle', activity: 'Awaiting new tasks', lastSeen: '3m ago',
    tasksCompleted: 189, accuracy: 94.8,
    skills: ['Task Routing', 'Priority Scoring', 'Load Balancing', 'Scheduling'],
    accentColor: '#f59e0b',
  },
  {
    id: '3', name: 'Audit Bot', emoji: '🛡️', type: 'Quality Agent', role: 'Compliance Officer',
    status: 'active', activity: 'Scanning PR #127', lastSeen: 'Just now',
    tasksCompleted: 256, accuracy: 99.1,
    skills: ['Code Review', 'Security Audit', 'Linting', 'Documentation'],
    accentColor: '#06b6d4',
  },
];

export const activityFeed = [
  { id: '1', emoji: '🤖', agent: 'Agent Alpha', action: 'Completed refactoring of auth middleware', time: '2m ago' },
  { id: '2', emoji: '🛡️', agent: 'Audit Bot', action: 'Flagged potential SQL injection in PR #124', time: '5m ago' },
  { id: '3', emoji: '📋', agent: 'Dispatch Bot', action: 'Reassigned 3 tasks due to priority change', time: '12m ago' },
  { id: '4', emoji: '🤖', agent: 'Agent Alpha', action: 'Deployed v2.4.1 to staging', time: '18m ago' },
  { id: '5', emoji: '🛡️', agent: 'Audit Bot', action: 'Approved PR #123 — all checks passed', time: '25m ago' },
  { id: '6', emoji: '📋', agent: 'Dispatch Bot', action: 'Created sprint plan for week 12', time: '32m ago' },
  { id: '7', emoji: '🤖', agent: 'Agent Alpha', action: 'Optimized database queries — 40% faster', time: '45m ago' },
  { id: '8', emoji: '🛡️', agent: 'Audit Bot', action: 'Generated compliance report for Q1', time: '1h ago' },
];

export const tasks: Task[] = [
  { id: '1', title: 'Implement OAuth2 flow', agentEmoji: '🤖', agentName: 'Agent Alpha', column: 'doing', priority: 'high', progress: 65 },
  { id: '2', title: 'Review API rate limits', agentEmoji: '🛡️', agentName: 'Audit Bot', column: 'todo', priority: 'medium' },
  { id: '3', title: 'Set up CI/CD pipeline', agentEmoji: '🤖', agentName: 'Agent Alpha', column: 'done', priority: 'high' },
  { id: '4', title: 'Triage incoming tickets', agentEmoji: '📋', agentName: 'Dispatch Bot', column: 'doing', priority: 'urgent', progress: 30 },
  { id: '5', title: 'Write unit tests for payments', agentEmoji: '🤖', agentName: 'Agent Alpha', column: 'todo', priority: 'medium' },
  { id: '6', title: 'Audit third-party deps', agentEmoji: '🛡️', agentName: 'Audit Bot', column: 'needs-input', priority: 'high' },
  { id: '7', title: 'Update onboarding docs', agentEmoji: '📋', agentName: 'Dispatch Bot', column: 'done', priority: 'low' },
  { id: '8', title: 'Database migration v3', agentEmoji: '🤖', agentName: 'Agent Alpha', column: 'todo', priority: 'urgent' },
  { id: '9', title: 'Performance benchmarks', agentEmoji: '🛡️', agentName: 'Audit Bot', column: 'doing', priority: 'medium', progress: 80 },
  { id: '10', title: 'Resolve merge conflicts', agentEmoji: '🤖', agentName: 'Agent Alpha', column: 'needs-input', priority: 'high' },
];

export const logEntries: LogEntry[] = [
  { id: '1', agentEmoji: '🤖', agentName: 'Agent Alpha', category: 'observation', message: 'Auth module has 3 circular dependencies that should be resolved before v3.0 release.', timestamp: '2m ago' },
  { id: '2', agentEmoji: '🛡️', agentName: 'Audit Bot', category: 'fyi', message: 'New CVE published for lodash@4.17.20. We are on 4.17.21 — not affected.', timestamp: '8m ago' },
  { id: '3', agentEmoji: '📋', agentName: 'Dispatch Bot', category: 'reminder', message: 'Sprint review meeting in 2 hours. 4 tasks still in "Doing" column.', timestamp: '15m ago' },
  { id: '4', agentEmoji: '🤖', agentName: 'Agent Alpha', category: 'general', message: 'Completed migration of user service to TypeScript. 0 type errors.', timestamp: '22m ago' },
  { id: '5', agentEmoji: '🛡️', agentName: 'Audit Bot', category: 'observation', message: 'API response times increased 12% in the last hour. Possibly related to new indexing job.', timestamp: '30m ago' },
  { id: '6', agentEmoji: '📋', agentName: 'Dispatch Bot', category: 'fyi', message: 'New team member onboarding scheduled for Monday. Preparing access provisioning.', timestamp: '45m ago' },
  { id: '7', agentEmoji: '🤖', agentName: 'Agent Alpha', category: 'reminder', message: 'Deploy freeze starts Friday at 5 PM. All PRs must be merged by then.', timestamp: '1h ago' },
  { id: '8', agentEmoji: '🛡️', agentName: 'Audit Bot', category: 'general', message: 'Weekly security scan complete. 0 critical, 2 low-severity findings.', timestamp: '1h ago' },
  { id: '9', agentEmoji: '🤖', agentName: 'Agent Alpha', category: 'observation', message: 'Test coverage dropped from 87% to 84% after recent merge. Investigating.', timestamp: '2h ago' },
  { id: '10', agentEmoji: '📋', agentName: 'Dispatch Bot', category: 'general', message: 'All Q1 OKRs have been updated in the tracking system.', timestamp: '3h ago' },
];

export const councilSessions: CouncilSession[] = [
  {
    id: '1',
    question: 'Should we migrate from REST to GraphQL for the public API?',
    status: 'completed',
    participants: [
      { emoji: '🤖', name: 'Agent Alpha', sent: 3, limit: 3, status: 'done' },
      { emoji: '📋', name: 'Dispatch Bot', sent: 2, limit: 3, status: 'done' },
      { emoji: '🛡️', name: 'Audit Bot', sent: 3, limit: 3, status: 'done' },
    ],
    messages: [
      { agentEmoji: '🤖', agentName: 'Agent Alpha', messageNumber: 1, text: 'GraphQL would reduce over-fetching by ~60% based on current endpoint analysis. The mobile app makes 12 calls that could become 3.', timestamp: '2h ago' },
      { agentEmoji: '🛡️', agentName: 'Audit Bot', messageNumber: 1, text: 'Security concern: GraphQL introduces query complexity attacks. We\'d need depth limiting and cost analysis middleware.', timestamp: '2h ago' },
      { agentEmoji: '📋', agentName: 'Dispatch Bot', messageNumber: 1, text: 'Migration timeline estimate: 6 weeks with current velocity. Suggest phased rollout starting with read-only queries.', timestamp: '1h ago' },
      { agentEmoji: '🤖', agentName: 'Agent Alpha', messageNumber: 2, text: 'Agreed on phased approach. We can use Apollo Federation to run both REST and GraphQL during transition.', timestamp: '1h ago' },
      { agentEmoji: '🛡️', agentName: 'Audit Bot', messageNumber: 2, text: 'I can implement persisted queries to mitigate injection risks. This also improves caching.', timestamp: '55m ago' },
    ],
  },
  {
    id: '2',
    question: 'How should we handle the upcoming database scaling challenge?',
    status: 'active',
    participants: [
      { emoji: '🤖', name: 'Agent Alpha', sent: 1, limit: 3, status: 'active' },
      { emoji: '📋', name: 'Dispatch Bot', sent: 1, limit: 3, status: 'pending' },
      { emoji: '🛡️', name: 'Audit Bot', sent: 0, limit: 3, status: 'pending' },
    ],
    messages: [
      { agentEmoji: '🤖', agentName: 'Agent Alpha', messageNumber: 1, text: 'Current DB is at 72% capacity. At current growth rate, we hit limits in 8 weeks. Options: vertical scaling, read replicas, or sharding.', timestamp: '10m ago' },
      { agentEmoji: '📋', agentName: 'Dispatch Bot', messageNumber: 1, text: 'Read replicas would be fastest to implement. I estimate 2 days of work. Sharding is 3+ weeks.', timestamp: '5m ago' },
    ],
  },
];

export const meetings: Meeting[] = [
  {
    id: '1', type: 'meeting', title: 'Weekly Standup with Engineering', date: '2026-04-03T10:00:00Z',
    duration_minutes: 30, duration_display: '30m', attendees: ['Alice', 'Bob', 'Charlie'],
    summary: '**Sprint Progress Update**\n\nDiscussed sprint progress. Backend API is 80% complete. Frontend team blocked on design tokens. Need to resolve by Wednesday.\n\n- Alice: Finishing auth flow\n- Bob: Working on API tests\n- Charlie: Design system updates',
    action_items: [{ task: 'Review PR #42', assignee: 'Alice', done: false }, { task: 'Update docs', assignee: 'Bob', done: true }],
    ai_insights: '30 min meeting with 3 attendees. Key blocker identified: design tokens.',
    meeting_type: 'standup', sentiment: 'positive', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: '2', type: 'meeting', title: 'Morning Standup — Platform Team', date: '2026-04-02T09:30:00Z',
    duration_minutes: 15, duration_display: '15m', attendees: ['Dave', 'Eve', 'Frank'],
    summary: 'Quick sync. All on track. Eve flagged a potential issue with the CDN config.',
    action_items: [{ task: 'Check CDN config', assignee: 'Eve', done: false }],
    ai_insights: '15 min standup. One action item flagged.',
    meeting_type: 'standup', sentiment: 'neutral', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: '3', type: 'meeting', title: 'Sales Demo — Acme Corp', date: '2026-04-01T14:00:00Z',
    duration_minutes: 45, duration_display: '45m', attendees: ['Alice', 'John (Acme)', 'Sarah (Acme)'],
    summary: 'Product demo for Acme Corp. They were very interested in the automation features. Requested a custom integration with their Salesforce instance.',
    action_items: [{ task: 'Send proposal to Acme', assignee: 'Alice', done: false }, { task: 'Prepare Salesforce integration estimate', assignee: 'Bob', done: false }],
    ai_insights: 'Positive sentiment. High buying intent detected. Follow up within 48 hours.',
    meeting_type: 'sales', sentiment: 'positive', has_external_participants: true, external_domains: ['acme.com'], fathom_url: 'https://fathom.video/demo1', share_url: null,
  },
  {
    id: '4', type: 'meeting', title: 'Enterprise Deal Review — Globex', date: '2026-03-28T16:00:00Z',
    duration_minutes: 60, duration_display: '1h', attendees: ['Charlie', 'Mike (Globex)', 'Lisa (Globex)', 'Tom'],
    summary: 'Deep dive into Globex requirements. They need SOC2 compliance documentation and custom SLAs. Budget approved on their end.',
    action_items: [{ task: 'Send SOC2 docs', assignee: 'Charlie', done: true }, { task: 'Draft custom SLA', assignee: 'Tom', done: false }],
    ai_insights: '1 hour meeting. Deal likely to close in Q2. Budget confirmed.',
    meeting_type: 'sales', sentiment: 'positive', has_external_participants: true, external_domains: ['globex.com'], fathom_url: null, share_url: 'https://share.meeting/globex-review',
  },
  {
    id: '5', type: 'meeting', title: 'Senior Frontend Interview — Jane Doe', date: '2026-03-30T11:00:00Z',
    duration_minutes: 60, duration_display: '1h', attendees: ['Bob', 'Eve', 'Jane Doe'],
    summary: 'Strong candidate. Excellent React/TypeScript skills. Some gaps in system design but very coachable. Recommended to proceed to final round.',
    action_items: [{ task: 'Submit interview scorecard', assignee: 'Bob', done: true }, { task: 'Schedule final round', assignee: 'Eve', done: false }],
    ai_insights: 'Candidate scored 4.2/5. Strengths: React, testing. Gaps: system design.',
    meeting_type: 'external', sentiment: 'positive', has_external_participants: true, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: '6', type: 'meeting', title: 'All-Hands — Q1 Retrospective', date: '2026-03-27T15:00:00Z',
    duration_minutes: 90, duration_display: '1h 30m', attendees: ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'Tom'],
    summary: 'Reviewed Q1 achievements. Revenue up 23%. Shipped 4 major features. Team satisfaction at 8.2/10. Areas to improve: documentation and onboarding.',
    action_items: [{ task: 'Create onboarding checklist', assignee: 'Dave', done: false }, { task: 'Assign doc owners', assignee: 'Frank', done: false }],
    ai_insights: '7 attendees, longest meeting this month. High engagement. 2 action items created.',
    meeting_type: 'team', sentiment: 'positive', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: '7', type: 'meeting', title: '1:1 — Alice & Bob', date: '2026-04-02T13:00:00Z',
    duration_minutes: 30, duration_display: '30m', attendees: ['Alice', 'Bob'],
    summary: 'Career growth discussion. Bob interested in moving to tech lead role. Discussed timeline and skill gaps. Alice to connect Bob with mentoring program.',
    action_items: [{ task: 'Enroll Bob in leadership program', assignee: 'Alice', done: false }],
    ai_insights: 'Regular 1:1. Career development discussion. Follow up in 2 weeks.',
    meeting_type: '1-on-1', sentiment: 'positive', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: '8', type: 'meeting', title: '1:1 — Charlie & Eve', date: '2026-03-31T10:30:00Z',
    duration_minutes: 25, duration_display: '25m', attendees: ['Charlie', 'Eve'],
    summary: 'Sprint blockers review. Eve needs access to production logs. Charlie approved and will set up by EOD.',
    action_items: [{ task: 'Grant Eve prod log access', assignee: 'Charlie', done: true }],
    ai_insights: 'Quick sync. One blocker resolved.',
    meeting_type: '1-on-1', sentiment: 'neutral', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: '9', type: 'meeting', title: 'Sprint Planning — Week 14', date: '2026-03-29T09:00:00Z',
    duration_minutes: 60, duration_display: '1h', attendees: ['Alice', 'Bob', 'Charlie', 'Dave'],
    summary: 'Planned 18 story points for the sprint. Focus areas: payment integration, performance optimization, and bug fixes. Capacity adjusted for Dave\'s PTO.',
    action_items: [{ task: 'Create Jira tickets for sprint', assignee: 'Alice', done: true }, { task: 'Set up perf monitoring', assignee: 'Dave', done: false }],
    ai_insights: '18 story points planned. Team velocity avg: 16. Slightly ambitious.',
    meeting_type: 'planning', sentiment: 'neutral', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: '10', type: 'meeting', title: 'Design Review — Dashboard v2', date: '2026-03-26T14:30:00Z',
    duration_minutes: 45, duration_display: '45m', attendees: ['Eve', 'Frank', 'Alice'],
    summary: 'Reviewed new dashboard designs. Approved the dark theme direction. Requested more contrast on secondary text. Frank to update Figma by Thursday.',
    action_items: [{ task: 'Update Figma with contrast fixes', assignee: 'Frank', done: false }, { task: 'Review updated designs', assignee: 'Alice', done: false }],
    ai_insights: 'Design approved with minor revisions. Dark theme confirmed.',
    meeting_type: 'team', sentiment: 'positive', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
];
