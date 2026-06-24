// email-template.ts
// Beautiful luxury HTML email for new consultation requests

interface EmailData {
  name: string;
  phone: string;
  details: string;
  desc?: string | null;
  whatsappPhone: string;
  id: string;
}

export function generateEmailHtml({
  name,
  phone,
  details,
  desc,
  whatsappPhone,
  id,
}: EmailData): string {
  const year = new Date().getFullYear();
  const isWrittenRequest = details === "كتابة التفاصيل";
  const typeLabel =
    isWrittenRequest ? "📝 طلب مكتوب مع تفاصيل" : "📞 طلب تواصل مباشر";

  // Compose WhatsApp reply URL back to the customer
  const waText = encodeURIComponent(
    `مرحباً ${name} 👋\n\nشكراً جزيلاً لتواصلك معنا!\n\nيسعدنا خدمتك ومساعدتك في تحويل رؤيتك إلى مساحة استثنائية تعكس ذوقك الرفيع ✨🏡\n\nمتى يناسبك نتحدث؟`,
  );
  const waUrl = `https://wa.me/${whatsappPhone}?text=${waText}`;

  const descSection =
    desc ?
      `
      <tr>
        <td colspan="2" style="padding:20px 28px 24px;background:#fffef9;border-top:1px solid rgba(0,0,0,0.04);">
          <p style="color:#a07c3a;font-size:11px;margin:0 0 10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">💬 التفاصيل التي كتبها العميل</p>
          <div style="background:linear-gradient(135deg,#fdf8ef,#f9f2e3);border-radius:12px;padding:18px 20px;border-right:4px solid #c9a96e;">
            <p style="color:#2d2416;font-size:15px;line-height:1.9;margin:0;font-family:Segoe UI,Tahoma,Arial,sans-serif;">${desc.replace(/\n/g, "<br>")}</p>
          </div>
        </td>
      </tr>
    `
    : "";

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>✨ طلب استشارة جديد — ${name}</title>
</head>
<body style="margin:0;padding:0;background-color:#ede8e0;font-family:Segoe UI,Tahoma,Arial,sans-serif;direction:rtl;-webkit-font-smoothing:antialiased;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
  style="background:linear-gradient(160deg,#ede8e0 0%,#e4ddd2 100%);padding:48px 16px;">
  <tr>
    <td align="center">

      <!-- ============ MAIN CARD ============ -->
      <table role="presentation" cellpadding="0" cellspacing="0"
        style="max-width:600px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;
               box-shadow:0 12px 60px rgba(0,0,0,0.14),0 2px 8px rgba(0,0,0,0.06);">

        <!-- ── HEADER ── -->
        <tr>
          <td style="background:linear-gradient(145deg,#0d0d0d 0%,#1f1a10 45%,#0d0d0d 100%);padding:56px 40px 48px;text-align:center;">
            <!-- Top ornament line -->
            <div style="width:64px;height:1px;background:linear-gradient(90deg,transparent,#c9a96e,transparent);margin:0 auto 28px;"></div>

            <!-- Brand icon -->
            <div style="display:inline-block;width:72px;height:72px;border-radius:50%;
                        border:1px solid rgba(201,169,110,0.5);
                        background:rgba(201,169,110,0.07);
                        line-height:72px;font-size:32px;margin:0 auto 22px;">🏡</div>

            <h1 style="color:#c9a96e;font-size:22px;margin:0 0 6px;font-weight:300;letter-spacing:4px;text-transform:uppercase;">الديكور الفاخر</h1>
            <p style="color:rgba(255,255,255,0.38);font-size:11px;letter-spacing:3px;margin:0 0 30px;text-transform:uppercase;">أثاث • تصميم داخلي • فخامة</p>

            <!-- Badge -->
            <div style="display:inline-block;background:rgba(201,169,110,0.12);
                        border:1px solid rgba(201,169,110,0.35);border-radius:100px;padding:9px 28px;">
              <span style="color:#c9a96e;font-size:13px;font-weight:600;">✨ وصل إليك طلب استشارة جديد</span>
            </div>

            <!-- Bottom ornament line -->
            <div style="width:64px;height:1px;background:linear-gradient(90deg,transparent,#c9a96e,transparent);margin:28px auto 0;"></div>
          </td>
        </tr>

        <!-- ── GREETING ── -->
        <tr>
          <td style="padding:36px 40px 28px;background:#fffef9;border-bottom:1px solid rgba(0,0,0,0.04);">
            <p style="color:#444;font-size:16px;line-height:2;margin:0;">
              مرحباً 👋 &nbsp;وصلك للتو طلب من
              <strong style="color:#1a1a1a;font-size:17px;">${name}</strong>
              وهو ينتظر ردّك الآن.<br>
              <span style="color:#888;font-size:14px;">
                تذكّر — السرعة في الاستجابة تجعل العميل يشعر بأنك تُقدّره، وهذا ما يصنع الفارق الحقيقي 💛
              </span>
            </p>
          </td>
        </tr>

        <!-- ── DETAILS TABLE ── -->
        <tr>
          <td style="padding:28px 40px 20px;background:#fffef9;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
              style="border:1px solid rgba(201,169,110,0.22);border-radius:16px;overflow:hidden;">

              <!-- Table header row -->
              <tr>
                <td colspan="2"
                  style="background:linear-gradient(135deg,#fdf8ef 0%,#f5edda 100%);
                         padding:14px 24px;border-bottom:1px solid rgba(201,169,110,0.15);">
                  <span style="color:#8a6828;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;">تفاصيل الطلب</span>
                </td>
              </tr>

              <!-- Name -->
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid rgba(0,0,0,0.035);
                           color:#999;font-size:13px;width:32%;vertical-align:middle;">
                  👤 &nbsp;الاسم الكريم
                </td>
                <td style="padding:16px 24px;border-bottom:1px solid rgba(0,0,0,0.035);">
                  <strong style="color:#1a1a1a;font-size:16px;">${name}</strong>
                </td>
              </tr>

              <!-- Phone -->
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid rgba(0,0,0,0.035);
                           color:#999;font-size:13px;vertical-align:middle;">
                  📱 &nbsp;رقم الجوال
                </td>
                <td style="padding:16px 24px;border-bottom:1px solid rgba(0,0,0,0.035);">
                  <a href="tel:${phone}"
                    style="color:#1a1a1a;text-decoration:none;font-size:16px;font-weight:700;
                           font-family:monospace,Courier New;letter-spacing:1px;">
                    ${phone}
                  </a>
                </td>
              </tr>

              <!-- Request type -->
              <tr>
                <td style="padding:16px 24px;${desc ? "border-bottom:1px solid rgba(0,0,0,0.035);" : ""}color:#999;font-size:13px;vertical-align:middle;">
                  📋 &nbsp;نوع الطلب
                </td>
                <td style="padding:16px 24px;${desc ? "border-bottom:1px solid rgba(0,0,0,0.035);" : ""}">
                  <span style="display:inline-block;
                               background:linear-gradient(135deg,#1a1a1a,#2d2416);
                               color:#c9a96e;padding:5px 16px;border-radius:100px;
                               font-size:12px;font-weight:700;letter-spacing:0.5px;">
                    ${typeLabel}
                  </span>
                </td>
              </tr>

              ${descSection}

            </table>
          </td>
        </tr>

        <!-- ── URGENCY REMINDER ── -->
        <tr>
          <td style="padding:4px 40px 32px;background:#fffef9;">
            <div style="background:linear-gradient(135deg,#fff9ec,#fff4d9);
                        border:1px solid rgba(201,169,110,0.3);border-radius:14px;
                        padding:18px 22px;">
              <p style="color:#6e4e14;font-size:13px;line-height:1.9;margin:0;">
                ⏰ &nbsp;<strong>وعدنا عملاءنا بالرد خلال ساعة أو أقل</strong> —
                كلما أسرعت في التواصل مع <strong>${name}</strong>، كلما ازدادت ثقته بنا!
                لا تدعه ينتظر 🚀
              </p>
            </div>
          </td>
        </tr>

        <!-- ── CTA BUTTONS ── -->
        <tr>
          <td style="padding:0 40px 52px;background:#fffef9;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <!-- WhatsApp button -->
                <td style="padding-left:7px;">
                  <a href="${waUrl}" target="_blank"
                    style="display:block;
                           background:linear-gradient(135deg,#25d366 0%,#1da851 100%);
                           color:#fff;text-decoration:none;padding:16px 12px;
                           border-radius:14px;font-size:14px;font-weight:700;
                           text-align:center;box-shadow:0 4px 16px rgba(37,211,102,0.35);">
                    📱 &nbsp;ردّ عبر واتساب
                  </a>
                </td>
                <!-- Email reply button -->
                <td style="padding-right:7px;">
                  <a href="mailto:hs1164570@gmail.com?subject=${encodeURIComponent(`ردّ على طلب استشارة — ${name}`)}"
                    style="display:block;
                           background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);
                           color:#c9a96e;text-decoration:none;padding:16px 12px;
                           border-radius:14px;font-size:14px;font-weight:700;
                           text-align:center;border:1px solid rgba(201,169,110,0.3);">
                    ✉️ &nbsp;ردّ بالإيميل
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background:#0d0d0d;padding:32px 40px;text-align:center;">
            <div style="width:48px;height:1px;background:linear-gradient(90deg,transparent,#c9a96e,transparent);margin:0 auto 18px;"></div>
            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0 0 6px;">
              رقم الطلب:&nbsp;
              <code style="background:rgba(255,255,255,0.07);color:#c9a96e;
                           padding:2px 10px;border-radius:5px;font-family:monospace;
                           font-size:11px;">${id}</code>
            </p>
            <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0 0 10px;">© ${year} — جميع الحقوق محفوظة</p>
            <p style="color:#c9a96e;font-size:10px;letter-spacing:4px;margin:0;opacity:0.6;text-transform:uppercase;">فخامة &nbsp;•&nbsp; جودة &nbsp;•&nbsp; ثقة</p>
          </td>
        </tr>

      </table>
      <!-- END MAIN CARD -->

    </td>
  </tr>
</table>

</body>
</html>`;
}
