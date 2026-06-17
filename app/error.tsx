"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Noto_Naskh_Arabic, IBM_Plex_Sans_Arabic } from "next/font/google";

// Display face — used sparingly, just the headline.
const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["500", "600"],
  variable: "--font-naskh",
  display: "swap",
});

// Body face — clean and legible at small sizes.
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500"],
  variable: "--font-plex-arabic",
  display: "swap",
});

const BG_URL =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/1000110665.png";

// Tiny blurred placeholder matching the photo's tones, so the image
// never pops in against a blank background while it loads.
const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAALABADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCh4WsI5LCQyoQS46jqMVq6vpdoLe3G370oB2+9cna311Bf29tFO6w7/uiuyVjKFEh3YcYzXKzpR//Z";

// Palette sampled from the reference interior.
const TEXT_GOLD = "#5E3B1E"; // wordmark — deep bronze, meets AA contrast on the wall
const INK = "#2A1810"; // headline, icon, primary button
const INK_MUTED = "#5C4A36"; // body copy, secondary link
const CREAM = "#F3E9DD"; // text on the filled button

const content = {
  wordmark: "موطن الريف",
  title: "تعذّر تحميل هذه الصفحة",
  description:
    "حدث خطأ أثناء عرض المحتوى. يمكنك إعادة المحاولة، أو العودة إلى الصفحة الرئيسية.",
  retry: "إعادة المحاولة",
  home: "الصفحة الرئيسية",
  devDetailsLabel: "تفاصيل الخطأ (للمطوّرين)",
  digestLabel: "رمز التتبّع",
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with your error reporting service (Sentry, etc.)
    console.error(error);
  }, [error]);

  return (
    <div
      className={`${naskh.variable} ${plexArabic.variable} relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#1A0F08]`}
    >
      <style>{`
        @keyframes stateFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          [data-state-anim] { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <Image
        src={BG_URL}
        alt=""
        fill
        priority
        sizes="100vw"
        quality={95}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        className="object-cover"
      />

      {/* Radial vignette — preserves the photo's own light, only deepens the edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(20,10,5,0) 45%, rgba(20,10,5,0.55) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6 text-center">
        <span
          data-state-anim
          style={{
            fontFamily: "var(--font-plex-arabic)",
            color: TEXT_GOLD,
            animation: "stateFadeUp 0.5s ease-out both",
          }}
          className="text-xs font-medium tracking-[0.3em]"
        >
          {content.wordmark}
        </span>

        {/* Signature element — the arch motif from the photo's architecture,
            rendered with a gap at the keystone to signal something didn't complete. */}
        <div
          data-state-anim
          style={{
            color: INK,
            animation: "stateFadeUp 0.5s ease-out 0.1s both",
          }}
          className="mt-7"
        >
          <svg
            viewBox="0 0 56 64"
            fill="none"
            className="h-12 w-11"
            aria-hidden="true"
          >
            <path
              d="M6 63V30"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M50 63V30"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M6 30C6 14 15.5 2 28 2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M32.5 3.2C42.5 6 50 16.5 50 30"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1
          data-state-anim
          style={{
            fontFamily: "var(--font-naskh)",
            color: INK,
            animation: "stateFadeUp 0.6s ease-out 0.18s both",
          }}
          className="mt-6 text-3xl leading-tight sm:text-4xl"
        >
          {content.title}
        </h1>

        <p
          data-state-anim
          style={{
            fontFamily: "var(--font-plex-arabic)",
            color: INK_MUTED,
            animation: "stateFadeUp 0.6s ease-out 0.3s both",
          }}
          className="mt-3 max-w-xs text-sm sm:text-base"
        >
          {content.description}
        </p>

        <div
          data-state-anim
          style={{
            fontFamily: "var(--font-plex-arabic)",
            animation: "stateFadeUp 0.6s ease-out 0.4s both",
          }}
          className="mt-8 flex items-center gap-4"
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{ backgroundColor: INK, color: CREAM }}
            className="rounded-full px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {content.retry}
          </button>

          <Link
            href="/"
            style={{ color: INK_MUTED }}
            className="text-sm font-medium underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {content.home}
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details
            style={{ fontFamily: "var(--font-plex-arabic)", color: INK_MUTED }}
            className="mt-8 w-full rounded-lg border border-black/10 bg-white/40 p-3 text-start text-xs"
          >
            <summary className="cursor-pointer select-none font-medium">
              {content.devDetailsLabel}
            </summary>
            <p className="mt-2 break-words">{error.message}</p>
            {error.digest && (
              <p className="mt-1 break-words opacity-70">
                {content.digestLabel}: {error.digest}
              </p>
            )}
          </details>
        )}
      </div>
    </div>
  );
}
