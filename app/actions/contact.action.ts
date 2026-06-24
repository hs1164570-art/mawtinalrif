"use server";
// actions.ts — Server Action for consultation form submission
// Saves appointment to Prisma DB + sends beautiful email via Resend

import prisma from "@/lib/db";
import { Resend } from "resend";
import { generateEmailHtml } from "./emailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function submitConsultation(
  formData: FormData,
): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const details = (formData.get("details") as string)?.trim();
  const desc = (formData.get("desc") as string)?.trim() || null;

  // ── Basic validation ──────────────────────────────────────────────────────
  if (!name || name.length < 2) {
    return { success: false, error: "يرجى إدخال اسمك الكريم" };
  }

  const cleanPhone = phone?.replace(/\s+|-/g, "");
  if (!cleanPhone || cleanPhone.length < 9) {
    return { success: false, error: "يرجى إدخال رقم جوال صحيح" };
  }

  try {
    // ── 1. Save to database ────────────────────────────────────────────────
    const appointment = await prisma.appointment.create({
      data: {
        name,
        phone: cleanPhone,
        details: details || "التفاصيل عن التواصل",
        desc,
      },
    });

    // ── 2. Normalise WhatsApp number (Saudi default: 966) ──────────────────
    let whatsappPhone = cleanPhone.replace(/^\+/, "").replace(/^00/, "");
    // If starts with 0, replace with country code 966
    if (whatsappPhone.startsWith("0")) {
      whatsappPhone = "966" + whatsappPhone.slice(1);
    }
    // If it's already 9 digits (local), prepend 966
    if (whatsappPhone.length === 9) {
      whatsappPhone = "966" + whatsappPhone;
    }

    // ── 3. Send notification email ─────────────────────────────────────────
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "hs1164570@gmail.com",
      subject: `✨ طلب استشارة جديد — ${name}`,
      html: generateEmailHtml({
        name,
        phone: cleanPhone,
        details: details || "التفاصيل عن التواصل",
        desc,
        whatsappPhone,
        id: appointment.id,
      }),
    });

    return { success: true };
  } catch (err) {
    console.error("[submitConsultation] Error:", err);
    return {
      success: false,
      error: "حدث خطأ أثناء إرسال طلبك. يرجى التواصل معنا مباشرةً عبر واتساب.",
    };
  }
}
