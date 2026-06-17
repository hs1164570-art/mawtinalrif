"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { User, Package, ShoppingBag, LogOut, LogIn } from "lucide-react";
import type { NavUserData } from "../navbar";

// ── Static menu items ─────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { href: "/profile", label: "الملف الشخصي", icon: User },
  { href: "/orders", label: "طلباتي", icon: Package },
  { href: "/cart", label: "السلة", icon: ShoppingBag },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProfileBtn({ user }: { user: NavUserData | null }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click / touch
  const handleOutside = useCallback((e: MouseEvent | TouchEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  }, []);

  // Close on Escape
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [handleOutside, handleKey]);

  // ── Not logged in → Login button ───────────────────────────────────────────
  if (!user) {
    return (
      <Link
        href="/auth/login"
        aria-label="تسجيل الدخول"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
          text-[#4a2e10] border border-[rgba(90,60,20,0.14)]
          hover:bg-[rgba(90,60,20,0.05)] transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a460]"
      >
        <LogIn className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">تسجيل الدخول </span>
      </Link>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative">
      {/* Avatar / Icon trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`حساب ${user.name ?? "المستخدم"}`}
        className={[
          "flex items-center p-1 rounded-xl transition-all duration-150",
          "hover:bg-[rgba(90,60,20,0.05)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a460]",
          open ? "ring-2 ring-[rgba(200,164,96,0.4)]" : "",
        ].join(" ")}
      >
        <div
          className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0
            ring-2 ring-[rgba(200,164,96,0.35)] bg-[rgba(200,164,96,0.10)]
            flex items-center justify-center"
        >
          {user.image ?
            <Image
              src={user.image}
              alt={user.name ?? "المستخدم"}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          : <User className="w-4 h-4 text-[#c8a460]" aria-hidden="true" />}
        </div>
      </button>

      {/* ── Dropdown ──────────────────────────────────────────────────── */}
      <div
        role="menu"
        aria-label="قائمة الحساب"
        className={[
          "absolute end-0 top-full mt-2 z-50 w-56",
          "bg-white rounded-2xl",
          "border border-[rgba(90,60,20,0.08)]",
          "shadow-[0_8px_32px_rgba(60,38,10,0.12)]",
          "overflow-hidden",
          "transition-all duration-200 origin-top-end",
          open ?
            "opacity-100 scale-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-95 -translate-y-1 pointer-events-none",
        ].join(" ")}
      >
        {/* User info header */}
        <div className="px-4 py-3 border-b border-[rgba(90,60,20,0.06)]">
          <p className="text-sm font-semibold text-[#2c1c08] truncate">
            {user.name ?? "مستخدم"}
          </p>
          {user.email && (
            <p className="text-xs text-[#7a6040] truncate mt-0.5">
              {user.email}
            </p>
          )}
        </div>

        {/* Menu links */}
        <div className="p-1.5 space-y-0.5">
          {MENU_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                text-[#2c1c08] hover:bg-[rgba(90,60,20,0.05)] transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a460]"
            >
              <Icon
                className="w-4 h-4 text-[#7a6040] flex-shrink-0"
                aria-hidden="true"
              />
              {label}
            </Link>
          ))}
        </div>

        {/* Sign out */}
        <div className="p-1.5 pt-0 border-t border-[rgba(90,60,20,0.06)]">
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
              text-red-600 hover:bg-red-50 transition-colors mt-1
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}
