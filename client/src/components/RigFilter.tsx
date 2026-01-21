import { useState } from 'react';
import { rigs } from '@/lib/mockData';
import { GitBranch, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RigFilterProps {
  selectedRig: string | null;
  onRigChange: (rigId: string | null) => void;
}

export function RigFilter({ selectedRig, onRigChange }: RigFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedRigName = selectedRig 
    ? rigs.find(r => r.id === selectedRig)?.name || 'All Rigs'
    : 'All Rigs';

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-3 rounded-none bg-black/30 border border-white/10 hover:bg-black/40 hover:border-white/20 text-xs font-mono"
        data-testid="button-rig-filter"
      >
        <GitBranch className="w-3 h-3 mr-2 text-primary" />
        <span className="text-foreground">{selectedRigName}</span>
        <ChevronDown className={`w-3 h-3 ml-2 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-56 bg-background/95 border border-white/10 backdrop-blur-sm z-50">
            <button
              onClick={() => { onRigChange(null); setIsOpen(false); }}
              className={`w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-white/5 border-b border-white/5 transition-colors ${!selectedRig ? 'bg-primary/10' : ''}`}
              data-testid="rig-filter-all"
            >
              <GitBranch className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-foreground flex-1">All Rigs</span>
              {!selectedRig && <Check className="w-3 h-3 text-primary" />}
            </button>
            {rigs.map((rig) => (
              <button
                key={rig.id}
                onClick={() => { onRigChange(rig.id); setIsOpen(false); }}
                className={`w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-colors ${selectedRig === rig.id ? 'bg-primary/10' : ''}`}
                data-testid={`rig-filter-${rig.id}`}
              >
                <GitBranch className="w-3 h-3 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground">{rig.name}</div>
                  <div className="text-[9px] text-muted-foreground truncate">{rig.repo}</div>
                </div>
                {selectedRig === rig.id && <Check className="w-3 h-3 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
