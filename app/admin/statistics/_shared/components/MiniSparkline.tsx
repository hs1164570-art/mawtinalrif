'use client';

import { useMemo } from 'react';
import { PALETTE } from '../constants';

interface MiniSparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  filled?: boolean;
  className?: string;
}

export function MiniSparkline({
  data,
  color = PALETTE.gold,
  width = 80,
  height = 36,
  filled = true,
  className = '',
}: MiniSparklineProps) {
  const points = useMemo(() => {
    if (!data || data.length < 2) return { line: '', area: '' };

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const pad   = 2;

    const coords = data.map((v, i) => ({
      x: pad + (i / (data.length - 1)) * (width - pad * 2),
      y: pad + (1 - (v - min) / range) * (height - pad * 2),
    }));

    // Smooth cubic bezier
    const line = coords.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x},${pt.y}`;
      const prev = coords[i - 1];
      const cpx1 = prev.x + (pt.x - prev.x) / 3;
      const cpx2 = pt.x  - (pt.x - prev.x) / 3;
      return `${acc} C ${cpx1},${prev.y} ${cpx2},${pt.y} ${pt.x},${pt.y}`;
    }, '');

    const area = `${line} L ${coords[coords.length - 1].x},${height} L ${coords[0].x},${height} Z`;

    return { line, area };
  }, [data, width, height]);

  const id = useMemo(() => `sp-${Math.random().toString(36).slice(2)}`, []);

  if (!data || data.length < 2) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      {filled && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
      )}
      {filled && (
        <path d={points.area} fill={`url(#${id})`} />
      )}
      <path
        d={points.line}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Variant: tiny dot indicator (for very small cards) ──────────────────────
export function TinyTrendLine({
  trend,
  pct,
  sparkline,
}: {
  trend: 'up' | 'down' | 'flat';
  pct: number;
  sparkline: number[];
}) {
  const color =
    trend === 'up'   ? PALETTE.sage  :
    trend === 'down' ? PALETTE.terra :
    PALETTE.muted;

  return (
    <div className="flex items-center gap-2">
      <MiniSparkline data={sparkline} color={color} width={56} height={28} />
      <span
        className={`text-xs font-medium tabular-nums ${
          trend === 'up'   ? 'text-[#6A9E7F]' :
          trend === 'down' ? 'text-[#C4614A]' :
          'text-[#A89585]'
        }`}
        aria-label={`${trend === 'up' ? 'ارتفع' : trend === 'down' ? 'انخفض' : 'لا تغيير'} بنسبة ${Math.abs(pct).toFixed(1)}%`}
      >
        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
        {Math.abs(pct).toFixed(1)}%
      </span>
    </div>
  );
}
