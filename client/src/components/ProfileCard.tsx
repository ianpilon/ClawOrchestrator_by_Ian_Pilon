import { motion } from 'framer-motion';
import { useState } from 'react';
import { NodeData } from '@/lib/mockData';
import { Github, Linkedin, Twitter, Globe, X, Scan, Database, MapPin, Fingerprint, Sparkles, Route, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ProfileCardProps {
  node: NodeData | null;
  onClose: () => void;
}

type TabType = 'overview' | 'journey' | 'signals';

export function ProfileCard({ node, onClose }: ProfileCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!node) return null;

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
                  className="w-16 h-16 grayscale opacity-80 border border-white/10"
                />
                <div className={`absolute -bottom-1 -right-1 w-2 h-2 ${node.exceptional ? 'bg-secondary' : 'bg-emerald-500'} border border-black`} />
             </div>
             <div>
                <div className="text-[10px] font-mono text-primary/70 mb-1 tracking-widest">ID: {node.id.toUpperCase()}</div>
                <h2 className="text-xl font-bold font-sans uppercase tracking-wide text-foreground" data-testid="text-profile-name">{node.name}</h2>
                <div className="text-xs font-mono text-muted-foreground">{node.role}</div>
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
            active={activeTab === 'journey'} 
            onClick={() => setActiveTab('journey')}
            icon={<Route className="w-3 h-3" />}
            label="Journey"
          />
          <TabButton 
            active={activeTab === 'signals'} 
            onClick={() => setActiveTab('signals')}
            icon={<Sparkles className="w-3 h-3" />}
            label="Signals"
          />
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {activeTab === 'overview' && <OverviewTab node={node} />}
          {activeTab === 'journey' && <JourneyTab node={node} />}
          {activeTab === 'signals' && <SignalsTab node={node} />}
        </div>
        
        {/* Footer */}
        <div className="p-2 border-t border-white/5 bg-[#16181d] text-[10px] font-mono text-center text-muted-foreground/50 flex-shrink-0">
           // ENCRYPTED CONNECTION ESTABLISHED //
        </div>
      </div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
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
    </button>
  );
}

function OverviewTab({ node }: { node: NodeData }) {
  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white/[0.02] p-2 border border-white/5">
            <div className="text-[10px] text-muted-foreground uppercase font-mono mb-1">Clearance</div>
            <div className="text-sm font-bold text-foreground flex items-center gap-2">
               <Shield /> {node.exceptional ? 'LEVEL 5' : 'LEVEL 1'}
            </div>
         </div>
         <div className="bg-white/[0.02] p-2 border border-white/5">
            <div className="text-[10px] text-muted-foreground uppercase font-mono mb-1">Sector</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
               <MapPin className="w-3 h-3 text-primary" /> {node.location.split(' ')[0].toUpperCase()}
            </div>
         </div>
      </div>

      <Separator className="bg-white/5" />

      {/* Performance Index */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
           <Database className="w-3 h-3" /> Performance Index
        </h3>
        
        <div className="space-y-3">
           <TechBar label="Innovation Cap" value={node.psychographic.innovationScore} />
           <TechBar label="Command Leadership" value={node.psychographic.leadershipPotential} />
           <TechBar label="Cognitive Flex" value={node.psychographic.openness} />
        </div>
      </div>

       {/* Skills Matrix */}
       <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
           <Fingerprint className="w-3 h-3" /> Competency Matrix
        </h3>
        <div className="flex flex-wrap gap-1">
          {node.skills.map((skill, i) => (
            <Badge key={i} variant="outline" className="rounded-none border-white/10 text-[10px] font-mono uppercase bg-transparent text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="bg-white/5" />

      {/* Comms Channels */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
           <Scan className="w-3 h-3" /> Secure Comms
        </h3>
        <div className="grid grid-cols-2 gap-2">
           <SocialBtn icon={Github} label="Repo" href={`https://${node.social.github}`} />
           <SocialBtn icon={Linkedin} label="Net" href={`https://${node.social.linkedin}`} />
           <SocialBtn icon={Twitter} label="Feed" href={`https://${node.social.twitter}`} />
           <SocialBtn icon={Globe} label="Link" href={`https://${node.social.website}`} />
        </div>
      </div>
    </div>
  );
}

function JourneyTab({ node }: { node: NodeData }) {
  const categoryColors: Record<string, string> = {
    founder: 'text-amber-400 border-amber-400/30',
    leadership: 'text-blue-400 border-blue-400/30',
    research: 'text-purple-400 border-purple-400/30',
    engineering: 'text-emerald-400 border-emerald-400/30',
    innovation: 'text-primary border-primary/30',
    thought_leader: 'text-rose-400 border-rose-400/30',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Synthesis Narrative */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
           <Sparkles className="w-3 h-3" /> Synthesis
        </h3>
        <div className="bg-white/[0.02] border border-white/5 p-4">
          <p className="text-sm text-foreground/80 leading-relaxed italic">
            "{node.journey.narrative}"
          </p>
        </div>
      </div>

      <Separator className="bg-white/5" />

      {/* Timeline */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
           <Route className="w-3 h-3" /> Career Timeline
        </h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[39px] top-2 bottom-2 w-px bg-white/10" />
          
          <div className="space-y-4">
            {node.journey.milestones.map((milestone, i) => (
              <div key={i} className="flex gap-4 items-start" data-testid={`milestone-${i}`}>
                <div className="w-16 text-right">
                  <span className="text-xs font-mono text-primary font-bold">{milestone.year}</span>
                </div>
                <div className="relative">
                  <div className={`w-2 h-2 border ${categoryColors[milestone.category] || 'border-white/30'} bg-[#1a1c23] z-10 relative`} />
                </div>
                <div className="flex-1 pb-2">
                  <Badge 
                    variant="outline" 
                    className={`rounded-none text-[9px] font-mono uppercase mb-1.5 ${categoryColors[milestone.category] || 'border-white/20 text-muted-foreground'}`}
                  >
                    {milestone.category.replace('_', ' ')}
                  </Badge>
                  <p className="text-xs text-foreground/70 leading-relaxed">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalsTab({ node }: { node: NodeData }) {
  return (
    <div className="p-6 space-y-6">
      {/* What Makes Them Exceptional */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
           <Zap className="w-3 h-3" /> Differentiators
        </h3>
        <p className="text-[10px] text-muted-foreground/70 font-mono">
          Non-ordinary attributes that distinguish this candidate from typical profiles
        </p>
        <div className="space-y-2">
          {node.journey.exceptionalTraits.map((trait, i) => (
            <div 
              key={i} 
              className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-colors"
              data-testid={`trait-${i}`}
            >
              <div className="w-5 h-5 flex items-center justify-center border border-primary/30 text-primary text-[10px] font-mono flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">{trait}</p>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-white/5" />

      {/* Quick Assessment */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
           <Database className="w-3 h-3" /> Signal Strength
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <SignalCard 
            label="First Mover" 
            value={node.exceptional ? 'HIGH' : 'LOW'} 
            active={node.exceptional}
          />
          <SignalCard 
            label="Scale Builder" 
            value={node.psychographic.leadershipPotential > 70 ? 'HIGH' : 'MED'} 
            active={node.psychographic.leadershipPotential > 70}
          />
          <SignalCard 
            label="Innovation" 
            value={node.psychographic.innovationScore > 85 ? 'HIGH' : 'MED'} 
            active={node.psychographic.innovationScore > 85}
          />
          <SignalCard 
            label="Risk Profile" 
            value={node.psychographic.openness > 80 ? 'BOLD' : 'STD'} 
            active={node.psychographic.openness > 80}
          />
        </div>
      </div>

      {node.exceptional && (
        <>
          <Separator className="bg-white/5" />
          <div className="bg-secondary/10 border border-secondary/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-xs font-mono text-secondary uppercase tracking-wider font-bold">High-Value Target</span>
            </div>
            <p className="text-[11px] text-foreground/70 leading-relaxed">
              This candidate exhibits multiple non-ordinary signals across innovation, leadership, and execution domains. Recommend priority engagement protocol.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function SignalCard({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className={`p-3 border ${active ? 'border-primary/30 bg-primary/5' : 'border-white/5 bg-white/[0.02]'}`}>
      <div className="text-[9px] text-muted-foreground uppercase font-mono mb-1">{label}</div>
      <div className={`text-sm font-bold font-mono ${active ? 'text-primary' : 'text-foreground/50'}`}>{value}</div>
    </div>
  );
}

function Shield() {
   return (
      <svg className="w-3 h-3 text-secondary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>
   )
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

function SocialBtn({ icon: Icon, label, href }: { icon: any, label: string, href: string }) {
  return (
    <Button variant="outline" className="w-full justify-start gap-2 border-white/10 hover:bg-primary/5 hover:border-primary/20 hover:text-primary rounded-none h-8 text-xs font-mono uppercase text-muted-foreground" asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Icon className="w-3 h-3" />
        {label}
      </a>
    </Button>
  );
}
