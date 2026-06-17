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
//
// --bg         #f8f4ec  →  #fefdfb   footer strip / subtle tints
// --bg-deep    #ede8dc  →  #f5f2eb   section dividers / card bg
// --gold       #a07830  →  #b18535   primary accent
// --gold-mid   #b89040  →  #c19a4e   secondary accent / hover
// --gold-bright#d0a820  →  #ddb327   highlight / badge
// --text-1     #181008  →  #261a0d   primary text on dark
// --text-2     #483820  →  #544226   secondary text / borders
// --text-3     #806840  →  #8e7548   muted text
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
        جارٍ تحميل الخريطة…
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
  phone: "0532055715",
  whatsapp: "966532055715", // digits-only for wa.me
  whatsappDisplay: "+966 53 205 5715",
  email: "info@mawtinalriyf.com",
};

// ── Inline SVGs ───────────────────────────────────────────────────────────────
const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
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
    aria-hidden="true"
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
    aria-hidden="true"
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
    aria-hidden="true"
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
    aria-hidden="true"
    className="w-5 h-5"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-1.02-.07z" />
  </svg>
);

const PayPalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 124 33"
    aria-label="PayPal"
    role="img"
    className="h-7 w-auto"
  >
    <path
      fill="#253B80"
      d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.468 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z"
    />
    <path
      fill="#179BD7"
      d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zM115.434 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.312 1.918.131 3.752 1.219 5.031 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0-.565-.658zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317zM119.295 7.23l-2.807 17.858a.569.569 0 0 0 .562.658h2.822c.469 0 .867-.34.939-.803l2.768-17.536a.57.57 0 0 0-.562-.659h-3.16a.571.571 0 0 0-.562.482z"
    />
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

// ── Shared token references (lightened palette) ───────────────────────────────
// bg-footer    : #f5f2eb  (--bg-deep +4L)
// bg-card      : #fefdfb  (--bg +4L)
// border       : rgba(84,66,38,0.14)   (--text-2 +4L based)
// border-md    : rgba(84,66,38,0.24)
// gold         : #b18535  (--gold +4L)
// gold-mid     : #c19a4e  (--gold-mid +4L)
// gold-bright  : #ddb327  (--gold-bright +4L)
// text-primary : #261a0d  (--text-1 +4L)
// text-secondary:#544226  (--text-2 +4L)
// text-muted   : #8e7548  (--text-3 +4L)

export default function Footer() {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const currentYear = new Date().getFullYear();

  const { data: categories = [] } = useQuery<CategoryWithSubs[]>({
    queryKey: categoriesQueryOptions.queryKey,
    staleTime: 60 * 60 * 1000, // ساعة كاملة كاش في الكلاينت
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

                {/*
                  SEO STRATEGY:
                  ┌─ Main category  → /products/collections/[ctg.slug]
                  └─ Sub-category   → /products/[ctg.slug]/[sub.slug]

                  All links are rendered in the DOM (crawlable by Googlebot).
                  Items past index 4 are sr-only (visually hidden) until the
                  toggle fires — keyboard users and bots see everything.
                */}
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
              {/* Social links */}
              <div>
                <p
                  className="text-xs mb-3 font-medium"
                  style={{ color: "#8e7548" }}
                >
                  تابعنا على
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.instagram.com/alreeefl11/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="موطن الريف على إنستغرام"
                    className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:opacity-70 hover:-translate-y-0.5 shadow-sm"
                    style={{
                      background: "#fefdfb",
                      color: "#b18535",
                      border: "1px solid rgba(84,66,38,0.18)",
                    }}
                  >
                    <InstagramIcon />
                  </a>
                  <a
                    href="https://www.tiktok.com/@mafrushatalriyf1"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="موطن الريف على تيك توك"
                    className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:opacity-70 hover:-translate-y-0.5 shadow-sm"
                    style={{
                      background: "#fefdfb",
                      color: "#261a0d",
                      border: "1px solid rgba(84,66,38,0.18)",
                    }}
                  >
                    <TikTokIcon />
                  </a>
                </div>
              </div>

              {/* Payment badge */}
              <div className="flex flex-col items-start sm:items-end gap-2">
                <p className="text-xs font-medium" style={{ color: "#8e7548" }}>
                  الدفع الآمن عبر
                </p>
                <div
                  className="bg-white rounded-xl px-4 py-2.5 shadow-sm"
                  style={{ border: "1px solid rgba(84,66,38,0.14)" }}
                >
                  <PayPalIcon />
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
