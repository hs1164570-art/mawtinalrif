'use client';

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, ZAxis,
} from 'recharts';
import ChartWrapper from '../../_shared/components/ChartWrapper';
import { PALETTE } from '../../_shared/constants';

interface EfficiencyPoint {
  x: number;
  y: number;
  type: 'done' | 'cancelled';
  label: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-white border border-[#EDE5D8] rounded-xl p-3 shadow-lg text-right" dir="rtl">
      <p className="text-xs text-[#A89585] mb-1">{d.label}</p>
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: d.type === 'done' ? PALETTE.sage : PALETTE.terra }}
        />
        <span className="text-xs text-[#6B4C3B]">
          {d.type === 'done' ? 'مكتملة' : 'ملغاة'}:
        </span>
        <span className="text-xs font-bold text-[#3D2B1F] tabular-nums">{d.y} طلب</span>
      </div>
    </div>
  );
};

export default function EfficiencyScatter({
  data,
  isComparison,
}: {
  data: EfficiencyPoint[];
  isComparison: boolean;
}) {
  const doneData      = data.filter((d) => d.type === 'done');
  const cancelledData = data.filter((d) => d.type === 'cancelled');
  const isEmpty       = data.length === 0;

  // Average cancelled count for reference line
  const avgCancelled = cancelledData.length
    ? cancelledData.reduce((s, d) => s + d.y, 0) / cancelledData.length
    : 0;

  return (
    <ChartWrapper
      title="كفاءة التشغيل — المكتملة مقابل الملغاة"
      description="كل نقطة تمثل يوماً — تتبع توزيع الإتمام والإلغاء عبر الزمن"
      exportData={data.map((d) => ({
        اليوم:   d.label,
        النوع:   d.type === 'done' ? 'مكتملة' : 'ملغاة',
        العدد:   d.y,
      }))}
      exportFileName="كفاءة-تشغيل"
      minHeight={300}
    >
      {isEmpty ? (
        <div className="flex items-center justify-center h-72 text-sm text-[#A89585]">
          لا توجد بيانات كافية
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} />
            <XAxis
              dataKey="x"
              type="number"
              name="اليوم"
              tick={{ fontSize: 10, fill: PALETTE.muted }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'اليوم', position: 'insideBottomRight', offset: -10, fontSize: 10, fill: PALETTE.muted }}
            />
            <YAxis
              dataKey="y"
              type="number"
              name="الطلبات"
              tick={{ fontSize: 10, fill: PALETTE.muted }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <ZAxis range={[40, 120]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Legend
              wrapperStyle={{ fontSize: 11, direction: 'rtl', paddingTop: 8 }}
              formatter={(v) => <span style={{ color: PALETTE.medBrown }}>{v}</span>}
            />

            {/* Reference line: average cancelled threshold */}
            {avgCancelled > 0 && (
              <ReferenceLine
                y={avgCancelled}
                stroke={PALETTE.terra}
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                label={{
                  value: `متوسط الإلغاء: ${avgCancelled.toFixed(0)}`,
                  position: 'insideTopRight',
                  fontSize: 9,
                  fill: PALETTE.terra,
                }}
              />
            )}

            <Scatter
              name="مكتملة"
              data={doneData}
              fill={PALETTE.sage}
              fillOpacity={0.75}
              shape="circle"
            />
            <Scatter
              name="ملغاة"
              data={cancelledData}
              fill={PALETTE.terra}
              fillOpacity={0.75}
              shape="diamond"
            />
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
