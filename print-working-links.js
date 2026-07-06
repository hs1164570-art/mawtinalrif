require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BASE = "http://localhost:3000";

async function main() {
  console.log("═══ روابط التصنيفات ═══\n");
  const categories = await prisma.blogCategory.findMany({
    select: { name: true, slug: true },
  });
  for (const c of categories) {
    const url = `${BASE}/blog/category/${encodeURIComponent(c.slug)}`;
    console.log(`${c.name}`);
    console.log(`  raw slug: ${JSON.stringify(c.slug)}`);
    console.log(`  رابط:     ${url}\n`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
