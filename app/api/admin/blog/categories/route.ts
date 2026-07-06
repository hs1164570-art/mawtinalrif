import { NextResponse } from "next/server";
import { z } from "zod";
import { adminGuard } from "@/lib/Guards";
import { getCategoriesWithCount } from "@/app/admin/blog/lib/queries/category.queries";

export const GET = adminGuard(z.object({}), async () => {
  const categories = await getCategoriesWithCount();
  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      color: c.color,
      postCount: c._count.posts,
    })),
  });
});
