"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { ZoomIn, ChevronRight, ChevronLeft } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface Props {
  mainImage: string;
  gallery: string[];
  productName: string;
}

/**
 * يحوّل رابط صورة خارجي (Supabase / أي مصدر خارجي) إلى رابط يعدي
 * من خلال next/image proxy الداخلي (/_next/image)، بحيث يكون الطلب
 * من نفس الدومين (same-origin) ويتجاوز قيود CSP الخاصة بـ img-src.
 * الصور المحلية (تبدأ بـ "/") بترجع كما هي بدون تغيير.
 */
function getOptimizedSrc(src: string, width = 1920, quality = 95) {
  if (!src) return src;
  if (src.startsWith("/") && !src.startsWith("//")) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

export default function ProductGallery({
  mainImage,
  gallery,
  productName,
}: Props) {
  const allImages = [mainImage, ...gallery];
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const slides = allImages.map((src, i) => ({
    src: getOptimizedSrc(src, 1920, 95),
    alt: i === 0 ? productName : `${productName} - صورة ${i + 1}`,
    title: productName,
    description: i === 0 ? productName : `صورة ${i + 1} من ${allImages.length}`,
  }));

  const openLightbox = useCallback((idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  }, []);

  const selectThumb = (idx: number) => {
    setActiveIdx(idx);
    // Scroll thumbnail into view
    const thumbEl = thumbsRef.current?.children[idx] as HTMLElement | undefined;
    thumbEl?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const prevImage = () =>
    selectThumb((activeIdx - 1 + allImages.length) % allImages.length);
  const nextImage = () => selectThumb((activeIdx + 1) % allImages.length);

  return (
    <div
      className="flex flex-col gap-3 w-full"
      role="region"
      aria-label="معرض صور المنتج"
    >
      {/* ── Main Image ─────────────────────────────────────────────────── */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#fdfaf4] border border-[rgba(90,60,20,0.08)] group">
        <button
          onClick={() => openLightbox(activeIdx)}
          className="absolute inset-0 z-10 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a07830] focus-visible:ring-offset-2 rounded-2xl"
          aria-label="افتح الصورة بحجم كامل"
        />
        <Image
          src={allImages[activeIdx]}
          alt={
            activeIdx === 0 ? productName : (
              `${productName} - صورة ${activeIdx + 1}`
            )
          }
          fill
          priority
          quality={95}
          className="object-cover transition-all duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
        />

        {/* Zoom badge */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-black/35 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
          <span>تكبير</span>
        </div>

        {/* Navigation arrows (only if multiple images) */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md text-[#483820] hover:bg-white hover:text-[#a07830] transition-all duration-150 opacity-0 group-hover:opacity-100"
              aria-label="الصورة السابقة"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={nextImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md text-[#483820] hover:bg-white hover:text-[#a07830] transition-all duration-150 opacity-0 group-hover:opacity-100"
              aria-label="الصورة التالية"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Counter pill */}
        {allImages.length > 1 && (
          <div className="absolute top-3 left-3 z-20 bg-black/35 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full pointer-events-none">
            {activeIdx + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* ── Thumbnails ─────────────────────────────────────────────────── */}
      {allImages.length > 1 && (
        <div
          ref={thumbsRef}
          className="flex gap-2 overflow-x-auto pb-0.5 scroll-smooth"
          style={{ scrollbarWidth: "none" }}
          role="list"
          aria-label="الصور المصغرة"
        >
          {allImages.map((src, i) => (
            <button
              key={i}
              role="listitem"
              onClick={() => selectThumb(i)}
              aria-label={`صورة ${i + 1}`}
              aria-pressed={i === activeIdx}
              className={[
                "relative flex-shrink-0 w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a07830]",
                i === activeIdx ?
                  "border-[#a07830] shadow-[0_0_0_1px_#a07830]"
                : "border-[rgba(90,60,20,0.12)] hover:border-[rgba(160,120,48,0.45)] opacity-75 hover:opacity-100",
              ].join(" ")}
            >
              <Image
                src={src}
                alt={i === 0 ? productName : `${productName} ${i + 1}`}
                fill
                quality={95}
                className="object-cover"
                sizes="80px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ───────────────────────────────────────────────────── */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIdx}
        slides={slides}
        plugins={[Captions, Fullscreen, Slideshow, Thumbnails, Video, Zoom]}
        captions={{ showToggle: true, descriptionTextAlign: "center" }}
        thumbnails={{
          border: 0,
          borderRadius: 8,
          padding: 3,
          gap: 8,
          imageFit: "cover",
        }}
        zoom={{ maxZoomPixelRatio: 4, scrollToZoom: true, doubleTapDelay: 300 }}
        slideshow={{ autoplay: false, delay: 4000 }}
        animation={{
          fade: 250,
          swipe: 300,
          easing: { fade: "ease", swipe: "ease-out" },
        }}
        styles={{ container: { backgroundColor: "rgba(10,6,2,0.94)" } }}
        carousel={{ finite: false, preload: 2 }}
        render={{
          buttonPrev: allImages.length <= 1 ? () => null : undefined,
          buttonNext: allImages.length <= 1 ? () => null : undefined,
        }}
        on={{ view: ({ index }) => setLightboxIdx(index) }}
      />
    </div>
  );
}
