import ForceGraph2D from 'react-force-graph-2d';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { statusColors, convoyColors } from '@/lib/mockData';

interface NetworkCanvasProps {
  data: any;
  onNodeClick: (node: any) => void;
  filter: 'all' | 'exceptional';
  onZoomChange?: (zoom: number) => void;
  selectedNodeId?: string | null;
  focusNodeId?: string | null;
  selectedRig?: string | null;
}

export function NetworkCanvas({ data, onNodeClick, filter, onZoomChange, selectedNodeId, focusNodeId, selectedRig }: NetworkCanvasProps) {
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
  
  // Build set of neighbor IDs for the selected node
  const neighborIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    
    const neighbors = new Set<string>();
    neighbors.add(selectedNodeId);
    
    data.links.forEach((link: any) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (sourceId === selectedNodeId) neighbors.add(targetId);
      if (targetId === selectedNodeId) neighbors.add(sourceId);
    });
    
    return neighbors;
  }, [selectedNodeId, data.links]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter links when in HVT mode - only show connections between exceptional nodes
  const filteredData = useMemo(() => {
    if (filter !== 'exceptional') return data;
    
    const exceptionalIds = new Set(
      data.nodes.filter((n: any) => n.exceptional).map((n: any) => n.id)
    );
    
    const filteredLinks = data.links.filter((link: any) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return exceptionalIds.has(sourceId) && exceptionalIds.has(targetId);
    });
    
    return { nodes: data.nodes, links: filteredLinks };
  }, [data, filter]);

  const clusterCenters: Record<number, {x: number, y: number, label: string, color: string}> = {
    0: { x: -200, y: -100, label: 'Auth System Overhaul', color: convoyColors['convoy-auth'] },
    1: { x: 200, y: -100, label: 'Performance Optimization', color: convoyColors['convoy-perf'] },
    2: { x: -200, y: 100, label: 'UI Redesign', color: convoyColors['convoy-ui'] },
    3: { x: 200, y: 100, label: 'API v2 Migration', color: convoyColors['convoy-api'] },
    4: { x: 0, y: -200, label: 'Test Coverage', color: convoyColors['convoy-test'] },
    5: { x: 0, y: 200, label: 'Documentation Update', color: convoyColors['convoy-docs'] },
  };

  // Configure Forces for "Cluster" layout - optimized for large datasets
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-30).distanceMax(300);
      graphRef.current.d3Force('link').distance(20);
      graphRef.current.d3Force('collide', d3.forceCollide(3));
      graphRef.current.d3Force('center').strength(0.02);
      
      const clusterForce = (alpha: number) => {
        data.nodes.forEach((node: any) => {
          const clusterId = node.clusterGroup || 0;
          const target = clusterCenters[clusterId] || { x: 0, y: 0 };
          
          node.vx += (target.x - node.x) * 1 * alpha;
          node.vy += (target.y - node.y) * 1 * alpha;
        });
      };
      
      graphRef.current.d3Force('cluster', clusterForce);
      graphRef.current.d3ReheatSimulation();
      
      // Set initial zoom to 2.4x
      graphRef.current.zoom(2.4, 0);
    }
  }, [graphRef.current, data]);

  // Handle focus/zoom to a specific node from search
  useEffect(() => {
    if (focusNodeId && graphRef.current) {
      const node = data.nodes.find((n: any) => n.id === focusNodeId);
      if (node) {
        // Lock all nodes to prevent jiggle
        data.nodes.forEach((n: any) => {
          n.fx = n.x;
          n.fy = n.y;
        });
        
        // Zoom to the node
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(2.4, 2000);
        
        // Trigger node click to open profile
        onNodeClick(node);
      }
    }
  }, [focusNodeId]);

  const drawClusterLabels = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Dynamic font size - bigger when zoomed out, smaller when zoomed in
    const baseFontSize = 14;
    const fontSize = Math.min(24, Math.max(8, baseFontSize / globalScale));
    const labelOffset = 50 / globalScale;
    const padding = 6 / globalScale;
    const rectHeight = 18 / globalScale;
    
    Object.values(clusterCenters).forEach(center => {
      const color = center.color || '#82cfff';
      
      // Draw Grid Marker - Subtle Circle (also scale with zoom)
      const markerSize = 60 / globalScale;
      const crosshairSize = 8 / globalScale;
      
      ctx.strokeStyle = color + '20';
      ctx.lineWidth = 1 / globalScale;
      
      ctx.beginPath();
      ctx.arc(center.x, center.y, markerSize, 0, 2 * Math.PI);
      ctx.stroke();

      // Crosshair center
      ctx.beginPath();
      ctx.moveTo(center.x - crosshairSize, center.y);
      ctx.lineTo(center.x + crosshairSize, center.y);
      ctx.moveTo(center.x, center.y - crosshairSize);
      ctx.lineTo(center.x, center.y + crosshairSize);
      ctx.stroke();

      // Label background for visibility
      ctx.font = `bold ${fontSize}px "Share Tech Mono"`;
      const textWidth = ctx.measureText(center.label).width;
      ctx.fillStyle = 'rgba(22, 24, 29, 0.85)';
      ctx.fillRect(center.x - textWidth/2 - padding, center.y + labelOffset, textWidth + padding * 2, rectHeight);
      
      // Label border with convoy color
      ctx.strokeStyle = color + '50';
      ctx.lineWidth = 1 / globalScale;
      ctx.strokeRect(center.x - textWidth/2 - padding, center.y + labelOffset, textWidth + padding * 2, rectHeight);

      // Label text with convoy color
      ctx.fillStyle = color;
      ctx.fillText(center.label, center.x, center.y + labelOffset + rectHeight / 2);
    });
    
    ctx.restore();
  }, []);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isMayor = node.agentRole === 'mayor';
    const isSelected = node.id === selectedNodeId;
    const isNeighbor = neighborIds.has(node.id);
    const hasSelection = selectedNodeId !== null && selectedNodeId !== undefined;
    const status = node.agentStatus || 'idle';
    const statusColor = statusColors[status as keyof typeof statusColors] || '#6b7280';
    const convoyId = node.currentConvoy?.id;
    const convoyColor = convoyId ? convoyColors[convoyId] || '#6b7280' : '#6b7280';
    
    // Check if node matches rig filter
    const nodeRigId = node.assignedRig?.id;
    const matchesRigFilter = !selectedRig || isMayor || nodeRigId === selectedRig;
    const hasRigFilter = selectedRig !== null && selectedRig !== undefined;
    
    // Opacity: faded if filtered by rig or if there's a selection and not connected
    let opacity = 1;
    if (hasRigFilter && !matchesRigFilter) {
      opacity = 0.15;
    } else if (hasSelection && !isNeighbor) {
      opacity = 0.25;
    }
    
    // Mayor gets special treatment - larger with golden glow
    if (isMayor) {
      // Golden glow for Mayor
      ctx.beginPath();
      const glowSize = isSelected ? 18 : 14;
      ctx.arc(node.x, node.y, glowSize, 0, 2 * Math.PI, false);
      ctx.fillStyle = isSelected ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.2)';
      ctx.globalAlpha = hasSelection && !isNeighbor ? 0.25 : 1;
      ctx.fill();
      
      // Crown/coordinator ring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = isSelected ? 1.5 : 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowSize - 2, 0, 2 * Math.PI, false);
      ctx.stroke();
      
      // Inner ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowSize - 5, 0, 2 * Math.PI, false);
      ctx.stroke();
    }
    
    // Status glow for active agents
    if (status === 'active' && !isMayor) {
      ctx.beginPath();
      const pulseSize = isSelected ? 8 : 5;
      ctx.arc(node.x, node.y, pulseSize, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.globalAlpha = hasSelection && !isNeighbor ? 0.15 : 0.6;
      ctx.fill();
    }

    // Node Body - size based on role
    let baseSize = isMayor ? 8 : 3;
    if (status === 'completed') baseSize = 2;
    const size = isSelected ? baseSize * 1.5 : (isNeighbor && hasSelection ? baseSize * 1.2 : baseSize);
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    
    // Color based on selection, role, or status
    if (isSelected) {
      ctx.fillStyle = '#82cfff';
    } else if (isMayor) {
      ctx.fillStyle = '#f59e0b';
    } else {
      ctx.fillStyle = statusColor;
    }
    
    ctx.globalAlpha = opacity;
    ctx.fill();

    // Convoy color ring for polecats
    if (!isMayor && convoyId) {
      ctx.strokeStyle = convoyColor;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 1.5, 0, 2 * Math.PI, false);
      ctx.stroke();
    }

    // Reset alpha
    ctx.globalAlpha = 1;

    // Draw label for selected node, neighbors, Mayor, or at high zoom
    const showLabel = isSelected || (isNeighbor && hasSelection) || isMayor || globalScale > 2.2;
    if (showLabel) {
       ctx.font = isSelected || isMayor ? 'bold 5px "Share Tech Mono"' : '400 4px "Share Tech Mono"';
       ctx.textAlign = 'left';
       ctx.textBaseline = 'middle';
       ctx.fillStyle = isSelected ? '#82cfff' : (isMayor ? '#f59e0b' : statusColor);
       ctx.globalAlpha = hasSelection && !isNeighbor ? 0.25 : 1;
       ctx.fillText(`${node.name}`, node.x + size + 4, node.y);
       ctx.globalAlpha = 1;
    }
  }, [filter, selectedNodeId, neighborIds, selectedRig]);

  return (
    <div className="absolute inset-0 bg-background overflow-hidden cursor-grab active:cursor-grabbing">
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.w}
        height={dimensions.h}
        graphData={filteredData}
        nodeLabel="name"
        backgroundColor="#00000000" // Transparent
        nodeRelSize={4}
        linkColor={(link: any) => {
          if (!selectedNodeId) return 'rgba(100, 116, 139, 0.6)';
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          const isConnected = sourceId === selectedNodeId || targetId === selectedNodeId;
          return isConnected ? 'rgba(130, 207, 255, 0.9)' : 'rgba(100, 116, 139, 0.1)';
        }}
        linkWidth={(link: any) => {
          if (!selectedNodeId) return 0.8;
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          const isConnected = sourceId === selectedNodeId || targetId === selectedNodeId;
          return isConnected ? 1.5 : 0.3;
        }}
        minZoom={0.5}
        maxZoom={2.4}
        onNodeClick={(node: any) => {
            // NUCLEAR OPTION: Lock all nodes in place to absolutely prevent jiggle
            data.nodes.forEach((n: any) => {
               n.fx = n.x;
               n.fy = n.y;
            });
            
            // Zoom to node (capped at max zoom)
            graphRef.current?.centerAt(node.x, node.y, 1000);
            graphRef.current?.zoom(2.4, 2000);
            
            onNodeClick(node);
        }}
        nodeCanvasObject={paintNode}
        onRenderFramePost={drawClusterLabels}
        cooldownTicks={50} 
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.7}
        warmupTicks={50}
        enableNodeDrag={true}
        onNodeDrag={(node: any) => {
          // During drag, update fixed position to follow cursor smoothly
          node.fx = node.x;
          node.fy = node.y;
        }}
        onNodeDragEnd={(node: any) => {
          // Keep node fixed where user dropped it
          node.fx = node.x;
          node.fy = node.y;
        }}
        onEngineStop={() => {
           // Engine stopped
        }}
        onZoom={(transform: { k: number }) => {
          onZoomChange?.(transform.k);
        }}
      />
    </div>
  );
}
