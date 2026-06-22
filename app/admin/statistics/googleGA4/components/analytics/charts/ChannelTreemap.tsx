// components/analytics/charts/ChannelTreemap.tsx
"use client";

import { Treemap, Tooltip, ResponsiveContainer } from "recharts";
import { EmptyState } from "../ChartCard";
import { ChannelTreemapNode } from "../../../lib/types";
import { formatNumber } from "../../../lib/utils";
import { chartColors, getSeriesColor } from "../../../lib/chart-colors";

interface TreemapCellProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  index?: number;
}

function TreemapCell(props: TreemapCellProps) {
  const { x = 0, y = 0, width = 0, height = 0, name, index = 0 } = props;
  if (width < 2 || height < 2) return null;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={getSeriesColor(index)}
        fillOpacity={0.82}
        stroke={chartColors.surface}
        strokeWidth={2}
        rx={6}
      />
      {width > 64 && height > 28 && (
        <text
          x={x + 8}
          y={y + 20}
          fontSize={11}
          fontWeight={700}
          fill={chartColors.textInv}
        >
          {name}
        </text>
      )}
    </g>
  );
}

export default function ChannelTreemap({
  data,
}: {
  data: ChannelTreemapNode[];
}) {
  if (!data.length) return <EmptyState message="لا توجد بيانات قنوات كافية" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <Treemap
        data={data as any}
        dataKey="size"
        nameKey="name"
        stroke={chartColors.surface}
        content={<TreemapCell />}
      >
        <Tooltip
          formatter={(value: any) => formatNumber(value)}
          contentStyle={{ direction: "rtl", textAlign: "right" }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
