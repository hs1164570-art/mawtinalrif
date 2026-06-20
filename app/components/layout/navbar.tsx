"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import NavLinks from "./navbar/links";
import ProfileBtn from "./navbar/profile-btn";
import { useCart } from "@/hook/use-cart";
import CartDrawer from "./navbar/cart-drawer";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface NavUserData {
  name: string | null;
  email: string | null;
  image: string | null;
  id: string | null;
}

interface NavbarProps {
  user: NavUserData | null;
  isAdmin: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const LOGO_URL =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/sign/alrif/logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNzkzMzE5NS0xOGUwLTRkOTMtYTRiMC0xNjczMTVlOTUyMGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhbHJpZi9sb2dvLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODEwOTE3MjMsImV4cCI6Mjg1NjA1MDkxNzIzfQ.OUJVVv1wX0EZz3B6G056NI_Xv2qnUVxaa6hqsvFwlt4";

// ── Component ──────────────────────────────────────────────────────────────────
export default function Navbar({ user, isAdmin }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const pathname = usePathname();

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on desktop resize
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        dir="rtl"
        role="banner"
        className={[
          "sticky inset-x-0 top-0 z-50 transition-all duration-300 overflow-visible",
          scrolled ?
            "bg-[var(--bg)] shadow-[0_4px_32px_rgba(33,37,41,0.05)] border-b border-[var(--border)]"
          : "bg-[var(--bg)]",
        ].join(" ")}
      >
        {/* خط ذهبي ناعم تحت الهيدر مستوحى من الهوية الاستايلش */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--gold-bright)]/30 to-transparent pointer-events-none" />

        <nav
          aria-label="التنقل الرئيسي"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 overflow-visible"
        >
          {/* الحاوية الرئيسية للشاشات الكبيرة والتابلت */}
          <div className="hidden md:flex flex-col py-3 overflow-visible w-full">
            <div className="flex items-center justify-between w-full overflow-visible relative z-10">
              {/* اللوجو في أقصى اليمين */}
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-mid)]/50 rounded-lg"
                >
                  <Image
                    quality={95}
                    src={LOGO_URL}
                    alt="موطن الريف للأثاث"
                    width={130}
                    height={48}
                    className="h-11 w-auto object-contain"
                    priority
                  />
                </Link>
              </div>

              {/* الروابط في المنتصف تماماً (تظهر هنا فقط في الشاشات الكبيرة جداً التي تستوعبها) */}
              <div className="hidden xl:flex flex-wrap items-center justify-center gap-x-4 gap-y-1 overflow-visible mx-4">
                <NavLinks
                  isAdmin={isAdmin}
                  isDesktop={true}
                  onClose={() => {}}
                />
              </div>

              {/* الأزرار في أقصى اليسار متناسقة ومقابلة للوجو دائماً */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <CartDrawer>
                  <button className="relative p-2.5 rounded-xl text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-deep)] transition-all duration-200">
                    <ShoppingBag className="w-[21px] h-[21px]" />
                    {totalItems > 0 && (
                      <span className="absolute top-1.5 left-1.5 min-w-[17px] h-[17px] px-0.5 text-[9px] font-bold rounded-full bg-[var(--gold)] text-[var(--text-inv)] flex items-center justify-center leading-none">
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    )}
                  </button>
                </CartDrawer>

                <ProfileBtn user={user} />
              </div>
            </div>

            {/* السطر السفلي للروابط لشاشات التابلت والشاشات المتوسطة لحماية الهيدر من الانفجار */}
            <div className="flex xl:hidden flex-wrap items-center justify-center gap-x-4 gap-y-1 overflow-visible w-full border-t border-[var(--border)] pt-2 mt-2">
              <NavLinks isAdmin={isAdmin} isDesktop={true} onClose={() => {}} />
            </div>
          </div>

          {/* ── وضع الموبايل للشاشات الصغيرة ────────────────── */}
          <div className="flex md:hidden items-center justify-between h-[64px]">
            <Link href="/" className="flex-shrink-0">
              <Image
                src={LOGO_URL}
                alt="موطن الريف للأثاث"
                width={120}
                height={44}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>

            <div className="flex items-center gap-0.5">
              <CartDrawer>
                <button className="relative p-2.5 rounded-xl text-[var(--text-2)] hover:text-[var(--text-1)]">
                  <ShoppingBag className="w-[21px] h-[21px]" />
                  {totalItems > 0 && (
                    <span className="absolute top-1.5 left-1.5 min-w-[17px] h-[17px] px-0.5 text-[9px] font-bold rounded-full bg-[var(--gold)] text-[var(--text-inv)] flex items-center justify-center leading-none">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </button>
              </CartDrawer>

              <ProfileBtn user={user} />

              <button
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
                className="p-2.5 rounded-xl text-[var(--text-2)] hover:text-[var(--text-1)]"
              >
                {mobileOpen ?
                  <X className="w-5 h-5" />
                : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ── Mobile menu panel (للموبايل فقط) ──────────────── */}
      <div
        id="mobile-menu"
        role="navigation"
        aria-label="قائمة التنقل للموبايل"
        aria-hidden={!mobileOpen}
        className={[
          "fixed top-[64px] inset-x-0 z-50 md:hidden border-t border-[var(--border)] bg-[var(--bg)]",
          "transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden motion-reduce:transition-none",
          mobileOpen ?
            "max-h-[calc(100dvh-64px)] opacity-100 shadow-xl"
          : "max-h-0 opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div className="overflow-y-auto max-h-[calc(100dvh-64px)] px-4 pt-3 pb-8 space-y-1">
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-2 text-sm font-semibold text-[var(--gold-mid)] border border-[var(--gold-bright)]/20 bg-[var(--gold-bright)]/[0.03]"
            >
              <LayoutDashboard className="w-4 h-4" />
              لوحة التحكم
            </Link>
          )}
          <NavLinks
            isAdmin={isAdmin}
            isDesktop={false}
            onClose={() => setMobileOpen(false)}
          />
        </div>
      </div>

      {/* ── Mobile backdrop ─────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
        className={[
          "fixed inset-0 z-40 md:hidden",
          "bg-black/25 backdrop-blur-[1px]",
          "transition-opacity duration-300 ease-in-out motion-reduce:transition-none",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />
    </>
  );
}
