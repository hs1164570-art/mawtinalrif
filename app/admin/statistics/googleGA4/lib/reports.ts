// lib/reports.ts
// Single source of truth for "fetch + filter" report logic, so API routes
// (HTTP layer) and server-component prefetchQuery calls (no HTTP round-trip
// needed since they run in the same process) both call the exact same
// function and can never drift out of sync (DRY).
//
// All data now comes from live GA4 calls in lib/ga4-client.ts — no mock
// data remains anywhere in this layer.

import {
  getPagesReportData,
  getSessionsReportData,
  getTechReportData,
  getUsersReportData,
} from "./ga4-client";
import type {
  DateRange,
  PagesReportResponse,
  SessionsReportResponse,
  TechReportResponse,
  UsersReportResponse,
} from "./types";

export async function getUsersReport(range: DateRange): Promise<UsersReportResponse> {
  const raw = await getUsersReportData(range);
  // Hard rule: filter zero/empty rows at the data layer, never render bare "0".
  return {
    ...raw,
    geo: raw.geo.filter((g) => g.totalUsers > 0),
    languages: raw.languages.filter((l) => l.totalUsers > 0),
    demographics: raw.demographics.filter((d) => d.newUsers > 0 || d.returningUsers > 0),
    channelGroups: raw.channelGroups.filter((c) => c.users > 0),
    cohorts: raw.cohorts.filter((c) => c.retentionRate > 0),
  };
}

export async function getSessionsReport(range: DateRange): Promise<SessionsReportResponse> {
  const raw = await getSessionsReportData(range);
  return {
    ...raw,
    sources: raw.sources.filter((s) => s.sessions > 0),
    campaigns: raw.campaigns.filter((c) => c.sessions > 0),
    sourceBubbles: raw.sourceBubbles.filter((s) => s.sessions > 0),
    channelTreemap: raw.channelTreemap.filter((c) => c.size > 0),
    firstVisitAttribution: raw.firstVisitAttribution.filter((f) => f.users > 0),
  };
}

export async function getPagesReport(range: DateRange): Promise<PagesReportResponse> {
  const raw = await getPagesReportData(range);
  return {
    ...raw,
    topPages: raw.topPages.filter((p) => p.views > 0),
    landingVsExit: raw.landingVsExit.filter((p) => p.landingCount > 0 || p.exitCount > 0),
    contentGroups: raw.contentGroups.filter((c) => c.views > 0),
    events: raw.events.filter((e) => e.count > 0),
    flow: raw.flow.filter((f) => f.value > 0),
  };
}

export async function getTechReport(range: DateRange): Promise<TechReportResponse> {
  const raw = await getTechReportData(range);
  return {
    browsers: raw.browsers.filter((b) => b.sessions > 0),
    operatingSystems: raw.operatingSystems.filter((o) => o.sessions > 0),
    devices: raw.devices.filter((d) => d.sessions > 0),
    hourDayHeatmap: raw.hourDayHeatmap,
  };
}
