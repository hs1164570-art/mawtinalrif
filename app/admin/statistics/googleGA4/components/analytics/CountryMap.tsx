// components/analytics/CountryMap.tsx
"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup, // [!] استيراد مكون التحكم والزووم التفاعلي
} from "react-simple-maps";
import { EmptyState } from "./ChartCard";
import { formatNumber } from "../../lib/utils";

const GEO_URL = "/countries.json";

export interface CountryMapDatum {
  countryCode: string;
  value: number;
}

const ARAB_COUNTRIES_REF: Record<
  string,
  { name_ar: string; lat: number; lng: number }
> = {
  EG: { name_ar: "مصر", lat: 26.8206, lng: 30.8025 },
  SA: { name_ar: "المملكة العربية السعودية", lat: 23.8859, lng: 45.0792 },
  AE: { name_ar: "الإمارات العربية المتحدة", lat: 23.4241, lng: 53.8478 },
  KW: { name_ar: "الكويت", lat: 29.3117, lng: 47.4818 },
  QA: { name_ar: "قطر", lat: 25.3548, lng: 51.1839 },
  BH: { name_ar: "البحرين", lat: 26.0667, lng: 50.5577 },
  OM: { name_ar: "عُمان", lat: 21.5126, lng: 55.9233 },
  JO: { name_ar: "الأردن", lat: 31.24, lng: 36.51 },
  IQ: { name_ar: "العراق", lat: 33.2232, lng: 43.6793 },
};

export function CountryMap({
  data,
  size = "large",
}: {
  data: CountryMapDatum[];
  size?: "large" | "small";
}) {
  // حالة التحكم بالزووم ديناميكياً للأزرار الخارجية
  const [position, setPosition] = useState({
    coordinates: [42, 24] as [number, number],
    zoom: 1,
  });

  const joined = data
    .map((d) => {
      const ref = ARAB_COUNTRIES_REF[d.countryCode.toUpperCase()];
      return ref ? { ...ref, code: d.countryCode, value: d.value } : null;
    })
    .filter(
      (
        x,
      ): x is {
        name_ar: string;
        lat: number;
        lng: number;
        code: string;
        value: number;
      } => x !== null && x.value > 0,
    );

  if (joined.length === 0) {
    return <EmptyState message="لا توجد بيانات جغرافية كافية لعرض الخريطة" />;
  }

  const max = Math.max(...joined.map((j) => j.value));
  const radiusFor = (value: number) => {
    const min = size === "small" ? 3 : 4;
    const maxR = size === "small" ? 10 : 22;
    return min + (value / max) * (maxR - min);
  };

  // دوال التحكم اليدوي من الأزرار
  const handleZoomIn = () => {
    if (position.zoom >= 8) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [42, 24], zoom: 1 });
  };

  return (
    <div className="relative w-full h-full min-h-[220px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
      {/* ── أزرار التحكم العائمة (Floating Controls) ── */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1.5 bg-[var(--surface)] p-1 rounded-lg shadow-[var(--shadow-sm)] border border-[var(--border-md)]">
        <button
          onClick={handleZoomIn}
          className="flex h-7 w-7 items-center justify-center rounded text-sm font-bold text-[var(--text-2)] hover:bg-[var(--bg-deep)] hover:text-[var(--text-1)] transition-colors"
          title="تكبير"
        >
          ＋
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-7 w-7 items-center justify-center rounded text-sm font-bold text-[var(--text-2)] hover:bg-[var(--bg-deep)] hover:text-[var(--text-1)] transition-colors border-t border-b border-[var(--border)]"
          title="تصغير"
        >
          －
        </button>
        <button
          onClick={handleReset}
          className="flex h-7 w-7 items-center justify-center rounded text-xs text-[var(--text-3)] hover:bg-[var(--bg-deep)] hover:text-[var(--text-1)] transition-colors"
          title="إعادة ضبط الأبعاد"
        >
          🔄
        </button>
      </div>

      {/* ── جسم الخريطة التفاعلي ── */}
      <ComposableMap
        projectionConfig={{
          scale: size === "small" ? 350 : 450,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* المكون السحري للـ Zoom & Pan */}
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(pos) =>
            setPosition({
              coordinates: pos.coordinates as [number, number],
              zoom: pos.zoom,
            })
          }
          maxZoom={8}
          minZoom={1}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="var(--bg-deep)"
                  stroke="var(--surface)"
                  strokeWidth={0.75}
                  style={{
                    default: { outline: "none", transition: "all 0.2s ease" },
                    hover: {
                      outline: "none",
                      fill: "var(--border-strong)",
                      cursor: "grab",
                    },
                    pressed: { outline: "none", cursor: "grabbing" },
                  }}
                />
              ))
            }
          </Geographies>

          {joined.map((c) => (
            <Marker key={c.code} coordinates={[c.lng, c.lat]}>
              <circle
                r={radiusFor(c.value) * 1.4}
                fill="var(--cyan)"
                fillOpacity={0.12}
                className="animate-pulse pointer-events-none"
              />
              <circle
                r={radiusFor(c.value)}
                fill="var(--cyan)"
                fillOpacity={0.75}
                stroke="var(--cyan-bright)"
                strokeWidth={1.5}
                className="cursor-pointer"
                style={{ transition: "all 0.3s ease" }}
              />
              <title>
                {c.name_ar}: {formatNumber(c.value)}
              </title>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
