// lib/hooks/useAnalyticsQueries.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../query-client";
import {
  DateRange,
  UsersReportResponse,
  SessionsReportResponse,
  PagesReportResponse,
  TechReportResponse,
  RealtimeReportResponse,
} from "../types";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

function withRange(path: string, range: DateRange) {
  const params = new URLSearchParams({
    startDate: range.startDate,
    endDate: range.endDate,
  });
  return `${path}?${params.toString()}`;
}

export function useUsersReport(range: DateRange) {
  return useQuery({
    queryKey: QUERY_KEYS.users(range),
    queryFn: () =>
      fetchJSON<UsersReportResponse>(
        withRange("/api/admin/analytics/users", range),
      ),
  });
}

export function useSessionsReport(range: DateRange) {
  return useQuery({
    queryKey: QUERY_KEYS.sessions(range),
    queryFn: () =>
      fetchJSON<SessionsReportResponse>(
        withRange("/api/admin/analytics/sessions", range),
      ),
  });
}

export function usePagesReport(range: DateRange) {
  return useQuery({
    queryKey: QUERY_KEYS.pages(range),
    queryFn: () =>
      fetchJSON<PagesReportResponse>(
        withRange("/api/admin/analytics/pages", range),
      ),
  });
}

export function useTechReport(range: DateRange) {
  return useQuery({
    queryKey: QUERY_KEYS.tech(range),
    queryFn: () =>
      fetchJSON<TechReportResponse>(
        withRange("/api/admin/analytics/tech", range),
      ),
  });
}

export function useRealtimeReport() {
  return useQuery({
    queryKey: QUERY_KEYS.realtime(),
    queryFn: () =>
      fetchJSON<RealtimeReportResponse>("/api/admin/analytics/realtime"),
    refetchInterval: 15000, // realtime widget polls every 15s
    staleTime: 0,
  });
}
