'use client';

import ChartWrapper from '../_shared/components/ChartWrapper';
import CalendarHeatmap from '../_shared/components/CalendarHeatmap';

interface Props {
  data: Array<{ date: string; count: number }>;
}

export default function OrderHeatmapWrapper({ data }: Props) {
  return (
    <ChartWrapper
      title="خريطة كثافة الطلبات"
      description="كثافة الطلبات اليومية خلال الأسابيع الماضية — الألوان الأعمق تعني نشاطاً أعلى"
      exportData={data.map((d) => ({ التاريخ: d.date, 'عدد الطلبات': d.count }))}
      exportFileName="كثافة-طلبات"
      minHeight={160}
    >
      <div className="overflow-x-auto -mx-2 px-2 pb-2">
        <CalendarHeatmap
          data={data}
          weeks={13}
          label="طلب"
        />
      </div>
    </ChartWrapper>
  );
}
