"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Menu } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "/admin": "الرئيسية",
  "/admin/products": "المنتجات",
  "/admin/categories": "الفئات",
  "/admin/orders": "الطلبات",
  "/admin/users": "المستخدمون",
  "/admin/analytics": "التحليلات",
};

export function AdminHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getLabel = () => {
    const exact = ROUTE_LABELS[pathname];
    if (exact) return exact;
    const keys = Object.keys(ROUTE_LABELS).sort((a, b) => b.length - a.length);
    const match = keys.find((k) => pathname.startsWith(k) && k !== "/admin");
    return match ? ROUTE_LABELS[match] : "لوحة التحكم";
  };

  const openCommandMenu = () => {
    window.dispatchEvent(new CustomEvent("openCommandMenu"));
  };

  return (
    <header className="h-16 bg-[var(--surface)] border-b border-[var(--border-md)] flex items-center px-6 gap-4 shrink-0 sticky top-0 z-30">
      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-[var(--text-1)] font-bold text-[1.1rem] m-0 leading-tight">
          {getLabel()}
        </h1>
        <p className="text-[var(--text-3)] text-xs m-0 mt-0.5">
          موطن الريف للأثاث
        </p>
      </div>

      {/* ─── Search trigger ───────────────────────────────────── */}
      <button
        onClick={openCommandMenu}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] border-[1.5px] border-[var(--border-md)] bg-[var(--bg)] text-[var(--text-3)] cursor-pointer text-[0.85rem] min-w-[200px] transition-all duration-150 hover:border-[var(--border-strong)] hover:text-[var(--text-1)]"
        aria-label="البحث السريع"
      >
        <Search size={15} />
        <span>بحث سريع...</span>
        <span className="mr-auto text-[0.7rem] px-1.5 py-0.5 bg-[var(--bg-deep)] rounded-[5px] text-[var(--text-2)] font-mono tracking-wide">
          ⌘K
        </span>
      </button>

      {/* ─── Notifications ────────────────────────────────────── */}

      {/* ─── Admin avatar ─────────────────────────────────────── */}
      <div
        className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-[var(--gold-bright)] to-[var(--gold)] flex items-center justify-center text-[var(--text-inv)] font-bold text-[0.9rem] cursor-pointer shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
        title="أدمن"
      >
        A
      </div>
    </header>
  );
}
