import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface GetPostsParams {
  page: number;
  perPage: number;
  search?: string;
  status?: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  categoryId?: string;
  sortBy?: "createdAt" | "publishedAt" | "title" | "viewCount" | "seoScore";
  sortDir?: "asc" | "desc";
}

export async function getPosts(params: GetPostsParams) {
  const {
    page,
    perPage,
    search,
    status,
    categoryId,
    sortBy = "createdAt",
    sortDir = "desc",
  } = params;

  const where: Prisma.BlogPostWhereInput = {
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        category: { select: { id: true, name: true, color: true } },
        author: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return { posts, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getPostById(id: string) {
  return prisma.blogPost.findUnique({
    where: { id },
    include: {
      category: true,
      tags: true,
      author: { select: { id: true, name: true } },
    },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function getPostActivityLogs(postId: string, limit = 10) {
  return prisma.postActivityLog.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
