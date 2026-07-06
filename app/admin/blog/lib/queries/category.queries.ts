import prisma from "@/lib/db";

export async function getCategoriesWithCount() {
  return prisma.blogCategory.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getTagsWithCount() {
  return prisma.blogTag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}
