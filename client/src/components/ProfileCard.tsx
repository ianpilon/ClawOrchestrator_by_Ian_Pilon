import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { NodeData, statusColors, convoyColors } from '@/lib/mockData';
import { X, Database, Sparkles, Route, Users, Bot, GitBranch, Package, Mail, Clock, CheckCircle, AlertCircle, Pause, Play, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ProfileCardProps {
  node: NodeData | null;
  onClose: () => void;
  graphData?: { nodes: NodeData[]; links: { source: string; target: string }[] };
  onNodeSelect?: (node: NodeData) => void;
}

type TabType = 'overview' | 'beads' | 'mailbox';

export function ProfileCard({ node, onClose, graphData, onNodeSelect }: ProfileCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!node) return null;

  // Find connected nodes
  const connections: NodeData[] = [];
  if (graphData) {
    const connectedIds = new Set<string>();
    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      if (sourceId === node.id) connectedIds.add(targetId);
      if (targetId === node.id) connectedIds.add(sourceId);
    });
    graphData.nodes.forEach(n => {
      if (connectedIds.has(n.id) && n.id !== node.id) {
        connections.push(n);
      }
    });
  }

  const statusColor = statusColors[node.agentStatus] || '#6b7280';
  const convoyColor = node.currentConvoy ? convoyColors[node.currentConvoy.id] || '#6b7280' : '#6b7280';

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'tween', ease: 'circOut', duration: 0.3 }}
      className="fixed right-6 top-24 bottom-24 w-[380px] z-50 pointer-events-auto"
    >
      <div className="h-full bg-[#1a1c23]/95 backdrop-blur-xl border border-white/10 text-foreground shadow-2xl overflow-hidden flex flex-col relative">
        {/* Tactical Corner Markers */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50 z-10" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/50 z-10" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/50 z-10" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50 z-10" />

        {/* Header */}
        <div className="p-4 border-b border-white/5 bg-white/[0.02] relative flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 hover:bg-white/5 text-muted-foreground hover:text-foreground rounded-none"
            data-testid="button-close-profile"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-4 items-center">
             <div className="relative">
                <img
                  src={node.img}
                  alt={node.name}
                  className={`w-16 h-16 rounded-full object-cover border-2 bg-[#0d0f12] ${node.agentRole === 'mayor' ? 'border-amber-500' : 'border-white/10'}`}
                />
                <div 
                  className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1a1c23]"
                  style={{ backgroundColor: statusColor }}
                />
             </div>
             <div className="flex-1">
                <div className="text-[10px] font-mono text-primary/70 mb-1 tracking-widest flex items-center gap-1">
                  <Bot className="w-3 h-3" /> 
                  {node.agentRole === 'mayor' ? 'COORDINATOR' : 'POLECAT'} 
                  <span className="text-muted-foreground">•</span>
                  <span style={{ color: statusColor }} className="uppercase">{node.agentStatus}</span>
                </div>
                <h2 className="text-xl font-bold font-sans uppercase tracking-wide text-foreground" data-testid="text-profile-name">{node.name}</h2>
                <div className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                  {node.role}
                  {node.isEphemeral && (
                    <Badge variant="outline" className="rounded-none text-[8px] border-amber-500/30 text-amber-500">EPHEMERAL</Badge>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 flex-shrink-0">
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            icon={<Database className="w-3 h-3" />}
            label="Overview"
          />
          <TabButton 
            active={activeTab === 'beads'} 
            onClick={() => setActiveTab('beads')}
            icon={<Package className="w-3 h-3" />}
            label="Beads"
            badge={node.beads.length}
          />
          <TabButton 
            active={activeTab === 'mailbox'} 
            onClick={() => setActiveTab('mailbox')}
            icon={<Mail className="w-3 h-3" />}
            label="Mailbox"
            badge={node.mailbox.filter(m => !m.read).length}
          />
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {activeTab === 'overview' && <OverviewTab node={node} connections={connections} onNodeSelect={onNodeSelect} convoyColor={convoyColor} />}
          {activeTab === 'beads' && <BeadsTab node={node} />}
          {activeTab === 'mailbox' && <MailboxTab node={node} />}
        </div>
        
        {/* Footer */}
        <div className="p-2 border-t border-white/5 bg-[#16181d] text-[10px] font-mono text-center text-muted-foreground/50 flex-shrink-0">
           // SPAWNED {node.spawnTime} // COMPLETION: {node.taskCompletionRate}%
        </div>
      </div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-3 text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-b-2 ${
        active 
          ? 'text-primary border-primary bg-primary/5' 
          : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-white/[0.02]'
      }`}
      data-testid={`tab-${label.toLowerCase()}`}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary text-[8px] rounded-full">{badge}</span>
      )}
    </button>
  );
}

function OverviewTab({ node, connections, onNodeSelect, convoyColor }: { node: NodeData; connections?: NodeData[]; onNodeSelect?: (node: NodeData) => void; convoyColor: string }) {
  return (
    <div className="p-6 space-y-6">
      {/* Agent Context */}
      <div className="grid grid-cols-2 gap-3">
         <div className="bg-white/[0.02] p-3 border border-white/5">
            <div className="text-[10px] text-muted-foreground uppercase font-mono mb-1">Assigned Rig</div>
            <div className="text-sm font-bold text-foreground flex items-center gap-2">
               <GitBranch className="w-3 h-3 text-primary" /> 
               {node.assignedRig?.name || 'None'}
            </div>
            {node.assignedRig && (
              <div className="text-[9px] text-muted-foreground mt-1 truncate">{node.assignedRig.repo}</div>
            )}
         </div>
         <div className="bg-white/[0.02] p-3 border border-white/5">
            <div className="text-[10px] text-muted-foreground uppercase font-mono mb-1">Current Convoy</div>
            <div className="text-sm font-bold text-foreground flex items-center gap-2">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: convoyColor }} />
               {node.currentConvoy?.name?.split(' ')[0] || 'None'}
            </div>
            {node.currentConvoy && (
              <Badge 
                variant="outline" 
                className="rounded-none text-[8px] mt-1"
                style={{ borderColor: convoyColor + '50', color: convoyColor }}
              >
                {node.currentConvoy.priority}
              </Badge>
            )}
         </div>
      </div>

      {/* Hook State */}
      {node.hookState && (
        <>
          <Separator className="bg-white/5" />
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <GitBranch className="w-3 h-3" /> Hook State
            </h3>
            <div className="bg-white/[0.02] border border-white/5 p-3 space-y-2">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">Last Commit</span>
                <span className="text-primary">{node.hookState.lastCommit}</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">Worktree</span>
                <span className="text-foreground truncate max-w-[150px]">{node.hookState.worktree}</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">Files Modified</span>
                <span className="text-amber-500">{node.hookState.filesModified}</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="text-emerald-500">{node.hookState.lastSync}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bead Summary */}
      <Separator className="bg-white/5" />
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
           <Package className="w-3 h-3" /> Bead Progress
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <BeadStat label="Assigned" value={node.beads.filter(b => b.status === 'assigned').length} color="text-blue-400" />
          <BeadStat label="Active" value={node.beads.filter(b => b.status === 'in_progress').length} color="text-amber-400" />
          <BeadStat label="Done" value={node.beads.filter(b => b.status === 'completed').length} color="text-emerald-400" />
          <BeadStat label="Blocked" value={node.beads.filter(b => b.status === 'blocked').length} color="text-red-400" />
        </div>
        <TechBar label="Completion Rate" value={node.taskCompletionRate} />
      </div>

      {/* Connected Agents */}
      {connections && connections.length > 0 && (
        <>
          <Separator className="bg-white/5" />
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Users className="w-3 h-3" /> Handoff Chain ({connections.length})
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {connections.slice(0, 5).map((conn) => (
                <button
                  key={conn.id}
                  onClick={() => onNodeSelect?.(conn)}
                  className="w-full flex items-center gap-3 p-2 bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-colors text-left"
                  data-testid={`connection-${conn.id}`}
                >
                  <img src={conn.img} alt={conn.name} className="w-8 h-8 rounded-full object-cover border border-white/10 bg-[#0d0f12]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{conn.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{conn.role} • {conn.agentStatus}</div>
                  </div>
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusColors[conn.agentStatus] }}
                  />
                </button>
              ))}
              {connections.length > 5 && (
                <div className="text-[10px] text-muted-foreground text-center py-1">
                  +{connections.length - 5} more agents
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Activity Log */}
      <Separator className="bg-white/5" />
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
           <Route className="w-3 h-3" /> Recent Activity
        </h3>
        <div className="space-y-2">
          {node.activityLog.slice(0, 4).map((entry, i) => (
            <div key={entry.id} className="flex items-start gap-2 text-[10px]">
              <span className="text-muted-foreground font-mono w-12 flex-shrink-0">{entry.timestamp}</span>
              <span className="text-foreground/70">{entry.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mayor Badge */}
      {node.agentRole === 'mayor' && (
        <>
          <Separator className="bg-white/5" />
          <div className="bg-amber-500/10 border border-amber-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-mono text-amber-500 uppercase tracking-wider font-bold">Primary Coordinator</span>
            </div>
            <p className="text-[11px] text-foreground/70 leading-relaxed">
              {node.journey.narrative}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function BeadsTab({ node }: { node: NodeData }) {
  const statusIcons = {
    assigned: <Circle className="w-3 h-3 text-blue-400" />,
    in_progress: <Play className="w-3 h-3 text-amber-400" />,
    completed: <CheckCircle className="w-3 h-3 text-emerald-400" />,
    blocked: <AlertCircle className="w-3 h-3 text-red-400" />,
  };

  const priorityColors = {
    low: 'border-gray-500/30 text-gray-400',
    medium: 'border-blue-500/30 text-blue-400',
    high: 'border-amber-500/30 text-amber-400',
    critical: 'border-red-500/30 text-red-400',
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Package className="w-3 h-3" /> Assigned Beads
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground">{node.beads.length} total</span>
      </div>

      {node.beads.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No beads assigned
        </div>
      ) : (
        <div className="space-y-2">
          {node.beads.map((bead, i) => (
            <div 
              key={bead.id}
              className="p-3 bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start gap-3">
                {statusIcons[bead.status]}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-relaxed">{bead.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="outline" 
                      className={`rounded-none text-[8px] uppercase ${priorityColors[bead.priority]}`}
                    >
                      {bead.priority}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground uppercase">{bead.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MailboxTab({ node }: { node: NodeData }) {
  const typeIcons: Record<string, React.ReactNode> = {
    task_assignment: <Package className="w-3 h-3 text-blue-400" />,
    handoff: <Users className="w-3 h-3 text-emerald-400" />,
    status_check: <Clock className="w-3 h-3 text-amber-400" />,
    priority_change: <AlertCircle className="w-3 h-3 text-red-400" />,
    dependency: <GitBranch className="w-3 h-3 text-purple-400" />,
    convoy_update: <Route className="w-3 h-3 text-cyan-400" />,
  };

  const unreadCount = node.mailbox.filter(m => !m.read).length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Mail className="w-3 h-3" /> Messages
        </h3>
        {unreadCount > 0 && (
          <Badge variant="outline" className="rounded-none text-[8px] border-primary/30 text-primary">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      {node.mailbox.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Mailbox empty
        </div>
      ) : (
        <div className="space-y-2">
          {node.mailbox.map((message, i) => (
            <div 
              key={message.id}
              className={`p-3 border transition-colors ${message.read ? 'bg-white/[0.01] border-white/5' : 'bg-primary/5 border-primary/20'}`}
            >
              <div className="flex items-start gap-3">
                {typeIcons[message.type] || <Mail className="w-3 h-3" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-primary">{message.from}</span>
                    <span className="text-[9px] text-muted-foreground">{message.timestamp}</span>
                    {!message.read && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{message.content}</p>
                  <Badge 
                    variant="outline" 
                    className="rounded-none text-[8px] uppercase mt-2 border-white/10 text-muted-foreground"
                  >
                    {message.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Handoff Info */}
      <Separator className="bg-white/5" />
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest">
          Handoff Chain
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.02] p-3 border border-white/5">
            <div className="text-[9px] text-muted-foreground uppercase mb-1">Upstream</div>
            <div className="text-xs font-mono text-foreground">
              {node.upstreamAgentId || 'None'}
            </div>
          </div>
          <div className="bg-white/[0.02] p-3 border border-white/5">
            <div className="text-[9px] text-muted-foreground uppercase mb-1">Downstream</div>
            <div className="text-xs font-mono text-foreground">
              {node.downstreamAgentId || 'None'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BeadStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
      <div className="text-[8px] text-muted-foreground uppercase">{label}</div>
    </div>
  );
}

function TechBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono uppercase">
        <span className="text-muted-foreground/70">{label}</span>
        <span className="text-primary">{value}%</span>
      </div>
      <div className="h-1 w-full bg-white/10 flex gap-0.5">
        {Array.from({ length: 20 }).map((_, i) => (
           <div 
             key={i} 
             className={`h-full flex-1 ${i < (value / 5) ? 'bg-primary/80' : 'bg-transparent'}`} 
           />
        ))}
      </div>
    </div>
  );
}
