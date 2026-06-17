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
        background: role === "ADMIN" ? "#FBF6EC" : "#FAF7F2",
        borderColor: role === "ADMIN" ? "#DDD0B0" : "#EDE5D8",
        color: role === "ADMIN" ? "#B89A5A" : "#A89585",
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
        className="relative bg-white rounded-[20px] p-8 max-w-[400px] w-full shadow-[0_24px_64px_rgba(0,0,0,0.15)]"
      >
        <div
          className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mx-auto mb-5 border-[1.5px]"
          style={{
            background: isBanning ? "#FBF0EE" : "#EEF7F2",
            borderColor: isBanning ? "#E8C3BB" : "#B3D5C3",
          }}
        >
          {isBanning ?
            <AlertTriangle size={24} color="#C4614A" />
          : <CheckCircle size={24} color="#6A9E7F" />}
        </div>
        <h3 className="text-center text-[#3D2B1F] font-bold mt-0 mb-[0.625rem]">
          {isBanning ? "حظر المستخدم" : "إلغاء الحظر"}
        </h3>
        <p className="text-center text-[#6B4C3B] text-[0.9rem] mt-0 mb-6 leading-[1.5]">
          {isBanning ?
            `هل تريد حظر "${user.name ?? user.email}"؟ لن يتمكن من الدخول للموقع.`
          : `هل تريد إلغاء حظر "${user.name ?? user.email}"؟`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-[10px] border-[1.5px] border-[#EDE5D8] bg-[#FAF7F2] text-[#3D2B1F] font-medium cursor-pointer text-[0.9rem] font-inherit"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-3 rounded-[10px] border-none text-white font-semibold text-[0.9rem] font-inherit transition-colors"
            style={{
              background:
                isPending ? "#DDD0B0"
                : isBanning ? "#C4614A"
                : "#6A9E7F",
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

  return (
    <div>
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="m-0 text-[#3D2B1F] font-bold text-[1.3rem]">
            المستخدمون
          </h2>
          <p className="mt-1 mb-0 text-[#A89585] text-[0.82rem]">
            {totalAll} مستخدم إجمالي
          </p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ["admin-users"] })}
          className="w-[38px] h-[38px] rounded-[10px] border-[1.5px] border-[#EDE5D8] bg-[#FAF7F2] cursor-pointer flex items-center justify-center text-[#6B4C3B]"
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
        {[
          {
            label: "إجمالي",
            value: totalAll,
            icon: <Users size={18} />,
            color: "#6B4C3B",
            bg: "#F5EFE6",
            filter: null,
          },
          {
            label: "نشطون",
            value: totalActive,
            icon: <CheckCircle size={18} />,
            color: "#6A9E7F",
            bg: "#EEF7F2",
            filter: "ACTIVE",
          },
          {
            label: "محظورون",
            value: totalBanned,
            icon: <XCircle size={18} />,
            color: "#C4614A",
            bg: "#FBF0EE",
            filter: "BANNED",
          },
        ].map((stat) => {
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
              className="p-4 rounded-[12px] border-[1.5px] cursor-pointer text-right flex items-center gap-3 font-inherit transition-all"
              style={{
                borderColor: isActive ? "#DDD0B0" : "#EDE5D8",
                background: isActive ? stat.bg : "#FFFFFF",
              }}
            >
              <div
                className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center shrink-0"
                style={{
                  background: isActive ? `${stat.color}20` : "#FAF7F2",
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div className="text-[#3D2B1F] font-bold text-[1.3rem]">
                  {stat.value}
                </div>
                <div className="text-[#A89585] text-[0.75rem]">
                  {stat.label}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ─── Filters ────────────────────────────────────────────── */}
      <div className="bg-white border-[1.5px] border-[#EDE5D8] rounded-[14px] px-4 py-[0.875rem] mb-5 flex gap-3 flex-wrap items-center">
        <div className="relative flex-[1_1_220px] min-w-[180px]">
          <Search
            size={14}
            color="#A89585"
            className="absolute top-1/2 right-3 -translate-y-1/2"
          />
          <input
            type="search"
            placeholder="بحث بالاسم أو الإيميل..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pr-9 pl-3 py-[0.45rem] rounded-[8px] border-[1.5px] border-[#EDE5D8] bg-[#FAF7F2] text-[#3D2B1F] text-[0.82rem] font-inherit outline-none box-border"
          />
        </div>

        <select
          value={roleFilter ?? ""}
          onChange={(e) => {
            setRoleFilter(e.target.value || null);
            setPage(1);
          }}
          className="px-3 py-[0.45rem] rounded-[8px] border-[1.5px] border-[#EDE5D8] bg-[#FAF7F2] text-[#3D2B1F] text-[0.82rem] font-inherit cursor-pointer outline-none"
          aria-label="تصفية حسب الدور"
        >
          <option value="">كل الأدوار</option>
          <option value="USER">مستخدم</option>
          <option value="ADMIN">أدمن</option>
        </select>
      </div>

      {/* ─── Table ──────────────────────────────────────────────── */}
      <div className="bg-white border-[1.5px] border-[#EDE5D8] rounded-[16px] overflow-hidden">
        {isLoading && (
          <div className="py-16 text-center text-[#A89585]">
            جاري التحميل...
          </div>
        )}

        {!isLoading && users.length === 0 && (
          <div className="py-16 text-center">
            <Users size={40} color="#EDE5D8" className="mx-auto mb-4" />
            <div className="text-[#A89585] text-[0.9rem]">لا توجد نتائج</div>
          </div>
        )}

        {!isLoading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b-[1.5px] border-[#EDE5D8]">
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
                      className="px-4 py-[0.875rem] text-right text-[#A89585] font-semibold text-[0.78rem] uppercase tracking-[0.06em] whitespace-nowrap"
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
                    className="border-b border-[#F5EFE6] transition-colors duration-150 hover:bg-[#FAF7F2]"
                  >
                    {/* User */}
                    <td className="px-4 py-[0.875rem]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-[1.5px] border-[#EDE5D8] bg-[#F5EFE6] flex items-center justify-center shrink-0">
                          {user.image ?
                            <Image
                              src={user.image}
                              alt={user.name ?? ""}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          : <User size={18} color="#A89585" />}
                        </div>
                        <div>
                          <div className="text-[#3D2B1F] font-semibold text-[0.875rem]">
                            {user.name ?? "—"}
                          </div>
                          <div
                            className="text-[#A89585] text-[0.75rem] text-right"
                            style={{ direction: "ltr" }}
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
                      <div className="flex items-center gap-1 text-[#6B4C3B] text-[0.82rem]">
                        <Globe size={13} />
                        {user.country ?? "—"}
                      </div>
                    </td>

                    {/* Orders count */}
                    <td className="px-4 py-[0.875rem]">
                      <div className="flex items-center gap-1 text-[#3D2B1F] text-[0.875rem]">
                        <ShoppingBag size={13} color="#A89585" />
                        {user._count?.order ?? 0}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-[0.875rem]">
                      <div className="flex items-center gap-1 text-[#6B4C3B] text-[0.8rem]">
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
                          className="px-[0.875rem] py-[0.4rem] rounded-[8px] border-[1.5px] font-semibold text-[0.78rem] cursor-pointer font-inherit whitespace-nowrap inline-flex items-center gap-1"
                          style={{
                            borderColor:
                              user.status === "ACTIVE" ? "#E8C3BB" : "#B3D5C3",
                            background:
                              user.status === "ACTIVE" ? "#FBF0EE" : "#EEF7F2",
                            color:
                              user.status === "ACTIVE" ? "#C4614A" : "#6A9E7F",
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
                        <span className="text-[#A89585] text-[0.78rem]">
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
        <div className="flex items-center justify-between mt-4 px-5 py-[0.875rem] bg-white border-[1.5px] border-[#EDE5D8] rounded-[12px] flex-wrap gap-3">
          <span className="text-[#A89585] text-[0.82rem]">صفحة {page}</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, (p ?? 1) - 1))}
              disabled={(page ?? 1) <= 1}
              className="w-9 h-9 rounded-[8px] border-[1.5px] border-[#EDE5D8] flex items-center justify-center"
              style={{
                background: (page ?? 1) <= 1 ? "#FAF7F2" : "#FFFFFF",
                color: (page ?? 1) <= 1 ? "#C9B9AD" : "#3D2B1F",
                cursor: (page ?? 1) <= 1 ? "not-allowed" : "pointer",
              }}
              aria-label="السابق"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage((p) => (p ?? 1) + 1)}
              disabled={users.length < USERS_PER_PAGE}
              className="w-9 h-9 rounded-[8px] border-[1.5px] border-[#EDE5D8] flex items-center justify-center"
              style={{
                background:
                  users.length < USERS_PER_PAGE ? "#FAF7F2" : "#FFFFFF",
                color: users.length < USERS_PER_PAGE ? "#C9B9AD" : "#3D2B1F",
                cursor:
                  users.length < USERS_PER_PAGE ? "not-allowed" : "pointer",
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
