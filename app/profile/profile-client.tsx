"use client";

import Image from "next/image";
import Link from "next/link";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Shield,
  ShoppingBag,
  ClipboardList,
  ChevronRight,
  Package,
} from "lucide-react";
import { OrderStatusBadge } from "../components/orders/order-status-badge";
import type { UserProfile } from "@/utils/index";

const CSS_VARS = `
  :root {
    --surface: #ffffff;
    --bg: #f8f9fa;
    --bg-deep: #f1f3f5;
    --surface-2: #fafbfa;
    --surface-3: #fcfdfd;
    --border: rgba(33, 37, 41, 0.06);
    --border-md: rgba(33, 37, 41, 0.12);
    --border-strong: rgba(33, 37, 41, 0.25);
    --red: #e03131;
    --cyan: #0ea5e9;
    --cyan-bright: #38bdf8;
    --cyan-bg: rgba(14, 165, 233, 0.06);
    --gold: #1a1a1a;
    --gold-mid: #212529;
    --gold-bright: #495057;
    --gold-bg: rgba(0, 0, 0, 0.75);
    --text-1: #1a1a1a;
    --text-2: #495057;
    --text-3: #868e96;
    --text-inv: #ffffff;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.08);
  }
`;

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

function calcDiscountedPrice(price: number, discount: number | null) {
  if (!discount) return price;
  return price - Math.round((price * discount) / 100);
}

interface ProfileClientProps {
  profile: UserProfile;
}

export function ProfileClient({ profile }: ProfileClientProps) {
  const joinDate = formatDate(profile.createdAt);
  const cartCount = profile.cart.reduce((s, i) => s + i.quantity, 0);
  const orderCount = profile.order.length;
  const initials =
    profile.name ?
      profile.name.slice(0, 2).toUpperCase()
    : (profile.email ?? "U").slice(0, 2).toUpperCase();

  return (
    <>
      <style>{CSS_VARS}</style>
      <main
        aria-label="User profile"
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          padding: "32px 16px 80px",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* ── Hero card ── */}
          <section
            aria-label="Account information"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-md)",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {/* Banner strip */}
            <div
              aria-hidden="true"
              style={{
                height: 80,
                background:
                  "linear-gradient(135deg, var(--cyan-bg) 0%, var(--bg-deep) 100%)",
                borderBottom: "1px solid var(--border)",
                position: "relative",
              }}
            >
              {/* Decorative dots */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "rgba(14, 165, 233, 0.25)",
                    left: `${(i % 6) * 18 + 8}%`,
                    top: i < 6 ? "25%" : "65%",
                  }}
                />
              ))}
            </div>

            <div style={{ padding: "0 24px 24px" }}>
              {/* Avatar row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  marginTop: -36,
                  marginBottom: 20,
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    border: "3px solid var(--surface)",
                    overflow: "hidden",
                    background: "var(--cyan-bg)",
                    flexShrink: 0,
                    position: "relative",
                    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  {profile.image ?
                    <Image
                      src={profile.image}
                      alt={profile.name ?? "Profile picture"}
                      fill
                      sizes="72px"
                      style={{ objectFit: "cover" }}
                    />
                  : <div
                      aria-label={`Avatar for ${profile.name ?? "user"}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.3rem",
                        fontWeight: 800,
                        color: "var(--cyan)",
                      }}
                    >
                      {initials}
                    </div>
                  }
                </div>

                {/* Badges */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {profile.role === "ADMIN" && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "4px 10px",
                        background: "rgba(124,58,237,0.10)",
                        color: "#7c3aed",
                        borderRadius: "99px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                      }}
                    >
                      <Shield size={11} /> ADMIN
                    </span>
                  )}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 10px",
                      background:
                        profile.status === "ACTIVE" ?
                          "rgba(22,163,74,0.10)"
                        : "rgba(224,49,49,0.10)",
                      color:
                        profile.status === "ACTIVE" ? "#15803d" : "var(--red)",
                      borderRadius: "99px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background:
                          profile.status === "ACTIVE" ?
                            "#22c55e"
                          : "var(--red)",
                      }}
                    />
                    {profile.status}
                  </span>
                </div>
              </div>

              {/* Name + meta */}
              <h1
                style={{
                  margin: "0 0 12px",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "var(--text-1)",
                  letterSpacing: "-0.025em",
                }}
              >
                {profile.name ?? "Anonymous"}
              </h1>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                {profile.email && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "var(--text-3)",
                      fontSize: "0.82rem",
                    }}
                  >
                    <Mail size={13} />
                    <span>{profile.email}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--text-3)",
                    fontSize: "0.82rem",
                  }}
                >
                  <MapPin size={13} />
                  <span>{profile.country}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--text-3)",
                    fontSize: "0.82rem",
                  }}
                >
                  <Calendar size={13} />
                  <span>Joined {joinDate}</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Stats row ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "14px",
            }}
          >
            {[
              {
                icon: (
                  <ClipboardList size={20} style={{ color: "var(--cyan)" }} />
                ),
                value: profile.order.length,
                label: "Recent Orders",
              },
              {
                icon: (
                  <ShoppingBag size={20} style={{ color: "var(--cyan)" }} />
                ),
                value: cartCount,
                label: "Items in Cart",
              },
              {
                icon: <Package size={20} style={{ color: "var(--cyan)" }} />,
                value: profile.order.filter((o) => o.status === "DELIVERED")
                  .length,
                label: "Delivered",
              },
            ].map(({ icon, value, label }) => (
              <div
                key={label}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-md)",
                  borderRadius: "16px",
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    background: "var(--cyan-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1.35rem",
                      fontWeight: 800,
                      color: "var(--text-1)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.1,
                    }}
                  >
                    {value}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      color: "var(--text-3)",
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Two columns ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
              gap: "20px",
            }}
            className="profile-cols"
          >
            {/* Recent Cart */}
            <section aria-label="Recent cart items" style={sectionStyle}>
              <SectionHeader
                title="Cart Preview"
                icon={
                  <ShoppingBag size={15} style={{ color: "var(--cyan)" }} />
                }
                href="/cart"
              />
              {profile.cart.length === 0 ?
                <EmptySection
                  message="Your cart is empty"
                  cta="Start shopping"
                  href="/products"
                />
              : <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {profile.cart.map((item) => {
                    const finalPrice = calcDiscountedPrice(
                      item.product.price,
                      item.product.discount,
                    );
                    return (
                      <Link
                        key={item.id}
                        href={`/products/${item.product.slug}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          textDecoration: "none",
                          padding: "8px",
                          borderRadius: "10px",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--bg)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: 44,
                            height: 44,
                            borderRadius: "8px",
                            overflow: "hidden",
                            flexShrink: 0,
                            border: "1px solid var(--border)",
                          }}
                        >
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            sizes="44px"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              color: "var(--text-1)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.product.name}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.75rem",
                              color: "var(--text-3)",
                            }}
                          >
                            ×{item.quantity}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            color: "var(--red)",
                            flexShrink: 0,
                          }}
                        >
                          ${(finalPrice * item.quantity).toFixed(2)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              }
            </section>

            {/* Recent Orders */}
            <section aria-label="Recent orders" style={sectionStyle}>
              <SectionHeader
                title="Recent Orders"
                icon={
                  <ClipboardList size={15} style={{ color: "var(--cyan)" }} />
                }
                href="/orders"
              />
              {profile.order.length === 0 ?
                <EmptySection
                  message="No orders placed yet"
                  cta="Browse products"
                  href="/products"
                />
              : <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {profile.order.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        padding: "10px 12px",
                        background: "var(--bg)",
                        borderRadius: "10px",
                        border: "1px solid var(--border)",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            color: "var(--text-2)",
                            letterSpacing: "0.05em",
                            fontFamily: "monospace",
                          }}
                        >
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: "0.72rem",
                            color: "var(--text-3)",
                          }}
                        >
                          {order.orderItems.length} item
                          {order.orderItems.length !== 1 ? "s" : ""} ·{" "}
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                          }).format(new Date(order.createdAt))}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <OrderStatusBadge status={order.status} />
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: "0.88rem",
                            color: "var(--red)",
                          }}
                        >
                          ${order.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </section>
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 640px) {
          .profile-cols {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const sectionStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border-md)",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "var(--shadow-sm)",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

function SectionHeader({
  title,
  icon,
  href,
}: {
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "7px",
            background: "var(--cyan-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "var(--text-1)",
          }}
        >
          {title}
        </h2>
      </div>
      <Link
        href={href}
        aria-label={`View all ${title}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          color: "var(--cyan)",
          fontSize: "0.75rem",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        View all <ChevronRight size={13} />
      </Link>
    </div>
  );
}

function EmptySection({
  message,
  cta,
  href,
}: {
  message: string;
  cta: string;
  href: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "28px 0",
        gap: "12px",
        textAlign: "center",
      }}
    >
      <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--text-3)" }}>
        {message}
      </p>
      <Link
        href={href}
        style={{
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "var(--cyan)",
          textDecoration: "none",
          padding: "6px 14px",
          border: "1px solid var(--border-md)",
          borderRadius: "8px",
          background: "var(--cyan-bg)",
        }}
      >
        {cta}
      </Link>
    </div>
  );
}
