// ─── app/blog/tag/[slug]/page/[pageNumber]/page.tsx ──────────────────────────
// Tag listing, page 2+. SEO logic kept INLINE — no separate file.

import { Breadcrumbs } from "@/app/components/blog/Breadcrumbs";
import { CollectionPageJsonLd } from "@/app/components/blog/JsonLd";
import { PostGrid } from "@/app/components/blog/PostGrid";
import { BLOG_CONFIG, SITE_CONFIG } from "@/utils/blog/config";
import { buildTagMetadata } from "@/utils/blog/metadata";
import { getTagBySlug, getPostsByTag } from "@/utils/blog/queries";
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string; pageNumber: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, pageNumber } = await params;
  const page = parseInt(pageNumber, 10);
  if (!Number.isInteger(page) || page < 2) return {};
  const tag = await getTagBySlug(slug);
  if (!tag) return {};
  return buildTagMetadata(tag, page);
}

export default async function TagPaginatedPage({ params }: PageProps) {
  const { slug, pageNumber } = await params;
  const page = parseInt(pageNumber, 10);
  const basePath = `${BLOG_CONFIG.basePath}/tag/${slug}`;

  if (pageNumber === "1") redirect(basePath);
  if (!Number.isInteger(page) || page < 2) notFound();

  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const result = await getPostsByTag(slug, page);
  if (result.items.length === 0) notFound();

  const pageUrl = `${SITE_CONFIG.url}${basePath}/page/${page}`;

  return (
    <>
      <CollectionPageJsonLd
        name={`وسم: ${tag.name} — الصفحة ${page}`}
        url={pageUrl}
        posts={result.items.map((post) => ({
          title: post.title,
          url: `${SITE_CONFIG.url}${BLOG_CONFIG.basePath}/${post.slug}`,
          imageUrl: post.coverImage ?? undefined,
        }))}
      />

      <div
        dir="rtl"
        className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10"
      >
        <Breadcrumbs
          items={[
            { label: `#${tag.name}`, href: `/blog/tag/${slug}` },
            { label: `الصفحة ${page}` },
          ]}
          className="mb-6"
        />

        <h1 className="text-2xl font-bold text-[var(--text-1)] mb-8">
          وسم: {tag.name} — الصفحة {page}
        </h1>

        <PostGrid result={result} basePath={basePath} />
      </div>
    </>
  );
}
