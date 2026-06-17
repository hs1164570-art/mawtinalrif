"use client";

import { useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { Package, ClipboardList } from "lucide-react";
import Link from "next/link";
import { getUserOrders } from "../actions/orders";
import { OrderCard, OrderCardSkeleton } from "../components/orders/order-card";
import { Order, OrderStatus } from "@/utils/index";

const CSS_VARS = `
  :root {
    --bg: #f8f4ec;
    --bg-deep: #ede8dc;
    --surface: #ffffff;
    --surface-2: #fffdf8;
    --border: rgba(90,60,20,0.10);
    --border-md: rgba(90,60,20,0.18);
    --border-strong: rgba(90,60,20,0.32);
    --gold: #a07830;
    --gold-mid: #b89040;
    --gold-bright: #d0a820;
    --gold-bg: rgba(160,120,48,0.07);
    --text-1: #181008;
    --text-2: #483820;
    --text-3: #806840;
    --text-inv: #ffffff;
    --red: #b91c1c;
  }
`;

type TabKey = "ALL" | OrderStatus;

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: "ALL", label: "All Orders", emoji: "📦" },
  { key: "PENDING_PAYMENT", label: "Pending", emoji: "⏳" },
  { key: "PROCESSING", label: "Processing", emoji: "⚙️" },
  { key: "SHIPPED", label: "Shipped", emoji: "🚚" },
  { key: "DELIVERED", label: "Delivered", emoji: "✅" },
  { key: "CANCELLED", label: "Cancelled", emoji: "✕" },
];

interface OrdersClientProps {
  initialOrders: Order[];
}

export function OrdersClient({ initialOrders }: OrdersClientProps) {
  const qc = useQueryClient();

  // Hydrate with SSR data
  useEffect(() => {
    qc.setQueryData(["orders", "ALL"], initialOrders);
  }, [initialOrders, qc]);

  // nuqs — tab persisted in URL query param ?tab=ALL
  const [activeTab, setActiveTab] = useQueryState<TabKey>("tab", {
    defaultValue: "ALL",
    parse: (v) => (TABS.some((t) => t.key === v) ? (v as TabKey) : "ALL"),
    serialize: (v) => v,
  });

  // TanStack Query — filter client-side for instant tab switch, re-fetch per status lazily
  const { data: allOrders = [], isFetching } = useQuery<Order[]>({
    queryKey: ["orders", "ALL"],
    queryFn: () => getUserOrders("ALL"),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Derive filtered list client-side (no extra network call)
  const filtered =
    activeTab === "ALL" ? allOrders : (
      allOrders.filter((o) => o.status === activeTab)
    );

  // Tab counts
  const counts: Partial<Record<TabKey, number>> = { ALL: allOrders.length };
  allOrders.forEach((o) => {
    counts[o.status] = (counts[o.status] ?? 0) + 1;
  });

  return (
    <>
      <style>{CSS_VARS}</style>
      <main
        aria-label="My orders"
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          padding: "32px 16px 80px",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {/* Page header */}
          <header style={{ marginBottom: "28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "6px",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  background: "var(--gold-bg)",
                  border: "1px solid var(--border-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ClipboardList size={18} style={{ color: "var(--gold)" }} />
              </div>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "var(--text-1)",
                    letterSpacing: "-0.025em",
                  }}
                >
                  My Orders
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.78rem",
                    color: "var(--text-3)",
                  }}
                >
                  {allOrders.length} order{allOrders.length !== 1 ? "s" : ""}{" "}
                  total
                </p>
              </div>
            </div>
          </header>

          {/* Tabs */}
          <nav
            aria-label="Filter orders by status"
            role="tablist"
            style={{
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              paddingBottom: "4px",
              marginBottom: "20px",
              scrollbarWidth: "none",
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = counts[tab.key] ?? 0;
              if (tab.key !== "ALL" && count === 0 && allOrders.length > 0)
                return null;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="orders-list"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "10px",
                    border:
                      isActive ?
                        "1px solid var(--border-strong)"
                      : "1px solid var(--border-md)",
                    background: isActive ? "var(--gold)" : "var(--surface)",
                    color: isActive ? "var(--text-inv)" : "var(--text-2)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                    flexShrink: 0,
                    boxShadow:
                      isActive ? "0 2px 8px rgba(160,120,48,0.25)" : "none",
                  }}
                >
                  <span aria-hidden="true">{tab.emoji}</span>
                  {tab.label}
                  {count > 0 && (
                    <span
                      style={{
                        minWidth: 18,
                        height: 18,
                        borderRadius: "99px",
                        background:
                          isActive ?
                            "rgba(255,255,255,0.25)"
                          : "var(--gold-bg)",
                        color: isActive ? "var(--text-inv)" : "var(--gold)",
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Orders list */}
          <section
            id="orders-list"
            role="tabpanel"
            aria-live="polite"
            aria-busy={isFetching}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {isFetching && allOrders.length === 0 ?
              <>
                <OrderCardSkeleton />
                <OrderCardSkeleton />
                <OrderCardSkeleton />
              </>
            : filtered.length === 0 ?
              <EmptyOrders status={activeTab} />
            : filtered.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            }
          </section>
        </div>
      </main>
    </>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyOrders({ status }: { status: TabKey }) {
  const isFiltered = status !== "ALL";
  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
        gap: "18px",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "var(--gold-bg)",
          border: "2px dashed var(--border-strong)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Package size={28} style={{ color: "var(--gold)" }} />
      </div>
      <div>
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "var(--text-1)",
            letterSpacing: "-0.02em",
          }}
        >
          {isFiltered ?
            `No ${status.toLowerCase().replace("_", " ")} orders`
          : "No orders yet"}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "0.86rem",
            color: "var(--text-3)",
            maxWidth: 300,
            lineHeight: 1.6,
          }}
        >
          {isFiltered ?
            "You don't have any orders with this status yet."
          : "When you place your first order, it will show up here."}
        </p>
      </div>
      {!isFiltered && (
        <Link
          href="/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 22px",
            background: "var(--gold)",
            color: "var(--text-inv)",
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "0.86rem",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(160,120,48,0.28)",
          }}
        >
          Browse Products
        </Link>
      )}
    </div>
  );
}
