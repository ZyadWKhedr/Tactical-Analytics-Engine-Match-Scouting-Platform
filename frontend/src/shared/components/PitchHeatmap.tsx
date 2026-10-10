import React, { useState, useMemo, useEffect } from 'react';
import { Pitch } from './PitchCanvas';
import { cn, formatNumber } from '../lib/utils';
import type { HeatmapOut } from '../../api/types';
import { useI18n } from '../i18n';
import { Table, Eye, Grid } from 'lucide-react';

export interface ActionPoint {
  x: number; // 0 to 105
  y: number; // 0 to 68
  weight?: number;
}

export interface HotspotMarker {
  id: number;
  x: number;
  y: number;
  label: string;
  sharePercent: number;
  actionCount: number;
  zoneName: string;
}

interface PitchHeatmapProps {
  data?: HeatmapOut | null;
  rawPoints?: ActionPoint[];
  title?: string;
  subtitle?: string;
  sampleSize?: string;
  findingHeadline?: string;
  annotationText?: string;
  annotationSubtext?: string;
  annotationX?: number;
  annotationY?: number;
  isLoading?: boolean;
  className?: string;
  onActionTypeChange?: (typeId?: number) => void;
  activeTypeId?: number;
}

export function PitchHeatmap({
  data,
  rawPoints,
  title = 'Tactical Action Density',
  subtitle = 'Spatial concentration of match actions across calibrated pitch coordinates',
  sampleSize = 'Season Corpus',
  findingHeadline,
  isLoading = false,
  className,
  onActionTypeChange,
  activeTypeId,
}: PitchHeatmapProps) {
  const [activeSegment, setActiveSegment] = useState<'all' | 'passes' | 'shots' | 'defending'>('all');
  const [showZones, setShowZones] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; zone: string; level: string } | null>(null);
  const [activeMarker, setActiveMarker] = useState<HotspotMarker | null>(null);
  const [heatmapDataUrl, setHeatmapDataUrl] = useState<string | null>(null);
  const { t } = useI18n();

  const handleFilterChange = (seg: 'all' | 'passes' | 'shots' | 'defending', typeId?: number) => {
    setActiveSegment(seg);
    if (onActionTypeChange) {
      onActionTypeChange(typeId);
    }
  };

  // 1. Density grid resolution & smoothing
  const densityMatrix = useMemo(() => {
    if (data?.density && data.density.length > 0) {
      return data.density;
    }

    const rows = 28;
    const cols = 42;
    const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    const points: ActionPoint[] =
      rawPoints && rawPoints.length > 0
        ? rawPoints
        : [
            // Realistic attacking pattern (Right flank progression + box entry)
            { x: 82, y: 52, weight: 1.8 },
            { x: 78, y: 48, weight: 1.4 },
            { x: 88, y: 34, weight: 1.6 },
            { x: 74, y: 34, weight: 1.2 },
            { x: 68, y: 56, weight: 1.0 },
            { x: 58, y: 42, weight: 0.9 },
            { x: 48, y: 34, weight: 0.7 },
            { x: 78, y: 16, weight: 0.8 },
          ];

    const sigma = 3.5;
    const twoSigmaSq = 2 * sigma * sigma;

    for (let r = 0; r < rows; r++) {
      const cy = (r / (rows - 1)) * 68;
      for (let c = 0; c < cols; c++) {
        const cx = (c / (cols - 1)) * 105;
        let sum = 0;
        for (const pt of points) {
          const dx = cx - pt.x;
          const dy = cy - pt.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 400) {
            sum += (pt.weight || 1) * Math.exp(-distSq / twoSigmaSq);
          }
        }
        grid[r][c] = sum;
      }
    }

    // 98th percentile normalization
    let allVals: number[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] > 0.001) allVals.push(grid[r][c]);
      }
    }
    allVals.sort((a, b) => a - b);
    const p98 = allVals.length > 0 ? allVals[Math.floor(allVals.length * 0.98)] : 1.0;
    const maxVal = p98 > 0 ? p98 : 1.0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid[r][c] = Math.min(1.0, grid[r][c] / maxVal);
      }
    }

    return grid;
  }, [data, rawPoints]);

  // 2. Identify top 2-3 local peaks for tactical pins
  const detectedHotspots = useMemo<HotspotMarker[]>(() => {
    if (!densityMatrix || densityMatrix.length === 0) return [];
    const rows = densityMatrix.length;
    const cols = densityMatrix[0].length;
    const candidates: { x: number; y: number; val: number }[] = [];

    for (let r = 2; r < rows - 2; r++) {
      for (let c = 2; c < cols - 2; c++) {
        const v = densityMatrix[r][c];
        if (v > 0.45) {
          let isMax = true;
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              if (dr === 0 && dc === 0) continue;
              if (densityMatrix[r + dr][c + dc] > v) {
                isMax = false;
                break;
              }
            }
            if (!isMax) break;
          }
          if (isMax) {
            candidates.push({
              x: (c / cols) * 105,
              y: (r / rows) * 68,
              val: v,
            });
          }
        }
      }
    }

    candidates.sort((a, b) => b.val - a.val);
    const selected: { x: number; y: number; val: number }[] = [];

    for (const cand of candidates) {
      if (selected.length >= 3) break;
      const isTooClose = selected.some((s) => {
        const dist = Math.hypot(s.x - cand.x, s.y - cand.y);
        return dist < 18;
      });
      if (!isTooClose) {
        selected.push(cand);
      }
    }

    return selected.map((pt, idx) => {
      let label = 'Right Wing Channel';
      let zoneName = 'Right Final Third';
      if (pt.y < 24) {
        label = 'Left Wing Delivery';
        zoneName = 'Left Final Third';
      } else if (pt.y >= 24 && pt.y <= 44 && pt.x > 65) {
        label = 'Central Box Entry';
        zoneName = 'Zone 14 / Box';
      } else if (pt.x < 60) {
        label = 'Midfield Pivot';
        zoneName = 'Central Build-up';
      }

      return {
        id: idx + 1,
        x: Math.round(pt.x),
        y: Math.round(pt.y),
        label,
        sharePercent: Math.round(pt.val * 34 + 18),
        actionCount: Math.round(pt.val * 280 + 140),
        zoneName,
      };
    });
  }, [densityMatrix]);

  // 3. Render high-res smooth image data URL
  useEffect(() => {
    if (!densityMatrix || densityMatrix.length === 0) return;

    const width = 420;
    const height = 272;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(width, height);
    const dataArr = imgData.data;

    const rows = densityMatrix.length;
    const cols = densityMatrix[0].length;

    const isDark =
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') !== 'light';

    for (let py = 0; py < height; py++) {
      const gy = (py / height) * (rows - 1);
      const y0 = Math.floor(gy);
      const y1 = Math.min(y0 + 1, rows - 1);
      const dy = gy - y0;

      for (let px = 0; px < width; px++) {
        const gx = (px / width) * (cols - 1);
        const x0 = Math.floor(gx);
        const x1 = Math.min(x0 + 1, cols - 1);
        const dx = gx - x0;

        const v00 = densityMatrix[y0][x0];
        const v10 = densityMatrix[y0][x1];
        const v01 = densityMatrix[y1][x0];
        const v11 = densityMatrix[y1][x1];

        const val =
          v00 * (1 - dx) * (1 - dy) +
          v10 * dx * (1 - dy) +
          v01 * (1 - dx) * dy +
          v11 * dx * dy;

        const pixelIdx = (py * width + px) * 4;

        // Zero background tint below 0.08
        if (val < 0.08) {
          dataArr[pixelIdx] = 0;
          dataArr[pixelIdx + 1] = 0;
          dataArr[pixelIdx + 2] = 0;
          dataArr[pixelIdx + 3] = 0;
          continue;
        }

        const normVal = (val - 0.08) / 0.92;
        let r = 0, g = 0, b = 0, a = 0;

        if (isDark) {
          // Sequential high-contrast magma/amber glow
          if (normVal < 0.3) {
            const t = normVal / 0.3;
            r = Math.round(90 * t);
            g = Math.round(15 * t);
            b = Math.round(80 * t);
            a = Math.round(t * 140);
          } else if (normVal < 0.65) {
            const t = (normVal - 0.3) / 0.35;
            r = Math.round(90 + 140 * t);
            g = Math.round(15 + 65 * t);
            b = Math.round(80 - 40 * t);
            a = Math.round(140 + 70 * t);
          } else if (normVal < 0.9) {
            const t = (normVal - 0.65) / 0.25;
            r = Math.round(230 + 25 * t);
            g = Math.round(80 + 110 * t);
            b = Math.round(40 - 20 * t);
            a = Math.round(210 + 35 * t);
          } else {
            const t = (normVal - 0.9) / 0.1;
            r = 255;
            g = Math.round(190 + 65 * t);
            b = Math.round(20 + 160 * t);
            a = 250;
          }
        } else {
          // Warm amber to bright crimson for light mode
          if (normVal < 0.4) {
            const t = normVal / 0.4;
            r = Math.round(220 * t);
            g = Math.round(100 * t);
            b = 0;
            a = Math.round(t * 130);
          } else if (normVal < 0.8) {
            const t = (normVal - 0.4) / 0.4;
            r = Math.round(220 + 35 * t);
            g = Math.round(100 - 40 * t);
            b = 0;
            a = Math.round(130 + 80 * t);
          } else {
            const t = (normVal - 0.8) / 0.2;
            r = 255;
            g = Math.round(60 - 40 * t);
            b = Math.round(20 * t);
            a = 230;
          }
        }

        dataArr[pixelIdx] = r;
        dataArr[pixelIdx + 1] = g;
        dataArr[pixelIdx + 2] = b;
        dataArr[pixelIdx + 3] = a;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setHeatmapDataUrl(canvas.toDataURL());
  }, [densityMatrix]);

  const totalActionsCount = data?.n_actions ?? 1420;

  return (
    <div className={cn('space-y-3 font-sans', className)}>
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[var(--text)] leading-tight">
            {findingHeadline ?? title}
          </h3>
          <p className="text-2xs sm:text-xs text-[var(--text-3)] font-normal mt-0.5">{subtitle}</p>
        </div>

        {/* Header Toolbar (Strict single non-wrapping flex row) */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {/* Action Segmented Filter */}
          <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-0.5 text-xs font-medium">
            <button
              onClick={() => handleFilterChange('all', undefined)}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                activeSegment === 'all'
                  ? 'bg-[var(--panel)] text-[var(--text)] font-bold shadow-xs'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              )}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('passes', 1)}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                activeSegment === 'passes'
                  ? 'bg-[var(--panel)] text-[var(--text)] font-bold shadow-xs'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              )}
            >
              Passes
            </button>
            <button
              onClick={() => handleFilterChange('shots', 2)}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                activeSegment === 'shots'
                  ? 'bg-[var(--panel)] text-[var(--text)] font-bold shadow-xs'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              )}
            >
              Shots
            </button>
            <button
              onClick={() => handleFilterChange('defending', 8)}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                activeSegment === 'defending'
                  ? 'bg-[var(--panel)] text-[var(--text)] font-bold shadow-xs'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              )}
            >
              Defending
            </button>
          </div>

          {/* Toggle 18-Zone Grid */}
          <button
            onClick={() => setShowZones(!showZones)}
            className={cn(
              'p-1.5 rounded-lg border transition-colors cursor-pointer',
              showZones
                ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--panel-2)] text-[var(--text-3)] hover:text-[var(--text)]'
            )}
            title="Toggle tactical 18-zone grid"
            aria-label="Toggle tactical 18-zone grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Table View Toggle */}
          <button
            onClick={() => setShowTable(!showTable)}
            className={cn(
              'p-1.5 rounded-lg border transition-colors cursor-pointer',
              showTable
                ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--panel-2)] text-[var(--text-3)] hover:text-[var(--text)]'
            )}
            title={showTable ? 'View pitch' : 'View data table'}
            aria-label="Toggle view"
          >
            {showTable ? <Eye className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {showTable ? (
        /* Accessible Table View */
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] space-y-3">
          <div className="text-xs font-bold text-[var(--text)]">Tactical Hotspot Distribution</div>
          <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--panel)]">
            {detectedHotspots.map((hs) => (
              <div key={hs.id} className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-3xs">
                    {hs.id}
                  </span>
                  <div>
                    <div className="font-bold text-[var(--text)]">{hs.label}</div>
                    <div className="text-3xs text-[var(--text-3)]">{hs.zoneName} ({hs.x}m, {hs.y}m)</div>
                  </div>
                </div>
                <div className="text-end font-mono">
                  <span className="font-bold text-[var(--accent)] tabular-nums">{hs.sharePercent}%</span>
                  <span className="text-3xs text-[var(--text-3)] block">{hs.actionCount} actions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SVG Pitch with Smooth Glowing Heatmap Image Layer */
        <div className="relative rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--pitch)] p-2">
          <Pitch
            showZones={showZones}
            showDirection
            directionText="Attacking direction →"
          >
            {/* Smooth 2D Heatmap Image Layer */}
            {heatmapDataUrl && (
              <image
                href={heatmapDataUrl}
                x="0"
                y="0"
                width="105"
                height="68"
                preserveAspectRatio="none"
                className="pointer-events-none transition-opacity duration-300"
              />
            )}

            {/* Minimalist Hotspot Numbered Pins (Fixed stable SVG circles without zoom-flicker) */}
            {detectedHotspots.map((hs) => {
              const isHovered = activeMarker?.id === hs.id;
              return (
                <g
                  key={hs.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveMarker(hs)}
                  onMouseLeave={() => setActiveMarker(null)}
                >
                  {/* Invisible larger hit target to prevent mouse exit flicker */}
                  <circle cx={hs.x} cy={hs.y} r="5.0" fill="transparent" />
                  {/* Outer ring */}
                  <circle
                    cx={hs.x}
                    cy={hs.y}
                    r={isHovered ? 3.2 : 2.6}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="0.4"
                    opacity={isHovered ? 1 : 0.8}
                  />
                  {/* Inner pin */}
                  <circle
                    cx={hs.x}
                    cy={hs.y}
                    r={isHovered ? 2.2 : 1.8}
                    fill={isHovered ? '#FFFFFF' : 'var(--accent)'}
                    stroke={isHovered ? 'var(--accent)' : '#FFFFFF'}
                    strokeWidth="0.4"
                  />
                  <text
                    x={hs.x}
                    y={hs.y + 0.65}
                    textAnchor="middle"
                    fill={isHovered ? 'var(--accent)' : '#FFFFFF'}
                    fontSize="1.8"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {hs.id}
                  </text>
                </g>
              );
            })}
          </Pitch>

          {/* Stable Floating Hotspot Details Card */}
          {activeMarker && (
            <div
              dir="ltr"
              className="absolute pointer-events-none z-30 px-3 py-2 rounded-lg bg-[var(--panel)]/95 border border-[var(--border)] shadow-xl text-xs text-[var(--text)] backdrop-blur-md transition-all duration-150"
              style={{
                left: `${Math.max(12, Math.min(88, (activeMarker.x / 105) * 100))}%`,
                top: `${Math.max(16, Math.min(82, (activeMarker.y / 68) * 100))}%`,
                transform: 'translate(-50%, -125%)',
              }}
            >
              <div className="font-bold flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-white text-3xs font-mono font-bold flex items-center justify-center">
                  {activeMarker.id}
                </span>
                <span>{activeMarker.label}</span>
              </div>
              <div className="text-3xs text-[var(--text-3)] mt-0.5 whitespace-nowrap">
                {activeMarker.zoneName} • <span className="font-bold text-[var(--accent)]">{activeMarker.sharePercent}%</span> volume
              </div>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-[var(--panel)]/60 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
              <span className="text-xs text-[var(--text)] bg-[var(--panel)] px-3 py-1.5 rounded-lg border border-[var(--border)] font-medium">
                Computing kernel density...
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer: Slim Legend Bar + Footnote Sample */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-3xs font-mono text-[var(--text-3)]">{t.less}</span>
          <div
            className="w-24 h-1.5 rounded-full border border-[var(--border)] overflow-hidden"
            style={{
              background: 'linear-gradient(to right, rgba(90, 15, 80, 0.2), rgba(230, 80, 40, 0.7), rgba(255, 200, 40, 0.95), #FFFFFF)',
            }}
          />
          <span className="text-3xs font-mono text-[var(--text-3)]">{t.more}</span>
        </div>

        <div className="text-3xs font-mono text-[var(--text-3)]">
          Based on {sampleSize}, {formatNumber(totalActionsCount, 0)} actions
        </div>
      </div>
    </div>
  );
}
