"use client";

import { useQuery } from "@tanstack/react-query";
import { HOME_QUERY_KEY, HOME_API_URL } from "./constants";
import type { HomeData } from "./types";
import ProductSectionWrapper from "./ProductSectionWrapper";
import SubSectionWrapper from "./SubSectionWrapper";
import SectionDivider from "./SectionDivider";
import SkeletonSection from "./SkeletonSection";
import HeroSection from "../HeroSection";

async function fetchHomeData(): Promise<HomeData> {
  const res = await fetch(HOME_API_URL); // api/home
  if (!res.ok) throw new Error("فشل تحميل البيانات");
  const json = await res.json();
  return json.data as HomeData;
}

export default function ProductSections() {
  const { data, isLoading, isError } = useQuery<HomeData>({
    queryKey: HOME_QUERY_KEY,
    queryFn: fetchHomeData,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <section
        id="products-section"
        aria-label="أقسام المنتجات"
        className="bg-[var(--bg)]"
      >
        <SkeletonSection />
        <SkeletonSection />
      </section>
    );
  }

  if (isError || !data) return null;

  const mainSections = data.productSections ?? [];
  const subSections = data.subSections ?? [];
  const heroSection = data.heroSection;
  return (
    <section
      id="products-section"
      aria-label="أقسام المنتجات"
      className="bg-[var(--bg)]"
    >
      {heroSection.length > 0 && <HeroSection heroData={heroSection} />}
      {/* ── الأقسام الرئيسية (4) — LayoutA / LayoutB ─────────── */}
      {mainSections.map((section, index) => (
        <div key={section.categorySlug}>
          {index > 0 && <SectionDivider />}
          <ProductSectionWrapper
            section={section}
            index={index}
            isPriority={index === 0}
          />
        </div>
      ))}

      {/* ── فاصل بين الرئيسية والفرعية ─────────────────────── */}
      {subSections.length > 0 && mainSections.length > 0 && <SectionDivider />}

      {/* ── الأقسام الفرعية (11) — 11 layout مختلف ──────────── */}
      {subSections.slice(0, 8).map((section, index) => (
        <div key={section.subSlug}>
          {/* الفاصل هيظهر فقط بين الأقسام المعروضة فعلياً (مش هيظهر قبل الأول) */}
          {index > 0 && <SectionDivider />}

          <SubSectionWrapper
            section={section}
            index={index}
            isPriority={false}
          />
        </div>
      ))}
    </section>
  );
}
