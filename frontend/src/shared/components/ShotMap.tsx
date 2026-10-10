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
      <div className="flex items-center justify-center p-12 text-3xs font-mono text-[var(--text-3)]">
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
    <div className="flex flex-col gap-2.5 w-full">
      {showSummaryBar && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-3xs font-mono text-[var(--text-2)] border-b border-[var(--border)] pb-2.5">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[var(--text-3)]">Shots: </span>
              <span className="text-[var(--text)] font-semibold">{totalShots}</span>
            </div>
            <div>
              <span className="text-[var(--text-3)]">Goals: </span>
              <span className="text-emerald-500 font-semibold">{goals}</span>
            </div>
            <div>
              <span className="text-[var(--text-3)]">xG: </span>
              <span className="text-[var(--text)] font-semibold">{formatNumber(totalXg, 2)}</span>
            </div>
            <div>
              <span className="text-[var(--text-3)]">xG/Shot: </span>
              <span className="text-[var(--text)]">{formatNumber(xgPerShot, 2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Goal
            </span>
            <span className="inline-flex items-center gap-1.5 text-[var(--text-3)]">
              <span className="w-2 h-2 rounded-full bg-[var(--text-3)]" /> Non-Goal
            </span>
            <span className="text-[var(--text-3)]">● Radius ∝ √xG</span>
          </div>
        </div>
      )}

      <div className="relative rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--pitch)] p-2">
        <PitchCanvas className={className} showThirds showHalfSpaces>
          {/* Shot glyphs */}
          <g>
            {validShots.map((shot, idx) => {
              // Scale radius by square root of xG (area proportional to expected goal probability)
              const radius = Math.max(0.9, Math.min(4.2, Math.sqrt(shot.xg || 0.05) * 3.6));
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
                        stroke="#10B981"
                        strokeWidth="0.4"
                        opacity="0.8"
                      />
                      {/* Solid goal core */}
                      <circle
                        cx={shot.x}
                        cy={shot.y}
                        r={radius}
                        fill="#10B981"
                        stroke="#ffffff"
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
                      strokeWidth="0.25"
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
            className="absolute bottom-3 left-3 z-20 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3 shadow-xl text-xs font-mono text-[var(--text)] pointer-events-none backdrop-blur-md"
            style={{ maxWidth: 260 }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-1 mb-2 font-sans">
              <span className="font-bold text-[var(--text)]">{hoveredShot.player?.name ?? 'Player'}</span>
              <span className="text-[var(--text-3)] text-3xs font-mono">{hoveredShot.minute?.toFixed(0)}&apos;</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-3xs">
              <div>
                <span className="text-[var(--text-3)]">xG Value:</span>{' '}
                <span className="text-emerald-500 font-bold">{formatNumber(hoveredShot.xg, 3)}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)]">Outcome:</span>{' '}
                <span className={hoveredShot.is_goal ? 'text-emerald-500 font-bold' : 'text-[var(--text-2)]'}>
                  {hoveredShot.is_goal ? 'Goal ⚽' : 'Saved / Missed'}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-3)]">Body Part:</span>{' '}
                <span className="text-[var(--text)]">{hoveredShot.bodypart || 'Foot'}</span>
              </div>
              <div>
                <span className="text-[var(--text-3)]">Type:</span>{' '}
                <span className="text-[var(--text)]">{hoveredShot.shot_type || 'Open Play'}</span>
              </div>
              {hoveredShot.assister && (
                <div className="col-span-2 pt-1 border-t border-[var(--border)]">
                  <span className="text-[var(--text-3)]">Assister:</span>{' '}
                  <span className="text-[var(--text)] font-semibold">{hoveredShot.assister.name}</span>
                  {hoveredShot.xa !== undefined && (
                    <span className="text-[var(--text-3)] ml-1">(xA: {formatNumber(hoveredShot.xa, 2)})</span>
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
