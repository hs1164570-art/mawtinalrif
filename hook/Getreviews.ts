// utils/getReviews.ts
// ─── Server-side only — never import from client components directly ─────────
// ─── Query Keys ────────────────────────────────────────────────────────────
// Centralised keys prevent cache mismatches between server prefetch and client
// useQuery calls. Keep as `const` tuple so TypeScript infers the literal type.

export const REVIEWS_QUERY_KEY = ["google-reviews"] as const;

export type ReviewsQueryKey = typeof REVIEWS_QUERY_KEY;

// ─── External Links ─────────────────────────────────────────────────────────
export const ADD_REVIEW_URL =
  "https://www.google.com/maps/place/%D9%85%D8%A4%D8%B3%D8%B3%D9%87+%D9%85%D9%88%D8%B7%D9%86+%D8%A7%D9%84%D8%B1%D9%8A%D9%81+%D9%84%D9%84%D8%AA%D8%AC%D8%A7%D8%B1%D9%871%E2%80%AD/@24.6564078,46.7923623,17z/data=!3m1!4b1!4m6!3m5!1s0x3e2f07584f86f885:0x1fa398d5807432b5!8m2!3d24.6564078!4d46.7923623!16s%2Fg%2F11xyg7dts1?entry=ttu&g_ep=EgoyMDI2MDYxMC4wIKXMDSoASAFQAw%3D%3D1";
// ── Raw shape returned by the Apify Google Maps Reviews dataset ───────────────
interface ApifyReviewRaw {
  name: string;
  text: string | null;
  stars: number;
  publishAt: string;
  reviewUrl: string;
  /** Apify actor may surface the photo under either key */
  reviewerPhotoUrl?: string | null;
  profilePhoto?: string | null;
  isLocalGuide?: boolean;
  likesCount?: number;
}

// ── Clean, mapped shape consumed by the UI ────────────────────────────────────
export interface Review {
  /** Reviewer's display name */
  name: string;
  /** URL to the reviewer's profile picture (may be empty string) */
  avatar: string;
  /** 1–5 star rating */
  rating: number;
  /** Full review body text */
  text: string;
  /** Human-readable relative date, e.g. "منذ شهرين" */
  time: string;
  /** Direct link to this review on Google Maps */
  reviewUrl: string;
}

// ── Fetcher ───────────────────────────────────────────────────────────────────
const APIFY_URL =
  "https://api.apify.com/v2/datasets/6IuZ3Cla2boD7cG5Z/items?token=apify_api_MYLrGk05gUPCRTaXVYE3tojUWRNgpO1Yzytx&limit=10";

export async function getReviews(): Promise<Review[]> {
  const res = await fetch(APIFY_URL, {
    // 💡 التعديل هنا: 28800 ثانية تعادل 8 ساعات بالظبط
    // ده بيضمن إن الموقع مش هيكلم Apify أكتر من 3 مرات في اليوم، والـ 5$ هتكفيك وزيادة!
    next: { revalidate: 28800 },
  });

  if (!res.ok) {
    throw new Error(
      `[getReviews] Apify API error: ${res.status} ${res.statusText}`,
    );
  }

  const raw: ApifyReviewRaw[] = await res.json();

  return raw
    .filter((item) => item.text && item.text.trim().length > 0)
    .map(
      (item): Review => ({
        name: item.name?.trim() || "مستخدم Google",
        avatar: item.reviewerPhotoUrl ?? item.profilePhoto ?? "",
        rating: Math.min(5, Math.max(1, Math.round(item.stars))),
        text: item.text!.trim(),
        time: item.publishAt?.trim() || "",
        reviewUrl: item.reviewUrl,
      }),
    );
}
