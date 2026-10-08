import React from 'react';

interface RadarItem {
  label: string;
  value: number; // 0 to 100
}

interface RadarChartProps {
  data: RadarItem[];
  size?: number;
  color?: string;
  fillColor?: string;
  label?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 340,
  color = '#38bdf8',
  fillColor = 'rgba(56, 189, 248, 0.25)',
}) => {
  if (!data || data.length < 3) return null;

  const center = size / 2;
  const radius = size * 0.38;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;

  // Grid circles: 20, 40, 60, 80, 100
  const levels = [20, 40, 60, 80, 100];

  // Coordinates for a value at given index
  const getCoords = (val: number, idx: number) => {
    const angle = idx * angleStep - Math.PI / 2;
    const r = (val / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = data.map((d, i) => {
    const pt = getCoords(d.value, i);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background web levels */}
        {levels.map((lvl) => {
          const pts = Array.from({ length: n })
            .map((_, i) => {
              const pt = getCoords(lvl, i);
              return `${pt.x},${pt.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={`lvl-${lvl}`}
              points={pts}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={lvl === 100 ? 1.5 : 0.8}
            />
          );
        })}

        {/* Axis radial spokes */}
        {data.map((_, i) => {
          const pt = getCoords(100, i);
          return (
            <line
              key={`spoke-${i}`}
              x1={center}
              y1={center}
              x2={pt.x}
              y2={pt.y}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill={fillColor}
          stroke={color}
          strokeWidth={2.2}
          strokeLinejoin="round"
        />

        {/* Data node dots */}
        {data.map((d, i) => {
          const pt = getCoords(d.value, i);
          return (
            <circle
              key={`dot-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={3.5}
              fill={color}
              stroke="#ffffff"
              strokeWidth={1}
            />
          );
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const pt = getCoords(118, i);
          const isLeft = pt.x < center - 10;
          const isRight = pt.x > center + 10;
          return (
            <text
              key={`lbl-${i}`}
              x={pt.x}
              y={pt.y + 4}
              textAnchor={isLeft ? 'end' : isRight ? 'start' : 'middle'}
              fill="#cbd5e1"
              fontSize={11}
              fontWeight={500}
            >
              {d.label} ({d.value.toFixed(0)})
            </text>
          );
        })}
      </svg>
    </div>
  );
};
