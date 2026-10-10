import React from 'react';
import { cn } from '../lib/utils';

export interface PitchProps {
  children?: React.ReactNode;
  className?: string;
  showZones?: boolean;
  showThirds?: boolean;
  showHalfSpaces?: boolean;
  showDirection?: boolean;
  directionText?: string;
  title?: string;
  description?: string;
  onMouseMove?: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<SVGSVGElement>) => void;
  onClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
}

/**
 * Standard FIFA 105m x 68m SVG Football Pitch Component.
 * - Single viewBox="0 0 105 68"
 * - Thin non-scaling strokes (line width 0.25)
 * - Flat var(--pitch) fill with var(--pitch-line) markings
 * - Data layer rendered UNDER pitch markings so lines remain crisp and visible on top
 */
export function Pitch({
  children,
  className,
  showZones = false,
  showDirection = true,
  directionText = 'Attacking direction →',
  title = 'Tactical Pitch Surface',
  description = 'Standard 105m x 68m pitch coordinate system',
  onMouseMove,
  onMouseLeave,
  onClick,
}: PitchProps) {
  const length = 105;
  const width = 68;

  // FIFA dimensions
  const penaltyBoxLength = 16.5;
  const penaltyBoxWidth = 40.32;
  const penaltyBoxY = (width - penaltyBoxWidth) / 2; // 13.84

  const goalAreaLength = 5.5;
  const goalAreaWidth = 18.32;
  const goalAreaY = (width - goalAreaWidth) / 2; // 24.84

  const penaltySpotDist = 11.0;
  const centerCircleRadius = 9.15;
  const cornerArcRadius = 1.0;
  const goalDepth = 2.44;
  const goalWidth = 7.32;
  const goalY = (width - goalWidth) / 2; // 30.34

  return (
    <div className={cn('flex flex-col items-center w-full select-none font-sans', className)}>
      {/* 105 x 68 Pitch SVG Canvas */}
      <div className="relative w-full aspect-[105/68] overflow-hidden rounded-[6px] border border-border bg-pitch shadow-xs">
        <svg
          viewBox={`0 0 ${length} ${width}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full block"
          aria-label={title}
          role="img"
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
        >
          <title>{title}</title>
          {description && <desc>{description}</desc>}

          {/* Pitch Background (Flat, no grass stripes, no gradients) */}
          <rect x="0" y="0" width={length} height={width} fill="var(--pitch)" />

          {/* Clip path for any heat / overlay layers to prevent bleeding outside touchlines */}
          <defs>
            <clipPath id="pitch-bounds-clip">
              <rect x="0" y="0" width={length} height={width} rx="1" />
            </clipPath>
          </defs>

          {/* LAYER 1: DATA LAYERS (Heatmap, Contours, Pass Networks, Shots) */}
          <g clipPath="url(#pitch-bounds-clip)">
            {children}
          </g>

          {/* LAYER 2: 18-ZONE GRID (Optional, subtle 0.2 stroke) */}
          {showZones && (
            <g stroke="var(--pitch-line)" strokeWidth="0.2" strokeDasharray="0.8 0.8" opacity="0.45" pointerEvents="none">
              {/* 6 vertical zone lines (17.5m each) */}
              {[1, 2, 3, 4, 5].map((i) => (
                <line key={`vz-${i}`} x1={i * 17.5} y1="0" x2={i * 17.5} y2={width} />
              ))}
              {/* 3 horizontal zone lines (22.67m each) */}
              {[1, 2].map((i) => (
                <line key={`hz-${i}`} x1="0" y1={i * (width / 3)} x2={length} y2={i * (width / 3)} />
              ))}
            </g>
          )}

          {/* LAYER 3: PITCH MARKINGS (Crisp 0.25 stroke on TOP of heat layer) */}
          <g
            stroke="var(--pitch-line)"
            strokeWidth="0.25"
            fill="none"
            vectorEffect="non-scaling-stroke"
            pointerEvents="none"
          >
            {/* Outer Touchlines */}
            <rect x="0" y="0" width={length} height={width} />

            {/* Halfway Line */}
            <line x1={length / 2} y1="0" x2={length / 2} y2={width} />

            {/* Centre Circle & Centre Spot */}
            <circle cx={length / 2} cy={width / 2} r={centerCircleRadius} />
            <circle cx={length / 2} cy={width / 2} r="0.4" fill="var(--pitch-line)" stroke="none" />

            {/* Left Penalty Area */}
            <rect x="0" y={penaltyBoxY} width={penaltyBoxLength} height={penaltyBoxWidth} />
            {/* Left Goal Area (6-yard) */}
            <rect x="0" y={goalAreaY} width={goalAreaLength} height={goalAreaWidth} />
            {/* Left Penalty Spot */}
            <circle cx={penaltySpotDist} cy={width / 2} r="0.4" fill="var(--pitch-line)" stroke="none" />
            {/* Left Penalty Arc (D) */}
            <path
              d={`M ${penaltyBoxLength} ${width / 2 - 7.3} A ${centerCircleRadius} ${centerCircleRadius} 0 0 1 ${penaltyBoxLength} ${width / 2 + 7.3}`}
            />
            {/* Left Goal */}
            <rect x={-goalDepth} y={goalY} width={goalDepth} height={goalWidth} strokeDasharray="0.6 0.6" opacity="0.6" />

            {/* Right Penalty Area */}
            <rect x={length - penaltyBoxLength} y={penaltyBoxY} width={penaltyBoxLength} height={penaltyBoxWidth} />
            {/* Right Goal Area (6-yard) */}
            <rect x={length - goalAreaLength} y={goalAreaY} width={goalAreaLength} height={goalAreaWidth} />
            {/* Right Penalty Spot */}
            <circle cx={length - penaltySpotDist} cy={width / 2} r="0.4" fill="var(--pitch-line)" stroke="none" />
            {/* Right Penalty Arc (D) */}
            <path
              d={`M ${length - penaltyBoxLength} ${width / 2 - 7.3} A ${centerCircleRadius} ${centerCircleRadius} 0 0 0 ${length - penaltyBoxLength} ${width / 2 + 7.3}`}
            />
            {/* Right Goal */}
            <rect x={length} y={goalY} width={goalDepth} height={goalWidth} strokeDasharray="0.6 0.6" opacity="0.6" />

            {/* 4 Corner Arcs */}
            <path d={`M 0 ${cornerArcRadius} A ${cornerArcRadius} ${cornerArcRadius} 0 0 0 ${cornerArcRadius} 0`} />
            <path d={`M 0 ${width - cornerArcRadius} A ${cornerArcRadius} ${cornerArcRadius} 0 0 1 ${cornerArcRadius} ${width}`} />
            <path d={`M ${length - cornerArcRadius} 0 A ${cornerArcRadius} ${cornerArcRadius} 0 0 0 ${length} ${cornerArcRadius}`} />
            <path d={`M ${length - cornerArcRadius} ${width} A ${cornerArcRadius} ${cornerArcRadius} 0 0 1 ${length} ${width - cornerArcRadius}`} />
          </g>
        </svg>
      </div>

      {/* Attacking Direction Indicator (Outside the pitch, bottom, 11px font) */}
      {showDirection && (
        <div className="w-full flex justify-center pt-1.5 pb-0.5">
          <span className="text-[11px] font-sans text-text-3 font-medium tracking-wide">
            {directionText}
          </span>
        </div>
      )}
    </div>
  );
}

export const PitchCanvas = Pitch;
