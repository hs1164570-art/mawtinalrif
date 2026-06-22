"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  ShoppingBag,
  Calendar,
  Globe,
  RefreshCw,
  CheckCircle,
  XCircle,
  Users,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminUser, UserStatus, UserStatusCount } from "../../types";
import { USER_STATUS_CONFIG, USERS_PER_PAGE } from "../../types";

// ─── API ──────────────────────────────────────────────────────────────────────
async function fetchUsers(
  params: Record<string, string>,
): Promise<AdminUser[]> {
  const sp = new URLSearchParams(params);
  const res = await fetch(`/api/admin/users/details?${sp}`);
  if (!res.ok) throw new Error("فشل في جلب المستخدمين");
  return res.json();
}

async function fetchUserStats(): Promise<UserStatusCount[]> {
  const res = await fetch("/api/admin/users/stats");
  if (!res.ok) throw new Error("فشل في جلب الإحصاءات");
  return res.json();
}

async function updateUserStatus(
  userId: string,
  status: UserStatus,
): Promise<AdminUser> {
  const res = await fetch("/api/admin/users/details", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل في تحديث الحالة");
  }
  return res.json();
}

// ─── Sub components ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: UserStatus }) {
  const cfg = USER_STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-[10px] py-[3px] rounded-[20px] text-[0.78rem] font-semibold border"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}
    >
      {status === "ACTIVE" ?
        <CheckCircle size={11} />
      : <XCircle size={11} />}
      {cfg.label}
    </span>
  );
}

function RoleBadge({ role }: { role: "USER" | "ADMIN" }) {
  return (
    <span
      className="inline-flex items-center gap-[3px] px-2 py-[2px] rounded-[6px] text-[0.72rem] font-semibold border"
      style={{
        background:
          role === "ADMIN" ?
            "color-mix(in srgb, var(--gold) 6%, white)"
          : "var(--bg)",
        borderColor: role === "ADMIN" ? "var(--border-md)" : "var(--border)",
        color: role === "ADMIN" ? "var(--gold)" : "var(--text-3)",
      }}
    >
      {role === "ADMIN" && <Shield size={10} />}
      {role === "ADMIN" ? "أدمن" : "مستخدم"}
    </span>
  );
}

// ─── Action confirm dialog ────────────────────────────────────────────────────
function StatusConfirmDialog({
  user,
  newStatus,
  onConfirm,
  onCancel,
  isPending,
}: {
  user: AdminUser;
  newStatus: UserStatus;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const isBanning = newStatus === "BANNED";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
    >
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-[4px]"
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="relative rounded-[20px] p-8 max-w-[400px] w-full"
        style={{
          background: "var(--surface)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mx-auto mb-5"
          style={{
            background:
              isBanning ?
                "color-mix(in srgb, var(--red) 8%, white)"
              : "var(--cyan-bg)",
            border:
              isBanning ?
                "1.5px solid color-mix(in srgb, var(--red) 22%, white)"
              : "1.5px solid color-mix(in srgb, var(--cyan) 28%, white)",
          }}
        >
          {isBanning ?
            <AlertTriangle size={24} style={{ color: "var(--red)" }} />
          : <CheckCircle size={24} style={{ color: "var(--cyan)" }} />}
        </div>
        <h3
          className="text-center font-bold mt-0 mb-[0.625rem]"
          style={{ color: "var(--text-1)" }}
        >
          {isBanning ? "حظر المستخدم" : "إلغاء الحظر"}
        </h3>
        <p
          className="text-center text-[0.9rem] mt-0 mb-6 leading-[1.5]"
          style={{ color: "var(--text-2)" }}
        >
          {isBanning ?
            `هل تريد حظر "${user.name ?? user.email}"؟ لن يتمكن من الدخول للموقع.`
          : `هل تريد إلغاء حظر "${user.name ?? user.email}"؟`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-[10px] font-medium cursor-pointer text-[0.9rem] font-inherit"
            style={{
              border: "1.5px solid var(--border-md)",
              background: "var(--bg)",
              color: "var(--text-1)",
            }}
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-3 rounded-[10px] border-none font-semibold text-[0.9rem] font-inherit transition-colors"
            style={{
              background:
                isPending ? "var(--border-strong)"
                : isBanning ? "var(--red)"
                : "var(--cyan)",
              color: "var(--text-inv)",
              cursor: isPending ? "not-allowed" : "pointer",
            }}
          >
            {isPending ?
              "جاري..."
            : isBanning ?
              "تأكيد الحظر"
            : "إلغاء الحظر"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface UsersClientProps {
  initialParams: Record<string, string>;
}

export function UsersClient({ initialParams }: UsersClientProps) {
  const qc = useQueryClient();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [roleFilter, setRoleFilter] = useQueryState("role", parseAsString);
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsString,
  );

  const [searchInput, setSearchInput] = useState(search ?? "");
  const [actionTarget, setActionTarget] = useState<{
    user: AdminUser;
    newStatus: UserStatus;
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput || null);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const params: Record<string, string> = {
    usersNumber: String(page ?? 1),
    ...(search && { search }),
    ...(roleFilter && { role: roleFilter }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin-users", params],
    queryFn: () => fetchUsers(params),
    placeholderData: (prev) => prev,
  });

  const { data: stats = [] } = useQuery<UserStatusCount[]>({
    queryKey: ["admin-user-stats"],
    queryFn: fetchUserStats,
    staleTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const totalActive =
    stats.find((s) => s.status === "ACTIVE")?._count.status ?? 0;
  const totalBanned =
    stats.find((s) => s.status === "BANNED")?._count.status ?? 0;
  const totalAll = totalActive + totalBanned;

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      updateUserStatus(userId, status),
    onSuccess: () => {
      toast.success("✅ تم تحديث حالة المستخدم");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-user-stats"] });
      setActionTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ─── Stat cards config ────────────────────────────────────────────────────
  const statCards = [
    {
      label: "إجمالي",
      value: totalAll,
      icon: <Users size={18} />,
      accentColor: "var(--text-2)",
      activeBg: "var(--bg-deep)",
      filter: null as string | null,
    },
    {
      label: "نشطون",
      value: totalActive,
      icon: <CheckCircle size={18} />,
      accentColor: "var(--cyan)",
      activeBg: "var(--cyan-bg)",
      filter: "ACTIVE",
    },
    {
      label: "محظورون",
      value: totalBanned,
      icon: <XCircle size={18} />,
      accentColor: "var(--red)",
      activeBg: "color-mix(in srgb, var(--red) 8%, white)",
      filter: "BANNED",
    },
  ];

  return (
    <div>
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2
            className="m-0 font-bold text-[1.3rem]"
            style={{ color: "var(--text-1)" }}
          >
            المستخدمون
          </h2>
          <p
            className="mt-1 mb-0 text-[0.82rem]"
            style={{ color: "var(--text-3)" }}
          >
            {totalAll} مستخدم إجمالي
          </p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ["admin-users"] })}
          className="w-[38px] h-[38px] rounded-[10px] cursor-pointer flex items-center justify-center"
          style={{
            border: "1.5px solid var(--border-md)",
            background: "var(--bg)",
            color: "var(--text-2)",
          }}
          aria-label="تحديث"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* ─── Stats ──────────────────────────────────────────────── */}
      <div
        className="grid gap-[0.875rem] mb-5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
      >
        {statCards.map((stat) => {
          const isActive =
            statusFilter === stat.filter ||
            (!statusFilter && stat.filter === null);
          return (
            <motion.button
              key={stat.label}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setStatusFilter(stat.filter);
                setPage(1);
              }}
              className="p-4 rounded-[12px] cursor-pointer text-right flex items-center gap-3 font-inherit transition-all"
              style={{
                border:
                  isActive ?
                    "1.5px solid var(--border-md)"
                  : "1.5px solid var(--border)",
                background: isActive ? stat.activeBg : "var(--surface)",
              }}
            >
              <div
                className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center shrink-0"
                style={{
                  background:
                    isActive ?
                      `color-mix(in srgb, ${stat.accentColor} 14%, white)`
                    : "var(--bg)",
                  color: stat.accentColor,
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div
                  className="font-bold text-[1.3rem]"
                  style={{ color: "var(--text-1)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-[0.75rem]"
                  style={{ color: "var(--text-3)" }}
                >
                  {stat.label}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ─── Filters ────────────────────────────────────────────── */}
      <div
        className="rounded-[14px] px-4 py-[0.875rem] mb-5 flex gap-3 flex-wrap items-center"
        style={{
          background: "var(--surface)",
          border: "1.5px solid var(--border)",
        }}
      >
        <div className="relative flex-[1_1_220px] min-w-[180px]">
          <Search
            size={14}
            className="absolute top-1/2 right-3 -translate-y-1/2"
            style={{ color: "var(--text-3)" }}
          />
          <input
            type="search"
            placeholder="بحث بالاسم أو الإيميل..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pr-9 pl-3 py-[0.45rem] rounded-[8px] text-[0.82rem] font-inherit outline-none box-border"
            style={{
              border: "1.5px solid var(--border-md)",
              background: "var(--bg)",
              color: "var(--text-1)",
            }}
          />
        </div>

        <select
          value={roleFilter ?? ""}
          onChange={(e) => {
            setRoleFilter(e.target.value || null);
            setPage(1);
          }}
          className="px-3 py-[0.45rem] rounded-[8px] text-[0.82rem] font-inherit cursor-pointer outline-none"
          style={{
            border: "1.5px solid var(--border-md)",
            background: "var(--bg)",
            color: "var(--text-1)",
          }}
          aria-label="تصفية حسب الدور"
        >
          <option value="">كل الأدوار</option>
          <option value="USER">مستخدم</option>
          <option value="ADMIN">أدمن</option>
        </select>
      </div>

      {/* ─── Table ──────────────────────────────────────────────── */}
      <div
        className="rounded-[16px] overflow-hidden"
        style={{ border: "1.5px solid var(--border)" }}
      >
        {isLoading && (
          <div className="py-16 text-center" style={{ color: "var(--text-3)" }}>
            جاري التحميل...
          </div>
        )}

        {!isLoading && users.length === 0 && (
          <div className="py-16 text-center">
            <Users
              size={40}
              className="mx-auto mb-4"
              style={{ color: "var(--border-strong)" }}
            />
            <div className="text-[0.9rem]" style={{ color: "var(--text-3)" }}>
              لا توجد نتائج
            </div>
          </div>
        )}

        {!isLoading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse"
              style={{ background: "var(--surface)" }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--bg)",
                    borderBottom: "1.5px solid var(--border-md)",
                  }}
                >
                  {[
                    "المستخدم",
                    "الدور",
                    "الحالة",
                    "الدولة",
                    "الطلبات",
                    "تاريخ التسجيل",
                    "إجراءات",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-[0.875rem] text-right font-semibold text-[0.78rem] uppercase tracking-[0.06em] whitespace-nowrap"
                      style={{ color: "var(--text-3)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="transition-colors duration-150"
                    style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* User */}
                    <td className="px-4 py-[0.875rem]">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                          style={{
                            border: "1.5px solid var(--border-md)",
                            background: "var(--bg-deep)",
                          }}
                        >
                          {user.image ?
                            <Image
                              src={user.image}
                              alt={user.name ?? ""}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          : <User
                              size={18}
                              style={{ color: "var(--text-3)" }}
                            />
                          }
                        </div>
                        <div>
                          <div
                            className="font-semibold text-[0.875rem]"
                            style={{ color: "var(--text-1)" }}
                          >
                            {user.name ?? "—"}
                          </div>
                          <div
                            className="text-[0.75rem] text-right"
                            style={{
                              color: "var(--text-3)",
                              direction: "ltr",
                            }}
                          >
                            {user.email ?? "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-[0.875rem]">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-[0.875rem]">
                      <StatusBadge status={user.status} />
                    </td>

                    {/* Country */}
                    <td className="px-4 py-[0.875rem]">
                      <div
                        className="flex items-center gap-1 text-[0.82rem]"
                        style={{ color: "var(--text-2)" }}
                      >
                        <Globe size={13} />
                        {user.country ?? "—"}
                      </div>
                    </td>

                    {/* Orders count */}
                    <td className="px-4 py-[0.875rem]">
                      <div
                        className="flex items-center gap-1 text-[0.875rem]"
                        style={{ color: "var(--text-1)" }}
                      >
                        <ShoppingBag
                          size={13}
                          style={{ color: "var(--text-3)" }}
                        />
                        {user._count?.order ?? 0}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-[0.875rem]">
                      <div
                        className="flex items-center gap-1 text-[0.8rem]"
                        style={{ color: "var(--text-2)" }}
                      >
                        <Calendar size={13} />
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-[0.875rem]">
                      {user.role !== "ADMIN" && (
                        <button
                          onClick={() =>
                            setActionTarget({
                              user,
                              newStatus:
                                user.status === "ACTIVE" ? "BANNED" : "ACTIVE",
                            })
                          }
                          className="px-[0.875rem] py-[0.4rem] rounded-[8px] font-semibold text-[0.78rem] cursor-pointer font-inherit whitespace-nowrap inline-flex items-center gap-1 transition-all"
                          style={{
                            border:
                              user.status === "ACTIVE" ?
                                "1.5px solid color-mix(in srgb, var(--red) 22%, white)"
                              : "1.5px solid color-mix(in srgb, var(--cyan) 28%, white)",
                            background:
                              user.status === "ACTIVE" ?
                                "color-mix(in srgb, var(--red) 8%, white)"
                              : "var(--cyan-bg)",
                            color:
                              user.status === "ACTIVE" ?
                                "var(--red)"
                              : "var(--cyan)",
                          }}
                        >
                          {user.status === "ACTIVE" ?
                            <>
                              <XCircle size={12} /> حظر
                            </>
                          : <>
                              <CheckCircle size={12} /> إلغاء الحظر
                            </>
                          }
                        </button>
                      )}
                      {user.role === "ADMIN" && (
                        <span
                          className="text-[0.78rem]"
                          style={{ color: "var(--text-3)" }}
                        >
                          محمي
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Pagination ─────────────────────────────────────────── */}
      {users.length > 0 && (
        <div
          className="flex items-center justify-between mt-4 px-5 py-[0.875rem] rounded-[12px] flex-wrap gap-3"
          style={{
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
          }}
        >
          <span className="text-[0.82rem]" style={{ color: "var(--text-3)" }}>
            صفحة {page}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, (p ?? 1) - 1))}
              disabled={(page ?? 1) <= 1}
              className="w-9 h-9 rounded-[8px] flex items-center justify-center transition-all"
              style={{
                border: "1.5px solid var(--border-md)",
                background: (page ?? 1) <= 1 ? "var(--bg)" : "var(--surface)",
                color: (page ?? 1) <= 1 ? "var(--text-3)" : "var(--text-1)",
                cursor: (page ?? 1) <= 1 ? "not-allowed" : "pointer",
                opacity: (page ?? 1) <= 1 ? 0.45 : 1,
              }}
              aria-label="السابق"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage((p) => (p ?? 1) + 1)}
              disabled={users.length < USERS_PER_PAGE}
              className="w-9 h-9 rounded-[8px] flex items-center justify-center transition-all"
              style={{
                border: "1.5px solid var(--border-md)",
                background:
                  users.length < USERS_PER_PAGE ?
                    "var(--bg)"
                  : "var(--surface)",
                color:
                  users.length < USERS_PER_PAGE ?
                    "var(--text-3)"
                  : "var(--text-1)",
                cursor:
                  users.length < USERS_PER_PAGE ? "not-allowed" : "pointer",
                opacity: users.length < USERS_PER_PAGE ? 0.45 : 1,
              }}
              aria-label="التالي"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Status Confirm Dialog ───────────────────────────────── */}
      <AnimatePresence>
        {actionTarget && (
          <StatusConfirmDialog
            user={actionTarget.user}
            newStatus={actionTarget.newStatus}
            onConfirm={() =>
              statusMutation.mutate({
                userId: actionTarget.user.id,
                status: actionTarget.newStatus,
              })
            }
            onCancel={() => setActionTarget(null)}
            isPending={statusMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
