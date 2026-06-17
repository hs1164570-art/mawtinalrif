"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
  Graticule,
  Sphere,
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";

// ══════════════════════════════════════════════════════════════════════════════
// TOKENS & LUXURY GOLD PALETTE
// ══════════════════════════════════════════════════════════════════════════════
const C = {
  gold: "#B89A5A",
  goldLight: "#D4B97A",
  goldDark: "#8A6E30",
  goldGlow: "rgba(184,154,90,0.25)",

  // اللون الذهبي الملكي الداكن للأرضية
  saudiActive: "#4A3E25",
  saudiHover: "#5E4F32",
  saudiStroke: "#B89A5A",

  // العالم المحيط
  world: "#F7F5F0",
  worldHover: "#EFECE5",
  worldStroke: "#E5DEC3",

  sea: "#FCFAF7",
  border: "#EAE1D4",
  text1: "#2D2219",
  text2: "#5C4636",
  text3: "#967860",
  mutedDot: "#C9BEA7",
};

const KSA_REGIONS_GEO = [
  { name: "الرياض", nameEn: "Riyadh", lng: 46.72, lat: 24.69 },
  { name: "مكة المكرمة", nameEn: "Makkah", lng: 39.82, lat: 21.39 },
  { name: "جدة", nameEn: "Jeddah", lng: 39.19, lat: 21.54 },
  { name: "المدينة المنورة", nameEn: "Al Madinah", lng: 39.61, lat: 24.47 },
  {
    name: "المنطقة الشرقية",
    nameEn: "Eastern Province",
    lng: 50.1,
    lat: 26.43,
  },
  { name: "القصيم", nameEn: "Al Qassim", lng: 43.97, lat: 26.33 },
  { name: "حائل", nameEn: "Ha'il", lng: 41.69, lat: 27.52 },
  { name: "تبوك", nameEn: "Tabuk", lng: 36.57, lat: 28.39 },
  {
    name: "الحدود الشمالية",
    nameEn: "Northern Borders",
    lng: 41.42,
    lat: 30.0,
  },
  { name: "جازان", nameEn: "Jazan", lng: 42.55, lat: 16.89 },
  { name: "نجران", nameEn: "Najran", lng: 44.15, lat: 17.49 },
  { name: "الباحة", nameEn: "Al Bahah", lng: 41.46, lat: 20.01 },
  { name: "الجوف", nameEn: "Al Jawf", lng: 40.21, lat: 29.81 },
  { name: "عسير", nameEn: "'Asir", lng: 42.53, lat: 18.22 },
];

function PulseRing({ color = C.gold }: { color?: string }) {
  return (
    <>
      {[0, 1].map((i) => (
        <motion.circle
          key={i}
          r={5}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          initial={{ r: 4, opacity: 0.8 }}
          animate={{ r: 20, opacity: 0 }}
          transition={{
            duration: 2.2,
            delay: i * 1.1,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}

interface SaudiSalesMapProps {
  data: { name: string; value: number }[];
  totalVisits: number;
  loading?: boolean;
}

interface TooltipData {
  name: string;
  visits: number;
  x: number;
  y: number;
}

export default function SaudiSalesMap({
  data = [],
  totalVisits = 0,
  loading = false,
}: SaudiSalesMapProps) {
  const [zoom, setZoom] = useState(5.5);
  const [center, setCenter] = useState<[number, number]>([44.5, 24.0]);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [focused, setFocused] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const checkMobile = window.innerWidth < 768;
      setIsMobile(checkMobile);
      if (checkMobile) {
        setZoom(4.6);
        setCenter([45.0, 24.0]);
      } else {
        setZoom(5.5);
        setCenter([44.5, 24.0]);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const processedRegions = KSA_REGIONS_GEO.map((reg) => {
    const matchedData = data.find(
      (d) =>
        d.name.toLowerCase() === reg.nameEn.toLowerCase() ||
        d.name === reg.name,
    );
    return { ...reg, visits: matchedData ? matchedData.value : 0 };
  });

  const focusSaudi = useCallback(() => {
    setCenter(isMobile ? [45.0, 24.0] : [44.5, 24.0]);
    setZoom(isMobile ? 4.6 : 5.5);
    setFocused(true);
  }, [isMobile]);

  const resetView = useCallback(() => {
    setCenter([35, 22]);
    setZoom(1.6);
    setFocused(false);
    setTooltip(null);
  }, []);

  const handleMoveEnd = useCallback(
    (pos: { coordinates: [number, number]; zoom: number }) => {
      setCenter(pos.coordinates);
      setZoom(pos.zoom);
    },
    [],
  );

  return (
    <div
      ref={wrapRef}
      className="relative w-full flex flex-col md:block"
      style={{
        background: C.sea,
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        // التعديل السحري لمنع الـ Freeze والسماح بالتحكم والـ Scroll معاً بكفاءة
        touchAction: "pan-x pan-y",
      }}
    >
      {/* ── شريط التحكم العلوى المتجاوب الفاخر ── */}
      <div
        className="w-full md:absolute md:top-0 md:inset-x-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b sm:border-b-0"
        style={{
          background: "rgba(255,254,251,0.94)",
          backdropFilter: "blur(12px)",
          borderColor: C.border,
        }}
      >
        <div>
          <p
            className="text-xs md:text-sm font-black tracking-tight"
            style={{ color: C.text1 }}
          >
            التوزيع الجغرافي لحركة الحشود والزيارات
          </p>
          <p
            className="text-[10px] md:text-xs mt-0.5"
            style={{ color: C.text3 }}
          >
            إجمالي زيارات المملكة:{" "}
            <span
              className="font-bold text-xs md:text-sm"
              style={{ color: C.goldDark }}
            >
              {totalVisits.toLocaleString("en-US")}
            </span>{" "}
            زيارة نشطة
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={focused ? resetView : focusSaudi}
            className="text-[10px] md:text-[11px] font-black px-2.5 py-1.5 rounded-lg border transition-all"
            style={{
              background: focused ? "#FFF" : C.saudiActive,
              color: focused ? C.text1 : "#FFF",
              borderColor: C.border,
            }}
          >
            {focused ? "🗺️ عرض شامل" : "🎯 تركيز"}
          </motion.button>
          {[
            { label: "+", delta: 1.0 },
            { label: "−", delta: -1.0 },
          ].map(({ label, delta }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                setZoom((z) => Math.min(Math.max(z + delta, 1), 15))
              }
              className="w-7 h-7 rounded-lg text-xs md:text-sm font-black flex items-center justify-center border bg-white"
              style={{ color: C.text1, borderColor: C.border }}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── حاوية الخريطة بنظام اللمس الحر ── */}
      <div className={`w-full ${loading ? "opacity-60" : ""} mt-0 md:mt-4`}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 160, center: [12, 18] }}
          width={isMobile ? 500 : 900}
          height={isMobile ? 520 : 500}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            onMoveEnd={handleMoveEnd}
            minZoom={1}
            maxZoom={15}
          >
            <Sphere
              id="sphere"
              fill={C.sea}
              stroke={C.border}
              strokeWidth={0.2}
            />
            <Graticule stroke="rgba(184,154,90,0.03)" strokeWidth={0.4} />

            <Geographies geography="/countries.json">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isSaudi =
                    geo.id === "682" ||
                    geo.properties?.name === "Saudi Arabia" ||
                    geo.properties?.NAME === "Saudi Arabia";

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: isSaudi ? C.saudiActive : C.world,
                          stroke: isSaudi ? C.saudiStroke : C.worldStroke,
                          strokeWidth: isSaudi ? 1.0 : 0.3,
                          outline: "none",
                          filter:
                            isSaudi ?
                              "drop-shadow(0 4px 10px rgba(74,62,37,0.2))"
                            : "none",
                          transition: "all 0.3s ease",
                        },
                        hover: {
                          fill: isSaudi ? C.saudiHover : C.worldHover,
                          stroke: isSaudi ? C.saudiStroke : C.worldStroke,
                          strokeWidth: isSaudi ? 1.3 : 0.3,
                          outline: "none",
                          cursor: isSaudi ? "grab" : "default",
                        },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* ── Markers ── */}
            {processedRegions.map((region) => {
              const hasVisits = region.visits > 0;
              const size =
                hasVisits ?
                  Math.min(
                    Math.max(
                      Math.sqrt(region.visits) * (isMobile ? 0.75 : 0.9),
                      isMobile ? 3.0 : 3.5,
                    ),
                    isMobile ? 11 : 14,
                  )
                : isMobile ? 1.4
                : 1.8;

              return (
                <Marker
                  key={region.nameEn}
                  coordinates={[region.lng, region.lat]}
                  onMouseEnter={(e) => {
                    if (isMobile) return;
                    const rect = wrapRef.current?.getBoundingClientRect();
                    setTooltip({
                      name: region.name,
                      visits: region.visits,
                      x: e.clientX - (rect?.left ?? 0),
                      y: e.clientY - (rect?.top ?? 0),
                    });
                  }}
                  onClick={(e) => {
                    // كبسة إصبع مرنة للموبايل تظهر تفاصيل المنطقة فوراً
                    const rect = wrapRef.current?.getBoundingClientRect();
                    setTooltip({
                      name: region.name,
                      visits: region.visits,
                      x: e.clientX - (rect?.left ?? 0),
                      y: e.clientY - (rect?.top ?? 0),
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {hasVisits && <PulseRing />}

                  <motion.circle
                    r={size}
                    fill={hasVisits ? C.gold : C.mutedDot}
                    stroke="#FFFFFF"
                    strokeWidth={hasVisits ? 0.8 : 0.3}
                    style={{
                      cursor: "pointer",
                      filter:
                        hasVisits ?
                          `drop-shadow(0 2px 4px ${C.goldGlow})`
                        : "none",
                    }}
                    whileHover={{ scale: 1.2 }}
                  />

                  {(hasVisits || zoom > 4.2) && (
                    <text
                      y={-(size + (isMobile ? 2.0 : 2.5))}
                      textAnchor="middle"
                      style={{
                        fontFamily: "Cairo, sans-serif",
                        fontSize:
                          isMobile ?
                            zoom > 6 ?
                              1.8
                            : 2.4
                          : zoom > 6 ? 2.0
                          : 2.8,
                        fontWeight: hasVisits ? 800 : 500,
                        fill: hasVisits ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                        direction: "rtl",
                        pointerEvents: "none",
                        textShadow: "0px 1px 2px rgba(0,0,0,0.6)",
                      }}
                    >
                      {region.name}
                    </text>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* ── Tooltip UI المتجاوب السلس ── */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-30 rounded-xl px-3 py-2 text-xs shadow-2xl"
            style={{
              left: isMobile ? "50%" : tooltip.x + 12,
              top: isMobile ? "70%" : tooltip.y + 12, // ينزل تحت شوية في الموبايل عشان صباعك ما يغطيش عليه
              transform: isMobile ? "translate(-50%, -55%)" : "none",
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${C.border}`,
              minWidth: 130,
            }}
            onClick={() => setTooltip(null)}
          >
            <p
              className="font-black text-xs md:text-sm mb-0.5"
              style={{ color: C.text1 }}
            >
              {tooltip.name}
            </p>
            <p
              className="flex items-center justify-between text-[10px] md:text-[11px]"
              style={{ color: C.text2 }}
            >
              <span>الزيارات:</span>
              <span
                className="font-black"
                style={{ color: tooltip.visits > 0 ? C.goldDark : C.text3 }}
              >
                {tooltip.visits > 0 ?
                  `${tooltip.visits.toLocaleString("en-US")}`
                : "0"}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── الـ Legend المتجاوب ── */}
      <div className="p-3 md:absolute md:bottom-3 md:left-4 z-20 flex items-center justify-center md:justify-start gap-4 bg-white/90 md:bg-white/80 backdrop-blur-md border-t md:border border-stone-200/40">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ background: C.gold }}
          />
          <span className="text-[10px] font-bold" style={{ color: C.text1 }}>
            منطقة نشطة مبيعاً
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: C.mutedDot }}
          />
          <span className="text-[10px] font-medium" style={{ color: C.text3 }}>
            خاملة حالياً
          </span>
        </div>
      </div>
    </div>
  );
}
