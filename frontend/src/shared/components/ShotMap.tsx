import React, { useState } from 'react';
import { PitchCanvas } from './PitchCanvas';
import { formatNumber } from '../lib/utils';
import type { ShotOut } from '../../api/types';

interface ShotMapProps {
  shots?: ShotOut[] | null;
  title?: string;
  teamName?: string;
  className?: string;
  showSummaryBar?: boolean;
  isLoading?: boolean;
}

export function ShotMap({
  shots = [],
  className,
  showSummaryBar = true,
  isLoading = false,
}: ShotMapProps) {
  const [hoveredShot, setHoveredShot] = useState<ShotOut | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-2xs font-mono text-ink-3">
        Loading Expected Goals Shot Dispersion...
      </div>
    );
  }

  const validShots = shots || [];
  const totalShots = validShots.length;
  const goals = validShots.filter((s) => s.is_goal).length;
  const totalXg = validShots.reduce((sum, s) => sum + (s.xg || 0), 0);
  const xgPerShot = totalShots > 0 ? totalXg / totalShots : 0;

  return (
    <div className="flex flex-col gap-2 w-full">
      {showSummaryBar && (
        <div className="flex items-center justify-between text-2xs font-mono text-zinc-400 border-b border-zinc-800/60 pb-2">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-zinc-500">Shots: </span>
              <span className="text-zinc-200 font-semibold">{totalShots}</span>
            </div>
            <div>
              <span className="text-zinc-500">Goals: </span>
              <span className="text-emerald-400 font-semibold">{goals}</span>
            </div>
            <div>
              <span className="text-zinc-500">xG: </span>
              <span className="text-zinc-200 font-semibold">{formatNumber(totalXg, 2)}</span>
            </div>
            <div>
              <span className="text-zinc-500">xG/Shot: </span>
              <span className="text-zinc-200">{formatNumber(xgPerShot, 2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-2xs">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Goal
            </span>
            <span className="inline-flex items-center gap-1 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600 border border-zinc-500" /> Non-Goal
            </span>
            <span className="text-zinc-500">● Size = xG</span>
          </div>
        </div>
      )}

      <div className="relative">
        <PitchCanvas className={className} showThirds showHalfSpaces>
          {/* Shot glyphs */}
          <g>
            {validShots.map((shot, idx) => {
              // Scale radius by square root of xG (area proportional to expected goal probability)
              const radius = Math.max(0.8, Math.min(4.5, Math.sqrt(shot.xg || 0.05) * 3.6));
              const isGoal = shot.is_goal;

              return (
                <g
                  key={`shot-${shot.action_id || idx}`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onMouseEnter={() => setHoveredShot(shot)}
                  onMouseLeave={() => setHoveredShot(null)}
                >
                  {isGoal ? (
                    <>
                      {/* Outer pulse ring for goals */}
                      <circle
                        cx={shot.x}
                        cy={shot.y}
                        r={radius + 1.2}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="0.4"
                        opacity="0.8"
                      />
                      {/* Solid goal core */}
                      <circle
                        cx={shot.x}
                        cy={shot.y}
                        r={radius}
                        fill="var(--accent)"
                        stroke="var(--ink)"
                        strokeWidth="0.3"
                      />
                    </>
                  ) : (
                    <circle
                      cx={shot.x}
                      cy={shot.y}
                      r={radius}
                      fill="rgba(148, 163, 184, 0.45)"
                      stroke="#94a3b8"
                      strokeWidth="0.3"
                    />
                  )}
                </g>
              );
            })}
          </g>
        </PitchCanvas>

        {/* Hover Shot Tooltip */}
        {hoveredShot && (
          <div
            className="absolute bottom-3 left-3 z-20 rounded border border-zinc-700 bg-zinc-900/95 p-2.5 shadow-xl text-xs font-mono text-zinc-200 pointer-events-none backdrop-blur"
            style={{ maxWidth: 260 }}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1 mb-1.5 font-sans">
              <span className="font-semibold text-zinc-100">{hoveredShot.player?.name ?? 'Player'}</span>
              <span className="text-zinc-400 text-2xs">{hoveredShot.minute?.toFixed(0)}&apos;</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-2xs">
              <div>
                <span className="text-zinc-500">xG Value:</span>{' '}
                <span className="text-emerald-400 font-bold">{formatNumber(hoveredShot.xg, 3)}</span>
              </div>
              <div>
                <span className="text-zinc-500">Outcome:</span>{' '}
                <span className={hoveredShot.is_goal ? 'text-emerald-400 font-semibold' : 'text-zinc-400'}>
                  {hoveredShot.is_goal ? 'Goal ⚽' : 'Saved / Blocked'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Body Part:</span>{' '}
                <span className="text-zinc-300">{hoveredShot.bodypart || 'Foot'}</span>
              </div>
              <div>
                <span className="text-zinc-500">Type:</span>{' '}
                <span className="text-zinc-300">{hoveredShot.shot_type || 'Open Play'}</span>
              </div>
              {hoveredShot.assister && (
                <div className="col-span-2 pt-0.5 border-t border-zinc-800/80">
                  <span className="text-zinc-500">Key Pass:</span>{' '}
                  <span className="text-zinc-300">{hoveredShot.assister.name}</span>
                  {hoveredShot.xa !== undefined && (
                    <span className="text-zinc-500 ml-1">(xA: {formatNumber(hoveredShot.xa, 2)})</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
