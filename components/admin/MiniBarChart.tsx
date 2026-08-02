"use client";

import { useState } from "react";

interface MiniBarChartProps {
  data: { day: string; value: number }[];
  color: string;
  formatValue?: (v: number) => string;
}

/** Lightweight hand-rolled SVG bar chart — no charting library needed for a single 30-point series. */
export default function MiniBarChart({ data, color, formatValue = (v) => String(v) }: MiniBarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const width = 100;
  const height = 40;
  const barWidth = width / data.length;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full" preserveAspectRatio="none">
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 2);
          return (
            <rect
              key={d.day}
              x={i * barWidth + barWidth * 0.15}
              y={height - h}
              width={barWidth * 0.7}
              height={h}
              fill={color}
              opacity={hover === null || hover === i ? 1 : 0.35}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>
      {hover !== null && data[hover] && (
        <div className="pointer-events-none absolute -top-7 rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-paper" style={{ left: `${(hover / data.length) * 100}%` }}>
          {data[hover].day.slice(5)} · {formatValue(data[hover].value)}
        </div>
      )}
    </div>
  );
}
