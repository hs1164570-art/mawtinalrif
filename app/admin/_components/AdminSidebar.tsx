"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  TrendingUp,
  LogOut,
  DollarSign,
  BarChart3,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/categories", label: "الفئات", icon: FolderTree },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  {
    label: "الإحصائيات",
    icon: BarChart3,
    isSubmenu: true,
    children: [
      { href: "/admin/statistics/finance", label: "المالية", icon: DollarSign },
      {
        href: "/admin/statistics/orders",
        label: "طلبات الإحصائيات",
        icon: ShoppingBag,
      },
      {
        href: "/admin/statistics/products",
        label: "إحصائيات المنتجات",
        icon: Package,
      },
    ],
  },
] as const;

const SIDEBAR_W = 260;
const SIDEBAR_COLLAPSED = 76;

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin/statistics")) {
      setStatsOpen(true);
    }
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <motion.div
      animate={{
        width: collapsed && !isMobile ? SIDEBAR_COLLAPSED : SIDEBAR_W,
      }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      // تم تغيير الخلفية لـ --surface والحدود لـ --border ليكون ناصع ومحدد بكامل طول الصفحة h-screen (أو h-full في الحاوية الأكبر)
      className="bg-[#ffffff] h-screen border-l border-[rgba(90,60,20,0.10)] flex flex-col overflow-hidden relative shrink-0 text-right select-none"
      dir="rtl"
    >
      {/* ─── Logo Section ───────────────────────────────────────── */}
      <div className="py-5 px-4 border-b border-[rgba(90,60,20,0.10)] flex items-center gap-3 min-h-16 justify-between bg-[#fffdf8]">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Icon Mark مع تدرج ذهبي فخم متناسق مع ألوان البراند الجديدة */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d0a820] to-[#a07830] flex items-center justify-center shrink-0 shadow-md shadow-[#a07830]/10">
            <span className="text-base select-none text-white">🏡</span>
          </div>

          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <div className="text-[#181008] font-bold text-[0.95rem] tracking-wide">
                  موطن الريف
                </div>
                <div className="text-[#806840] text-[0.72rem] mt-0.5">
                  لوحة التحكم
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle (Desktop only) */}
        {!isMobile && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCollapsed((c) => !c)}
            className="w-7 h-7 rounded-lg border border-[rgba(90,60,20,0.18)] bg-[#fffdf8] text-[#806840] hover:text-[#181008] hover:border-[rgba(90,60,20,0.32)] cursor-pointer flex items-center justify-center shrink-0 transition-colors"
            aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <ChevronRight size={14} />
            </motion.div>
          </motion.button>
        )}

        {/* Mobile close */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="bg-transparent border-none text-[#806840] hover:text-[#181008] cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ─── Navigation Links ─────────────────────────────────── */}
      <nav
        className="flex-1 py-4 px-3 overflow-y-auto overflow-x-hidden scrollbar-none bg-[#ffffff]"
        aria-label="القائمة الرئيسية"
      >
        <ul className="list-none m-0 p-0 flex flex-col gap-1">
          {NAV_ITEMS.map((item, index) => {
            if (!("isSubmenu" in item)) {
              const active = isActive(item.href, (item as any).exact);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link href={item.href} className="no-underline block">
                    <motion.div
                      whileTap={{ scale: 0.99 }}
                      className={`flex items-center gap-3 rounded-xl cursor-pointer transition-all duration-200 relative group min-h-[44px] ${
                        collapsed && !isMobile ?
                          "px-0 justify-center py-2.5"
                        : "px-3.5 py-2.5 justify-start"
                      } ${
                        active ?
                          "bg-[rgba(160,120,48,0.08)] text-[#181008] font-medium"
                        : "text-[#483820] hover:text-[#181008] hover:bg-[rgba(90,60,20,0.04)]"
                      }`}
                    >
                      {/* Active Indicator line right on the edge */}
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] bg-[#a07830] rounded-l-md"
                        />
                      )}

                      <Icon
                        size={18}
                        className={
                          active ? "text-[#a07830]" : (
                            "text-[#806840] group-hover:text-[#483820] transition-colors"
                          )
                        }
                        strokeWidth={active ? 2 : 1.6}
                      />

                      {(!collapsed || isMobile) && (
                        <span className="text-[0.88rem] whitespace-nowrap overflow-hidden">
                          {item.label}
                        </span>
                      )}
                    </motion.div>
                  </Link>
                </li>
              );
            }

            const Icon = item.icon;
            const hasActiveChild = item.children.some((child) =>
              isActive(child.href),
            );

            return (
              <li key={index} className="flex flex-col gap-1">
                <motion.div
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    if (collapsed && !isMobile) setCollapsed(false);
                    setStatsOpen(!statsOpen);
                  }}
                  className={`flex items-center gap-3 rounded-xl cursor-pointer transition-all duration-200 min-h-[44px] group ${
                    collapsed && !isMobile ?
                      "px-0 justify-center py-2.5"
                    : "px-3.5 py-2.5 justify-between"
                  } ${
                    hasActiveChild && !statsOpen ?
                      "bg-[rgba(160,120,48,0.05)] text-[#181008]"
                    : "text-[#483820] hover:text-[#181008] hover:bg-[rgba(90,60,20,0.04)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        hasActiveChild ? "text-[#a07830]" : (
                          "text-[#806840] group-hover:text-[#483820] transition-colors"
                        )
                      }
                      strokeWidth={hasActiveChild ? 2 : 1.6}
                    />
                    {(!collapsed || isMobile) && (
                      <span className="text-[0.88rem] whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                    )}
                  </div>

                  {(!collapsed || isMobile) && (
                    <motion.div
                      animate={{ rotate: statsOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[#806840] group-hover:text-[#181008]"
                    >
                      <ChevronDown size={14} />
                    </motion.div>
                  )}
                </motion.div>

                {/* Submenu Dropdown */}
                <AnimatePresence initial={false}>
                  {statsOpen && (!collapsed || isMobile) && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="list-none m-0 p-0 mr-4 border-r border-[rgba(90,60,20,0.10)] flex flex-col gap-0.5 overflow-hidden"
                    >
                      {item.children.map((child) => {
                        const childActive = isActive(child.href);
                        const ChildIcon = child.icon;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="no-underline block"
                            >
                              <div
                                className={`flex items-center gap-2.5 py-2 px-3.5 rounded-lg cursor-pointer transition-colors ${
                                  childActive ?
                                    "text-[#a07830] font-medium bg-[rgba(160,120,48,0.04)]"
                                  : "text-[#806840] hover:text-[#181008] hover:bg-[rgba(90,60,20,0.02)]"
                                }`}
                              >
                                <ChildIcon
                                  size={14}
                                  strokeWidth={childActive ? 2 : 1.5}
                                  className={
                                    childActive ? "text-[#a07830]" : (
                                      "text-[#806840]"
                                    )
                                  }
                                />
                                <span className="text-[0.825rem]">
                                  {child.label}
                                </span>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        <div className="h-px bg-[rgba(90,60,20,0.10)] my-4 mx-1" />
      </nav>
    </motion.div>
  );

  return (
    <>
      {/* ─── Mobile floating trigger ───────────────────────────── */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-xl border border-[rgba(90,60,20,0.18)] bg-[#ffffff] text-[#181008] cursor-pointer flex items-center justify-center shadow-md shadow-black/5"
          aria-label="فتح القائمة"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Desktop implementation */}
      {!isMobile && sidebarContent}

      {/* Mobile drawer implementation */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-[#181008]/30 z-40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="fixed top-0 right-0 z-50 h-screen"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
