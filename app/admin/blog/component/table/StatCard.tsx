export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex-1 min-w-[120px] px-3 py-2.5 bg-[var(--surface)] border border-[var(--border-md)] rounded-[10px]">
      <p className="text-[0.68rem] text-[var(--text-3)] m-0">{label}</p>
      <p className="text-[1.1rem] font-bold text-[var(--text-1)] m-0">{value}</p>
    </div>
  );
}
