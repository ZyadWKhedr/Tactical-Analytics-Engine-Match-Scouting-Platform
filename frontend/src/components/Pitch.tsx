import React, { useState } from 'react';
import { HeatmapOut, PassingNetworkOut, ShotOut, ZoneCell } from '../api/types';

interface PitchProps {
  zones?: ZoneCell[];
  selectedZoneId?: number | null;
  onSelectZone?: (zone: ZoneCell | null) => void;
  heatmap?: HeatmapOut | null;
  passingNetwork?: PassingNetworkOut | null;
  shots?: ShotOut[] | null;
  width?: number | string;
  height?: number | string;
  showCoordinates?: boolean;
}

export const Pitch: React.FC<PitchProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
  heatmap,
  passingNetwork,
  shots,
  width = '100%',
  height = 'auto',
}) => {
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);

  // Pitch constants: 105m x 68m
  const W = 105;
  const H = 68;

  // Helper color for vulnerability index (0 to 100)
  const getVulnColor = (idx: number) => {
    if (idx >= 65) return 'rgba(239, 68, 68, 0.45)'; // high red
    if (idx >= 55) return 'rgba(249, 115, 22, 0.40)'; // orange
    if (idx >= 45) return 'rgba(234, 179, 8, 0.35)'; // yellow
    if (idx >= 35) return 'rgba(59, 130, 246, 0.30)'; // blue
    return 'rgba(34, 197, 94, 0.30)'; // green
  };

  return (
    <div style={{ position: 'relative', width, maxWidth: '900px', margin: '0 auto' }}>
      <svg
        viewBox={`-4 -4 ${W + 8} ${H + 8}`}
        style={{
          width: '100%',
          height,
          backgroundColor: '#0a1612',
          borderRadius: '12px',
          border: '1px solid #1f2937',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}
      >
        <defs>
          {/* Pitch grass pattern stripes */}
          <pattern id="grass-stripes" width="10.5" height="68" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="5.25" height="68" fill="#0d1b15" />
            <rect x="5.25" y="0" width="5.25" height="68" fill="#0a1612" />
          </pattern>
        </defs>

        {/* Grass Background */}
        <rect x="0" y="0" width={W} height={H} fill="url(#grass-stripes)" />

        {/* ---------------- HEATMAP LAYER ---------------- */}
        {heatmap && heatmap.counts && heatmap.max_count > 0 && (
          <g opacity={0.75}>
            {heatmap.counts.map((row, iy) => {
              const cellH = H / heatmap.ny;
              const y = iy * cellH;
              return row.map((count, ix) => {
                if (count === 0) return null;
                const cellW = W / heatmap.nx;
                const x = ix * cellW;
                const intensity = Math.min(count / heatmap.max_count, 1);
                // Heatmap color interpolation (blue -> yellow -> red)
                const r = Math.round(255 * intensity);
                const g = Math.round(255 * (1 - Math.abs(intensity - 0.5) * 2));
                const b = Math.round(255 * (1 - intensity));
                return (
                  <rect
                    key={`hm-${ix}-${iy}`}
                    x={x}
                    y={y}
                    width={cellW}
                    height={cellH}
                    fill={`rgba(${r}, ${g}, ${b}, ${0.2 + intensity * 0.7})`}
                  />
                );
              });
            })}
          </g>
        )}

        {/* ---------------- ZONE VULNERABILITY LAYER ---------------- */}
        {zones && zones.length > 0 && (
          <g>
            {zones.map((z) => {
              // 6 bands along X (each 17.5m), 5 channels along Y (each 13.6m)
              const cellW = 105 / 6;
              const cellH = 68 / 5;
              const x = z.band * cellW;
              const y = z.channel * cellH;
              const isSelected = selectedZoneId === z.zone_id;

              return (
                <g
                  key={`zone-${z.zone_id}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectZone && onSelectZone(z)}
                  onMouseEnter={() =>
                    setHoveredInfo(
                      `${z.zone_name}: Vuln Index ${z.vulnerability_index.toFixed(1)} | Conceded Shot Chains: ${z.conceded_shot_chains}`
                    )
                  }
                  onMouseLeave={() => setHoveredInfo(null)}
                >
                  <rect
                    x={x}
                    y={y}
                    width={cellW}
                    height={cellH}
                    fill={getVulnColor(z.vulnerability_index)}
                    stroke={isSelected ? '#38bdf8' : 'rgba(255,255,255,0.15)'}
                    strokeWidth={isSelected ? 0.8 : 0.2}
                  />
                  <text
                    x={x + cellW / 2}
                    y={y + cellH / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize={3.2}
                    fontWeight={600}
                    opacity={0.9}
                  >
                    {z.vulnerability_index.toFixed(0)}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* ---------------- PITCH OUTLINES & MARKINGS ---------------- */}
        <g stroke="#ffffff" strokeWidth="0.4" fill="none" opacity="0.85">
          {/* Outer Boundary */}
          <rect x="0" y="0" width={W} height={H} />

          {/* Halfway Line */}
          <line x1={W / 2} y1="0" x2={W / 2} y2={H} />

          {/* Center Circle & Spot */}
          <circle cx={W / 2} cy={H / 2} r="9.15" />
          <circle cx={W / 2} cy={H / 2} r="0.5" fill="#ffffff" />

          {/* Left Penalty Box (16.5m deep, 40.32m wide) */}
          <rect x="0" y={(H - 40.32) / 2} width="16.5" height="40.32" />
          {/* Left 6-Yard Box (5.5m deep, 18.32m wide) */}
          <rect x="0" y={(H - 18.32) / 2} width="5.5" height="18.32" />
          {/* Left Penalty Spot (11m) */}
          <circle cx="11" cy={H / 2} r="0.5" fill="#ffffff" />
          {/* Left Penalty Arc */}
          <path d={`M 16.5 ${(H / 2) - 7.3} A 9.15 9.15 0 0 1 16.5 ${(H / 2) + 7.3}`} />

          {/* Right Penalty Box */}
          <rect x={W - 16.5} y={(H - 40.32) / 2} width="16.5" height="40.32" />
          {/* Right 6-Yard Box */}
          <rect x={W - 5.5} y={(H - 18.32) / 2} width="5.5" height="18.32" />
          {/* Right Penalty Spot */}
          <circle cx={W - 11} cy={H / 2} r="0.5" fill="#ffffff" />
          {/* Right Penalty Arc */}
          <path d={`M ${W - 16.5} ${(H / 2) - 7.3} A 9.15 9.15 0 0 0 ${W - 16.5} ${(H / 2) + 7.3}`} />

          {/* Goals */}
          <rect x="-2" y={(H - 7.32) / 2} width="2" height="7.32" stroke="#ffffff" strokeWidth="0.3" fill="rgba(255,255,255,0.05)" />
          <rect x={W} y={(H - 7.32) / 2} width="2" height="7.32" stroke="#ffffff" strokeWidth="0.3" fill="rgba(255,255,255,0.05)" />
        </g>

        {/* ---------------- PASSING NETWORK LAYER ---------------- */}
        {passingNetwork && (
          <g>
            {/* Directed Edges */}
            {passingNetwork.edges.map((e, idx) => {
              const src = passingNetwork.nodes.find((n) => n.player.player_id === e.source);
              const tgt = passingNetwork.nodes.find((n) => n.player.player_id === e.target);
              if (!src || !tgt) return null;
              const strokeWidth = Math.min(Math.max(e.count * 0.25, 0.4), 2.2);
              return (
                <line
                  key={`edge-${idx}`}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="#38bdf8"
                  strokeWidth={strokeWidth}
                  strokeOpacity={0.65}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Nodes */}
            {passingNetwork.nodes.map((node) => {
              const r = Math.min(Math.max(Math.sqrt(node.passes_completed) * 0.7, 1.8), 4.5);
              return (
                <g
                  key={`node-${node.player.player_id}`}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() =>
                    setHoveredInfo(
                      `${node.player.name}: ${node.passes_completed} passes completed, ${node.passes_received} received`
                    )
                  }
                  onMouseLeave={() => setHoveredInfo(null)}
                >
                  <circle cx={node.x} cy={node.y} r={r} fill="#ef4444" stroke="#ffffff" strokeWidth="0.5" />
                  <text
                    x={node.x}
                    y={node.y - r - 1}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={2.5}
                    fontWeight={700}
                  >
                    {node.player.name.split(' ').pop()}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* ---------------- SHOT MAP LAYER ---------------- */}
        {shots && (
          <g>
            {shots.map((sh, idx) => {
              const r = Math.min(Math.max(Math.sqrt(sh.xg) * 6, 1.2), 5.5);
              const color = sh.is_goal ? '#22c55e' : '#38bdf8';
              return (
                <g
                  key={`shot-${idx}`}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() =>
                    setHoveredInfo(
                      `${sh.player.name} (${sh.minute}') - xG: ${sh.xg.toFixed(2)} | ${sh.is_goal ? 'GOAL ⚽' : 'Saved/Miss'} | Type: ${sh.shot_type}`
                    )
                  }
                  onMouseLeave={() => setHoveredInfo(null)}
                >
                  <circle
                    cx={sh.x}
                    cy={sh.y}
                    r={r}
                    fill={color}
                    fillOpacity={sh.is_goal ? 0.9 : 0.6}
                    stroke="#ffffff"
                    strokeWidth={sh.is_goal ? 0.6 : 0.2}
                  />
                  {sh.is_goal && (
                    <text
                      x={sh.x}
                      y={sh.y + 0.8}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={2.2}
                      fontWeight="bold"
                    >
                      ★
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {/* Hover Info Tooltip Bar */}
      <div
        style={{
          marginTop: '6px',
          minHeight: '24px',
          fontSize: '0.82rem',
          color: '#cbd5e1',
          textAlign: 'center',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {hoveredInfo || 'Hover over zones, shots, or player nodes for details'}
      </div>
    </div>
  );
};
