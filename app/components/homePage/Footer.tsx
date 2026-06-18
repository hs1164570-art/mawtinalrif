"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { categoriesQueryOptions } from "@/utils/categories";
import type { RootCategory } from "@/utils/category";
import { DOMAIN } from "@/lib/constants";
import {
  FaInstagram,
  FaTiktok,
  FaSnapchat,
  FaPinterest,
  FaXTwitter,
} from "react-icons/fa6";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";

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

// ── Inline SVGs ──────────────────────────────────────────────────────────────
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

const ICON_TONE = "#8e7548";

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
          {/* FIRST HALF — Brand, Info Links, Category Links */}
          <div className="flex flex-col gap-10">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Column 1: حول موطن الريف */}
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

              {/* Column 2: روابط سريعة */}
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
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
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

          {/* SECOND HALF — Map, Contact, Socials, Payments */}
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

            <div
              className="rounded-xl overflow-hidden shadow-sm"
              style={{ outline: "1px solid rgba(84,66,38,0.18)" }}
            >
              <MapEmbed />
            </div>

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

            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-4"
              style={{ borderTop: "1px solid rgba(84,66,38,0.14)" }}
            >
              <div>
                <p
                  className="text-xs mb-3 font-medium"
                  style={{ color: "#8e7548" }}
                >
                  تابعنا على
                </p>
                <div className="flex items-center flex-wrap gap-2.5">
                  <a
                    href="https://www.instagram.com/al_rif.foundation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="موطن الريف على إنستغرام"
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:opacity-70 hover:-translate-y-0.5 shadow-sm"
                    style={{
                      background: "#fefdfb",
                      color: ICON_TONE,
                      border: "1px solid rgba(84,66,38,0.18)",
                    }}
                  >
                    <FaInstagram className="w-5 h-5" />
                  </a>

                  <a
                    href="https://www.tiktok.com/@al_rif.foundation"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="موطن الريف على تيك توك"
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:opacity-70 hover:-translate-y-0.5 shadow-sm"
                    style={{
                      background: "#fefdfb",
                      color: ICON_TONE,
                      border: "1px solid rgba(84,66,38,0.18)",
                    }}
                  >
                    <FaTiktok className="w-5 h-5" />
                  </a>

                  <a
                    href="https://snapchat.com/t/9fx3W32S"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="موطن الريف على سناب شات"
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:opacity-70 hover:-translate-y-0.5 shadow-sm"
                    style={{
                      background: "#fefdfb",
                      color: ICON_TONE,
                      border: "1px solid rgba(84,66,38,0.18)",
                    }}
                  >
                    <FaSnapchat className="w-5 h-5" />
                  </a>

                  <a
                    href="https://pin.it/1MO6eVgpf"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="موطن الريف على بينتريست"
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:opacity-70 hover:-translate-y-0.5 shadow-sm"
                    style={{
                      background: "#fefdfb",
                      color: ICON_TONE,
                      border: "1px solid rgba(84,66,38,0.18)",
                    }}
                  >
                    <FaPinterest className="w-5 h-5" />
                  </a>

                  <a
                    href="https://x.com/a_riffoundation"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="موطن الريف على منصة إكس"
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:opacity-70 hover:-translate-y-0.5 shadow-sm"
                    style={{
                      background: "#fefdfb",
                      color: ICON_TONE,
                      border: "1px solid rgba(84,66,38,0.18)",
                    }}
                  >
                    <FaXTwitter className="w-[18px] h-[18px]" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <p className="text-xs font-medium" style={{ color: "#8e7548" }}>
                  طرق الدفع الآمنة
                </p>
                <div
                  className="bg-white rounded-xl px-3.5 py-2 shadow-sm flex items-center gap-4"
                  style={{ border: "1px solid rgba(84,66,38,0.14)" }}
                >
                  <span
                    className="text-xs font-bold lowercase tracking-tight leading-none"
                    style={{ color: ICON_TONE }}
                    aria-label="Tamara"
                  >
                    tamara
                  </span>

                  <span
                    className="text-xs font-bold lowercase tracking-tight leading-none"
                    style={{ color: ICON_TONE }}
                    aria-label="Tabby"
                  >
                    tabby
                  </span>

                  <FaCcVisa
                    className="h-6 w-auto"
                    style={{ color: ICON_TONE }}
                    aria-label="Visa"
                  />

                  <FaCcMastercard
                    className="h-6 w-auto"
                    style={{ color: ICON_TONE }}
                    aria-label="Mastercard"
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
