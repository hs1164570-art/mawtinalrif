// lib/paypal.ts

const BASE =
  process.env.PAYPAL_MODE === "live" ?
    "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

// ── Token (short-lived, PayPal recommends re-fetching) ──────────────────────
async function getToken(): Promise<string> {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`,
  ).toString("base64");

  console.log(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`);
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  // console.log(res);
  if (!res.ok) throw new Error("PayPal: failed to fetch access token");
  const data = await res.json();
  return data.access_token as string;
}

// ── Step 1: create a PayPal order (intent = CAPTURE) ────────────────────────
export async function createPayPalOrder(
  amountInCents: number,
  currency = "USD",
  idempotencyKey: string,
): Promise<{ id: string }> {
  const token = await getToken();

  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": idempotencyKey, // ← idempotency: same key = same result
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: (amountInCents / 100).toFixed(2),
          },
        },
      ],
      // 👇 الحتة السحرية اللي هتفك قفشة الـ Compliance الحالية
      payment_source: {
        paypal: {
          experience_context: {
            shipping_preference: "NO_SHIPPING",
          },
        },
      },
    }),
  });

  if (!res.ok) throw new Error("PayPal: failed to create order");
  return res.json();
}

// ── Step 2: capture an approved PayPal order ─────────────────────────────────
export async function capturePayPalOrder(paypalOrderId: string): Promise<void> {
  const token = await getToken();

  const res = await fetch(
    `${BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = await res.json();

  if (!res.ok || data.status !== "COMPLETED") {
    const reason = data?.details?.[0]?.description ?? "unknown";
    throw new Error(`PayPal capture failed: ${reason}`);
  }
}
