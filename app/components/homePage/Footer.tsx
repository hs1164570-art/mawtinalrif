"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { categoriesQueryOptions } from "@/utils/categories";
import type { RootCategory } from "@/utils/category";
import { DOMAIN } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────────────────────
// Palette — 2 lightness-degrees lighter than the site's CSS variables
// (+4 HSL lightness pts per "degree")
// ─────────────────────────────────────────────────────────────────────────────

// ── Lazy-load the map iframe (keeps Lighthouse score clean) ──────────────────
const MapEmbed = dynamic(() => import("./MapEmbed"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-52 rounded-xl animate-pulse flex items-center justify-center"
      style={{ background: "#ece4d7" }}
    >
      <span className="text-sm font-arabic" style={{ color: "#8e7548" }}>
        Refetching map…
      </span>
    </div>
  ),
});

// ── Static informational links ────────────────────────────────────────────────
const INFO_LINKS: { label: string; href: string }[] = [
  { label: "الأسئلة الشائعة", href: "/about#faq" },
  { label: "عن المؤسسة", href: "/about#about" },
  { label: "الشحن والتوصيل", href: "/about#shipping" },
  { label: "تواصل معنا", href: "/about#contact" },
];

// ── Contact details ───────────────────────────────────────────────────────────
const CONTACT = {
  phone: "0557211359",
  whatsapp: "966557211359",
  whatsappDisplay: "+966 55 721 1359",
  email: "info@mawtinalriyf.com",
};

// ── Inline SVGs (Contact & Socials) ──────────────────────────────────────────
const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4 shrink-0"
  >
    <path
      fillRule="evenodd"
      d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
      clipRule="evenodd"
    />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4 shrink-0"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4 shrink-0"
  >
    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-1.02-.07z" />
  </svg>
);

const SnapchatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M12 2c-3.93 0-5.5 2.5-5.5 5 0 .5.11.94.27 1.34-.64.38-1.27.91-1.27 1.91 0 .82.59 1.28 1.14 1.41-.12.44-.14.93-.14 1.34 0 2.2 1.54 3.75 3.5 4.25-.33.39-.75 1.03-.75 1.75 0 .75.44 1.5 1.5 1.75.25.06.5.25.5.5s-.25.5-.5.5h-1c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1h-1c-.25 0-.5-.25-.5-.5s.25-.44.5-.5c1.06-.25 1.5-1 1.5-1.75 0-.72-.42-1.36-.75-1.75 1.96-.5 3.5-2.05 3.5-4.25 0-.41-.02-.9-.14-1.34.55-.13 1.14-.59 1.14-1.41 0-1-.63-1.53-1.27-1.91.16-.4.27-.84.27-1.34 0-2.5-1.57-5-5.5-5z" />
  </svg>
);

const PinterestIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.63-.13-1.6.03-2.3l1.37-5.8s-.35-.7-.35-1.74c0-1.63.95-2.85 2.13-2.85 1 0 1.49.75 1.49 1.66 0 1-.64 2.52-.97 3.92-.28 1.18.59 2.14 1.75 2.14 2.1 0 3.72-2.22 3.72-5.42 0-2.84-2.04-4.82-4.94-4.82-3.37 0-5.34 2.53-5.34 5.14 0 1 .39 2.12.88 2.72a.3.3 0 0 1 .07.25c-.08.33-.26 1.06-.3 1.22a.23.23 0 0 1-.14.15c-1.16-.54-1.88-2.23-1.88-3.6 0-3.86 2.8-7.4 8.08-7.4 4.24 0 7.54 3.02 7.54 7.06 0 4.22-2.66 7.62-6.35 7.62-1.24 0-2.4-.64-2.8-1.4l-.76 2.9c-.28 1.07-1 2.4-1.5 3.22A12 12 0 1 0 12 0z" />
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// ── Types ─────────────────────────────────────────────────────────────────────
type SubCategory = {
  id: string;
  slug: string;
  name: string;
};

type CategoryWithSubs = RootCategory & {
  subcategories?: SubCategory[];
};

export default function Footer() {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const currentYear = new Date().getFullYear();

  const { data: categories = [] } = useQuery<CategoryWithSubs[]>({
    queryKey: categoriesQueryOptions.queryKey,
    staleTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<CategoryWithSubs[]> => {
      try {
        const res = await fetch(`${DOMAIN}/api/categories`, {
          next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        return res.json();
      } catch {
        return [];
      }
    },
  });
  const VISIBLE_COUNT = 5;

  return (
    <footer
      dir="rtl"
      className="font-arabic mt-auto"
      style={{ background: "#ece4d7" }}
      aria-label="تذييل الصفحة"
    >
      {/* ── Top gold accent stripe ─────────────────────────────────────────── */}
      <div
        className="h-[3px] w-full"
        style={{
          background:
            "linear-gradient(90deg, #b18535 0%, #c19a4e 40%, #ddb327 70%, #b18535 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* ══════════════════════════════════════════════════════════════════
              FIRST HALF — Brand, Info Links, Category Links
          ══════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-10">
            {/* Brand logo */}
            <Link href="/" aria-label="الصفحة الرئيسية — موطن الريف">
              <Image
                src="https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/logo.png"
                alt="شعار موطن الريف"
                width={155}
                quality={95}
                loading="lazy"
                height={62}
                className="object-contain drop-shadow-sm"
                priority={false}
              />
            </Link>

            {/* Two-column link grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* ── Column 1: حول موطن الريف ─────────────────────────────── */}
              <nav aria-label="روابط موطن الريف">
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-5"
                  style={{ color: "#b18535" }}
                >
                  <span
                    className="block pb-2"
                    style={{ borderBottom: "1px solid rgba(84,66,38,0.18)" }}
                  >
                    حول موطن الريف
                  </span>
                </h3>
                <ul className="space-y-3">
                  {INFO_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm flex items-center gap-2 transition-opacity duration-200 hover:opacity-60"
                        style={{ color: "#544226" }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: "#b18535" }}
                          aria-hidden="true"
                        />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* ── Column 2: روابط سريعة (dynamic categories) ───────────── */}
              <nav aria-label="تصفح الفئات">
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-5"
                  style={{ color: "#b18535" }}
                >
                  <span
                    className="block pb-2"
                    style={{ borderBottom: "1px solid rgba(84,66,38,0.18)" }}
                  >
                    روابط سريعة
                  </span>
                </h3>

                <ul className="space-y-2">
                  {categories.map((cat: CategoryWithSubs, idx: number) => {
                    const isHidden = idx >= VISIBLE_COUNT && !showAllCategories;
                    return (
                      <li key={cat.id ?? cat.slug ?? idx}>
                        {/* Main category */}
                        <Link
                          href={`/products/collections/${cat.slug}`}
                          className={[
                            "text-sm flex items-center gap-2 transition-opacity duration-200 hover:opacity-60",
                            isHidden ? "sr-only" : "",
                          ].join(" ")}
                          style={{ color: "#544226" }}
                          tabIndex={isHidden ? -1 : 0}
                          aria-hidden={isHidden || undefined}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: "#b18535" }}
                            aria-hidden="true"
                          />
                          {cat.name}
                        </Link>

                        {/* Sub-categories */}
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <ul
                            className={[
                              "mt-1 space-y-1 pe-4",
                              isHidden ? "sr-only" : "",
                            ].join(" ")}
                            aria-hidden={isHidden || undefined}
                          >
                            {cat.subcategories.map((sub: SubCategory) => (
                              <li key={sub.id ?? sub.slug}>
                                <Link
                                  href={`/products/${cat.slug}/${sub.slug}`}
                                  className="text-xs flex items-center gap-1.5 transition-opacity duration-200 hover:opacity-60"
                                  style={{ color: "#8e7548" }}
                                  tabIndex={isHidden ? -1 : 0}
                                  aria-hidden={isHidden || undefined}
                                >
                                  <span
                                    className="w-1 h-1 rounded-full shrink-0"
                                    style={{ background: "#c19a4e" }}
                                    aria-hidden="true"
                                  />
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Show more / less toggle */}
                {categories.length > VISIBLE_COUNT && (
                  <button
                    type="button"
                    onClick={() => setShowAllCategories((prev) => !prev)}
                    className="mt-4 text-xs underline underline-offset-2 transition-opacity duration-200 hover:opacity-60 cursor-pointer"
                    style={{ color: "#b18535" }}
                    aria-expanded={showAllCategories}
                  >
                    {showAllCategories ? "عرض أقل ▲" : "عرض المزيد ▼"}
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              SECOND HALF — Map, Contact, Socials, Payments
          ══════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-8">
            <h3
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#b18535" }}
            >
              <span
                className="block pb-2"
                style={{ borderBottom: "1px solid rgba(84,66,38,0.18)" }}
              >
                موقعنا وتواصل معنا
              </span>
            </h3>

            {/* Google Maps — lazy loaded */}
            <div
              className="rounded-xl overflow-hidden shadow-sm"
              style={{ outline: "1px solid rgba(84,66,38,0.18)" }}
            >
              <MapEmbed />
            </div>

            {/* ── Contact details ─────────────────────────────────────────── */}
            <address className="not-italic">
              <ul className="space-y-3">
                {/* Phone */}
                <li>
                  <a
                    href={`tel:${CONTACT.phone}`}
                    className="text-sm flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-60"
                    style={{ color: "#544226" }}
                    aria-label={`اتصل بنا على ${CONTACT.phone}`}
                  >
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-lg"
                      style={{
                        background: "#fefdfb",
                        color: "#b18535",
                        border: "1px solid rgba(84,66,38,0.18)",
                      }}
                    >
                      <PhoneIcon />
                    </span>
                    <span dir="ltr">{CONTACT.phone}</span>
                  </a>
                </li>

                {/* WhatsApp */}
                <li>
                  <a
                    href={`https://wa.me/${CONTACT.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-60"
                    style={{ color: "#544226" }}
                    aria-label={`تواصل عبر واتساب ${CONTACT.whatsappDisplay}`}
                  >
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-lg"
                      style={{
                        background: "#fefdfb",
                        color: "#25D366",
                        border: "1px solid rgba(84,66,38,0.18)",
                      }}
                    >
                      <WhatsAppIcon />
                    </span>
                    <span dir="ltr">{CONTACT.whatsappDisplay}</span>
                  </a>
                </li>

                {/* Email */}
                <li>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="text-sm flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-60"
                    style={{ color: "#544226" }}
                    aria-label={`راسلنا على ${CONTACT.email}`}
                  >
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-lg"
                      style={{
                        background: "#fefdfb",
                        color: "#b18535",
                        border: "1px solid rgba(84,66,38,0.18)",
                      }}
                    >
                      <EmailIcon />
                    </span>
                    <span dir="ltr">{CONTACT.email}</span>
                  </a>
                </li>
              </ul>
            </address>

            {/* ── Socials + Payment ───────────────────────────────────────── */}
            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-4"
              style={{ borderTop: "1px solid rgba(84,66,38,0.14)" }}
            >
              {/* Social links (Updated with exact counts and IDs from screenshots) */}
              <div>
                <p
                  className="text-xs mb-3 font-medium"
                  style={{ color: "#8e7548" }}
                >
                  تابعنا على
                </p>
                <div className="flex items-center flex-wrap gap-2.5">
                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/al_rif.foundation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="موطن الريف على إنستغرام"
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:opacity-70 hover:-translate-y-0.5 shadow-sm"
                    style={{
                      background: "#fefdfb",
                      color: "#b18535",
                      border: "1px solid rgba(84,66,38,0.18)",
                    }}
                  >
                    <InstagramIcon />
                  </a>

                  {/* TikTok */}
                  <a
                    href="https://www.tiktok.com/@al_rif.foundation"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="موطن الريف على تيك توك"
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:opacity-70 hover:-translate-y-0.5 shadow-sm"
                    style={{
                      background: "#fefdfb",
                      color: "#261a0d",
                      border: "1px solid rgba(84,66,38,0.18)",
                    }}
                  >
                    <TikTokIcon />
                  </a>

                  {/* Snapchat */}
                  <a
                    href="https://snapchat.com/t/9fx3W32S"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="موطن الريف على سناب شات"
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:opacity-70 hover:-translate-y-0.5 shadow-sm"
                    style={{
                      background: "#fefdfb",
                      color: "#FFFC00",
                      border: "1px solid rgba(84,66,38,0.18)",
                    }}
                  >
                    <SnapchatIcon />
                  </a>

                  {/* Pinterest */}
                  <a
                    href="https://pin.it/1MO6eVgpf"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="موطن الريف على بينتريست"
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:opacity-70 hover:-translate-y-0.5 shadow-sm"
                    style={{
                      background: "#fefdfb",
                      color: "#E60023",
                      border: "1px solid rgba(84,66,38,0.18)",
                    }}
                  >
                    <PinterestIcon />
                  </a>

                  {/* X (Twitter) */}
                  <a
                    href="https://x.com/a_riffoundation"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="موطن الريف على منصة إكس"
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:opacity-70 hover:-translate-y-0.5 shadow-sm"
                    style={{
                      background: "#fefdfb",
                      color: "#261a0d",
                      border: "1px solid rgba(84,66,38,0.18)",
                    }}
                  >
                    <XIcon />
                  </a>
                </div>
              </div>

              {/* Payment badges (Replaced PayPal with Tamara, Tabby, Visa, Mastercard Logos) */}
              <div className="flex flex-col items-start sm:items-end gap-2">
                <p className="text-xs font-medium" style={{ color: "#8e7548" }}>
                  طرق الدفع الآمنة
                </p>
                <div
                  className="bg-white rounded-xl px-3 py-1.5 shadow-sm flex items-center gap-3"
                  style={{ border: "1px solid rgba(84,66,38,0.14)" }}
                >
                  {/* تمارا */}
                  <Image
                    src="https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/tamara.png"
                    alt="Tamara"
                    width={45}
                    height={15}
                    className="object-contain"
                  />
                  {/* تابي */}
                  <Image
                    src="https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/tabby.png"
                    alt="Tabby"
                    width={40}
                    height={15}
                    className="object-contain"
                  />
                  {/* فيزا */}
                  <Image
                    src="https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/visa.png"
                    alt="Visa"
                    width={35}
                    height={15}
                    className="object-contain"
                  />
                  {/* ماستر كارد */}
                  <Image
                    src="https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/mastercard.png"
                    alt="Mastercard"
                    width={28}
                    height={15}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom copyright bar ──────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(84,66,38,0.14)" }}>
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4
            flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ color: "#8e7548" }}
        >
          {/* Copyright + policy links */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <p>
              © {currentYear}{" "}
              <span className="font-medium" style={{ color: "#544226" }}>
                موطن الريف
              </span>
              . جميع الحقوق محفوظة لموطن الريف.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/about#privacy"
                className="transition-opacity duration-200 hover:opacity-60"
              >
                سياسة الخصوصية
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href="/about#terms"
                className="transition-opacity duration-200 hover:opacity-60"
              >
                الشروط والأحكام
              </Link>
            </div>
          </div>

          {/* Powered by */}
          <a
            href="https://protofolio-smoky.vercel.app/en"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-opacity duration-200 hover:opacity-70"
            style={{ color: "#8e7548" }}
            aria-label="Powered by Ebrahim Abozaid — Portfolio"
          >
            <span>
              Powered by{" "}
              <span className="font-semibold underline underline-offset-2">
                Ebrahim Abozaid
              </span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
