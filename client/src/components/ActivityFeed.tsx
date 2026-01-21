import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeData, statusColors } from '@/lib/mockData';
import { Activity, ChevronDown, ChevronUp, Package, Users, GitBranch, Clock, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActivityFeedProps {
  nodes: NodeData[];
  onNodeSelect: (node: NodeData) => void;
}

interface AggregatedActivity {
  id: string;
  agentName: string;
  agentId: string;
  action: string;
  description: string;
  timestamp: string;
  status: string;
}

export function ActivityFeed({ nodes, onNodeSelect }: ActivityFeedProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Aggregate recent activity from all agents
  const recentActivity: AggregatedActivity[] = nodes
    .flatMap(node => 
      node.activityLog.map(entry => ({
        id: `${node.id}-${entry.id}`,
        agentName: node.name,
        agentId: node.id,
        action: entry.action,
        description: entry.description,
        timestamp: entry.timestamp,
        status: node.agentStatus,
      }))
    )
    .sort((a, b) => {
      const aMin = parseInt(a.timestamp.replace(/[^\d]/g, '')) || 0;
      const bMin = parseInt(b.timestamp.replace(/[^\d]/g, '')) || 0;
      return aMin - bMin;
    })
    .slice(0, 20);

  const actionIcons: Record<string, React.ReactNode> = {
    bead_started: <Package className="w-3 h-3 text-blue-400" />,
    bead_completed: <Package className="w-3 h-3 text-emerald-400" />,
    handoff_sent: <Users className="w-3 h-3 text-amber-400" />,
    handoff_received: <Users className="w-3 h-3 text-cyan-400" />,
    status_changed: <Bot className="w-3 h-3 text-purple-400" />,
    convoy_joined: <GitBranch className="w-3 h-3 text-pink-400" />,
    hook_updated: <GitBranch className="w-3 h-3 text-emerald-400" />,
  };

  const handleAgentClick = (agentId: string) => {
    const node = nodes.find(n => n.id === agentId);
    if (node) {
      onNodeSelect(node);
    }
  };

  return (
    <div className="hud-panel p-0 overflow-hidden w-72">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
        data-testid="button-toggle-activity"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase text-foreground">Activity Feed</span>
          <Badge variant="outline" className="rounded-none text-[8px] border-primary/30 text-primary">
            {recentActivity.length}
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/5"
          >
            <div className="max-h-64 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-xs">
                  No recent activity
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentActivity.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => handleAgentClick(activity.agentId)}
                      className="w-full p-3 text-left hover:bg-white/5 transition-colors"
                      data-testid={`activity-${activity.id}`}
                    >
                      <div className="flex items-start gap-2">
                        {actionIcons[activity.action] || <Clock className="w-3 h-3 text-muted-foreground" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono text-primary truncate max-w-[100px]">
                              {activity.agentName}
                            </span>
                            <div 
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: statusColors[activity.status as keyof typeof statusColors] || '#6b7280' }}
                            />
                            <span className="text-[9px] text-muted-foreground ml-auto">
                              {activity.timestamp}
                            </span>
                          </div>
                          <p className="text-[10px] text-foreground/70 truncate">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
