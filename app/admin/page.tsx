import { fetchDashboardData } from "./dataCore";
import Dashboard from "./Dashboard";

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ tf?: string }>;
}) {
  const { tf: tfParam } = await searchParams;
  const tf =
    ["7d", "30d", "90d", "year"].includes(tfParam ?? "") ?
      (tfParam as "7d" | "30d" | "90d" | "year")
    : "30d";

  const data = await fetchDashboardData(tf);

  return <Dashboard initialData={data} initialTf={tf} />;
}
