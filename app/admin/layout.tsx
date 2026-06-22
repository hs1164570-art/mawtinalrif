// AdminLayout.tsx
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { AdminSidebar } from "./_components/AdminSidebar";
import { AdminHeader } from "./_components/AdminHeader";
import { CommandMenu } from "./_components/CommandMenu";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | موطن الريف",
    default: "لوحة التحكم | موطن الريف",
  },
  description: "لوحة تحكم موطن الريف للأثاث",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      dir="rtl"
      className={`${cairo.variable} font-sans bg-[var(--surface-2)] min-h-screen flex overflow-hidden`}
      style={{ fontFamily: "var(--font-cairo), 'Segoe UI', sans-serif" }}
    >
      {/* Command Menu - Portal, renders over everything */}
      <CommandMenu />

      {/* Sidebar - RIGHT side in RTL */}
      <AdminSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
