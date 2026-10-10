import React, { useState } from 'react';
import { PitchCanvas } from './PitchCanvas';
import { formatNumber } from '../lib/utils';
import type { PassingNetworkOut } from '../../api/types';

interface PassNetworkProps {
  data?: PassingNetworkOut | null;
  className?: string;
  isLoading?: boolean;
}

export function PassNetwork({ data, className, isLoading }: PassNetworkProps) {
  const [hoveredPlayerId, setHoveredPlayerId] = useState<number | null>(null);

  if (isLoading || !data || !data.nodes) {
    return (
      <div className="flex items-center justify-center p-12 text-2xs font-mono text-ink-3">
        Loading Passing Topology & Spatial Node Distribution...
      </div>
    );
  }

  const nodeMap = new Map(data.nodes.map((n) => [n.player.player_id, n]));

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between text-2xs font-mono text-zinc-400 border-b border-zinc-800/60 pb-2">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-zinc-500">Completed Passes: </span>
            <span className="text-zinc-200 font-semibold">{data.total_passes}</span>
          </div>
          <div>
            <span className="text-zinc-500">Min Threshold: </span>
            <span className="text-zinc-200">≥ {data.min_passes} passes</span>
          </div>
          <div>
            <span className="text-zinc-500">Network Nodes: </span>
            <span className="text-zinc-200">{data.nodes.length} starters</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-2xs">
          <span className="text-zinc-400">● Node size = Involvement</span>
          <span className="text-zinc-400">— Line width = Volume</span>
        </div>
      </div>

      <div className="relative">
        <PitchCanvas className={className} showThirds showHalfSpaces>
          {/* Passing Edges */}
          <g>
            {data.edges.map((edge, idx) => {
              const sourceNode = nodeMap.get(edge.source);
              const targetNode = nodeMap.get(edge.target);
              if (!sourceNode || !targetNode) return null;

              const isHighlighted =
                hoveredPlayerId === edge.source || hoveredPlayerId === edge.target;
              const lineWidth = Math.max(0.4, Math.min(2.8, edge.count * 0.22));
              const strokeOpacity = hoveredPlayerId
                ? isHighlighted
                  ? 0.95
                  : 0.15
                : 0.65;

              return (
                <line
                  key={`edge-${idx}`}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={isHighlighted ? '#10b981' : '#64748b'}
                  strokeWidth={lineWidth}
                  strokeOpacity={strokeOpacity}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* Player Nodes */}
          <g>
            {data.nodes.map((node) => {
              const isHovered = hoveredPlayerId === node.player.player_id;
              const radius = Math.max(2.2, Math.min(5.0, Math.sqrt(node.passes_completed + 1) * 0.7));

              return (
                <g
                  key={`node-${node.player.player_id}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPlayerId(node.player.player_id)}
                  onMouseLeave={() => setHoveredPlayerId(null)}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={isHovered ? '#10b981' : '#1e293b'}
                    stroke={isHovered ? '#34d399' : '#0ea5e9'}
                    strokeWidth={isHovered ? 0.8 : 0.5}
                  />
                  {/* Player Label */}
                  <text
                    x={node.x}
                    y={node.y + radius + 2.6}
                    textAnchor="middle"
                    fill={isHovered ? '#f1f5f9' : '#cbd5e1'}
                    fontSize="2.1"
                    fontFamily="Inter, sans-serif"
                    fontWeight={isHovered ? '600' : '400'}
                    className="select-none pointer-events-none drop-shadow"
                  >
                    {node.player.name.split(' ').pop() ?? node.player.name}
                  </text>
                </g>
              );
            })}
          </g>
        </PitchCanvas>

        {/* Node Hover Tooltip */}
        {hoveredPlayerId && nodeMap.get(hoveredPlayerId) && (
          <div
            className="absolute bottom-3 right-3 z-20 rounded border border-zinc-700 bg-zinc-900/95 p-2.5 shadow-xl text-xs font-mono text-zinc-200 pointer-events-none backdrop-blur"
            style={{ minWidth: 200 }}
          >
            {(() => {
              const node = nodeMap.get(hoveredPlayerId)!;
              return (
                <>
                  <div className="font-semibold text-zinc-100 font-sans border-b border-zinc-800 pb-1 mb-1.5">
                    {node.player.name}
                  </div>
                  <div className="space-y-1 text-2xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Passes Completed:</span>
                      <span className="text-zinc-200 font-bold">{node.passes_completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Passes Received:</span>
                      <span className="text-zinc-200">{node.passes_received}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Betweenness Centrality:</span>
                      <span className="text-zinc-300">{formatNumber(node.betweenness, 3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Avg Coordinate:</span>
                      <span className="text-zinc-400">
                        ({node.x.toFixed(1)}m, {node.y.toFixed(1)}m)
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
