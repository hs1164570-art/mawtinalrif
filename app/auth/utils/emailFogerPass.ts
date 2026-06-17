import { Resend } from "resend";
import { DOMAIN } from "@/lib/constants";

const resend = new Resend(process.env.AUTH_EMAIL_VERIFIY);

export const sendForget_passwordToken = async (
  email: string,
  token: string,
  // عشان بص منرجعش نكتب الملفات من الاول
  lang: string | null,
) => {
  // الرابط مباشر بدون متغيرات لغة في الـ URL
  const link = `${DOMAIN}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "إعادة تعيين كلمة المرور | موطن الريف",
    html: `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f4ec; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <tr>
        <td align="center" style="padding: 40px 16px;">

          <table width="100%" cellpadding="0" cellspacing="0" style="
            max-width: 500px;
            background-color: #ffffff;
            border-radius: 12px;
            border: 1px solid rgba(90,60,20,0.10);
            box-shadow: 0 4px 20px rgba(24,16,8,0.04);
            padding: 40px 32px;
            text-align: right;
            direction: rtl;
          ">
            <tr>
              <td align="center">

                <div style="
                  width: 64px;
                  height: 64px;
                  border-radius: 50%;
                  background-color: rgba(160,120,48,0.07);
                  line-height: 64px;
                  font-size: 26px;
                  text-align: center;
                  margin-bottom: 20px;
                ">
                  🪑
                </div>

                <h1 style="
                  margin: 0 0 16px;
                  font-size: 24px;
                  font-weight: 700;
                  color: #a07830;
                  line-height: 1.4;
                ">
                  إعادة تعيين كلمة المرور
                </h1>

                <p style="
                  margin: 0 0 28px;
                  font-size: 15px;
                  color: #483820;
                  line-height: 1.8;
                ">
                  مرحباً بك، لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في <strong>موطن الريف للأثاث</strong>. 
                  لا تقلق، يحدث هذا دائماً 🌱
                  <br /><br />
                  اضغط على الزر أدناه لتعيين كلمة مرور جديدة لحسابك بشكل آمن.
                </p>

                <a href="${link}" style="
                  display: inline-block;
                  background-color: #a07830;
                  color: #ffffff;
                  text-decoration: none;
                  padding: 14px 36px;
                  border-radius: 6px;
                  font-size: 15px;
                  font-weight: bold;
                  letter-spacing: 0.5px;
                  box-shadow: 0 4px 12px rgba(160,120,48,0.2);
                ">
                  إعادة تعيين كلمة المرور
                </a>

                <hr style="border: 0; border-top: 1px solid rgba(90,60,20,0.10); margin: 32px 0 24px;" />

                <p style="
                  margin: 0 0 24px;
                  font-size: 13px;
                  color: #806840;
                  line-height: 1.6;
                ">
                  هذا الرابط صلاحيته محدودة لأسباب أمنية حماية لخصوصيتك.
                  <br />
                  إذا لم تكن أنت من طلب هذا الإجراء، يمكنك تجاهل هذا البريد الإلكتروني بأمان تّام — حسابك لا يزال محمياً وفخامة أثاثك مستمرة 🌿
                </p>

                <p style="
                  margin: 0;
                  font-size: 13px;
                  color: #806840;
                  line-height: 1.6;
                  border-top: 1px dashed rgba(90,60,20,0.18);
                  padding-top: 16px;
                  width: 100%;
                ">
                  نتمنى لك يوماً هادئاً ومليئاً بالراحة،
                  <br />
                  <strong>فريق الدعم الفني 🪑 موطن الريف للأثاث</strong>
                  <br />
                  <span style="font-size: 11px; color: #806840; opacity: 0.7;">shadatucme@gmail.com</span>
                </p>

              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
    `,
  });
};
