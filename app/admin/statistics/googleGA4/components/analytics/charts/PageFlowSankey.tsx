// components/analytics/charts/PageFlowSankey.tsx
"use client";

import {
  Sankey,
  Tooltip,
  ResponsiveContainer,
  Layer,
  Rectangle,
} from "recharts";

import { EmptyState } from "../ChartCard";
import { getSeriesColor, chartColors } from "../../../lib/chart-colors";
import { PageFlowLink } from "../../../lib/types";
import { formatNumber } from "../../../lib/utils";

interface SankeyNodeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: { name?: string };
}

function SankeyNode({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = 0,
  payload,
}: SankeyNodeProps) {
  return (
    <Layer>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={getSeriesColor(index)}
        fillOpacity={0.9}
        rx={3}
      />
      <text
        x={x + width + 6}
        y={y + height / 2}
        dy={4}
        fontSize={11}
        fill={chartColors.text2}
        textAnchor="start"
      >
        {payload?.name}
      </text>
    </Layer>
  );
}

export default function PageFlowSankey({ data }: { data: PageFlowLink[] }) {
  if (!data.length)
    return <EmptyState message="لا توجد بيانات مسار تصفح كافية" />;

  const names = Array.from(new Set(data.flatMap((d) => [d.source, d.target])));
  const nodes = names.map((name) => ({ name }));
  const links = data.map((d) => ({
    source: names.indexOf(d.source),
    target: names.indexOf(d.target),
    value: d.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <Sankey
        data={{ nodes, links }}
        nodePadding={28}
        margin={{ left: 8, right: 90, top: 12, bottom: 12 }}
        link={{ stroke: chartColors.cyan, strokeOpacity: 0.25 }}
        node={<SankeyNode />}
      >
        <Tooltip
          formatter={(value: any) => formatNumber(value)}
          contentStyle={{ direction: "rtl", textAlign: "right" }}
        />
      </Sankey>
    </ResponsiveContainer>
  );
}
