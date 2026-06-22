// lib/ga4-client.ts
// Real Google Analytics Data API (GA4) client. No mock data remains here —
// every function below calls runReport / runRealtimeReport against your
// live GA4 property.
//
// ── Credentials ──────────────────────────────────────────────────────────
// Two ways to authenticate (pick one):
//   1. Individual env vars (recommended for Vercel/most hosts, since you
//      can't easily ship a JSON file to serverless functions):
//        GA_PROPERTY_ID=your-ga4-property-id
//        GA_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
//        GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
//      (keep the \n escapes — they get unescaped below)
//   2. A JSON keyfile on disk:
//        GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
//        GA_PROPERTY_ID=your-ga4-property-id
//
// Never commit real values for these — keep them in .env.local (gitignored)
// or your host's secret manager.

import { BetaAnalyticsDataClient, protos } from "@google-analytics/data";
import type {
  ActiveUsersTrendPoint,
  CampaignRow,
  CampaignTrendPoint,
  CohortRow,
  ContentGroupRow,
  DateRange,
  DeviceCategoryRow,
  EngagementRatios,
  EventRow,
  FirstVisitAttributionRow,
  HourDayHeatPoint,
  LandingExitRow,
  PageFlowLink,
  PagesReportResponse,
  RealtimeActiveRow,
  RealtimeMinutePoint,
  RealtimeReportResponse,
  SessionSourceRow,
  SessionsReportResponse,
  TechBrowserRow,
  TechOsRow,
  TechReportResponse,
  TopPageRow,
  UserDemographicRow,
  UserGeoRow,
  UserLanguageRow,
  UsersReportResponse,
} from "./types";

type IRunReportRequest = protos.google.analytics.data.v1beta.IRunReportRequest;
type IRunRealtimeReportRequest =
  protos.google.analytics.data.v1beta.IRunRealtimeReportRequest;
type IRow = protos.google.analytics.data.v1beta.IRow;

export const GA4_PROPERTY_ID =
  process.env.GA_PROPERTY_ID || process.env.GA4_PROPERTY_ID || "";

let _client: BetaAnalyticsDataClient | null = null;

export function getGA4Client(): BetaAnalyticsDataClient {
  if (_client) return _client;

  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (clientEmail && privateKey) {
    _client = new BetaAnalyticsDataClient({
      credentials: { client_email: clientEmail, private_key: privateKey },
    });
  } else if (keyFilename) {
    _client = new BetaAnalyticsDataClient({ keyFilename });
  } else {
    throw new Error(
      "GA4 credentials are not configured. Set GA_CLIENT_EMAIL + GA_PRIVATE_KEY, or GOOGLE_APPLICATION_CREDENTIALS, in your environment.",
    );
  }
  return _client;
}

export function propertyPath(): string {
  if (!GA4_PROPERTY_ID) {
    throw new Error("GA_PROPERTY_ID is not set in your environment.");
  }
  return `properties/${GA4_PROPERTY_ID}`;
}

export function isGA4Configured(): boolean {
  const hasKey =
    !!(process.env.GA_CLIENT_EMAIL && process.env.GA_PRIVATE_KEY) ||
    !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  return !!GA4_PROPERTY_ID && hasKey;
}

// ──────────────────────────────────────────────────────────────────────────
// Low-level helpers
// ──────────────────────────────────────────────────────────────────────────

function val(row: IRow, kind: "dimension" | "metric", index: number): string {
  const arr = kind === "dimension" ? row.dimensionValues : row.metricValues;
  return arr?.[index]?.value ?? "";
}

function num(row: IRow, kind: "dimension" | "metric", index: number): number {
  const n = Number(val(row, kind, index));
  return Number.isFinite(n) ? n : 0;
}

/**
 * GA4 returns rate metrics (bounceRate, engagementRate) as a 0–1 fraction.
 * Our UI works in 0–100 percentages throughout, so we scale here, once,
 * in a single named place. If your real numbers come back 100x off versus
 * what the GA4 UI shows, this is the line to revisit.
 */
function pct(row: IRow, kind: "dimension" | "metric", index: number): number {
  return num(row, kind, index) * 100;
}

/** Wraps runReport with try/catch so one bad sub-request degrades to an
 * empty result (→ EmptyState in the UI) instead of crashing the whole page. */
async function safeRunReport(request: IRunReportRequest): Promise<IRow[]> {
  try {
    const [response] = await getGA4Client().runReport(request);
    return response.rows ?? [];
  } catch (err) {
    console.error(
      "[GA4] runReport failed:",
      request.dimensions?.map((d) => d.name),
      err,
    );
    return [];
  }
}

async function safeRunRealtimeReport(
  request: IRunRealtimeReportRequest,
): Promise<IRow[]> {
  try {
    const [response] = await getGA4Client().runRealtimeReport(request);
    return response.rows ?? [];
  } catch (err) {
    console.error(
      "[GA4] runRealtimeReport failed:",
      request.dimensions?.map((d) => d.name),
      err,
    );
    return [];
  }
}

function dateRangeFor(range: DateRange) {
  return [{ startDate: range.startDate, endDate: range.endDate }];
}

// ──────────────────────────────────────────────────────────────────────────
// Users report
// ──────────────────────────────────────────────────────────────────────────

export async function getUsersReportData(
  range: DateRange,
): Promise<UsersReportResponse> {
  const property = propertyPath();
  const dateRanges = dateRangeFor(range);

  const [totalsRows, geoRows, langRows, demoRows, trendRows, channelRows] =
    await Promise.all([
      safeRunReport({
        property,
        dateRanges,
        dimensions: [],
        metrics: [
          { name: "totalUsers" },
          { name: "newUsers" },
          { name: "userEngagementDuration" },
        ],
      }),
      safeRunReport({
        property,
        dateRanges,
        dimensions: [
          { name: "country" },
          { name: "countryId" },
          { name: "city" },
          { name: "region" },
          { name: "continent" },
        ],
        metrics: [{ name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
        limit: 20,
      }),
      safeRunReport({
        property,
        dateRanges,
        dimensions: [{ name: "language" }],
        metrics: [{ name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
        limit: 10,
      }),
      safeRunReport({
        property,
        dateRanges,
        dimensions: [
          { name: "userAgeBracket" },
          { name: "userGender" },
          { name: "newVsReturning" },
        ],
        metrics: [{ name: "totalUsers" }],
      }),
      safeRunReport({
        property,
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "active1DayUsers" },
          { name: "active7DayUsers" },
          { name: "active28DayUsers" },
        ],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      safeRunReport({
        property,
        dateRanges,
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      }),
    ]);

  const totalUsers = totalsRows[0] ? num(totalsRows[0], "metric", 0) : 0;
  const newUsers = totalsRows[0] ? num(totalsRows[0], "metric", 1) : 0;
  const engagementDurationTotal =
    totalsRows[0] ? num(totalsRows[0], "metric", 2) : 0;

  const geo: UserGeoRow[] = geoRows.map((r) => ({
    country: val(r, "dimension", 0),
    countryCode: val(r, "dimension", 1),
    city: val(r, "dimension", 2),
    region: val(r, "dimension", 3),
    continent: val(r, "dimension", 4),
    totalUsers: num(r, "metric", 0),
  }));

  const languages: UserLanguageRow[] = langRows.map((r) => ({
    language: val(r, "dimension", 0),
    totalUsers: num(r, "metric", 0),
  }));

  const demoMap = new Map<string, UserDemographicRow>();
  demoRows.forEach((r) => {
    const ageGroup = val(r, "dimension", 0);
    const gender = val(r, "dimension", 1);
    const newVsReturning = val(r, "dimension", 2);
    const count = num(r, "metric", 0);
    const key = `${ageGroup}__${gender}`;
    const row = demoMap.get(key) ?? {
      ageGroup,
      gender,
      newUsers: 0,
      returningUsers: 0,
    };
    if (newVsReturning === "new") row.newUsers += count;
    else if (newVsReturning === "returning") row.returningUsers += count;
    demoMap.set(key, row);
  });
  const demographics = Array.from(demoMap.values());

  const activeUsersTrend: ActiveUsersTrendPoint[] = trendRows.map((r) => ({
    date: formatGA4Date(val(r, "dimension", 0)),
    active1Day: num(r, "metric", 0),
    active7Day: num(r, "metric", 1),
    active28Day: num(r, "metric", 2),
  }));

  const latest = activeUsersTrend[activeUsersTrend.length - 1];
  const ratios: EngagementRatios =
    latest ?
      {
        dau: latest.active1Day,
        wau: latest.active7Day,
        mau: latest.active28Day,
        dauWauRatio:
          latest.active7Day > 0 ?
            (latest.active1Day / latest.active7Day) * 100
          : 0,
        dauMauRatio:
          latest.active28Day > 0 ?
            (latest.active1Day / latest.active28Day) * 100
          : 0,
      }
    : { dau: 0, wau: 0, mau: 0, dauWauRatio: 0, dauMauRatio: 0 };

  const channelGroups = channelRows.map((r) => ({
    channel: val(r, "dimension", 0),
    users: num(r, "metric", 0),
  }));

  // TODO: GA4's standard cohortSpec report groups users by *first-session
  // date* cohorts, not by named Audiences — true named-Audience retention
  // requires the separate (beta) Audience Export API. This gives accurate
  // weekly retention, labeled generically rather than by audience name.
  const cohorts = await getWeeklyCohortRetention(range);

  return {
    totalUsers,
    newUsers,
    returningUsers: Math.max(0, totalUsers - newUsers),
    avgEngagementDurationSec:
      totalUsers > 0 ? engagementDurationTotal / totalUsers : 0,
    geo,
    languages,
    demographics,
    activeUsersTrend,
    ratios,
    cohorts,
    channelGroups,
  };
}

async function getWeeklyCohortRetention(
  range: DateRange,
): Promise<CohortRow[]> {
  try {
    const [response] = await getGA4Client().runReport({
      property: propertyPath(),
      dimensions: [{ name: "cohort" }, { name: "cohortNthWeek" }],
      metrics: [{ name: "cohortActiveUsers" }],
      cohortSpec: {
        cohorts: [
          {
            dimension: "firstSessionDate",
            name: "cohort",
            dateRange: { startDate: range.startDate, endDate: range.endDate },
          },
        ],
        cohortsRange: { granularity: "WEEKLY", startOffset: 0, endOffset: 6 },
      },
    });
    const rows = response.rows ?? [];
    const totalsByCohort = new Map<string, number>();
    rows.forEach((r) => {
      if (val(r, "dimension", 1) === "0000") {
        totalsByCohort.set(val(r, "dimension", 0), num(r, "metric", 0));
      }
    });
    return rows.map((r) => {
      const cohort = val(r, "dimension", 0);
      const week = Number(val(r, "dimension", 1));
      const activeUsers = num(r, "metric", 0);
      const base = totalsByCohort.get(cohort) || 1;
      return {
        audienceName: `الزوار الجدد — ${cohort}`,
        audienceId: cohort,
        cohort,
        periodNumber: week,
        retentionRate: Math.round((activeUsers / base) * 100),
      };
    });
  } catch (err) {
    console.error("[GA4] cohort report failed:", err);
    return [];
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Sessions / Acquisition / Campaigns report
// ──────────────────────────────────────────────────────────────────────────

function campaignQuality(c: {
  engagementRate: number;
  bounceRate: number;
}): CampaignRow["quality"] {
  if (c.engagementRate >= 60 && c.bounceRate <= 40) return "good";
  if (c.engagementRate < 45 || c.bounceRate > 55) return "poor";
  return "average";
}

export async function getSessionsReportData(
  range: DateRange,
): Promise<SessionsReportResponse> {
  const property = propertyPath();
  const dateRanges = dateRangeFor(range);

  const [sourceRows, campaignRows, firstVisitRows, bounceTrendRows] =
    await Promise.all([
      safeRunReport({
        property,
        dateRanges,
        dimensions: [
          { name: "sessionSource" },
          { name: "sessionMedium" },
          { name: "sessionDefaultChannelGroup" },
        ],
        metrics: [
          { name: "sessions" },
          { name: "sessionsPerUser" },
          { name: "bounceRate" },
          { name: "engagementRate" },
          { name: "engagedSessions" },
          { name: "averageSessionDuration" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 25,
      }),
      safeRunReport({
        property,
        dateRanges,
        dimensions: [
          { name: "sessionCampaignName" },
          { name: "sessionSource" },
          { name: "sessionMedium" },
        ],
        metrics: [
          { name: "sessions" },
          { name: "bounceRate" },
          { name: "engagementRate" },
          { name: "averageSessionDuration" },
          { name: "sessionsPerUser" },
        ],
        dimensionFilter: {
          notExpression: {
            filter: {
              fieldName: "sessionCampaignName",
              stringFilter: { value: "(not set)" },
            },
          },
        },
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 25,
      }),
      safeRunReport({
        property,
        dateRanges,
        dimensions: [
          { name: "firstUserSource" },
          { name: "firstUserMedium" },
          { name: "firstUserCampaignName" },
          { name: "firstUserGoogleAdsKeyword" },
          { name: "firstUserManualAdContent" },
          { name: "firstUserSourcePlatform" },
        ],
        metrics: [{ name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
        limit: 15,
      }),
      safeRunReport({
        property,
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [{ name: "bounceRate" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
    ]);

  const sources: SessionSourceRow[] = sourceRows.map((r) => ({
    source: val(r, "dimension", 0),
    medium: val(r, "dimension", 1),
    defaultChannelGroup: val(r, "dimension", 2),
    sessions: num(r, "metric", 0),
    sessionsPerUser: num(r, "metric", 1),
    bounceRate: pct(r, "metric", 2),
    engagementRate: pct(r, "metric", 3),
    engagedSessions: num(r, "metric", 4),
    avgSessionDurationSec: num(r, "metric", 5),
  }));

  const campaigns: CampaignRow[] = campaignRows.map((r) => {
    const row = {
      campaignName: val(r, "dimension", 0),
      source: val(r, "dimension", 1),
      medium: val(r, "dimension", 2),
      sessions: num(r, "metric", 0),
      bounceRate: pct(r, "metric", 1),
      engagementRate: pct(r, "metric", 2),
      avgSessionDurationSec: num(r, "metric", 3),
      sessionsPerUser: num(r, "metric", 4),
    };
    return { ...row, quality: campaignQuality(row) };
  });

  // Trend lines for the top 5 campaigns by total sessions.
  const top5Names = [...campaigns]
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5)
    .map((c) => c.campaignName);
  let campaignTrend: CampaignTrendPoint[] = [];
  if (top5Names.length > 0) {
    const trendRows = await safeRunReport({
      property,
      dateRanges,
      dimensions: [{ name: "date" }, { name: "sessionCampaignName" }],
      metrics: [{ name: "sessions" }],
      dimensionFilter: {
        filter: {
          fieldName: "sessionCampaignName",
          inListFilter: { values: top5Names },
        },
      },
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });
    const byDate = new Map<string, CampaignTrendPoint>();
    trendRows.forEach((r) => {
      const date = formatGA4Date(val(r, "dimension", 0));
      const campaign = val(r, "dimension", 1);
      const point = byDate.get(date) ?? { date };
      point[campaign] = num(r, "metric", 0);
      byDate.set(date, point);
    });
    campaignTrend = Array.from(byDate.values());
  }

  const firstVisitAttribution: FirstVisitAttributionRow[] = firstVisitRows.map(
    (r) => ({
      firstSource: val(r, "dimension", 0),
      firstMedium: val(r, "dimension", 1),
      firstCampaign: val(r, "dimension", 2),
      firstKeyword: val(r, "dimension", 3),
      firstAdContent: val(r, "dimension", 4),
      firstSourcePlatform: val(r, "dimension", 5),
      users: num(r, "metric", 0),
    }),
  );

  const totalSessions = sources.reduce((s, r) => s + r.sessions, 0);
  const knownMediumSessions = sources
    .filter((s) => s.medium !== "(none)" && s.medium !== "(not set)")
    .reduce((s, r) => s + r.sessions, 0);
  const campaignSessions = campaigns.reduce((s, c) => s + c.sessions, 0);

  const funnel = [
    { stage: "Source" as const, label: "كل المصادر", value: totalSessions },
    {
      stage: "Medium" as const,
      label: "وسيط معروف",
      value: knownMediumSessions,
    },
    {
      stage: "Campaign" as const,
      label: "ضمن حملة محددة",
      value: campaignSessions,
    },
  ];

  const bounceRateTrend = bounceTrendRows.map((r) => ({
    date: formatGA4Date(val(r, "dimension", 0)),
    bounceRate: pct(r, "metric", 0),
  }));

  const channelMap = new Map<string, number>();
  sources.forEach((s) =>
    channelMap.set(
      s.defaultChannelGroup,
      (channelMap.get(s.defaultChannelGroup) ?? 0) + s.sessions,
    ),
  );
  const channelTreemap = Array.from(channelMap.entries()).map(
    ([name, size]) => ({ name, size }),
  );

  const sourceBubbleMap = new Map<
    string,
    {
      sessions: number;
      engagementSum: number;
      bounceSum: number;
      count: number;
    }
  >();
  sources.forEach((s) => {
    const cur = sourceBubbleMap.get(s.source) ?? {
      sessions: 0,
      engagementSum: 0,
      bounceSum: 0,
      count: 0,
    };
    cur.sessions += s.sessions;
    cur.engagementSum += s.engagementRate * s.sessions;
    cur.bounceSum += s.bounceRate * s.sessions;
    cur.count += s.sessions;
    sourceBubbleMap.set(s.source, cur);
  });
  const sourceBubbles = Array.from(sourceBubbleMap.entries()).map(
    ([source, v]) => ({
      source,
      sessions: v.sessions,
      engagementRate: v.count > 0 ? v.engagementSum / v.count : 0,
      bounceRate: v.count > 0 ? v.bounceSum / v.count : 0,
    }),
  );

  return {
    totalSessions,
    sources,
    campaigns,
    campaignTrend,
    firstVisitAttribution,
    funnel,
    bounceRateTrend,
    channelTreemap,
    sourceBubbles,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Pages & Events report
// ──────────────────────────────────────────────────────────────────────────

export async function getPagesReportData(
  range: DateRange,
): Promise<PagesReportResponse> {
  const property = propertyPath();
  const dateRanges = dateRangeFor(range);

  const [totalsRows, topPagesRows, landingRows, contentGroupRows, eventRows] =
    await Promise.all([
      safeRunReport({
        property,
        dateRanges,
        dimensions: [],
        metrics: [
          { name: "screenPageViews" },
          { name: "screenPageViewsPerSession" },
          { name: "screenPageViewsPerUser" },
        ],
      }),
      safeRunReport({
        property,
        dateRanges,
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "screenPageViewsPerSession" },
          { name: "screenPageViewsPerUser" },
        ],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
      safeRunReport({
        property,
        dateRanges,
        dimensions: [{ name: "landingPage" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),
      safeRunReport({
        property,
        dateRanges,
        dimensions: [{ name: "contentGroup" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      }),
      safeRunReport({
        property,
        dateRanges,
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 12,
      }),
    ]);

  const topPagePaths = topPagesRows.map((r) => val(r, "dimension", 0));
  let sparklineByPath = new Map<string, number[]>();
  if (topPagePaths.length > 0) {
    const sparkRows = await safeRunReport({
      property,
      dateRanges,
      dimensions: [{ name: "date" }, { name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          inListFilter: { values: topPagePaths },
        },
      },
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });
    const byPath = new Map<string, number[]>();
    sparkRows.forEach((r) => {
      const path = val(r, "dimension", 1);
      const arr = byPath.get(path) ?? [];
      arr.push(num(r, "metric", 0));
      byPath.set(path, arr);
    });
    sparklineByPath = byPath;
  }

  const topPages: TopPageRow[] = topPagesRows.map((r) => {
    const path = val(r, "dimension", 0);
    return {
      pagePath: path,
      pageTitle: val(r, "dimension", 1),
      views: num(r, "metric", 0),
      viewsPerSession: Math.round(num(r, "metric", 1) * 100) / 100,
      viewsPerUser: Math.round(num(r, "metric", 2) * 100) / 100,
      trend: sparklineByPath.get(path) ?? [],
    };
  });

  // NOTE: GA4's standard Data API has no "Exit Page" dimension equivalent to
  // Universal Analytics' exitRate — that requires either BigQuery export
  // (event-level data with a derived "last pageview in session" calculation)
  // or a custom exploration in the GA4 UI. We report real landing-page
  // sessions here; exitCount is intentionally left at 0 (which our zero-value
  // rule then hides from the UI) rather than fabricated, since this dashboard
  // is meant to drive real spend decisions.
  const landingVsExit: LandingExitRow[] = landingRows.map((r) => ({
    page: val(r, "dimension", 0),
    landingCount: num(r, "metric", 0),
    exitCount: 0,
  }));

  // NOTE: True session-path "Behavior Flow" is not exposed by the standard
  // GA4 Data API either. This is a best-effort two-hop approximation
  // (top landing pages → top destination pages by volume), not a real
  // sequential path. For real path analysis, export GA4 to BigQuery and
  // reconstruct event sequences from session/event timestamps.
  const flow: PageFlowLink[] = [];
  const topLandings = landingRows.slice(0, 3);
  const topDestinations = topPagesRows.slice(0, 3);
  topLandings.forEach((l) => {
    topDestinations.forEach((d) => {
      const landingPath = val(l, "dimension", 0);
      const destTitle = val(d, "dimension", 1);
      if (landingPath !== val(d, "dimension", 0)) {
        flow.push({
          source: landingPath,
          target: destTitle,
          value: Math.round(num(d, "metric", 0) / topLandings.length),
        });
      }
    });
  });

  const contentGroups: ContentGroupRow[] = contentGroupRows.map((r) => ({
    contentGroup: val(r, "dimension", 0),
    views: num(r, "metric", 0),
  }));

  const events: EventRow[] = eventRows.map((r) => ({
    eventName: val(r, "dimension", 0),
    count: num(r, "metric", 0),
  }));

  return {
    totalViews: totalsRows[0] ? num(totalsRows[0], "metric", 0) : 0,
    viewsPerSession:
      totalsRows[0] ?
        Math.round(num(totalsRows[0], "metric", 1) * 100) / 100
      : 0,
    viewsPerUser:
      totalsRows[0] ?
        Math.round(num(totalsRows[0], "metric", 2) * 100) / 100
      : 0,
    topPages,
    landingVsExit,
    flow,
    contentGroups,
    events,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Technology report
// ──────────────────────────────────────────────────────────────────────────

export async function getTechReportData(
  range: DateRange,
): Promise<TechReportResponse> {
  const property = propertyPath();
  const dateRanges = dateRangeFor(range);

  const [browserRows, osRows, deviceRows, heatmapRows] = await Promise.all([
    // NOTE: GA4's standard dimension set has no separate "browserVersion"
    // dimension (unlike "operatingSystemVersion", which does exist), so
    // browserVersion is left blank here rather than guessed at.
    safeRunReport({
      property,
      dateRanges,
      dimensions: [{ name: "browser" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
    safeRunReport({
      property,
      dateRanges,
      dimensions: [
        { name: "operatingSystem" },
        { name: "operatingSystemVersion" },
      ],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
    safeRunReport({
      property,
      dateRanges,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
    }),
    safeRunReport({
      property,
      dateRanges,
      dimensions: [{ name: "dayOfWeek" }, { name: "hour" }],
      metrics: [{ name: "sessions" }],
    }),
  ]);

  const browsers: TechBrowserRow[] = browserRows.map((r) => ({
    browser: val(r, "dimension", 0),
    browserVersion: "",
    sessions: num(r, "metric", 0),
  }));

  const operatingSystems: TechOsRow[] = osRows.map((r) => ({
    os: val(r, "dimension", 0),
    osVersion: val(r, "dimension", 1),
    sessions: num(r, "metric", 0),
  }));

  const devices: DeviceCategoryRow[] = deviceRows
    .map((r) => ({
      deviceCategory: val(
        r,
        "dimension",
        0,
      ).toLowerCase() as DeviceCategoryRow["deviceCategory"],
      sessions: num(r, "metric", 0),
    }))
    .filter(
      (d) =>
        d.deviceCategory === "mobile" ||
        d.deviceCategory === "desktop" ||
        d.deviceCategory === "tablet",
    );

  // GA4's "dayOfWeek" dimension returns "0".."6" where 0 = Sunday, matching
  // our existing 0–6 schema directly.
  const hourDayHeatmap: HourDayHeatPoint[] = heatmapRows.map((r) => ({
    dayOfWeek: Number(val(r, "dimension", 0)),
    hour: Number(val(r, "dimension", 1)),
    sessions: num(r, "metric", 0),
  }));

  return { browsers, operatingSystems, devices, hourDayHeatmap };
}

// ──────────────────────────────────────────────────────────────────────────
// Realtime report
// ──────────────────────────────────────────────────────────────────────────

export async function getRealtimeData(): Promise<RealtimeReportResponse> {
  const property = propertyPath();

  const [totalsRows, byLocationRows, minuteRows] = await Promise.all([
    safeRunRealtimeReport({
      property,
      metrics: [
        { name: "activeUsers" },
        { name: "eventCount" },
        { name: "conversions" },
        { name: "screenPageViews" },
      ],
    }),
    safeRunRealtimeReport({
      property,
      // Realtime API has no separate pagePath/pageTitle dimensions — the
      // closest equivalent is "unifiedScreenName", mapped into both fields
      // below since we don't get a clean path/title split in realtime data.
      dimensions: [
        { name: "country" },
        { name: "city" },
        { name: "deviceCategory" },
        { name: "unifiedScreenName" },
      ],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 15,
    }),
    safeRunRealtimeReport({
      property,
      dimensions: [{ name: "minutesAgo" }],
      metrics: [{ name: "activeUsers" }],
    }),
  ]);

  const totals = totalsRows[0];

  const byLocation: RealtimeActiveRow[] = byLocationRows.map((r) => ({
    country: val(r, "dimension", 0),
    countryCode: "", // realtime API doesn't expose a country-code dimension; left blank rather than guessed
    city: val(r, "dimension", 1),
    deviceCategory: val(r, "dimension", 2).toLowerCase(),
    pagePath: val(r, "dimension", 3),
    pageTitle: val(r, "dimension", 3),
    platform: val(r, "dimension", 4),
    activeUsers: num(r, "metric", 0),
  }));

  const last30Minutes: RealtimeMinutePoint[] = minuteRows
    .map((r) => ({
      minutesAgo: Number(val(r, "dimension", 0)),
      activeUsers: num(r, "metric", 0),
    }))
    .sort((a, b) => b.minutesAgo - a.minutesAgo);

  return {
    activeUsersNow: totals ? num(totals, "metric", 0) : 0,
    eventCountNow: totals ? num(totals, "metric", 1) : 0,
    conversionsNow: totals ? num(totals, "metric", 2) : 0,
    pageViewsNow: totals ? num(totals, "metric", 3) : 0,
    byLocation,
    last30Minutes,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// GA4's "date" dimension returns YYYYMMDD strings — normalize to ISO so the
// rest of the app (charts, formatArabicDate, etc.) only ever deals with one
// date format.
// ──────────────────────────────────────────────────────────────────────────
function formatGA4Date(yyyymmdd: string): string {
  if (!/^\d{8}$/.test(yyyymmdd)) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}
