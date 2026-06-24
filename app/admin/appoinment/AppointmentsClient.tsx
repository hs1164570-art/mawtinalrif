"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import {
  AlignLeft,
  Calendar,
  Eye,
  EyeOff,
  FileText,
  Phone,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type AppointmentStatus = "UNREAD" | "READ";
type StatusFilter = "ALL" | AppointmentStatus;

interface Appointment {
  id: string;
  name: string;
  phone: string;
  status: AppointmentStatus;
  details: string;
  desc: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_VALUES = ["ALL", "UNREAD", "READ"] as const;

const FILTER_LABELS: Record<StatusFilter, string> = {
  ALL: "الكل",
  UNREAD: "غير مقروء",
  READ: "مقروء",
};

// ─── Fetcher ─────────────────────────────────────────────────────────────────

async function fetchAppointments(): Promise<Appointment[]> {
  const res = await fetch("/api/admin/appointments", { cache: "no-store" });
  if (!res.ok) throw new Error("فشل في جلب البيانات");
  return res.json() as Promise<Appointment[]>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AppointmentsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_VALUES).withDefault("ALL"),
  );

  const [selected, setSelected] = useState<Appointment | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["admin", "appointments"],
    queryFn: fetchAppointments,
  });

  const filtered =
    statusFilter === "ALL" ? appointments : (
      appointments.filter((a) => a.status === statusFilter)
    );

  const unreadCount = appointments.filter((a) => a.status === "UNREAD").length;

  const handleToggleStatus = useCallback(async () => {
    if (!selected || isUpdating) return;
    const nextStatus: AppointmentStatus =
      selected.status === "UNREAD" ? "READ" : "UNREAD";
    setIsUpdating(true);

    try {
      const res = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status: nextStatus }),
      });
      if (!res.ok) throw new Error("فشل في تحديث الحالة");
      const updated = (await res.json()) as Appointment;

      queryClient.setQueryData<Appointment[]>(
        ["admin", "appointments"],
        (old = []) => old.map((a) => (a.id === updated.id ? updated : a)),
      );
      setSelected(updated);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  }, [selected, isUpdating, queryClient, router]);

  return (
    <div dir="rtl">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "var(--text-1)" }}
          >
            طلبات الحجز والاستشارات
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>
            {appointments.length} طلب إجمالاً
            {unreadCount > 0 && (
              <span
                className="mr-2 font-medium"
                style={{ color: "var(--cyan)" }}
              >
                · {unreadCount} جديد
              </span>
            )}
          </p>
        </div>

        {/* Filter Pills */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border-md)",
          }}
        >
          {STATUS_VALUES.map((val) => {
            const isActive = statusFilter === val;
            return (
              <button
                key={val}
                onClick={() => setStatusFilter(val)}
                className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-150"
                style={{
                  background: isActive ? "var(--surface)" : "transparent",
                  color: isActive ? "var(--text-1)" : "var(--text-3)",
                  boxShadow: isActive ? "var(--shadow-sm)" : "none",
                  border:
                    isActive ?
                      "1px solid var(--border-md)"
                    : "1px solid transparent",
                }}
              >
                {FILTER_LABELS[val]}
                {val === "UNREAD" && unreadCount > 0 && (
                  <span
                    className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold"
                    style={{ background: "var(--cyan)", color: "#fff" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ?
        <LoadingSkeleton />
      : filtered.length === 0 ?
        <EmptyState />
      : <div
          className="overflow-x-auto rounded-2xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-md)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <table className="w-full min-w-[640px] text-sm" cellSpacing={0}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border-md)",
                  background: "var(--bg)",
                }}
              >
                {["", "الاسم", "رقم الهاتف", "تفاصيل الطلب", "التاريخ"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-right text-xs font-medium tracking-wide"
                      style={{ color: "var(--text-3)" }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((apt, i) => {
                const isUnread = apt.status === "UNREAD";
                const isLast = i === filtered.length - 1;
                return (
                  <AppointmentRow
                    key={apt.id}
                    appointment={apt}
                    isUnread={isUnread}
                    isLast={isLast}
                    onClick={() => setSelected(apt)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      }

      {/* ── Modal ── */}
      <AnimatePresence>
        {selected && (
          <AppointmentModal
            appointment={selected}
            isUpdating={isUpdating}
            onClose={() => setSelected(null)}
            onToggle={handleToggleStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

interface RowProps {
  appointment: Appointment;
  isUnread: boolean;
  isLast: boolean;
  onClick: () => void;
}

function AppointmentRow({
  appointment: apt,
  isUnread,
  isLast,
  onClick,
}: RowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer transition-colors duration-100"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        background: hovered ? "var(--bg)" : "var(--surface)",
      }}
    >
      {/* Status dot */}
      <td className="w-10 px-5 py-4">
        {isUnread ?
          <span
            className="block h-2 w-2 animate-pulse rounded-full"
            style={{ background: "var(--cyan)" }}
          />
        : <span
            className="block h-2 w-2 rounded-full"
            style={{ background: "var(--border-strong)" }}
          />
        }
      </td>

      {/* Name */}
      <td className="px-5 py-4">
        <span
          style={{
            color: "var(--text-1)",
            fontWeight: isUnread ? 600 : 400,
          }}
        >
          {apt.name}
        </span>
      </td>

      {/* Phone */}
      <td className="px-5 py-4">
        <span className="font-mono text-xs" style={{ color: "var(--text-2)" }}>
          {apt.phone}
        </span>
      </td>

      {/* Details preview */}
      <td className="max-w-xs px-5 py-4">
        <span
          className="line-clamp-1 text-xs"
          style={{ color: "var(--text-2)" }}
        >
          {apt.details}
        </span>
      </td>

      {/* Date */}
      <td className="px-5 py-4">
        <span className="text-xs" style={{ color: "var(--text-3)" }}>
          {format(new Date(apt.createdAt), "d MMM yyyy", { locale: arSA })}
        </span>
      </td>
    </tr>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  appointment: Appointment;
  isUpdating: boolean;
  onClose: () => void;
  onToggle: () => void;
}

function AppointmentModal({
  appointment: apt,
  isUpdating,
  onClose,
  onToggle,
}: ModalProps) {
  const isUnread = apt.status === "UNREAD";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-md)",
          boxShadow: "var(--shadow-md)",
        }}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-semibold"
              style={
                isUnread ?
                  {
                    background: "var(--cyan-bg)",
                    color: "var(--cyan)",
                    border: "1px solid rgba(14,165,233,0.2)",
                  }
                : {
                    background: "var(--bg-deep)",
                    color: "var(--text-3)",
                    border: "1px solid var(--border-md)",
                  }
              }
            >
              {isUnread ? "جديد" : "مقروء"}
            </span>
            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: "var(--text-1)" }}
              >
                {apt.name}
              </h2>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                {format(new Date(apt.createdAt), "EEEE، d MMMM yyyy", {
                  locale: arSA,
                })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{
              color: "var(--text-3)",
              border: "1px solid var(--border-md)",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Details */}
        <div className="mb-5 space-y-3">
          <DetailRow icon={<Phone size={13} />} label="رقم الهاتف">
            <a
              href={`tel:${apt.phone}`}
              className="font-mono text-sm transition-opacity hover:opacity-70"
              style={{ color: "var(--cyan)" }}
            >
              {apt.phone}
            </a>
          </DetailRow>

          <DetailRow icon={<FileText size={13} />} label="تفاصيل الطلب">
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-2)" }}
            >
              {apt.details}
            </p>
          </DetailRow>

          {apt.desc && (
            <DetailRow icon={<AlignLeft size={13} />} label="ملاحظات إضافية">
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-2)" }}
              >
                {apt.desc}
              </p>
            </DetailRow>
          )}
        </div>

        {/* Toggle Status Button */}
        <button
          onClick={onToggle}
          disabled={isUpdating}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          style={
            isUnread ?
              {
                background: "var(--bg-deep)",
                color: "var(--text-2)",
                border: "1px solid var(--border-md)",
              }
            : {
                background: "var(--cyan-bg)",
                color: "var(--cyan)",
                border: "1px solid rgba(14,165,233,0.2)",
              }
          }
        >
          {isUpdating ?
            <Spinner />
          : isUnread ?
            <>
              <Eye size={14} />
              تحديد كمقروء
            </>
          : <>
              <EyeOff size={14} />
              تحديد كغير مقروء
            </>
          }
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function DetailRow({ icon, label, children }: DetailRowProps) {
  return (
    <div
      className="rounded-xl p-3.5"
      style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <span style={{ color: "var(--text-3)" }}>{icon}</span>
        <span
          className="text-xs font-medium"
          style={{ color: "var(--text-3)" }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        border: "1px solid var(--border-md)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-5 px-5 py-4"
          style={{
            background: "var(--surface)",
            borderBottom: i < 5 ? "1px solid var(--border)" : "none",
          }}
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--bg-deep)" }}
          />
          <div
            className="h-3.5 w-28 rounded-md"
            style={{ background: "var(--bg-deep)" }}
          />
          <div
            className="h-3 w-24 rounded-md"
            style={{ background: "var(--bg-deep)" }}
          />
          <div
            className="h-3 flex-1 rounded-md"
            style={{ background: "var(--bg-deep)" }}
          />
          <div
            className="h-3 w-20 rounded-md"
            style={{ background: "var(--bg-deep)" }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl py-24 text-center"
      style={{
        border: "1px solid var(--border-md)",
        background: "var(--surface)",
      }}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: "var(--bg-deep)", color: "var(--text-3)" }}
      >
        <Calendar size={22} />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
        لا توجد طلبات
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>
        ستظهر طلبات الحجز هنا عند وصولها
      </p>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
