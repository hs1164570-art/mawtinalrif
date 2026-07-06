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
      className={`${cairo.variable} font-sans bg-[var(--surface-2)] h-screen flex overflow-hidden`}
      style={{ fontFamily: "var(--font-cairo), 'Segoe UI', sans-serif" }}
    >
      {/* Command Menu - Portal, renders over everything */}
      <CommandMenu />

      {/* Sidebar - RIGHT side in RTL */}
      <AdminSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <AdminHeader />

        {/*
          مهم: main دلوقتي مجرد "ممرّ" (pass-through) بدون padding وبدون overflow خاص بيه.
          كل صفحة هي اللي تقرر شكلها:
            - صفحات عادية (جداول، فورمات، إلخ) لازم تحط بنفسها:
                <div className="h-full overflow-y-auto p-4 sm:p-6"> ... </div>
            - صفحات full-bleed زي محرر المقال تاخد h-full مباشرة من غير padding.
          min-h-0 هنا ضروري عشان الأبناء يقدروا ياخدوا h-full صح جوه flex column.
        */}
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
