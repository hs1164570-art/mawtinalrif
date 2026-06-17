"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Home, Info, LayoutDashboard } from "lucide-react"; // ضفنا أيقونات مساعدة للموبايل والترتيب
import { categoriesQueryOptions } from "@/utils/categories";

interface NavLinksProps {
  isDesktop: boolean;
  isAdmin: boolean;
  onClose: () => void;
}

/* 🎨 الألوان الأساسية المأخوذة من لوحة تحكم "موطن الريف" */
const linkBase =
  "block px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 " +
  "text-[#2e261f] hover:text-[#000000] hover:bg-[#f3ede4] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c6239]";

const subLinkBase =
  "block px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c6239]";

export default function NavLinks({
  isDesktop,
  isAdmin,
  onClose,
}: NavLinksProps) {
  const { data: categories = [], isLoading } = useQuery(categoriesQueryOptions);
  const [openId, setOpenId] = useState<string | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback((id: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setOpenId(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeout.current = setTimeout(() => setOpenId(null), 200);
  }, []);

  const handleTriggerClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  if (isLoading) {
    return isDesktop ?
        <div className="flex items-center gap-2" aria-hidden="true">
          {[90, 80, 100, 75, 85].map((w) => (
            <div
              key={w}
              style={{ width: w }}
              className="h-8 rounded-xl bg-[#f3ede4] animate-pulse"
            />
          ))}
        </div>
      : null;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // نسخة الديسكتوب (Desktop & Tablet Row)
  // ══════════════════════════════════════════════════════════════════════════
  if (isDesktop) {
    return (
      <ul
        role="menubar"
        aria-label="الأقسام الرئيسية"
        className="flex items-center gap-1 flex-nowrap py-2 overflow-visible"
      >
        {/* 1. رابط الرئيسية الثابت */}
        <li role="none" className="flex-shrink-0">
          <Link href="/" role="menuitem" onClick={onClose} className={linkBase}>
            الرئيسية
          </Link>
        </li>

        {/* 2. رندرة الأقسام الديناميكية القادمة من السيرفر */}
        {categories.map((cat) => {
          const hasChildren = cat.children && cat.children.length > 0;
          const isOpen = openId === cat.id;

          return (
            <li
              key={cat.id}
              role="none"
              className="relative flex-shrink-0 overflow-visible"
              {...(hasChildren ?
                {
                  onMouseEnter: () => handleMouseEnter(cat.id),
                  onMouseLeave: handleMouseLeave,
                }
              : {})}
            >
              {hasChildren ?
                <>
                  <button
                    role="menuitem"
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    onClick={(e) => handleTriggerClick(e, cat.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setOpenId(null);
                    }}
                    className={[
                      "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border",
                      "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c6239]",
                      isOpen ?
                        "bg-[#f3ede4] text-[#000000] border-[#dcd4c9] shadow-sm"
                      : "text-[#2e261f] bg-transparent border-transparent hover:bg-[#f3ede4] hover:text-[#000000]",
                    ].join(" ")}
                  >
                    <span>{cat.name}</span>
                    <ChevronDown
                      className={[
                        "w-4 h-4 text-[#2e261f] transition-transform duration-300",
                        isOpen ? "rotate-180" : "",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </button>

                  {/* الـ Dropdown Panel */}
                  <div
                    role="menu"
                    aria-label={`قائمة قسم ${cat.name}`}
                    className={[
                      "absolute top-full start-0 z-[99999] pointer-events-auto pt-2",
                      "min-w-[240px]",
                      "transition-all duration-200 origin-top-start",
                      isOpen ?
                        "opacity-100 scale-100 translate-y-0 visible"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none invisible",
                    ].join(" ")}
                  >
                    <div className="p-2 space-y-0.5 bg-[#faf6f0] rounded-2xl border border-[#dcd4c9] shadow-[0_15px_35px_rgba(46,38,31,0.08)]">
                      <Link
                        href={`/products/collections/${cat.slug}`}
                        role="menuitem"
                        onClick={() => {
                          setOpenId(null);
                          onClose();
                        }}
                        className={[
                          subLinkBase,
                          "block text-[#000000] font-bold border-b border-[#e6dfd5] pb-2 mb-1.5 rounded-b-none bg-[#f3ede4] hover:bg-[#eadecc]",
                        ].join(" ")}
                      >
                        عرض كل {cat.name}
                      </Link>

                      {cat.children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/products/${cat.slug}/${sub.slug}`}
                          role="menuitem"
                          onClick={() => {
                            setOpenId(null);
                            onClose();
                          }}
                          className={[
                            subLinkBase,
                            "block text-[#4a4035] hover:text-[#000000] hover:bg-[#f3ede4]",
                          ].join(" ")}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              : <Link
                  href={`/products/${cat.slug}`}
                  role="menuitem"
                  onClick={() => {
                    setOpenId(null);
                    onClose();
                  }}
                  className={linkBase}
                >
                  {cat.name}
                </Link>
              }
            </li>
          );
        })}

        {/* 3. رابط عن الشركة (About) الثابت */}
        <li role="none" className="flex-shrink-0">
          <Link
            href="/about"
            role="menuitem"
            onClick={onClose}
            className={linkBase}
          >
            من نحن
          </Link>
        </li>

        {/* 4. رابط لوحة التحكم للمسؤول (Admin Dashboard) الثابت */}
        {isAdmin && (
          <li role="none" className="flex-shrink-0">
            <Link
              href="/admin"
              role="menuitem"
              onClick={onClose}
              className={[
                linkBase,
                "text-[#b89a5a] hover:bg-[#b89a5a]/[0.08] hover:text-[#8c6239]",
              ].join(" ")}
            >
              لوحة تحكم الأدمن
            </Link>
          </li>
        )}
      </ul>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // نسخة الموبايل والتابلت (Accordion Mobile Sidebar Menu)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <ul className="space-y-1">
      {/* 1. الرئيسية للموبايل */}
      <li className="border-b border-[#e6dfd5]">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#2e261f] hover:bg-[#f3ede4] transition-colors"
        >
          <Home className="w-4 h-4 text-[#b89a5a]" />
          <span>الرئيسية</span>
        </Link>
      </li>

      {/* 2. رندرة الأقسام الديناميكية */}
      {categories.map((cat) => {
        const hasChildren = cat.children && cat.children.length > 0;
        const isOpen = openId === cat.id;

        return (
          <li key={cat.id} className="border-b border-[#e6dfd5] last:border-0">
            {hasChildren ?
              <div className="py-0.5">
                <button
                  aria-expanded={isOpen}
                  aria-controls={`mob-sub-${cat.id}`}
                  onClick={() => setOpenId(isOpen ? null : cat.id)}
                  className="w-full flex items-center justify-between px-4 py-3
                    rounded-xl text-sm font-bold text-[#2e261f]
                    hover:bg-[#f3ede4] transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c6239]"
                >
                  <span>{cat.name}</span>
                  <ChevronDown
                    className={[
                      "w-4 h-4 text-[#2e261f] transition-transform duration-200",
                      isOpen ? "rotate-180" : "",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={`mob-sub-${cat.id}`}
                  className={[
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ?
                      "max-h-[500px] opacity-100 mt-1"
                    : "max-h-0 opacity-0",
                  ].join(" ")}
                >
                  <div className="pe-2 ps-6 pb-2 pt-1 space-y-1 bg-[#faf6f0] rounded-xl border border-[#dcd4c9]">
                    <Link
                      href={`/products/collections/${cat.slug}`}
                      onClick={onClose}
                      className="block px-4 py-2.5 text-sm rounded-lg
                        text-[#000000] font-bold hover:bg-[#eadecc] transition-colors
                        border-b border-[#e6dfd5] mb-1"
                    >
                      عرض الكل
                    </Link>
                    {cat.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/products/${cat.slug}/${sub.slug}`}
                        onClick={onClose}
                        className="block px-4 py-2 text-sm rounded-lg
                          text-[#4a4035] hover:text-[#000000] hover:bg-[#f3ede4] transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            : <Link
                href={`/products/collections/${cat.slug}`}
                onClick={onClose}
                className="block px-4 py-3 rounded-xl text-sm font-bold
                  text-[#2e261f] hover:text-[#000000] hover:bg-[#f3ede4] transition-colors"
              >
                {cat.name}
              </Link>
            }
          </li>
        );
      })}

      {/* 3. من نحن للموبايل */}
      <li className="border-t border-[#e6dfd5] pt-1">
        <Link
          href="/about"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#2e261f] hover:bg-[#f3ede4] transition-colors"
        >
          <Info className="w-4 h-4 text-[#b89a5a]" />
          <span>من نحن</span>
        </Link>
      </li>

      {/* 4. لوحة التحكم للموبايل (تظهر فقط للأدمن) */}
      {isAdmin && (
        <li className="border-t border-[#e6dfd5]/60 pt-1">
          <Link
            href="/adminDashboard"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#b89a5a] bg-[#b89a5a]/[0.04] hover:bg-[#b89a5a]/[0.09] transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>لوحة الإدارة (adminDashboard)</span>
          </Link>
        </li>
      )}
    </ul>
  );
}
