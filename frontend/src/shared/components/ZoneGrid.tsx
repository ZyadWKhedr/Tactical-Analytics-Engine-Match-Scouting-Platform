import React, { useState } from 'react';
import { PitchCanvas } from './PitchCanvas';
import { formatNumber, formatPercent } from '../lib/utils';
import { getVulnerabilityColor } from '../lib/colors';
import type { ZoneCell, ZonesOut } from '../../api/types';

interface ZoneGridProps {
  data?: ZonesOut | null;
  className?: string;
  selectedZoneId?: number;
  onSelectZone?: (zone: ZoneCell) => void;
  isLoading?: boolean;
}

export function ZoneGrid({ data, className, selectedZoneId, onSelectZone, isLoading }: ZoneGridProps) {
  const [hoveredCell, setHoveredCell] = useState<ZoneCell | null>(null);

  const bandWidth = 105 / 6; // 17.5m
  const channelHeight = 68 / 5; // 13.6m

  if (isLoading || !data || !data.grid) {
    return (
      <div className="flex items-center justify-center p-12 text-2xs font-mono text-ink-3">
        Loading 6×5 Pitch Zone Vulnerability Matrix...
      </div>
    );
  }

  const maxVuln = Math.max(0.01, ...data.grid.map((c) => c.vulnerability_index));

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Legend Header */}
      <div className="flex items-center justify-between text-2xs font-mono text-zinc-400 border-b border-zinc-800/60 pb-2">
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">Grid: 6 Bands × 5 Channels (30 Sectors)</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400">Attacking: Left → Right</span>
        </div>
        <div className="flex items-center gap-2 text-2xs">
          <span className="text-zinc-500">Vulnerability:</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-700/60 border border-slate-600/40" /> Low
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-600/70 border border-amber-500/40" /> Med
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-600/80 border border-rose-500/40" /> High / Target
          </span>
        </div>
      </div>

      <div className="relative">
        <PitchCanvas className={className} showThirds={false} showHalfSpaces={false}>
          {/* 6x5 Grid Overlay */}
          <g>
            {data.grid.map((cell) => {
              const x = cell.band * bandWidth;
              // Invert Y coordinate so channel 0 is top flank or standard pitch alignment
              const y = (4 - cell.channel) * channelHeight;
              const colorInfo = getVulnerabilityColor(cell.vulnerability_index, maxVuln);
              const isSelected = selectedZoneId === cell.zone_id;
              const isHovered = hoveredCell?.zone_id === cell.zone_id;

              return (
                <g
                  key={`zone-${cell.zone_id}`}
                  className="cursor-pointer transition-opacity"
                  onClick={() => onSelectZone && onSelectZone(cell)}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {/* Zone rectangle */}
                  <rect
                    x={x + 0.3}
                    y={y + 0.3}
                    width={bandWidth - 0.6}
                    height={channelHeight - 0.6}
                    rx="0.4"
                    fill={colorInfo.bg}
                    stroke={isSelected ? '#38bdf8' : isHovered ? '#f1f5f9' : '#334155'}
                    strokeWidth={isSelected ? '0.8' : isHovered ? '0.6' : '0.25'}
                  />

                  {/* Vulnerability Index Text */}
                  <text
                    x={x + bandWidth / 2}
                    y={y + channelHeight / 2 - 1.2}
                    textAnchor="middle"
                    fill={colorInfo.text}
                    fontSize="2.4"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="600"
                    className="select-none pointer-events-none"
                  >
                    {formatNumber(cell.vulnerability_index, 2)}
                  </text>

                  {/* Conceded Entry count */}
                  <text
                    x={x + bandWidth / 2}
                    y={y + channelHeight / 2 + 2.2}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="1.7"
                    fontFamily="Inter, sans-serif"
                    className="select-none pointer-events-none opacity-80"
                  >
                    {cell.conceded_shot_chains} ch / {cell.conceded_goals}g
                  </text>

                  {/* Rank badge for top vulnerable zones */}
                  {cell.exposure_rank_in_team && cell.exposure_rank_in_team <= 3 && (
                    <g>
                      <circle
                        cx={x + bandWidth - 2.2}
                        cy={y + 2.2}
                        r="1.4"
                        fill="#e11d48"
                        stroke="#881337"
                        strokeWidth="0.2"
                      />
                      <text
                        x={x + bandWidth - 2.2}
                        y={y + 2.7}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="1.3"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="bold"
                        className="select-none pointer-events-none"
                      >
                        #{cell.exposure_rank_in_team}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </PitchCanvas>

        {/* Hover Zone Tooltip */}
        {hoveredCell && (
          <div
            className="absolute top-3 left-3 z-20 rounded border border-zinc-700 bg-zinc-900/95 p-3 shadow-xl text-xs font-mono text-zinc-200 pointer-events-none backdrop-blur"
            style={{ minWidth: 220 }}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1 mb-2 font-sans">
              <span className="font-semibold text-zinc-100">{hoveredCell.zone_name}</span>
              <span className="text-2xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">
                {hoveredCell.corridor}
              </span>
            </div>
            <div className="space-y-1 text-2xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Vulnerability Index:</span>
                <span className="text-rose-400 font-bold">
                  {formatNumber(hoveredCell.vulnerability_index, 3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Opponent Entries / 90:</span>
                <span className="text-zinc-200 font-medium">
                  {formatNumber(hoveredCell.conceded_entries_p90, 1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">xT Conceded / Entry:</span>
                <span className="text-zinc-300">
                  {formatNumber(hoveredCell.conceded_xt_per_entry, 3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Shot Chains Conceded:</span>
                <span className="text-zinc-200">{hoveredCell.conceded_shot_chains}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Goals Conceded:</span>
                <span className="text-rose-400 font-semibold">{hoveredCell.conceded_goals}</span>
              </div>
              {hoveredCell.clean_recovery_rate !== undefined && hoveredCell.clean_recovery_rate !== null && (
                <div className="flex justify-between pt-1 border-t border-zinc-800">
                  <span className="text-zinc-500">Clean Recovery %:</span>
                  <span className="text-emerald-400">
                    {formatPercent(hoveredCell.clean_recovery_rate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Corridor Breakdown Summary Bar */}
      {data.corridors && data.corridors.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-1">
          {data.corridors.map((c) => (
            <div
              key={c.corridor}
              className="p-2 rounded border border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-2xs"
            >
              <div className="flex flex-col">
                <span className="text-zinc-400 font-medium capitalize">{c.corridor} Corridor</span>
                <span className="text-zinc-500 font-mono">
                  {c.conceded_shot_chains} chains | {c.conceded_goals} goals
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-zinc-500 text-3xs block">Mean Vuln</span>
                <span className="text-zinc-200 font-semibold">{formatNumber(c.mean_vulnerability, 2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
