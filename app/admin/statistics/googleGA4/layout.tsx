// app/dashboard/layout.tsx

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg" dir="rtl">
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
