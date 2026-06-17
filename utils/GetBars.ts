import prisma from "@/lib/db";

export async function getActiveAnnouncements() {
  try {
    const bars = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        url: true,
        backgroundColor: true,
        textColor: true,
        showCount: true,
      },
    });

    // تنفيذ الـ flatMap بناءً على الـ showCount لتكرار الإعلانات
    const expandedBars = bars.flatMap(({ showCount, ...bar }) =>
      Array.from({ length: showCount }, () => ({
        id: bar.id,
        title: bar.title,
        url: bar.url ?? null,
        backgroundColor: bar.backgroundColor,
        textColor: bar.textColor,
      })),
    );

    return expandedBars;
  } catch (error) {
    console.error("[DB ERROR] Failed to fetch active announcements:", error);
    return []; // بنرجع مصفوفة فاضية عشان الـ UI ميتكسرش لو الداتابيز وقعت
  }
}
