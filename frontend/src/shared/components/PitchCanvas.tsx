import React from 'react';
import { cn } from '../lib/utils';

interface PitchCanvasProps {
  children?: React.ReactNode;
  className?: string;
  showCoordinates?: boolean;
  showThirds?: boolean;
  showHalfSpaces?: boolean;
  orientation?: 'horizontal' | 'vertical';
  aspectRatio?: number;
}

/**
 * Standard FIFA 105m x 68m SVG football pitch canvas.
 * Coordinates: X from 0 (own goal) to 105 (opponent goal), Y from 0 (bottom touchline) to 68 (top touchline).
 */
export function PitchCanvas({
  children,
  className,
  showCoordinates = false,
  showThirds = false,
  showHalfSpaces = false,
  orientation = 'horizontal',
}: PitchCanvasProps) {
  // Pitch dimensions (standard FIFA)
  const length = 105;
  const width = 68;

  // Key coordinate geometry
  const penaltyBoxLength = 16.5;
  const penaltyBoxWidth = 40.32;
  const penaltyBoxY = (width - penaltyBoxWidth) / 2; // 13.84

  const goalAreaLength = 5.5;
  const goalAreaWidth = 18.32;
  const goalAreaY = (width - goalAreaWidth) / 2; // 24.84

  const penaltySpotDist = 11.0;
  const centerCircleRadius = 9.15;
  const cornerArcRadius = 1.0;

  return (
    <div className={cn('relative w-full aspect-[105/68] select-none rounded overflow-hidden bg-slate-950 border border-slate-800/80', className)}>
      <svg
        viewBox={`0 0 ${length} ${width}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block"
        aria-label="105x68 Tactical Pitch Surface"
      >
        <defs>
          <pattern id="pitch-stripes" width="10.5" height="68" patternUnits="userSpaceOnUse">
            <rect width="5.25" height="68" fill="#09111c" />
            <rect x="5.25" width="5.25" height="68" fill="#0b1523" />
          </pattern>
        </defs>

        {/* Grass Background & Subtle mowing pattern */}
        <rect x="0" y="0" width={length} height={width} fill="url(#pitch-stripes)" />

        {/* Tactical Guidance Lines: Thirds */}
        {showThirds && (
          <g stroke="#334155" strokeWidth="0.3" strokeDasharray="1.5 1.5" opacity="0.6">
            <line x1="35" y1="0" x2="35" y2={width} />
            <line x1="70" y1="0" x2="70" y2={width} />
          </g>
        )}

        {/* Tactical Guidance Lines: 5 Corridors (Wings, Half-spaces, Center) */}
        {showHalfSpaces && (
          <g stroke="#334155" strokeWidth="0.3" strokeDasharray="1.5 1.5" opacity="0.6">
            <line x1="0" y1="13.84" x2={length} y2="13.84" />
            <line x1="0" y1="24.84" x2={length} y2="24.84" />
            <line x1="0" y1="43.16" x2={length} y2="43.16" />
            <line x1="0" y1="54.16" x2={length} y2="54.16" />
          </g>
        )}

        {/* Pitch boundary and markings (subtle slate/zinc stroke) */}
        <g stroke="#475569" strokeWidth="0.5" fill="none" opacity="0.85">
          {/* Outer Touchlines */}
          <rect x="0.25" y="0.25" width={length - 0.5} height={width - 0.5} />

          {/* Halfway Line */}
          <line x1={length / 2} y1="0" x2={length / 2} y2={width} />

          {/* Center Circle & Spot */}
          <circle cx={length / 2} cy={width / 2} r={centerCircleRadius} />
          <circle cx={length / 2} cy={width / 2} r="0.6" fill="#475569" stroke="none" />

          {/* Left Penalty Area */}
          <rect x="0" y={penaltyBoxY} width={penaltyBoxLength} height={penaltyBoxWidth} />
          {/* Left Goal Area */}
          <rect x="0" y={goalAreaY} width={goalAreaLength} height={goalAreaWidth} />
          {/* Left Penalty Spot */}
          <circle cx={penaltySpotDist} cy={width / 2} r="0.5" fill="#475569" stroke="none" />
          {/* Left Penalty Arc (D) */}
          <path
            d={`M ${penaltyBoxLength} ${width / 2 - 7.3} A ${centerCircleRadius} ${centerCircleRadius} 0 0 1 ${penaltyBoxLength} ${width / 2 + 7.3}`}
          />

          {/* Right Penalty Area */}
          <rect x={length - penaltyBoxLength} y={penaltyBoxY} width={penaltyBoxLength} height={penaltyBoxWidth} />
          {/* Right Goal Area */}
          <rect x={length - goalAreaLength} y={goalAreaY} width={goalAreaLength} height={goalAreaWidth} />
          {/* Right Penalty Spot */}
          <circle cx={length - penaltySpotDist} cy={width / 2} r="0.5" fill="#475569" stroke="none" />
          {/* Right Penalty Arc (D) */}
          <path
            d={`M ${length - penaltyBoxLength} ${width / 2 - 7.3} A ${centerCircleRadius} ${centerCircleRadius} 0 0 0 ${length - penaltyBoxLength} ${width / 2 + 7.3}`}
          />

          {/* Corner Arcs */}
          <path d={`M 0 ${cornerArcRadius} A ${cornerArcRadius} ${cornerArcRadius} 0 0 0 ${cornerArcRadius} 0`} />
          <path d={`M 0 ${width - cornerArcRadius} A ${cornerArcRadius} ${cornerArcRadius} 0 0 1 ${cornerArcRadius} ${width}`} />
          <path d={`M ${length - cornerArcRadius} 0 A ${cornerArcRadius} ${cornerArcRadius} 0 0 0 ${length} ${cornerArcRadius}`} />
          <path d={`M ${length - cornerArcRadius} ${width} A ${cornerArcRadius} ${cornerArcRadius} 0 0 1 ${length} ${width - cornerArcRadius}`} />
        </g>

        {/* Attacking direction indicator */}
        <g opacity="0.4" className="text-zinc-500">
          <text x="52.5" y={width - 2} textAnchor="middle" fill="#64748b" fontSize="2.2" fontFamily="monospace" letterSpacing="0.2">
            ATTACKING DIRECTION →
          </text>
        </g>

        {/* Overlay Layers (Shots, Heatmaps, Pass Networks, Zones) */}
        {children}
      </svg>
    </div>
  );
}
