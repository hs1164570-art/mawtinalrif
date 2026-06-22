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
// MAP CONFIGURATIONS & CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════
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

function PulseRing({ color = "var(--cyan)" }: { color?: string }) {
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
        background: "var(--surface-3)",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid var(--border-md)",
        touchAction: "pan-x pan-y",
      }}
    >
      {/* ── شريط التحكم العلوى المتجاوب الفاخر ── */}
      <div
        className="w-full md:absolute md:top-0 md:inset-x-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b sm:border-b-0"
        style={{
          background: "var(--surface)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--border)",
        }}
      >
        <div>
          <p
            className="text-xs md:text-sm font-black tracking-tight"
            style={{ color: "var(--text-1)" }}
          >
            التوزيع الجغرافي لحركة الحشود والزيارات
          </p>
          <p
            className="text-[10px] md:text-xs mt-0.5"
            style={{ color: "var(--text-3)" }}
          >
            إجمالي زيارات المملكة:{" "}
            <span
              className="font-bold text-xs md:text-sm"
              style={{ color: "var(--red)" }}
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
              background: focused ? "var(--surface)" : "var(--gold)",
              color: focused ? "var(--text-1)" : "var(--text-inv)",
              borderColor: "var(--border-strong)",
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
              className="w-7 h-7 rounded-lg text-xs md:text-sm font-black flex items-center justify-center border"
              style={{
                color: "var(--text-1)",
                background: "var(--surface)",
                borderColor: "var(--border-strong)",
              }}
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
              fill="var(--surface-3)"
              stroke="var(--border)"
              strokeWidth={0.2}
            />
            <Graticule stroke="var(--border)" strokeWidth={0.4} />

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
                          fill: isSaudi ? "var(--gold-bright)" : "var(--bg)",
                          stroke:
                            isSaudi ? "var(--border-strong)" : "var(--border)",
                          strokeWidth: isSaudi ? 1.0 : 0.3,
                          outline: "none",
                          filter:
                            isSaudi ?
                              "drop-shadow(0 4px 10px rgba(0,0,0,0.08))"
                            : "none",
                          transition: "all 0.3s ease",
                        },
                        hover: {
                          fill: isSaudi ? "var(--gold-mid)" : "var(--bg-deep)",
                          stroke:
                            isSaudi ?
                              "var(--border-strong)"
                            : "var(--border-md)",
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
                  {hasVisits && <PulseRing color="var(--cyan)" />}

                  <motion.circle
                    r={size}
                    fill={hasVisits ? "var(--cyan)" : "var(--text-3)"}
                    stroke="var(--surface)"
                    strokeWidth={hasVisits ? 0.8 : 0.3}
                    style={{
                      cursor: "pointer",
                      filter: hasVisits ? "var(--shadow-sm)" : "none",
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
                        fill: "var(--text-inv)",
                        direction: "rtl",
                        pointerEvents: "none",
                        textShadow: "0px 1px 2px rgba(0,0,0,0.8)",
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
              top: isMobile ? "70%" : tooltip.y + 12,
              transform: isMobile ? "translate(-50%, -55%)" : "none",
              background: "var(--surface)",
              backdropFilter: "blur(10px)",
              border: "1px solid var(--border-md)",
              minWidth: 130,
            }}
            onClick={() => setTooltip(null)}
          >
            <p
              className="font-black text-xs md:text-sm mb-0.5"
              style={{ color: "var(--text-1)" }}
            >
              {tooltip.name}
            </p>
            <p
              className="flex items-center justify-between text-[10px] md:text-[11px]"
              style={{ color: "var(--text-2)" }}
            >
              <span>الزيارات:</span>
              <span
                className="font-black"
                style={{
                  color: tooltip.visits > 0 ? "var(--red)" : "var(--text-3)",
                }}
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
      <div
        className="p-3 md:absolute md:bottom-3 md:left-4 z-20 flex items-center justify-center md:justify-start gap-4 border-t md:border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border-md)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ background: "var(--cyan)" }}
          />
          <span
            className="text-[10px] font-bold"
            style={{ color: "var(--text-1)" }}
          >
            منطقة نشطة مبيعاً
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--text-3)" }}
          />
          <span
            className="text-[10px] font-medium"
            style={{ color: "var(--text-3)" }}
          >
            خاملة حالياً
          </span>
        </div>
      </div>
    </div>
  );
}
