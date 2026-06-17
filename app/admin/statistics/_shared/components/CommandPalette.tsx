"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  LayoutDashboard,
  Plus,
  TrendingUp,
  BarChart3,
  Calendar,
  Download,
  RotateCcw,
  X,
} from "lucide-react";

interface CmdItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  group: "التنقل" | "التحليلات والإحصاءات" | "الإجراءات السريعة" | "تصفية";
  keywords?: string[];
  onlyInAnalytics?: boolean;
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // التحقق إذا كان المستخدم داخل صفحات الإحصائيات
  const isInAnalytics =
    pathname?.includes("/statistics") || pathname?.includes("/analytics");

  // ─── Keyboard Shortcuts & Events ───────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        ((e.key === "k" || e.key === "ن") && (e.metaKey || e.ctrlKey)) ||
        e.key === "/"
      ) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);

    const openHandler = () => setOpen(true);
    window.addEventListener("openCommandMenu", openHandler);

    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("openCommandMenu", openHandler);
    };
  }, []);

  const go = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
      setSearch("");
    },
    [router],
  );

  // ─── مصفوفة البيانات الموحدة ───────────────────────────────────────────
  const ITEMS: CmdItem[] = [
    {
      id: "nav-dashboard",
      label: "الرئيسية",
      description: "لوحة التحكم الرئيسية",
      icon: <LayoutDashboard size={16} />,
      action: () => go("/admin"),
      group: "التنقل",
      keywords: ["dashboard", "home", "رئيسية"],
    },
    {
      id: "nav-products",
      label: "المنتجات",
      description: "عرض وإدارة المنتجات والقطع",
      icon: <Package size={16} />,
      action: () => go("/admin/products"),
      group: "التنقل",
      keywords: ["products", "منتجات", "مخزن"],
    },
    {
      id: "nav-categories",
      label: "الفئات والأقسام",
      description: "إدارة الأقسام والفئات",
      icon: <FolderTree size={16} />,
      action: () => go("/admin/categories"),
      group: "التنقل",
      keywords: ["categories", "فئات", "أقسام"],
    },
    {
      id: "nav-orders",
      label: "الطلبات والعمليات",
      description: "عرض وإدارة طلبات الشحن",
      icon: <ShoppingBag size={16} />,
      action: () => go("/admin/orders"),
      group: "التنقل",
      keywords: ["orders", "طلبات", "شحن"],
    },
    {
      id: "nav-users",
      label: "المستخدمون",
      description: "إدارة حسابات المستخدمين والعملاء",
      icon: <Users size={16} />,
      action: () => go("/admin/users"),
      group: "التنقل",
      keywords: ["users", "مستخدمون", "عملاء"],
    },
    {
      id: "stats-finance",
      label: "صفحة المالية",
      description: "الإيرادات والأرباح الصافية وحركة الأموال",
      icon: <TrendingUp size={16} />,
      action: () => go("/admin/statistics/finance"),
      group: "التحليلات والإحصاءات",
      keywords: ["finance", "مالية", "ارباح", "فلوس"],
    },
    {
      id: "stats-products",
      label: "صفحة المنتجات الإحصائية",
      description: "المبيعات والمشاهدات ونسب التحويل البيعي",
      icon: <ShoppingBag size={16} />,
      action: () => go("/admin/statistics/products"),
      group: "التحليلات والإحصاءات",
      keywords: ["product stats", "احصائيات المنتجات"],
    },
    {
      id: "stats-orders",
      label: "صفحة الطلبات الإحصائية",
      description: "حالات الطلبات وتدفق حركة الشحن وكفاءة التشغيل",
      icon: <BarChart3 size={16} />,
      action: () => go("/admin/statistics/orders"),
      group: "التحليلات والإحصاءات",
      keywords: ["order stats", "احصائيات الطلبات"],
    },
    {
      id: "action-add-product",
      label: "إضافة منتج جديد",
      description: "إنشاء منتج جديد في المتجر",
      icon: <Plus size={16} />,
      action: () => {
        go("/admin/products");
        setTimeout(
          () => window.dispatchEvent(new CustomEvent("openAddProduct")),
          300,
        );
      },
      group: "الإجراءات السريعة",
      keywords: ["add product", "إضافة منتج", "جديد"],
    },
    {
      id: "action-add-category",
      label: "إضافة فئة جديدة",
      icon: <Plus size={16} />,
      action: () => {
        go("/admin/categories");
        setTimeout(
          () => window.dispatchEvent(new CustomEvent("openAddCategory")),
          300,
        );
      },
      group: "الإجراءات السريعة",
      keywords: ["add category", "إضافة فئة"],
    },
    {
      id: "export",
      label: "تصدير البيانات الحالي",
      description: "تحميل التقرير المعروض فوراً",
      icon: <Download size={16} />,
      action: () => {
        window.dispatchEvent(new Event("triggerExport"));
        setOpen(false);
      },
      group: "الإجراءات السريعة",
      keywords: ["export", "تصدير", "تحميل", "excel", "pdf"],
      onlyInAnalytics: true,
    },
    {
      id: "reset",
      label: "إعادة تعيين الفلاتر",
      description: "تنظيف الفلاتر الزمنية الحالية بالصفحة",
      icon: <RotateCcw size={16} />,
      action: () => {
        window.dispatchEvent(new Event("resetFilters"));
        setOpen(false);
      },
      group: "الإجراءات السريعة",
      keywords: ["reset", "اعادة تعيين", "تنظيف"],
      onlyInAnalytics: true,
    },
    {
      id: "tf-7d",
      label: "آخر ٧ أيام",
      icon: <Calendar size={16} />,
      action: () => {
        window.dispatchEvent(new CustomEvent("setTf", { detail: "7d" }));
        setOpen(false);
      },
      group: "تصفية",
      keywords: ["7d", "اسبوع"],
      onlyInAnalytics: true,
    },
    {
      id: "tf-30d",
      label: "آخر ٣٠ يوم",
      icon: <Calendar size={16} />,
      action: () => {
        window.dispatchEvent(new CustomEvent("setTf", { detail: "30d" }));
        setOpen(false);
      },
      group: "تصفية",
      keywords: ["30d", "شهر"],
      onlyInAnalytics: true,
    },
    {
      id: "tf-90d",
      label: "آخر ٩٠ يوم",
      icon: <Calendar size={16} />,
      action: () => {
        window.dispatchEvent(new CustomEvent("setTf", { detail: "90d" }));
        setOpen(false);
      },
      group: "تصفية",
      keywords: ["90d", "٣ شهور"],
      onlyInAnalytics: true,
    },
    {
      id: "tf-year",
      label: "هذه السنة",
      icon: <Calendar size={16} />,
      action: () => {
        window.dispatchEvent(new CustomEvent("setTf", { detail: "year" }));
        setOpen(false);
      },
      group: "تصفية",
      keywords: ["year", "سنة"],
      onlyInAnalytics: true,
    },
  ];

  const filteredByGroup = (group: CmdItem["group"]) =>
    ITEMS.filter((item) => {
      if (item.group !== group) return false;
      if (item.onlyInAnalytics && !isInAnalytics) return false;

      return (
        search === "" ||
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.keywords?.some((k) =>
          k.toLowerCase().includes(search.toLowerCase()),
        )
      );
    });

  if (!open) return null;

  const ALL_GROUPS: CmdItem["group"][] = [
    "التنقل",
    "التحليلات والإحصاءات",
    "الإجراءات السريعة",
    "تصفية",
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]"
      dir="rtl"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#3D2B1F]/40 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setOpen(false)}
      />

      {/* Command Palette Modal */}
      <div className="relative w-full max-w-[560px] bg-white rounded-2xl border border-[#EDE5D8] shadow-[0_24px_64px_rgba(61,43,31,0.18),0_8px_24px_rgba(61,43,31,0.1)] overflow-hidden transition-all transform scale-100">
        <Command className="w-full font-inherit" label="البحث السريع">
          {/* Search Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#EDE5D8] bg-white">
            <Search
              size={18}
              className="text-[#B89A5A] flex-shrink-0 stroke-[2px]"
            />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="ابحث عن صفحة، منتج، طلب، مستخدم، أو أمر..."
              className="flex-1 border-none outline-none bg-transparent text-[#3D2B1F] text-[0.95rem] placeholder:text-[#A89585]/60"
              autoFocus
            />
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg border border-[#EDE5D8] bg-[#FAF7F2] cursor-pointer flex items-center justify-center text-[#A89585] hover:bg-[#F5EFE6] hover:text-[#3D2B1F] transition-all flex-shrink-0"
              aria-label="إغلاق"
            >
              <X size={13} />
            </button>
          </div>

          {/* List Content */}
          <Command.List className="max-h-[380px] overflow-y-auto p-2 space-y-1">
            <Command.Empty className="py-8 text-center text-sm text-[#A89585]">
              لا توجد نتائج لـ «{search}»
            </Command.Empty>

            {ALL_GROUPS.map((group) => {
              const currentItems = filteredByGroup(group);
              if (currentItems.length === 0) return null;

              return (
                <Command.Group key={group} heading={group}>
                  {/* Heading */}
                  <div className="px-2.5 py-2 text-[11px] font-bold text-[#A89585] uppercase tracking-wider select-none">
                    {group}
                  </div>

                  {/* Items */}
                  {currentItems.map((item) => (
                    <Command.Item
                      key={item.id}
                      value={`${item.label} ${item.description ?? ""} ${item.keywords?.join(" ") ?? ""}`}
                      onSelect={item.action}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-[#3D2B1F] outline-none select-none transition-all duration-150 data-[selected=true]:bg-[#FBF6EC]"
                    >
                      {/* Icon Box */}
                      <div className="w-[34px] h-[34px] rounded-lg bg-[#F5EFE6] flex items-center justify-center text-[#B89A5A] flex-shrink-0 transition-colors data-[selected=true]:bg-[#B89A5A] data-[selected=true]:text-white">
                        {item.icon}
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#3D2B1F]">
                          {item.label}
                        </div>
                        {item.description && (
                          <div className="text-xs text-[#A89585] mt-0.5 truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              );
            })}
          </Command.List>

          {/* Footer Guide */}
          <div className="px-4 py-2.5 bg-[#FAF7F2] border-t border-[#EDE5D8] flex gap-4 text-[11px] text-[#A89585] font-medium">
            <span>↑↓ للتنقل</span>
            <span>↵ للتنفيذ</span>
            <span>Esc للإغلاق</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
