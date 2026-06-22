// lib/insights-generator.ts
// Deterministic, rule-based (NOT AI-generated) Arabic insight sentences.
// Every page calls generateInsights(data, pageType) and renders the result
// inside <InsightsPanel>. Logic is threshold/comparison based so it's
// predictable, testable, and fast.

import type {
  Insight,
  PageType,
  SessionsReportResponse,
  UsersReportResponse,
  PagesReportResponse,
  TechReportResponse,
} from "./types";

const fmt = new Intl.NumberFormat("en-US", { numberingSystem: "latn" });
const pct = (n: number) => `${fmt.format(Math.round(n))}%`;

function pushInsight(list: Insight[], tone: Insight["tone"], text: string) {
  list.push({ id: `ins_${list.length}`, tone, text });
}

/* ───────────────────────── Users page insights ───────────────────────── */

function usersInsights(data: UsersReportResponse): Insight[] {
  const out: Insight[] = [];

  const returningPct =
    (data.returningUsers / Math.max(1, data.totalUsers)) * 100;
  if (returningPct >= 35) {
    pushInsight(
      out,
      "positive",
      `${pct(returningPct)} من زوارك عملاء عائدون، وهذا مؤشر جيد على الولاء — يستحق الاستثمار في تجربة ما بعد الشراء للحفاظ عليهم.`,
    );
  } else {
    pushInsight(
      out,
      "warning",
      `نسبة العملاء العائدين منخفضة نسبيًا (${pct(returningPct)} فقط) — معظم الزيارات من عملاء جدد، ما يعني أن الموقع يعتمد بشكل كبير على جذب زوار جدد باستمرار.`,
    );
  }

  const topCountry = [...data.geo].sort(
    (a, b) => b.totalUsers - a.totalUsers,
  )[0];
  if (topCountry) {
    const topShare =
      (topCountry.totalUsers / Math.max(1, data.totalUsers)) * 100;
    if (topShare >= 30) {
      pushInsight(
        out,
        "neutral",
        `${pct(topShare)} من المستخدمين يأتون من ${topCountry.country} — قد يكون من المفيد تخصيص عروض أو حملات إعلانية موجهة لهذه السوق تحديدًا.`,
      );
    }
  }

  if (data.ratios.dauMauRatio < 10) {
    pushInsight(
      out,
      "warning",
      `نسبة الالتصاق (DAU/MAU) منخفضة عند ${pct(data.ratios.dauMauRatio)} فقط — يعني أن معظم المستخدمين الشهريين لا يعودون يوميًا، وهذا فرصة لتحسين التفاعل عبر إشعارات أو محتوى متجدد.`,
    );
  } else {
    pushInsight(
      out,
      "positive",
      `نسبة الالتصاق (DAU/MAU) جيدة عند ${pct(data.ratios.dauMauRatio)}، ما يدل على تفاعل يومي منتظم من جزء معتبر من قاعدة المستخدمين.`,
    );
  }

  const lastTrend = data.activeUsersTrend.slice(-7);
  if (lastTrend.length >= 2) {
    const delta =
      ((lastTrend[lastTrend.length - 1].active1Day - lastTrend[0].active1Day) /
        Math.max(1, lastTrend[0].active1Day)) *
      100;
    if (Math.abs(delta) >= 8) {
      pushInsight(
        out,
        delta > 0 ? "positive" : "negative",
        `المستخدمون النشطون يوميًا ${delta > 0 ? "ارتفعوا" : "انخفضوا"} بنسبة ${pct(Math.abs(delta))} خلال آخر أسبوع مقارنة ببداية الفترة.`,
      );
    }
  }

  return out.slice(0, 6);
}

/* ───────────────────────── Sessions / Campaigns insights ───────────────────────── */

function sessionsInsights(data: SessionsReportResponse): Insight[] {
  const out: Insight[] = [];

  const sortedCampaigns = [...data.campaigns].sort(
    (a, b) => b.sessions - a.sessions,
  );
  const top = sortedCampaigns[0];
  const second = sortedCampaigns[1];

  if (top) {
    pushInsight(
      out,
      "positive",
      `حملة "${top.campaignName}" هي الأكثر جلبًا للزيارات بـ ${fmt.format(top.sessions)} جلسة من إجمالي الحملات.`,
    );
  }
  if (second) {
    pushInsight(
      out,
      "neutral",
      `حملة "${second.campaignName}" تأتي في المرتبة الثانية بـ ${fmt.format(second.sessions)} جلسة.`,
    );
  }

  // Flag high-traffic, low-engagement campaigns — the core decision the owner needs.
  const highVisitsPoorEngagement = sortedCampaigns.find(
    (c) =>
      c.sessions >=
        sortedCampaigns[Math.min(2, sortedCampaigns.length - 1)].sessions &&
      c.quality === "poor",
  );
  if (highVisitsPoorEngagement) {
    pushInsight(
      out,
      "negative",
      `حملة "${highVisitsPoorEngagement.campaignName}" تجلب عددًا كبيرًا من الزيارات (${fmt.format(highVisitsPoorEngagement.sessions)} جلسة) لكن معدل الارتداد مرتفع (${pct(highVisitsPoorEngagement.bounceRate)}) ومعدل التفاعل ضعيف (${pct(highVisitsPoorEngagement.engagementRate)}) — يستحق المراجعة قبل زيادة الميزانية عليها.`,
    );
  }

  const strongCandidate = sortedCampaigns.find(
    (c) =>
      c.quality === "good" &&
      c.sessions >= sortedCampaigns[sortedCampaigns.length - 1].sessions,
  );
  if (strongCandidate) {
    pushInsight(
      out,
      "positive",
      `حملة "${strongCandidate.campaignName}" تجمع بين حجم زيارات جيد (${fmt.format(strongCandidate.sessions)} جلسة) وجودة تفاعل عالية (${pct(strongCandidate.engagementRate)}) — مرشح جيد لاستمرار أو زيادة الميزانية الإعلانية.`,
    );
  }

  const poorCount = sortedCampaigns.filter((c) => c.quality === "poor").length;
  if (poorCount > 0) {
    pushInsight(
      out,
      "warning",
      `${poorCount} ${poorCount === 1 ? "حملة" : "حملات"} مصنّفة بجودة تفاعل ضعيفة — راجع الاستهداف أو المحتوى الإعلاني لهذه الحملات قبل ضخ ميزانية إضافية.`,
    );
  }

  const topSource = [...data.sources].sort(
    (a, b) => b.sessions - a.sessions,
  )[0];
  if (topSource) {
    const share = (topSource.sessions / Math.max(1, data.totalSessions)) * 100;
    if (share >= 30) {
      pushInsight(
        out,
        "neutral",
        `${pct(share)} من كل الجلسات تأتي من مصدر "${topSource.source}" وحده — قناة مهيمنة يستحق تتبعها عن قرب لأي تذبذب مستقبلي.`,
      );
    }
  }

  return out.slice(0, 6);
}

/* ───────────────────────── Pages insights ───────────────────────── */

function pagesInsights(data: PagesReportResponse): Insight[] {
  const out: Insight[] = [];
  const sorted = [...data.topPages].sort((a, b) => b.views - a.views);
  const top = sorted[0];
  if (top) {
    pushInsight(
      out,
      "positive",
      `الصفحة الأكثر مشاهدة هي "${top.pageTitle}" بـ ${fmt.format(top.views)} مشاهدة — تأكد من أنها تعرض أفضل المنتجات أو العروض الحالية.`,
    );
  }

  const highExit = [...data.landingVsExit].sort(
    (a, b) => b.exitCount - a.exitCount,
  )[0];
  if (highExit && highExit.exitCount > highExit.landingCount * 1.4) {
    pushInsight(
      out,
      "warning",
      `صفحة "${highExit.page}" لديها معدل خروج مرتفع مقارنة بدخولها — قد تحتاج لتحسين المحتوى أو إضافة دعوة لاتخاذ إجراء أوضح.`,
    );
  }

  const topEvent = [...data.events].sort((a, b) => b.count - a.count)[0];
  if (topEvent) {
    pushInsight(
      out,
      "neutral",
      `أكثر حدث تفاعل تكرارًا هو "${topEvent.eventName}" بـ ${fmt.format(topEvent.count)} مرة، ما يعكس سلوك المستخدمين الأساسي في الموقع.`,
    );
  }

  const topContentGroup = [...data.contentGroups].sort(
    (a, b) => b.views - a.views,
  )[0];
  if (topContentGroup) {
    pushInsight(
      out,
      "neutral",
      `تصنيف "${topContentGroup.contentGroup}" يستحوذ على أعلى نسبة مشاهدات بين تصنيفات المحتوى — فرصة لتوسيع التشكيلة فيه.`,
    );
  }

  return out.slice(0, 6);
}

/* ───────────────────────── Tech / Realtime insights ───────────────────────── */

function techInsights(data: TechReportResponse): Insight[] {
  const out: Insight[] = [];

  const totalDeviceSessions = data.devices.reduce((s, d) => s + d.sessions, 0);
  const mobile = data.devices.find((d) => d.deviceCategory === "mobile");
  if (mobile) {
    const share = (mobile.sessions / Math.max(1, totalDeviceSessions)) * 100;
    if (share >= 60) {
      pushInsight(
        out,
        "neutral",
        `${pct(share)} من الجلسات تأتي عبر الجوال — تأكد أن تجربة الشراء وسرعة التحميل على الجوال ممتازة قبل أي حملة إعلانية جديدة.`,
      );
    }
  }

  if (data.hourDayHeatmap.length) {
    const peak = [...data.hourDayHeatmap].sort(
      (a, b) => b.sessions - a.sessions,
    )[0];
    const low = [...data.hourDayHeatmap].sort(
      (a, b) => a.sessions - b.sessions,
    )[0];
    const days = [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    pushInsight(
      out,
      "positive",
      `أعلى نشاط للزوار يكون يوم ${days[peak.dayOfWeek]} الساعة ${peak.hour}:00 — هذا التوقيت الأنسب لجدولة الإعلانات لتحقيق أكبر وصول.`,
    );
    pushInsight(
      out,
      "neutral",
      `أقل نشاط يكون يوم ${days[low.dayOfWeek]} الساعة ${low.hour}:00 — يمكن خفض الإنفاق الإعلاني في هذا التوقيت لتوفير الميزانية.`,
    );
  }

  const topBrowser = [...data.browsers].sort(
    (a, b) => b.sessions - a.sessions,
  )[0];
  if (topBrowser) {
    pushInsight(
      out,
      "neutral",
      `متصفح ${topBrowser.browser} هو الأكثر استخدامًا بين الزوار — تأكد من توافق الموقع الكامل معه.`,
    );
  }

  return out.slice(0, 6);
}

export function generateInsights(data: unknown, pageType: PageType): Insight[] {
  switch (pageType) {
    case "users":
      return usersInsights(data as UsersReportResponse);
    case "sessions":
      return sessionsInsights(data as SessionsReportResponse);
    case "pages":
      return pagesInsights(data as PagesReportResponse);
    case "tech-realtime":
      return techInsights(data as TechReportResponse);
    default:
      return [];
  }
}
