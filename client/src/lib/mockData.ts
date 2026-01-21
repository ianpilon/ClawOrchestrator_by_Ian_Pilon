// Gas Town Multi-Agent Orchestration System
// Agent types: Mayor (coordinator), Polecats (ephemeral workers)

// Agent avatars using robot/bot style icons
const agentAvatars = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=polecat1&backgroundColor=1a1c23',
  'https://api.dicebear.com/7.x/bottts/svg?seed=polecat2&backgroundColor=1a1c23',
  'https://api.dicebear.com/7.x/bottts/svg?seed=polecat3&backgroundColor=1a1c23',
  'https://api.dicebear.com/7.x/bottts/svg?seed=polecat4&backgroundColor=1a1c23',
  'https://api.dicebear.com/7.x/bottts/svg?seed=polecat5&backgroundColor=1a1c23',
  'https://api.dicebear.com/7.x/bottts/svg?seed=polecat6&backgroundColor=1a1c23',
  'https://api.dicebear.com/7.x/bottts/svg?seed=polecat7&backgroundColor=1a1c23',
  'https://api.dicebear.com/7.x/bottts/svg?seed=polecat8&backgroundColor=1a1c23',
];

const getAgentAvatar = (name: string) => {
  const index = Math.abs(name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0)) % agentAvatars.length;
  return agentAvatars[index];
};

// Agent naming for Polecats
const polecatPrefixes = ['Swift', 'Shadow', 'Spark', 'Circuit', 'Flux', 'Pulse', 'Vector', 'Cipher', 'Echo', 'Nova', 'Helix', 'Ion', 'Nexus', 'Quantum', 'Synth', 'Delta', 'Omega', 'Prism', 'Core', 'Apex'];
const polecatSuffixes = ['Runner', 'Worker', 'Agent', 'Bot', 'Unit', 'Node', 'Process', 'Handler', 'Executor', 'Builder'];

// Agent roles in Gas Town
export type AgentRole = 'mayor' | 'polecat';
export type AgentStatus = 'active' | 'idle' | 'waiting' | 'completed';

// Rigs (project containers)
const rigs = [
  { id: 'rig-frontend', name: 'Frontend App', repo: 'github.com/gastown/frontend' },
  { id: 'rig-backend', name: 'Backend API', repo: 'github.com/gastown/backend' },
  { id: 'rig-infra', name: 'Infrastructure', repo: 'github.com/gastown/infra' },
  { id: 'rig-docs', name: 'Documentation', repo: 'github.com/gastown/docs' },
  { id: 'rig-ml', name: 'ML Pipeline', repo: 'github.com/gastown/ml-pipeline' },
];

// Convoys (work tracking units)
const convoys = [
  { id: 'convoy-auth', name: 'Auth System Overhaul', priority: 'high', beadCount: 8 },
  { id: 'convoy-perf', name: 'Performance Optimization', priority: 'medium', beadCount: 12 },
  { id: 'convoy-ui', name: 'UI Redesign', priority: 'high', beadCount: 15 },
  { id: 'convoy-api', name: 'API v2 Migration', priority: 'critical', beadCount: 20 },
  { id: 'convoy-test', name: 'Test Coverage', priority: 'low', beadCount: 6 },
  { id: 'convoy-docs', name: 'Documentation Update', priority: 'medium', beadCount: 10 },
];

// Bead templates (git-backed issues)
const beadTemplates = [
  { title: 'Implement user session management', status: 'in_progress' },
  { title: 'Fix memory leak in worker pool', status: 'assigned' },
  { title: 'Add rate limiting middleware', status: 'completed' },
  { title: 'Refactor database connection pool', status: 'in_progress' },
  { title: 'Update API documentation', status: 'assigned' },
  { title: 'Add unit tests for auth module', status: 'completed' },
  { title: 'Optimize image processing pipeline', status: 'in_progress' },
  { title: 'Implement webhook handlers', status: 'assigned' },
  { title: 'Fix race condition in cache layer', status: 'in_progress' },
  { title: 'Add logging instrumentation', status: 'completed' },
];

// Message templates for mailbox
const messageTemplates = [
  { from: 'Mayor', type: 'task_assignment', content: 'New bead assigned: Implement user session management' },
  { from: 'Mayor', type: 'priority_change', content: 'Convoy priority elevated to CRITICAL' },
  { from: 'Polecat-7', type: 'handoff', content: 'Completed auth module, ready for integration' },
  { from: 'Mayor', type: 'status_check', content: 'Requesting progress update on current bead' },
  { from: 'Polecat-12', type: 'dependency', content: 'Blocked: waiting for API endpoint from your task' },
  { from: 'Mayor', type: 'convoy_update', content: 'New beads added to convoy, review assignments' },
];

// Activity log templates
const activityTemplates = [
  { action: 'bead_started', description: 'Started work on bead' },
  { action: 'bead_completed', description: 'Completed bead and pushed to hook' },
  { action: 'handoff_sent', description: 'Sent handoff to downstream agent' },
  { action: 'handoff_received', description: 'Received handoff from upstream agent' },
  { action: 'status_changed', description: 'Status changed to' },
  { action: 'convoy_joined', description: 'Joined convoy' },
  { action: 'hook_updated', description: 'Updated persistent hook state' },
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export interface Bead {
  id: string;
  title: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface MailboxMessage {
  id: string;
  from: string;
  type: 'task_assignment' | 'handoff' | 'status_check' | 'priority_change' | 'dependency' | 'convoy_update';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  details?: string;
}

export interface HookState {
  lastCommit: string;
  worktree: string;
  filesModified: number;
  lastSync: string;
}

export interface NodeData {
  id: string;
  name: string;
  role: string;
  company: string;
  img: string;
  exceptional: boolean;
  skills: string[];
  psychographic: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    innovationScore: number;
    leadershipPotential: number;
  };
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    website: string;
  };
  yearsExperience: number;
  location: string;
  clusterGroup: number;
  journey: {
    milestones: { version: string; event: string; category: string }[];
    narrative: string;
    exceptionalTraits: string[];
  };
  // Gas Town specific fields
  agentRole: AgentRole;
  agentStatus: AgentStatus;
  assignedRig: { id: string; name: string; repo: string } | null;
  currentConvoy: { id: string; name: string; priority: string } | null;
  beads: Bead[];
  mailbox: MailboxMessage[];
  activityLog: ActivityLogEntry[];
  hookState: HookState | null;
  upstreamAgentId: string | null;
  downstreamAgentId: string | null;
  isEphemeral: boolean;
  spawnTime: string;
  taskCompletionRate: number;
}

function generateBeads(count: number): Bead[] {
  const beads: Bead[] = [];
  const statuses: Bead['status'][] = ['assigned', 'in_progress', 'completed', 'blocked'];
  const priorities: Bead['priority'][] = ['low', 'medium', 'high', 'critical'];
  
  for (let i = 0; i < count; i++) {
    const template = randomItem(beadTemplates);
    beads.push({
      id: `bead-${Date.now()}-${i}`,
      title: template.title,
      status: randomItem(statuses),
      priority: randomItem(priorities),
    });
  }
  return beads;
}

function generateMailbox(count: number): MailboxMessage[] {
  const messages: MailboxMessage[] = [];
  const hours = [1, 2, 3, 5, 8, 12, 24];
  
  for (let i = 0; i < count; i++) {
    const template = randomItem(messageTemplates);
    messages.push({
      id: `msg-${Date.now()}-${i}`,
      from: template.from,
      type: template.type as MailboxMessage['type'],
      content: template.content,
      timestamp: `${randomItem(hours)}h ago`,
      read: Math.random() > 0.4,
    });
  }
  return messages;
}

function generateActivityLog(count: number): ActivityLogEntry[] {
  const entries: ActivityLogEntry[] = [];
  const minutes = [5, 10, 15, 30, 45, 60, 90, 120];
  
  for (let i = 0; i < count; i++) {
    const template = randomItem(activityTemplates);
    entries.push({
      id: `activity-${Date.now()}-${i}`,
      action: template.action,
      description: template.description,
      timestamp: `${randomItem(minutes)}m ago`,
    });
  }
  return entries.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));
}

function generateHookState(): HookState {
  const commits = ['a1b2c3d', 'e4f5g6h', 'i7j8k9l', 'm0n1o2p', 'q3r4s5t'];
  return {
    lastCommit: randomItem(commits),
    worktree: `/hooks/worktree-${randomInt(1, 50)}`,
    filesModified: randomInt(1, 20),
    lastSync: `${randomInt(1, 30)}m ago`,
  };
}

// Create The Mayor - the primary coordinator
function createMayor(): NodeData {
  return {
    id: 'mayor',
    name: 'The Mayor',
    role: 'Primary Coordinator',
    company: 'Gas Town Core',
    img: 'https://api.dicebear.com/7.x/bottts/svg?seed=mayor&backgroundColor=1a1c23&baseColor=f59e0b',
    exceptional: true,
    skills: ['Orchestration', 'Task Distribution', 'Agent Coordination', 'State Management', 'Conflict Resolution'],
    psychographic: {
      openness: 95,
      conscientiousness: 100,
      extraversion: 90,
      agreeableness: 85,
      neuroticism: 5,
      innovationScore: 98,
      leadershipPotential: 100,
    },
    social: {
      github: 'github.com/gastown/mayor',
      linkedin: 'linkedin.com/company/gastown',
      twitter: '@gastown_mayor',
      website: 'gastown.dev/mayor',
    },
    yearsExperience: 1,
    location: 'Core System',
    clusterGroup: 0,
    journey: {
      milestones: [
        { version: 'v1.0', event: 'Initial deployment as central coordinator', category: 'launch' },
        { version: 'v1.5', event: 'Added multi-convoy management', category: 'feature' },
        { version: 'v2.0', event: 'Implemented intelligent task distribution', category: 'architecture' },
        { version: 'v2.5', event: 'Added predictive agent spawning', category: 'feature' },
      ],
      narrative: 'The Mayor is the central nervous system of Gas Town, coordinating all agent activities, managing convoys, and ensuring no work is lost through persistent git-backed state management.',
      exceptionalTraits: [
        'Manages 20-30 concurrent agents without context loss',
        'Maintains global awareness of all active convoys and beads',
        'Orchestrates complex handoffs between ephemeral workers',
        'Provides persistent context across agent restarts',
      ],
    },
    agentRole: 'mayor',
    agentStatus: 'active',
    assignedRig: null,
    currentConvoy: null,
    beads: [],
    mailbox: [],
    activityLog: generateActivityLog(10),
    hookState: generateHookState(),
    upstreamAgentId: null,
    downstreamAgentId: null,
    isEphemeral: false,
    spawnTime: '72h ago',
    taskCompletionRate: 100,
  };
}

// Create a Polecat (ephemeral worker agent)
function createPolecat(index: number, convoyIndex: number): NodeData {
  const prefix = randomItem(polecatPrefixes);
  const suffix = randomItem(polecatSuffixes);
  const name = `${prefix} ${suffix}`;
  const status: AgentStatus = randomItem(['active', 'idle', 'waiting', 'completed']);
  const rig = randomItem(rigs);
  const convoy = convoys[convoyIndex % convoys.length];
  const beadCount = randomInt(1, 5);
  const messageCount = randomInt(0, 4);
  
  const beads = generateBeads(beadCount);
  const completedBeads = beads.filter(b => b.status === 'completed').length;
  const completionRate = beadCount > 0 ? Math.round((completedBeads / beadCount) * 100) : 0;

  return {
    id: `polecat-${index}`,
    name: name,
    role: 'Ephemeral Worker',
    company: convoy.name,
    img: getAgentAvatar(name),
    exceptional: status === 'completed' && completionRate === 100,
    skills: ['Code Generation', 'Task Execution', 'Git Operations', 'Issue Resolution'],
    psychographic: {
      openness: randomInt(60, 90),
      conscientiousness: randomInt(70, 95),
      extraversion: randomInt(30, 70),
      agreeableness: randomInt(60, 90),
      neuroticism: randomInt(10, 40),
      innovationScore: randomInt(60, 95),
      leadershipPotential: randomInt(20, 60),
    },
    social: {
      github: `github.com/gastown/${name.toLowerCase().replace(' ', '-')}`,
      linkedin: 'linkedin.com/company/gastown',
      twitter: `@${prefix.toLowerCase()}_${suffix.toLowerCase()}`,
      website: 'gastown.dev',
    },
    yearsExperience: 0,
    location: rig.name,
    clusterGroup: convoyIndex % convoys.length,
    journey: {
      milestones: [
        { version: 'spawn', event: `Spawned to work on ${convoy.name}`, category: 'launch' },
        { version: 'assigned', event: `Assigned ${beadCount} beads`, category: 'feature' },
        ...(completedBeads > 0 ? [{ version: 'progress', event: `Completed ${completedBeads} beads`, category: 'improvement' }] : []),
      ],
      narrative: `Ephemeral worker agent spawned to handle tasks in the ${convoy.name} convoy. Will complete assigned beads then gracefully terminate.`,
      exceptionalTraits: status === 'completed' ? [
        'Completed all assigned beads',
        'Clean handoff to downstream agents',
        'Maintained hook state integrity',
      ] : [
        'Focused single-task execution',
        'Maintains git-backed progress',
      ],
    },
    agentRole: 'polecat',
    agentStatus: status,
    assignedRig: rig,
    currentConvoy: convoy,
    beads: beads,
    mailbox: generateMailbox(messageCount),
    activityLog: generateActivityLog(randomInt(3, 8)),
    hookState: generateHookState(),
    upstreamAgentId: index > 0 ? `polecat-${index - 1}` : 'mayor',
    downstreamAgentId: Math.random() > 0.5 ? `polecat-${index + 1}` : null,
    isEphemeral: true,
    spawnTime: `${randomInt(1, 48)}h ago`,
    taskCompletionRate: completionRate,
  };
}

export function generateGraphData() {
  const nodes: NodeData[] = [];
  const links: { source: string; target: string }[] = [];

  // Add The Mayor first
  const mayor = createMayor();
  nodes.push(mayor);

  // Generate Polecats for each convoy
  let polecatIndex = 0;
  convoys.forEach((convoy, convoyIndex) => {
    const polecatCount = randomInt(4, 8);
    
    for (let i = 0; i < polecatCount; i++) {
      const polecat = createPolecat(polecatIndex, convoyIndex);
      nodes.push(polecat);
      
      // Connect to Mayor
      links.push({
        source: mayor.id,
        target: polecat.id,
      });
      
      // Connect some polecats within the same convoy (handoff chains)
      if (i > 0 && Math.random() > 0.3) {
        links.push({
          source: nodes[nodes.length - 2].id,
          target: polecat.id,
        });
      }
      
      polecatIndex++;
    }
  });

  // Add some cross-convoy connections (dependency links)
  for (let i = 0; i < 10; i++) {
    const source = nodes[randomInt(1, nodes.length - 1)];
    const target = nodes[randomInt(1, nodes.length - 1)];
    if (source.id !== target.id && source.clusterGroup !== target.clusterGroup) {
      links.push({
        source: source.id,
        target: target.id,
      });
    }
  }

  return { nodes, links };
}

// Convoy color map for visual grouping
export const convoyColors: Record<string, string> = {
  'convoy-auth': '#f59e0b',
  'convoy-perf': '#10b981',
  'convoy-ui': '#8b5cf6',
  'convoy-api': '#ef4444',
  'convoy-test': '#06b6d4',
  'convoy-docs': '#ec4899',
};

// Status color map
export const statusColors: Record<AgentStatus, string> = {
  active: '#22c55e',
  idle: '#6b7280',
  waiting: '#f59e0b',
  completed: '#3b82f6',
};

// Export convoys and rigs for filtering
export { convoys, rigs };
