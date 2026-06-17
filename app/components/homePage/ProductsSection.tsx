"use client";

import { useState, useRef, useCallback, useEffect, memo } from "react";

// ─── Types ───
interface Product {
  id: number;
  name: string;
  originalPrice: number;
  discountPrice: number;
  discountPercent: number;
  images: string[];
  href: string;
  category: string;
}

// ─── Mid-tone Warm Luxury Palette ───
const CSS = `
:root {
  --bg:          #f8f4ec;
  --bg-deep:     #ede8dc;
  --surface:     #ffffff;
  --surface-2:   #fffdf8;
  --surface-3:   #fffef8;
  --border:      rgba(90,60,20,0.10);
  --border-md:   rgba(90,60,20,0.18);
  --border-strong: rgba(90,60,20,0.32);
  --gold:        #a07830;
  --gold-mid:    #b89040;
  --gold-bright: #d0a820;
  --gold-bg:     rgba(160,120,48,0.07);
  --text-1:      #181008;
  --text-2:      #483820;
  --text-3:      #806840;
  --text-inv:    #ffffff;
  --red:         #b91c1c;
  --shadow-sm:   0 1px 6px rgba(60,38,10,0.08);
  --shadow-md:   0 6px 24px rgba(60,38,10,0.13);
  --shadow-lg:   0 16px 56px rgba(60,38,10,0.18);
}
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  @keyframes shineSwipe {
    0%   { transform: translateX(-120%) skewX(-18deg); }
    100% { transform: translateX(280%)  skewX(-18deg); }
  }
  @keyframes shimmerBadge {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.75; }
  }
  .card-shine { animation: shineSwipe 0.75s ease forwards; }
`;

// ─── Products Data (new images) ───
const products: Product[] = [
  {
    id: 1,
    name: "طقم مجالس ديم الملكي",
    originalPrice: 24500,
    discountPrice: 18900,
    discountPercent: 22,
    href: "/products/deem-lounge",
    category: "مجالس",
    images: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=85",
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=85",
      "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=800&q=85",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=85",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&q=85",
    ],
  },
  {
    id: 2,
    name: "طاولة طعام أوليفيا الرخامية",
    originalPrice: 14200,
    discountPrice: 11500,
    discountPercent: 19,
    href: "/products/olivia-dining",
    category: "غرف طعام",
    images: [
      "https://images.unsplash.com/photo-1549497538-303791108f95?w=800&q=85",
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&q=85",
      "https://images.unsplash.com/photo-1617806118233-18e1db207f62?w=800&q=85",
      "https://images.unsplash.com/photo-1525896544086-40a95e2c00c6?w=800&q=85",
      "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&q=85",
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=85",
    ],
  },
  {
    id: 3,
    name: "خزانة ملابس ثيرموس الممتدة",
    originalPrice: 19800,
    discountPrice: 16000,
    discountPercent: 19,
    href: "/products/thermos-wardrobe",
    category: "غرف نوم",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=85",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=85",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=85",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=85",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&q=85",
    ],
  },
  {
    id: 4,
    name: "أريكة ميراد المخملية الفاخرة",
    originalPrice: 9600,
    discountPrice: 7800,
    discountPercent: 18,
    href: "/products/mirad-sofa",
    category: "أرائك",
    images: [
      "https://images.unsplash.com/photo-1550254478-ead40cc54513?w=800&q=85",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=85",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=85",
      "https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=800&q=85",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=85",
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=85",
    ],
  },
  {
    id: 5,
    name: "سرير لافيش المعماري المبطن",
    originalPrice: 12500,
    discountPrice: 9900,
    discountPercent: 20,
    href: "/products/lavish-bed",
    category: "غرف نوم",
    images: [
      "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&q=85",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=85",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=85",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=85",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=85",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=85",
    ],
  },
  {
    id: 6,
    name: "كرسي استرخاء أورا المخملي",
    originalPrice: 4800,
    discountPrice: 3900,
    discountPercent: 18,
    href: "/products/aura-chair",
    category: "كراسي",
    images: [
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=85",
      "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=800&q=85",
      "https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=85",
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=85",
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=85",
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&q=85",
    ],
  },
  {
    id: 7,
    name: "وحدة تلفاز إكليبس المعلقة",
    originalPrice: 8900,
    discountPrice: 6900,
    discountPercent: 22,
    href: "/products/eclipse-tv-unit",
    category: "وحدات",
    images: [
      "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800&q=85",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=85",
      "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=800&q=85",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=85",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=85",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&q=85",
    ],
  },
];

/* ═══════════════════════════════════════
   GALLERY MODAL
═══════════════════════════════════════ */
interface GalleryModalProps {
  product: Product;
  onClose: () => void;
  isOpen: boolean;
}

const GalleryModal = memo(function GalleryModal({
  product,
  onClose,
  isOpen,
}: GalleryModalProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIdx(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((p) => (p + 1) % product.images.length);
      if (e.key === "ArrowRight")
        setIdx((p) => (p - 1 + product.images.length) % product.images.length);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose, product.images.length]);

  if (!isOpen) return null;

  const goNext = () => setIdx((p) => (p + 1) % product.images.length);
  const goPrev = () =>
    setIdx((p) => (p - 1 + product.images.length) % product.images.length);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "rgba(196,176,148,0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="إغلاق"
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--surface-3)",
          border: "1.5px solid var(--border-md)",
          color: "var(--text-2)",
          cursor: "pointer",
          boxShadow: "var(--shadow-sm)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Counter */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.06em",
          color: "var(--text-2)",
          backgroundColor: "var(--surface-3)",
          border: "1px solid var(--border)",
          padding: "5px 12px",
          borderRadius: 20,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {idx + 1} / {product.images.length}
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 780,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Main + Arrows */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
          }}
        >
          {[
            { fn: goPrev, label: "السابقة", d: "M15 18 9 12 15 6" },
            null,
            { fn: goNext, label: "التالية", d: "M9 18 15 12 9 6" },
          ].map((item, i) =>
            item === null ?
              <div
                key="img"
                style={{
                  flex: 1,
                  aspectRatio: "16/10",
                  overflow: "hidden",
                  borderRadius: 3,
                  boxShadow: "var(--shadow-lg)",
                  border: "1px solid var(--border-md)",
                }}
              >
                <img
                  src={product.images[idx]}
                  alt={`صورة ${idx + 1} لـ ${product.name}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "all 0.3s",
                  }}
                />
              </div>
            : <button
                key={item.label}
                onClick={item.fn}
                aria-label={item.label}
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--surface-3)",
                  border: "1.5px solid var(--border-md)",
                  color: "var(--gold)",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.08)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <polyline points={item.d} />
                </svg>
              </button>,
          )}
        </div>

        {/* Name */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--gold-mid)",
              marginBottom: 4,
              fontWeight: 600,
            }}
          >
            {product.category}
          </p>
          <h3
            id="modal-title"
            style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)" }}
          >
            {product.name}
          </h3>
        </div>

        {/* Thumbnails */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {product.images.map((src, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`صورة ${i + 1}`}
              style={{
                width: 56,
                height: 56,
                overflow: "hidden",
                borderRadius: 3,
                cursor: "pointer",
                border:
                  i === idx ?
                    "2.5px solid var(--gold)"
                  : "2px solid transparent",
                opacity: i === idx ? 1 : 0.45,
                transition: "opacity 0.25s, border-color 0.25s",
                outline: "none",
                boxShadow: i === idx ? "0 2px 8px rgba(90,62,22,0.25)" : "none",
              }}
            >
              <img
                src={src}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════
   PRODUCT CARD — Deeper zoom + shine sweep
═══════════════════════════════════════ */
interface ProductCardProps {
  product: Product;
  onQuickView: (p: Product) => void;
  aspectRatio?: string;
  compact?: boolean;
}

const ProductCard = memo(function ProductCard({
  product,
  onQuickView,
  aspectRatio = "4/3",
  compact = false,
}: ProductCardProps) {
  const [hov, setHov] = useState(false);
  const [shine, setShine] = useState(false);
  const shineRef = useRef<ReturnType<typeof setTimeout>>(null!);

  const handleEnter = () => {
    setHov(true);
    setShine(false);
    clearTimeout(shineRef.current);
    // slight delay so image transition starts first
    shineRef.current = setTimeout(() => setShine(true), 80);
  };
  const handleLeave = () => {
    setHov(false);
    setShine(false);
    clearTimeout(shineRef.current);
  };

  useEffect(() => () => clearTimeout(shineRef.current), []);

  return (
    <article
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        backgroundColor: "var(--surface-2)",
        border: "1px solid",
        borderColor: hov ? "var(--border-strong)" : "var(--border-md)",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: hov ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transform: hov ? "translateY(-5px)" : "translateY(0)",
        transition:
          "transform 0.38s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.38s ease, border-color 0.3s",
      }}
    >
      {/* ── Image wrapper ── */}
      <div style={{ position: "relative", overflow: "hidden", aspectRatio }}>
        {/* Main image */}
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hov ? "scale(1.16)" : "scale(1)",
            transition: "transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
            willChange: "transform",
            display: "block",
          }}
        />

        {/* Shine sweep overlay */}
        <div
          className={shine ? "card-shine" : ""}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "35%",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
            pointerEvents: "none",
            transform: "translateX(-120%) skewX(-18deg)",
          }}
        />

        {/* Dark-to-warm scrim on hover */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(28,18,8,0.72) 0%, transparent 55%)",
            opacity: hov ? 1 : 0,
            transition: "opacity 0.4s",
            pointerEvents: "none",
          }}
        />

        {/* Discount badge */}
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "var(--red)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            padding: "3px 9px",
            letterSpacing: "0.06em",
            boxShadow: "0 2px 6px rgba(185,28,28,0.35)",
          }}
        >
          %{product.discountPercent}
        </span>

        {/* Category pill */}
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "var(--surface-3)",
            color: "var(--text-2)",
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 9px",
            borderRadius: 20,
            border: "1px solid var(--border)",
            opacity: hov ? 1 : 0,
            transform: hov ? "translateY(0)" : "translateY(-6px)",
            transition: "opacity 0.3s, transform 0.3s",
          }}
        >
          {product.category}
        </span>

        {/* Quick view button */}
        <button
          onClick={() => onQuickView(product)}
          aria-label={`عرض سريع لـ ${product.name}`}
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform:
              hov ?
                "translateX(-50%) translateY(0)"
              : "translateX(-50%) translateY(12px)",
            opacity: hov ? 1 : 0,
            transition: "opacity 0.32s, transform 0.32s",
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "var(--surface-3)",
            color: "var(--gold)",
            border: "1.5px solid var(--border-strong)",
            fontSize: 11,
            fontWeight: 700,
            padding: "7px 18px",
            cursor: "pointer",
            borderRadius: 2,
            boxShadow: "var(--shadow-md)",
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--surface)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--surface-3)")
          }
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          عرض سريع
        </button>
      </div>

      {/* ── Info ── */}
      <div
        style={{
          padding: compact ? "10px 13px" : "14px 18px",
          backgroundColor: "var(--surface-2)",
          transform: hov ? "translateY(-2px)" : "translateY(0)",
          transition: "transform 0.38s ease",
        }}
      >
        <p
          style={{
            fontSize: 10,
            color: "var(--text-3)",
            marginBottom: 5,
            letterSpacing: "0.10em",
            fontWeight: 500,
          }}
        >
          {product.category}
        </p>
        <h4
          style={{
            fontSize: compact ? 13 : 14,
            fontWeight: 700,
            color: "var(--text-1)",
            marginBottom: 9,
            lineHeight: 1.35,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical" as const,
          }}
        >
          {product.name}
        </h4>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              color: "var(--gold)",
              fontWeight: 800,
              fontSize: compact ? 14 : 16,
              transition: "color 0.3s",
            }}
          >
            {product.discountPrice.toLocaleString()} ر.س
          </span>
          <span
            style={{
              color: "var(--text-3)",
              textDecoration: "line-through",
              fontSize: 11,
            }}
          >
            {product.originalPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  );
});

/* ═══════════════════════════════════════
   LAYOUT 1 — Horizontal Scroll
═══════════════════════════════════════ */
function HorizontalScroll({
  onQuickView,
}: {
  onQuickView: (p: Product) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const check = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10 || el.scrollLeft < -10);
    setCanRight(Math.abs(el.scrollLeft) < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", check, { passive: true });
    check();
    return () => el.removeEventListener("scroll", check);
  }, [check]);

  const scroll = (dir: "l" | "r") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "l" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Arrow Right (prev) */}
      <button
        onClick={() => scroll("r")}
        disabled={!canLeft}
        aria-label="السابق"
        style={{
          display: "none",
          position: "absolute",
          right: -22,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          width: 42,
          height: 42,
          borderRadius: "50%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--surface-3)",
          border: "1.5px solid var(--border-md)",
          color: canLeft ? "var(--gold)" : "var(--text-3)",
          opacity: canLeft ? 1 : 0.3,
          cursor: canLeft ? "pointer" : "not-allowed",
          boxShadow: "var(--shadow-md)",
          transition: "all 0.2s",
        }}
        className="lg-flex"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Arrow Left (next) */}
      <button
        onClick={() => scroll("l")}
        disabled={!canRight}
        aria-label="التالي"
        style={{
          display: "none",
          position: "absolute",
          left: -22,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          width: 42,
          height: 42,
          borderRadius: "50%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--surface-3)",
          border: "1.5px solid var(--border-md)",
          color: canRight ? "var(--gold)" : "var(--text-3)",
          opacity: canRight ? 1 : 0.3,
          cursor: canRight ? "pointer" : "not-allowed",
          boxShadow: "var(--shadow-md)",
          transition: "all 0.2s",
        }}
        className="lg-flex"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          paddingBottom: 8,
          scrollSnapType: "x mandatory",
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              flexShrink: 0,
              width: "min(295px, 78vw)",
              scrollSnapAlign: "start",
            }}
          >
            <ProductCard product={p} onQuickView={onQuickView} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   LAYOUT 2 — Hover Expand Duo (always ROW, 70/30)
═══════════════════════════════════════ */
function HoverExpandDuo({
  onQuickView,
}: {
  onQuickView: (p: Product) => void;
}) {
  const [hov, setHov] = useState<number | null>(null);
  const duo = products.slice(0, 2);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row" /* ← ALWAYS row, never column */,
        gap: 4,
        height: 460,
        overflow: "hidden",
        borderRadius: 3,
        border: "1px solid var(--border-md)",
        boxShadow: "var(--shadow-md)",
      }}
      role="group"
      aria-label="ثنائيات معمارية"
    >
      {duo.map((p, i) => (
        <article
          key={p.id}
          onMouseEnter={() => setHov(i)}
          onMouseLeave={() => setHov(null)}
          style={{
            /* 70 / 30 split on hover, 50/50 at rest */
            flex:
              hov === null ? "1 1 50%"
              : hov === i ? "0 0 70%"
              : "0 0 30%",
            transition: "flex 0.55s cubic-bezier(0.4,0,0.2,1)",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            minWidth: 0,
          }}
        >
          {/* Image */}
          <img
            src={p.images[0]}
            alt={p.name}
            loading="lazy"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: hov === i ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.7s ease-out",
            }}
          />

          {/* Warm tint on non-hovered panel */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(196,176,148,0.35)",
              opacity: hov !== null && hov !== i ? 1 : 0,
              transition: "opacity 0.45s",
              pointerEvents: "none",
            }}
          />

          {/* Bottom scrim */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(28,18,8,0.88) 0%, rgba(28,18,8,0.2) 45%, transparent 100%)",
              transition: "opacity 0.4s",
              opacity: hov === i ? 1 : 0.55,
            }}
          />

          {/* Content */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: 24,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "fit-content",
                backgroundColor: "var(--red)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                padding: "2px 9px",
                marginBottom: 8,
                letterSpacing: "0.05em",
              }}
            >
              %{p.discountPercent} خصم
            </span>
            <h4
              style={{
                color: "#fff",
                fontWeight: 700,
                lineHeight: 1.35,
                fontSize: hov === i ? 22 : 16,
                transition: "font-size 0.4s ease",
                marginBottom: 6,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {p.name}
            </h4>

            {/* Revealed content */}
            <div
              style={{
                overflow: "hidden",
                maxHeight: hov === i ? 130 : 0,
                opacity: hov === i ? 1 : 0,
                transition: "max-height 0.45s ease, opacity 0.3s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  marginBottom: 16,
                  paddingTop: 6,
                }}
              >
                <span
                  style={{
                    color: "var(--gold-bright)",
                    fontWeight: 800,
                    fontSize: 20,
                  }}
                >
                  {p.discountPrice.toLocaleString()} ر.س
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.38)",
                    textDecoration: "line-through",
                    fontSize: 12,
                  }}
                >
                  {p.originalPrice.toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickView(p);
                  }}
                  style={{
                    backgroundColor: "var(--gold)",
                    color: "var(--text-inv)",
                    border: "none",
                    padding: "9px 20px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    borderRadius: 2,
                    letterSpacing: "0.04em",
                  }}
                >
                  عرض سريع
                </button>
                <a
                  href={p.href}
                  style={{
                    border: "1.5px solid rgba(255,255,255,0.45)",
                    color: "#fff",
                    padding: "9px 20px",
                    fontSize: 12,
                    fontWeight: 500,
                    textDecoration: "none",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    transition: "border-color 0.2s",
                  }}
                >
                  تفاصيل
                </a>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   LAYOUT 3 — Featured Wide + 3-col Grid
═══════════════════════════════════════ */
function FeaturedGrid({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const [fHov, setFHov] = useState(false);
  const featured = products[2];
  const grid = products.slice(3, 6);

  return (
    <div>
      {/* Wide featured */}
      <article
        onMouseEnter={() => setFHov(true)}
        onMouseLeave={() => setFHov(false)}
        style={{
          position: "relative",
          overflow: "hidden",
          marginBottom: 16,
          borderRadius: 3,
          cursor: "pointer",
          border: "1px solid",
          borderColor: fHov ? "var(--border-strong)" : "var(--border-md)",
          boxShadow: fHov ? "var(--shadow-lg)" : "var(--shadow-sm)",
          transform: fHov ? "translateY(-3px)" : "translateY(0)",
          transition:
            "transform 0.35s ease, box-shadow 0.35s, border-color 0.3s",
        }}
      >
        <div style={{ aspectRatio: "21/8", overflow: "hidden" }}>
          <img
            src={featured.images[0]}
            alt={featured.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: fHov ? "scale(1.07)" : "scale(1)",
              transition: "transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          />
        </div>

        {/* Left-side gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(28,18,8,0.88) 0%, rgba(28,18,8,0.45) 38%, transparent 70%)",
          }}
        />

        {/* Info */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: "42%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "24px 32px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "fit-content",
              backgroundColor: "var(--red)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              padding: "2px 9px",
              marginBottom: 10,
              letterSpacing: "0.05em",
            }}
          >
            %{featured.discountPercent} خصم
          </span>
          <p
            style={{
              fontSize: 11,
              color: "rgba(245,237,224,0.6)",
              marginBottom: 4,
              letterSpacing: "0.12em",
            }}
          >
            {featured.category}
          </p>
          <h4
            style={{
              color: "var(--text-inv)",
              fontWeight: 300,
              fontSize: "clamp(18px, 2vw, 30px)",
              lineHeight: 1.35,
              marginBottom: 12,
            }}
          >
            {featured.name}
          </h4>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <span
              style={{
                color: "var(--gold-bright)",
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              {featured.discountPrice.toLocaleString()} ر.س
            </span>
            <span
              style={{
                color: "rgba(245,237,224,0.35)",
                textDecoration: "line-through",
                fontSize: 13,
              }}
            >
              {featured.originalPrice.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => onQuickView(featured)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              width: "fit-content",
              backgroundColor: "var(--surface-3)",
              color: "var(--gold)",
              border: "1.5px solid var(--border-strong)",
              padding: "9px 18px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              borderRadius: 2,
              boxShadow: "var(--shadow-sm)",
              transition: "background 0.2s",
              letterSpacing: "0.04em",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--surface)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--surface-3)")
            }
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            عرض سريع
          </button>
        </div>
      </article>

      {/* 3-col grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {grid.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onQuickView={onQuickView}
            aspectRatio="1/1"
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   LAYOUT 4 — Grid + Side Banner
═══════════════════════════════════════ */
function GridWithSideBanner({
  onQuickView,
}: {
  onQuickView: (p: Product) => void;
}) {
  const [bHov, setBHov] = useState(false);
  const grid = products.slice(0, 6);
  const featured = products[6];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 16,
      }}
      className="lg-grid-side"
    >
      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {grid.map((p) => (
          <ProductCard
            key={`gs-${p.id}`}
            product={p}
            onQuickView={onQuickView}
            compact
          />
        ))}
      </div>

      {/* Side Banner */}
      <article
        onMouseEnter={() => setBHov(true)}
        onMouseLeave={() => setBHov(false)}
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: 300,
          borderRadius: 3,
          border: "1px solid",
          borderColor: bHov ? "var(--border-strong)" : "var(--border-md)",
          boxShadow: bHov ? "var(--shadow-lg)" : "var(--shadow-sm)",
          transform: bHov ? "translateY(-4px)" : "translateY(0)",
          transition:
            "transform 0.38s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.38s, border-color 0.3s",
          cursor: "pointer",
        }}
      >
        <img
          src={featured.images[0]}
          alt={featured.name}
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: bHov ? "scale(1.10)" : "scale(1)",
            transition: "transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        />

        {/* Shine sweep on banner hover */}
        <div
          className={bHov ? "card-shine" : ""}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "40%",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
            transform: "translateX(-120%) skewX(-18deg)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(28,18,8,0.92) 0%, rgba(28,18,8,0.4) 55%, transparent 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: 24,
            textAlign: "center",
          }}
        >
          <span
            style={{
              backgroundColor: "var(--gold)",
              color: "var(--text-inv)",
              fontSize: 10,
              fontWeight: 800,
              padding: "3px 12px",
              letterSpacing: "0.10em",
              marginBottom: 10,
            }}
          >
            إصدار مميز
          </span>
          <h4
            style={{
              color: "#fff",
              fontSize: 17,
              fontWeight: 700,
              marginBottom: 7,
              lineHeight: 1.4,
            }}
          >
            {featured.name}
          </h4>
          <p
            style={{
              color: "var(--gold-bright)",
              fontWeight: 800,
              fontSize: 18,
              marginBottom: 18,
            }}
          >
            {featured.discountPrice.toLocaleString()} ر.س
          </p>
          <button
            onClick={() => onQuickView(featured)}
            style={{
              backgroundColor: "var(--surface-3)",
              color: "var(--gold)",
              border: "1.5px solid var(--border-strong)",
              padding: "9px 22px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              borderRadius: 2,
              transition: "all 0.2s",
              letterSpacing: "0.05em",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--surface)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--surface-3)")
            }
          >
            استكشف الفخامة
          </button>
        </div>
      </article>
    </div>
  );
}

/* ═══════════════════════════════════════
   SECTION TITLE
═══════════════════════════════════════ */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 3,
          height: 22,
          flexShrink: 0,
          backgroundColor: "var(--gold)",
          borderRadius: 2,
        }}
      />
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "var(--text-1)",
          letterSpacing: "0.02em",
        }}
      >
        {children}
      </h3>
      <div
        style={{
          flex: 1,
          height: 1,
          backgroundColor: "var(--border)",
          marginRight: 4,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════ */
const ProductsSection = memo(function ProductsSection() {
  const [modal, setModal] = useState<Product | null>(null);
  const handleQV = useCallback((p: Product) => setModal(p), []);
  const handleClose = useCallback(() => setModal(null), []);

  return (
    <section
      id="products"
      aria-labelledby="products-heading"
      style={{
        backgroundColor: "var(--bg)",
        direction: "rtl",
        padding: "80px 16px",
        position: "relative",
      }}
    >
      <style>{CSS}</style>

      {/* Responsive helpers */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-flex  { display: flex !important; }
          .lg-grid-side { grid-template-columns: 1fr 268px !important; }
        }
        @media (max-width: 640px) {
          .duo-grid { flex-direction: row !important; height: 300px !important; }
        }
      `}</style>

      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(ellipse 70% 40% at 15% 85%, rgba(122,85,32,0.08) 0%, transparent 60%)," +
            "radial-gradient(ellipse 50% 30% at 85% 15%, rgba(122,85,32,0.06) 0%, transparent 55%)",
        }}
      />

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.24em",
              color: "var(--gold-mid)",
              marginBottom: 12,
              fontWeight: 700,
            }}
          >
            ◆ &nbsp;مجموعتنا الحصرية&nbsp; ◆
          </p>
          <h2
            id="products-heading"
            style={{
              fontSize: "clamp(28px,5vw,50px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              color: "var(--text-1)",
              lineHeight: 1.2,
              marginBottom: 14,
            }}
          >
            قطع{" "}
            <span style={{ color: "var(--gold)", fontWeight: 800 }}>حصرية</span>{" "}
            مختارة
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-2)",
              maxWidth: 480,
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            اكتشف أرقى خطوط التصميم الداخلي المنفذة بأجود الأخشاب والأقمشة
            العالمية.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginTop: 22,
            }}
          >
            <div
              style={{
                width: 48,
                height: 1,
                backgroundColor: "var(--border-strong)",
              }}
            />
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                backgroundColor: "var(--gold)",
              }}
            />
            <div
              style={{
                width: 48,
                height: 1,
                backgroundColor: "var(--border-strong)",
              }}
            />
          </div>
        </div>

        {/* ── Layout 1 ── */}
        <div style={{ marginBottom: 72 }}>
          <SectionTitle>صيحات الأكثر مبيعاً</SectionTitle>
          <HorizontalScroll onQuickView={handleQV} />
        </div>

        {/* ── Layout 2 ── */}
        <div style={{ marginBottom: 72 }}>
          <SectionTitle>ثنائيات معمارية فريدة</SectionTitle>
          <HoverExpandDuo onQuickView={handleQV} />
        </div>

        {/* ── Layout 3 ── */}
        <div style={{ marginBottom: 72 }}>
          <SectionTitle>تنسيقات مصممينا الفنية</SectionTitle>
          <FeaturedGrid onQuickView={handleQV} />
        </div>

        {/* ── Layout 4 ── */}
        <div>
          <SectionTitle>المجموعة الشاملة</SectionTitle>
          <GridWithSideBanner onQuickView={handleQV} />
        </div>
      </div>

      {/* Modal */}
      <GalleryModal
        product={modal ?? products[0]}
        isOpen={modal !== null}
        onClose={handleClose}
      />
    </section>
  );
});

export default ProductsSection;
