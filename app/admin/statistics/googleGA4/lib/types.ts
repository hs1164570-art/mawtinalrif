// lib/types.ts
// Shared TypeScript interfaces for every GA4-backed report used in the dashboard.
// Keeping these centralized means API routes, React Query hooks, and chart
// components all agree on the exact same shape (DRY).

export interface DateRange {
  startDate: string; // 'YYYY-MM-DD' or GA4 relative strings like '7daysAgo'
  endDate: string;
}

/* ───────────────────────── Users page ───────────────────────── */

export interface UserGeoRow {
  country: string;
  countryCode: string; // ISO-2, joined against countries.json
  city: string;
  region: string;
  continent: string;
  totalUsers: number;
}

export interface UserLanguageRow {
  language: string;
  totalUsers: number;
}

export interface UserDemographicRow {
  ageGroup: string;
  gender: string;
  newUsers: number;
  returningUsers: number;
}

export interface ActiveUsersTrendPoint {
  date: string;
  active1Day: number;
  active7Day: number;
  active28Day: number;
}

export interface EngagementRatios {
  dau: number;
  wau: number;
  mau: number;
  dauWauRatio: number; // stickiness
  dauMauRatio: number;
}

export interface CohortRow {
  audienceName: string;
  audienceId: string;
  cohort: string; // e.g. "Week of Jun 1"
  periodNumber: number; // day/week/month number in cohort
  retentionRate: number; // 0-100
}

export interface UsersReportResponse {
  totalUsers: number;
  newUsers: number;
  returningUsers: number;
  avgEngagementDurationSec: number;
  geo: UserGeoRow[];
  languages: UserLanguageRow[];
  demographics: UserDemographicRow[];
  activeUsersTrend: ActiveUsersTrendPoint[];
  ratios: EngagementRatios;
  cohorts: CohortRow[];
  channelGroups: { channel: string; users: number }[];
}

/* ─────────────────── Sessions & Acquisition / Campaigns page ─────────────────── */

export interface SessionSourceRow {
  source: string;
  medium: string;
  defaultChannelGroup: string;
  sessions: number;
  sessionsPerUser: number;
  bounceRate: number; // 0-100
  engagementRate: number; // 0-100
  engagedSessions: number;
  avgSessionDurationSec: number;
}

export interface CampaignRow {
  campaignName: string;
  source: string;
  medium: string;
  sessions: number;
  bounceRate: number;
  engagementRate: number;
  avgSessionDurationSec: number;
  sessionsPerUser: number;
  quality: "good" | "average" | "poor";
}

export interface CampaignTrendPoint {
  date: string;
  [campaignName: string]: number | string;
}

export interface FirstVisitAttributionRow {
  firstSource: string;
  firstMedium: string;
  firstCampaign: string;
  firstKeyword: string;
  firstAdContent: string;
  firstSourcePlatform: string;
  users: number;
}

export interface ChannelFunnelStep {
  stage: "Source" | "Medium" | "Campaign";
  label: string;
  value: number;
}

export interface ChannelTreemapNode {
  name: string;
  size: number;
}

export interface SourceBubblePoint {
  source: string;
  sessions: number;
  engagementRate: number;
  bounceRate: number;
}

export interface SessionsReportResponse {
  totalSessions: number;
  sources: SessionSourceRow[];
  campaigns: CampaignRow[];
  campaignTrend: CampaignTrendPoint[];
  firstVisitAttribution: FirstVisitAttributionRow[];
  funnel: ChannelFunnelStep[];
  bounceRateTrend: { date: string; bounceRate: number }[];
  channelTreemap: ChannelTreemapNode[];
  sourceBubbles: SourceBubblePoint[];
}

export type AcquisitionSourceFilter =
  | "all"
  | "qr"
  | "whatsapp"
  | "google_ads"
  | "direct"
  | "social";

/* ───────────────────────── Pages & Events page ───────────────────────── */

export interface TopPageRow {
  pagePath: string;
  pageTitle: string;
  views: number;
  viewsPerSession: number;
  viewsPerUser: number;
  trend: number[]; // sparkline series
}

export interface LandingExitRow {
  page: string;
  landingCount: number;
  exitCount: number;
}

export interface PageFlowLink {
  source: string;
  target: string;
  value: number;
}

export interface ContentGroupRow {
  contentGroup: string;
  views: number;
}

export interface EventRow {
  eventName: string;
  count: number;
}

export interface PagesReportResponse {
  totalViews: number;
  viewsPerSession: number;
  viewsPerUser: number;
  topPages: TopPageRow[];
  landingVsExit: LandingExitRow[];
  flow: PageFlowLink[];
  contentGroups: ContentGroupRow[];
  events: EventRow[];
}

/* ───────────────────────── Technology & Realtime page ───────────────────────── */

export interface TechBrowserRow {
  browser: string;
  browserVersion: string;
  sessions: number;
}

export interface TechOsRow {
  os: string;
  osVersion: string;
  sessions: number;
}

export interface DeviceCategoryRow {
  deviceCategory: "mobile" | "desktop" | "tablet";
  sessions: number;
}

export interface HourDayHeatPoint {
  dayOfWeek: number; // 0-6 (Sun-Sat)
  hour: number; // 0-23
  sessions: number;
}

export interface TechReportResponse {
  browsers: TechBrowserRow[];
  operatingSystems: TechOsRow[];
  devices: DeviceCategoryRow[];
  hourDayHeatmap: HourDayHeatPoint[];
}

export interface RealtimeActiveRow {
  country: string;
  countryCode: string;
  city: string;
  deviceCategory: string;
  pagePath: string;
  pageTitle: string;
  platform: string;
  activeUsers: number;
}

export interface RealtimeMinutePoint {
  minutesAgo: number; // 0-29
  activeUsers: number;
}

export interface RealtimeReportResponse {
  activeUsersNow: number;
  eventCountNow: number;
  conversionsNow: number;
  pageViewsNow: number;
  byLocation: RealtimeActiveRow[];
  last30Minutes: RealtimeMinutePoint[];
}

/* ───────────────────────── Insights ───────────────────────── */

export type PageType = "users" | "sessions" | "pages" | "tech-realtime";

export interface Insight {
  id: string;
  tone: "positive" | "warning" | "negative" | "neutral";
  text: string; // plain Arabic sentence
}
