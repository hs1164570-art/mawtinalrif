// ─── Filter Types ───────────────────────────────────────────────────────────
export type Timeframe = '7d' | '30d' | '90d' | 'year' | 'custom';

export interface AnalyticsFilters {
  tf: Timeframe;
  from: string;   // ISO date YYYY-MM-DD (custom only)
  to: string;     // ISO date YYYY-MM-DD (custom only)
  cmp: boolean;   // show comparison toggle
  pf: string;     // prev-from (custom comparison start)
  pt: string;     // prev-to   (custom comparison end)
}

export interface ResolvedDates {
  from: string;
  to: string;
  prevFrom: string;
  prevTo: string;
  durationMs: number;
}

// ─── Finance Types ───────────────────────────────────────────────────────────
export interface ChartPoint {
  date: string;
  value: number;
}

export interface MetricSeries {
  data: ChartPoint[];
  total: number;
  prevTotal: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'flat';
  sparkline: number[];
}

export interface FinanceData {
  revenue: MetricSeries;
  profit: MetricSeries;
  combined: Array<{ date: string; revenue: number; profit: number }>;
  profitMargin: number;
  prevProfitMargin: number;
  costs: number;
}

// ─── Products Types ──────────────────────────────────────────────────────────
export interface ProductKPI {
  slug: string;
  totalScore: number;
}

export interface ProductsData {
  kpis: {
    topSeller: ProductKPI | null;
    topCarted: ProductKPI | null;
    topViewed: ProductKPI | null;
  };
  individualCharts: {
    topSales: ProductKPI[];
    topCart: ProductKPI[];
    topViews: ProductKPI[];
  };
  groupedBarChartData: Array<{
    name: string;
    sales: number;
    cart: number;
    views: number;
  }>;
  dailyTrends: Array<{ date: string; cart: number; purchase: number; view: number }>;
  tableData: Array<{
    slug: string;
    name: string;
    category: string;
    sold: number;
    stock: number;
    inStock: boolean;
    image: string;
  }>;
}

// ─── Orders Types ────────────────────────────────────────────────────────────
export interface OrderKPI {
  current: number;
  prev: number;
  trend: 'up' | 'down' | 'flat';
  pct: number;
}

export interface OrdersData {
  kpis: {
    total: OrderKPI;
    pending: number;
    processing: number;
    done: OrderKPI;
    cancelled: number;
  };
  flowByDay: Array<{ date: string; count: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  periodComparison: Array<{ date: string; current: number; prev: number }>;
  efficiencyData: Array<{
    x: number;   // timestamp
    y: number;   // count
    type: 'done' | 'cancelled';
    label: string;
  }>;
  heatmapData: Array<{
    date: string;   // YYYY-MM-DD
    count: number;
  }>;
}

// ─── Shared UI Types ─────────────────────────────────────────────────────────
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface ChartWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  exportData?: Record<string, unknown>[];
  exportFileName?: string;
  className?: string;
  minHeight?: number;
}

export interface InsightItem {
  type: 'success' | 'warning' | 'info' | 'danger';
  icon: string;
  message: string;
}
