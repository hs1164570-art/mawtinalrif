import { NextResponse } from "next/server";
import { z } from "zod";
import { adminGuard } from "@/lib/Guards";
import { getTagsWithCount } from "@/app/admin/blog/lib/queries/category.queries";

export const GET = adminGuard(z.object({}), async () => {
  const tags = await getTagsWithCount();
  return NextResponse.json({
    tags: tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, postCount: t._count.posts })),
  });
});
