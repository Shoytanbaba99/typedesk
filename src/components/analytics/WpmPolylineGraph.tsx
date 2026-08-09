import React, { useMemo, useState } from "react";

export interface WpmHistoryPoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

interface WpmPolylineGraphProps {
  data: WpmHistoryPoint[];
  width?: number;
  height?: number;
}

/**
 * WpmPolylineGraph
 * Zero-dependency native SVG <polyline> speed graph component.
 * Renders second-by-second Net WPM and Raw WPM trajectories with CRT grid lines.
 */
export const WpmPolylineGraph: React.FC<WpmPolylineGraphProps> = ({
  data,
  width = 650,
  height = 200,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<WpmHistoryPoint | null>(null);

  // Calculate max scaling bounds
  const { maxWpm, maxSecond, points } = useMemo(() => {
    if (!data || data.length === 0) {
      return { maxWpm: 100, maxSecond: 30, points: [] };
    }

    const highestWpm = Math.max(...data.map((d) => Math.max(d.wpm, d.rawWpm)), 40);
    const roundedMaxWpm = Math.ceil(highestWpm / 20) * 20 + 10;
    const lastSecond = Math.max(...data.map((d) => d.second), 1);

    const paddingLeft = 40;
    const paddingBottom = 30;
    const graphWidth = width - paddingLeft - 10;
    const graphHeight = height - paddingBottom - 10;

    const mapped = data.map((d) => {
      const x = paddingLeft + (d.second / lastSecond) * graphWidth;
      const netY = height - paddingBottom - (d.wpm / roundedMaxWpm) * graphHeight;
      const rawY = height - paddingBottom - (d.rawWpm / roundedMaxWpm) * graphHeight;
      return { ...d, x, netY, rawY };
    });

    return { maxWpm: roundedMaxWpm, maxSecond: lastSecond, points: mapped };
  }, [data, width, height]);

  // Generate SVG polyline point strings
  const netPolylinePoints = useMemo(() => {
    return points.map((p) => `${p.x},${p.netY}`).join(" ");
  }, [points]);

  const rawPolylinePoints = useMemo(() => {
    return points.map((p) => `${p.x},${p.rawY}`).join(" ");
  }, [points]);

  if (points.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 font-mono text-xs text-(--text-untyped)">
        [INSUFFICIENT DATA FOR POLYLINE GRAPH]
      </div>
    );
  }

  return (
    <div className="relative font-mono select-none w-full">
      <div className="flex items-center justify-between text-xs text-(--text-untyped) mb-2">
        <span className="font-bold text-(--text-correct) crt-glow">[WPM SPEED TRAJECTORY]</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-(--text-correct) inline-block" /> NET WPM
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 border-b border-dashed border-(--text-correct)/60 inline-block" /> RAW WPM
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* CRT Grid Lines (Y-Axis ticks) */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = (height - 40) * (1 - ratio) + 10;
          const val = Math.round(maxWpm * ratio);
          return (
            <g key={idx}>
              <line
                x1={35}
                y1={y}
                x2={width - 10}
                y2={y}
                stroke="var(--border-accent)"
                strokeOpacity={0.3}
                strokeDasharray="3,3"
              />
              <text x={28} y={y + 4} textAnchor="end" fill="var(--text-untyped)" fontSize="10">
                {val}
              </text>
            </g>
          );
        })}

        {/* X-Axis Labels */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const x = 40 + ratio * (width - 50);
          const sec = Math.round(maxSecond * ratio);
          return (
            <text key={idx} x={x} y={height - 5} textAnchor="middle" fill="var(--text-untyped)" fontSize="10">
              {sec}s
            </text>
          );
        })}

        {/* Raw WPM Polyline (Dashed Line) */}
        <polyline
          fill="none"
          stroke="var(--text-correct)"
          strokeOpacity={0.4}
          strokeWidth="1.5"
          strokeDasharray="4,4"
          points={rawPolylinePoints}
        />

        {/* Net WPM Polyline (Solid Glow Line) */}
        <polyline
          fill="none"
          stroke="var(--text-correct)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={netPolylinePoints}
          className="crt-glow"
        />

        {/* Interactive Data Point Markers */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.netY}
            r={hoveredPoint?.second === p.second ? 5 : 3}
            fill="var(--bg-main)"
            stroke="var(--text-correct)"
            strokeWidth="2"
            className="cursor-pointer transition-all duration-150"
            onMouseEnter={() => setHoveredPoint(p)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}
      </svg>

      {/* Hover Tooltip */}
      {hoveredPoint && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-(--bg-panel) border border-(--text-correct) rounded px-3 py-1.5 text-xs shadow-xl crt-glow flex items-center gap-3">
          <span>{hoveredPoint.second}s</span>
          <span className="font-bold text-(--text-correct)">{hoveredPoint.wpm} WPM</span>
          <span className="text-(--text-untyped)">{hoveredPoint.rawWpm} RAW</span>
          {hoveredPoint.errors > 0 && <span className="text-(--text-error)">{hoveredPoint.errors} ERR</span>}
        </div>
      )}
    </div>
  );
};
