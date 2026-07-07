"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { categoriesQueryOptions } from "@/utils/categories";
import type { RootCategory } from "@/utils/category";
import { DOMAIN } from "@/lib/constants";
import { FaTiktok, FaSnapchat, FaPinterest, FaXTwitter } from "react-icons/fa6";

// ─────────────────────────────────────────────────────────────────────────────
// Palette — مبنية بالكامل من متغيرات اللون العامة الجديدة (رمادي محايد + سيان تفاعلي)
// ─────────────────────────────────────────────────────────────────────────────

// ── Lazy-load the map iframe (keeps Lighthouse score clean) ──────────────────
const MapEmbed = dynamic(() => import("./MapEmbed"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-52 rounded-xl animate-pulse flex items-center justify-center"
      style={{ background: "var(--bg-deep)" }}
    >
      <span className="text-sm font-arabic" style={{ color: "var(--text-3)" }}>
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
  { label: "تواصل معنا", href: "/contact" },
  { label: "سياسة الارجاع ", href: "/return-policy" },
  { label: "احجز استشارتك المجانية الان ", href: "/contact" },
  { label: "ماذا يقول عملائنا", href: "/#testimonials-section" },
];

// ── Contact details ───────────────────────────────────────────────────────────
const CONTACT = {
  phone: "0557211359",
  whatsapp: "966557211359",
  whatsappDisplay: "+966 55 721 1359",
  email: "info@mawtinalriyf.com",
};

// ── Official business/legal details (from commercial registration docs) ─────
const BUSINESS_INFO = {
  legalName: "مؤسسة موطن الريف للتجارة",
  crNumber: "451115770740", // رقم الرخصة التجارية الموحد (بلدي)
  vatNumber: "300844962400003", // الرقم الضريبي (VAT)
  shortAddress: "RQJA7773", // العنوان الوطني المختصر
  fullAddress: "حي الجزيرة، شارع رقم 3، الرياض 14261، المملكة العربية السعودية",
};

// ── Inline SVGs (Contact & Payment icons) ─────────────────────────────────────────
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
    viewBox="0 0 448 512"
    className="w-[18px] h-[18px]"
  >
    <defs>
      <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80" />
        <stop offset="25%" stopColor="#F77737" />
        <stop offset="50%" stopColor="#E1306C" />
        <stop offset="75%" stopColor="#C13584" />
        <stop offset="100%" stopColor="#833AB4" />
      </linearGradient>
    </defs>
    <path
      fill="white"
      d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
    />
  </svg>
);

const MastercardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 24"
    className="h-6 w-auto shrink-0"
    aria-label="Mastercard"
  >
    <circle cx="15" cy="12" r="11" fill="#EB001B" />
    <circle cx="21" cy="12" r="11" fill="#F79E1B" fillOpacity="0.85" />
  </svg>
);

const TabbyIcon = () => (
  <svg
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 141 141"
    style={{ enableBackground: "new 0 0 141 141" } as any}
    xmlSpace="preserve"
    className="h-5 w-auto shrink-0"
    aria-label="Tabby"
  >
    <style type="text/css">{`.st0{fill:#292929;}`}</style>
    <path
      className="st0"
      d="M120.1,59.9l-8,30.4l0,0.1h6.2l8-30.4H120.1z M21.7,77.1c-0.9,0.5-2,0.7-3,0.7c-2.2,0-3.5-0.4-3.6-2.2v-0.1 c0-0.1,0-0.1,0-0.2v-5.2l0-0.6v-3.7h0v-1.6l0-0.6V60l-5.5,0.7c3.7-0.7,5.9-3.7,5.9-6.6v-1.8H9.3v8.5l-0.4,0.1v15.7 c0.2,4.4,3.1,7,7.9,7c1.7,0,3.6-0.4,5-1l0,0L21.7,77.1L21.7,77.1L21.7,77.1z"
    />
    <path
      className="st0"
      d="M22.7,58.7L5.3,61.4v4.4l17.4-2.7C22.7,63.1,22.7,58.7,22.7,58.7z M22.7,65.2L5.3,67.9v4.2l17.4 -2.7C22.7,69.4,22.7,65.2,22.7,65.2z M42.3,67.2C42,62.3,39,59.4,34,59.4c-2.9,0-5.2,1.1-6.9,3.2c-1.6,2.1-2.5,5.2-2.5,8.9 c0,3.7,0.8,6.8,2.5,8.9c1.6,2.1,4,3.2,6.9,3.2c5,0,8.1-2.9,8.3-7.9v7.4h6.2V59.9l-6.2,1L42.3,67.2L42.3,67.2z M42.6,71.5 c0,4.4-2.3,7.2-5.8,7.2c-3.6,0-5.8-2.7-5.8-7.2c0-4.5,2.2-7.2,5.8-7.2c1.8,0,3.3,0.7,4.3,2C42.1,67.6,42.6,69.4,42.6,71.5 C42.6,71.5,42.6,71.5,42.6,71.5z M66.6,59.4c-5,0-8.1,2.9-8.3,7.8V53.1l-6.2,1v29.1h6.2v-7.4c0.2,4.9,3.3,7.9,8.3,7.9 c5.9,0,9.4-4.5,9.4-12.1S72.5,59.4,66.6,59.4z M63.8,78.7c-3.5,0-5.8-2.8-5.8-7.2c0-2.1,0.5-3.9,1.5-5.2c1-1.3,2.5-2,4.3-2 c3.6,0,5.8,2.7,5.8,7.2C69.6,76,67.4,78.7,63.8,78.7L63.8,78.7z M92.9,59.4c-5,0-8.1,2.9-8.3,7.8V53.1l-6.2,1v29.1h6.2v-7.4 c0.2,4.9,3.3,7.9,8.3,7.9c5.9,0,9.4-4.5,9.4-12.1S98.7,59.4,92.9,59.4L92.9,59.4z M90.1,78.7c-3.5,0-5.8-2.8-5.8-7.2 c0-2.1,0.5-3.9,1.5-5.2c1-1.3,2.5-2,4.3-2c3.6,0,5.8,2.7,5.8,7.2C95.9,76,93.7,78.7,90.1,78.7L90.1,78.7z M102.3,59.9h6.6l5.4,23.3 h-5.9C108.3,83.1,102.3,59.9,102.3,59.9z M131.4,62.3v-1.9h-0.8V60h2v0.4h-0.8v1.9H131.4z M132.8,62.3V60h0.8l0.4,1.1 c0.1,0.3,0.1,0.4,0.2,0.5c0-0.1,0.1-0.2,0.2-0.5l0.4-1.1h0.8v2.3H135v-1.8l-0.6,1.8h-0.4l-0.6-1.8v1.8L132.8,62.3L132.8,62.3z"
    />
  </svg>
);

const VisaIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1465.16 912.45"
    version="1.1"
    className="h-4 w-auto shrink-0"
    aria-label="Visa"
  >
    <defs>
      <clipPath id="clip1">
        <path d="M 0 781 L 1465.160156 781 L 1465.160156 912.449219 L 0 912.449219 Z M 0 781 " />
      </clipPath>
      <clipPath id="clip2">
        <path d="M 0 0 L 1465.160156 0 L 1465.160156 132 L 0 132 Z M 0 0 " />
      </clipPath>
    </defs>
    <g id="surface1">
      <g clipPath="url(#clip1)" clipRule="nonzero">
        <path
          style={{
            stroke: "none",
            fillRule: "nonzero",
            fill: "rgb(95.298767%,70.999146%,0%)",
            fillOpacity: 1,
          }}
          d="M 0 912.449219 L 1465.160156 912.449219 L 1465.160156 781.101563 L 0 781.101563 Z M 0 912.449219 "
        />
      </g>
      <g clipPath="url(#clip2)" clipRule="nonzero">
        <path
          style={{
            stroke: "none",
            fillRule: "nonzero",
            fill: "rgb(16.899109%,16.099548%,38.798523%)",
            fillOpacity: 1,
          }}
          d="M 0 131.363281 L 1465.160156 131.363281 L 1465.160156 0.00390625 L 0 0.00390625 Z M 0 131.363281 "
        />
      </g>
      <path
        style={{
          stroke: "none",
          fillRule: "nonzero",
          fill: "rgb(16.899109%,16.099548%,38.798523%)",
          fillOpacity: 1,
        }}
        d="M 719.941406 276.082031 L 642.710938 637.148438 L 549.3125 637.148438 L 626.546875 276.082031 Z M 1112.921875 509.226563 L 1162.101563 373.628906 L 1190.378906 509.226563 Z M 1217.179688 637.148438 L 1303.558594 637.148438 L 1228.101563 276.082031 L 1148.421875 276.082031 C 1130.460938 276.082031 1115.339844 286.5 1108.621094 302.566406 L 968.476563 637.148438 L 1066.578125 637.148438 L 1086.039063 583.21875 L 1205.871094 583.21875 Z M 973.328125 519.261719 C 973.75 423.984375 841.621094 418.691406 842.492188 376.128906 C 842.769531 363.183594 855.109375 349.402344 882.097656 345.890625 C 895.472656 344.160156 932.386719 342.765625 974.230469 362.035156 L 990.597656 285.449219 C 968.109375 277.316406 939.203125 269.480469 903.222656 269.480469 C 810.882813 269.480469 745.921875 318.539063 745.394531 388.832031 C 744.796875 440.816406 791.796875 469.792969 827.128906 487.097656 C 863.570313 504.808594 875.773438 516.15625 875.589844 531.960938 C 875.324219 556.1875 846.523438 566.914063 819.71875 567.316406 C 772.734375 568.046875 745.519531 554.625 723.796875 544.492188 L 706.851563 623.65625 C 728.695313 633.664063 768.984375 642.359375 810.679688 642.816406 C 908.863281 642.816406 973.054688 594.332031 973.328125 519.261719 M 586.476563 276.082031 L 435.125 637.148438 L 336.402344 637.148438 L 261.902344 348.984375 C 257.402344 331.269531 253.457031 324.753906 239.726563 317.277344 C 217.257813 305.070313 180.191406 293.660156 147.589844 286.5625 L 149.792969 276.082031 L 308.738281 276.082031 C 328.96875 276.082031 347.199219 289.5625 351.839844 312.871094 L 391.191406 521.824219 L 488.339844 276.082031 "
      />
    </g>
  </svg>
);

// ── Shared social-icon badge wrapper ─────────────────────────────────────────
function SocialBadge({
  href,
  label,
  background,
  children,
}: {
  href: string;
  label: string;
  background: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex items-center justify-center w-9 h-9 rounded-xl shadow-[var(--shadow-sm)] transition-transform duration-200 hover:scale-110 hover:shadow-[var(--shadow-md)]"
      style={{ background }}
    >
      {children}
    </a>
  );
}

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
      style={{ background: "var(--bg-deep)" }}
      aria-label="تذييل الصفحة"
    >
      {/* ── Top accent stripe ─────────────────────────────────────────── */}
      <div
        className="h-[3px] w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--cyan) 0%, var(--cyan-bright) 50%, var(--cyan) 100%)",
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
                src="https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/edit%20logo%20withou%20ground.png"
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
              <nav aria-label="روابط موطن الريف">
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-5"
                  style={{ color: "var(--text-3)" }}
                >
                  <span
                    className="block pb-2"
                    style={{ borderBottom: "1px solid var(--border-md)" }}
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
                        style={{ color: "var(--text-2)" }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: "var(--text-3)" }}
                          aria-hidden="true"
                        />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="تصفح الفئات">
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-5"
                  style={{ color: "var(--text-3)" }}
                >
                  <span
                    className="block pb-2"
                    style={{ borderBottom: "1px solid var(--border-md)" }}
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
                          style={{ color: "var(--text-2)" }}
                          tabIndex={isHidden ? -1 : 0}
                          aria-hidden={isHidden || undefined}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: "var(--text-3)" }}
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
                                  style={{ color: "var(--text-3)" }}
                                  tabIndex={isHidden ? -1 : 0}
                                  aria-hidden={isHidden || undefined}
                                >
                                  <span
                                    className="w-1 h-1 rounded-full shrink-0"
                                    style={{
                                      background: "var(--border-strong)",
                                    }}
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
                    style={{ color: "var(--cyan)" }}
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
              style={{ color: "var(--text-3)" }}
            >
              <span
                className="block pb-2"
                style={{ borderBottom: "1px solid var(--border-md)" }}
              >
                موقعنا وتواصل معنا
              </span>
            </h3>

            <div
              className="rounded-xl overflow-hidden shadow-[var(--shadow-sm)]"
              style={{ outline: "1px solid var(--border-md)" }}
            >
              <MapEmbed />
            </div>

            <address className="not-italic">
              <ul className="space-y-3">
                <li>
                  <a
                    href={`tel:${CONTACT.phone}`}
                    className="text-sm flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-60"
                    style={{ color: "var(--text-2)" }}
                    aria-label={`اتصل بنا على ${CONTACT.phone}`}
                  >
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-lg"
                      style={{
                        background: "var(--surface)",
                        color: "var(--cyan)",
                        border: "1px solid var(--border-md)",
                      }}
                    >
                      <PhoneIcon />
                    </span>
                    <span dir="ltr">{CONTACT.phone}</span>
                  </a>
                </li>

                <li>
                  <a
                    href={`https://wa.me/${CONTACT.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-60"
                    style={{ color: "var(--text-2)" }}
                    aria-label={`تواصل عبر واتساب ${CONTACT.whatsappDisplay}`}
                  >
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-lg"
                      style={{
                        background: "var(--surface)",
                        color: "#25D366",
                        border: "1px solid var(--border-md)",
                      }}
                    >
                      <WhatsAppIcon />
                    </span>
                    <span dir="ltr">{CONTACT.whatsappDisplay}</span>
                  </a>
                </li>

                <li>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="text-sm flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-60"
                    style={{ color: "var(--text-2)" }}
                    aria-label={`راسلنا على ${CONTACT.email}`}
                  >
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-lg"
                      style={{
                        background: "var(--surface)",
                        color: "var(--cyan)",
                        border: "1px solid var(--border-md)",
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
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {/* Social links — each badge keeps its own real app brand color */}
              <div>
                <p
                  className="text-xs mb-3 font-medium"
                  style={{ color: "var(--text-3)" }}
                >
                  تابعنا على
                </p>
                <div className="flex items-center flex-wrap gap-2.5">
                  {/* Instagram — real gradient */}
                  <SocialBadge
                    href="https://www.instagram.com/al_rif.foundation/"
                    label="موطن الريف على إنستغرام"
                    background="linear-gradient(45deg, #FFDC80 0%, #F77737 25%, #E1306C 50%, #C13584 75%, #833AB4 100%)"
                  >
                    <InstagramIcon />
                  </SocialBadge>

                  {/* TikTok — brand black */}
                  <SocialBadge
                    href="https://www.tiktok.com/@al_rif.foundation"
                    label="موطن الريف على تيك توك"
                    background="#000000"
                  >
                    <FaTiktok className="w-[18px] h-[18px]" color="#FFFFFF" />
                  </SocialBadge>

                  {/* Snapchat — brand yellow */}
                  <SocialBadge
                    href="https://snapchat.com/t/9fx3W32S"
                    label="موطن الريف على سناب شات"
                    background="#fffc0aa1"
                  >
                    <FaSnapchat className="w-5 h-5" color="#FFFFFF" />
                  </SocialBadge>

                  {/* Pinterest — brand red */}
                  <SocialBadge
                    href="https://pin.it/1MO6eVgpf"
                    label="موطن الريف على بينتريست"
                    background="#E60023"
                  >
                    <FaPinterest className="w-5 h-5" color="#FFFFFF" />
                  </SocialBadge>

                  {/* X — brand black */}
                  <SocialBadge
                    href="https://x.com/a_riffoundation"
                    label="موطن الريف على منصة إكس"
                    background="#000000"
                  >
                    <FaXTwitter className="w-[18px] h-[18px]" color="#FFFFFF" />
                  </SocialBadge>
                </div>
              </div>

              {/* Payment badges — real brand logos */}
              <div className="flex flex-col items-start sm:items-end gap-2">
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--text-3)" }}
                >
                  طرق الدفع الآمنة
                </p>
                <div
                  className="bg-[var(--surface)] rounded-xl px-3.5 py-2 shadow-[var(--shadow-sm)] flex items-center gap-4 h-9"
                  style={{ border: "1px solid var(--border)" }}
                >
                  {/* تمارا — Local SVG from public folder */}
                  <Image
                    src="/Tamara.svg"
                    alt="Tamara"
                    width={55}
                    height={16}
                    className="h-4.5 w-auto object-contain shrink-0"
                  />

                  {/* تابي — Inline SVG Code */}
                  <TabbyIcon />

                  {/* فيزا — Inline SVG Code */}
                  <VisaIcon />

                  {/* ماستر كارد — Inline SVG Code */}
                  <MastercardIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Legal / Business Registration bar ────────────────────────────── */}
      {/* ── Legal / Business Registration bar ────────────────────────────── */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4">
          <div
            className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-[11px]"
            style={{ color: "var(--text-3)" }}
          >
            <span>{BUSINESS_INFO.legalName}</span>
            <span className="flex items-center gap-1.5">
              <span style={{ color: "var(--text-2)" }}>س.ت:</span>
              <span dir="ltr">{BUSINESS_INFO.crNumber}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ color: "var(--text-2)" }}>الرقم الضريبي:</span>
              <span dir="ltr">{BUSINESS_INFO.vatNumber}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ color: "var(--text-2)" }}>العنوان الوطني:</span>
              <span dir="ltr">{BUSINESS_INFO.shortAddress}</span>
            </span>
            <span className="hidden sm:inline">
              {BUSINESS_INFO.fullAddress}
            </span>
            <a
              href="https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/Tax%20Registration%20Certificate.jpeg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="عرض شهادة
            التسجيل الضريبي"
              className="flex items-center transition-opacity
            duration-200 hover:opacity-70"
            >
              <Image
                src="https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/tax%20logo.png"
                alt="شعار التسجيل الضريبي"
                width={40}
                height={40}
                className="object-contain shrink-0"
              />
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom copyright bar ──────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ color: "var(--text-3)" }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <p>
              © {currentYear}{" "}
              <span className="font-medium" style={{ color: "var(--text-2)" }}>
                موطن الريف
              </span>
              . جميع الحقوق محفوظة لموطن الريف.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy-policy"
                className="transition-opacity duration-200 hover:opacity-60"
              >
                سياسة الخصوصية
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href="/terms"
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
            style={{ color: "var(--text-3)" }}
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
