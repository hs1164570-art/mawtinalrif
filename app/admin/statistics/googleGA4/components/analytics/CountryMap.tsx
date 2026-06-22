// components/analytics/CountryMap.tsx
"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import countries from "../../data/countries.json";
import { EmptyState } from "./ChartCard";
import { chartColors } from "../../lib/chart-colors";
import { formatNumber } from "../../lib/utils";

// Standard public world-atlas topojson (110m resolution) — the conventional
// geography source used with react-simple-maps.
const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export interface CountryMapDatum {
  countryCode: string;
  value: number;
}

interface CountryRef {
  code: string;
  name_en: string;
  name_ar: string;
  lat: number;
  lng: number;
}

export function CountryMap({
  data,
  size = "large",
}: {
  data: CountryMapDatum[];
  size?: "large" | "small";
}) {
  const joined = data
    .map((d) => {
      const ref = (countries as CountryRef[]).find(
        (c) => c.code === d.countryCode,
      );
      return ref ? { ...ref, value: d.value } : null;
    })
    .filter(
      (x): x is CountryRef & { value: number } => x !== null && x.value > 0,
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

  return (
    <div className="w-full h-full min-h-[220px]">
      <ComposableMap
        projectionConfig={{ scale: size === "small" ? 110 : 140 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={chartColors.bgDeep}
                stroke={chartColors.surface}
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: chartColors.cyanBg },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        {joined.map((c) => (
          <Marker key={c.code} coordinates={[c.lng, c.lat]}>
            <circle
              r={radiusFor(c.value)}
              fill={chartColors.cyan}
              fillOpacity={0.55}
              stroke={chartColors.cyanBright}
              strokeWidth={1}
            />
            <title>
              {c.name_ar}: {formatNumber(c.value)}
            </title>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
