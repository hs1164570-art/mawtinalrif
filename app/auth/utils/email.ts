import { Resend } from "resend";
import { DOMAIN } from "@/lib/constants";
const resend = new Resend(process.env.AUTH_EMAIL_VERIFIY);

export const sendVerificationToken = async (
  email: string,
  token: string,
  lang?: string,
) => {
  const link = `${DOMAIN}/${lang || "en"}/verify?token=${token}`;
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify Your Email",
    html: `
      
      
      
      
       <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#84cc16 0%,#10b981 100%);padding:50px 30px;text-align:center;">
                            <div style="width:80px;height:80px;background:#fff;border-radius:50%;display:inline-block;margin-bottom:20px;line-height:80px;">
                                <span style="font-size:40px;">✉️</span>
                            </div>
                            <h1 style="color:#fff;font-size:28px;font-weight:700;margin:0;">Verify Your Email</h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding:50px 40px;">
                            <h2 style="color:#065f46;font-size:24px;margin:0 0 20px 0;font-weight:600;">Hello! 👋</h2>
                            
                            <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
                                Thanks for signing up! We're excited to have you on board. To get started, please verify your email address by clicking the button below.
                            </p>
                            
                            <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 30px 0;">
                                This verification link will expire in 2 hours for security reasons.
                            </p>
                            
                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding:20px 0;">
                                        <a href=${link} style="display:inline-block;background:linear-gradient(135deg,#84cc16 0%,#10b981 100%);color:#fff;text-decoration:none;padding:16px 50px;border-radius:12px;font-weight:600;font-size:16px;box-shadow:0 10px 25px rgba(16,185,129,0.3);">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="border-top:1px solid #e5e7eb;margin:30px 0;"></div>
                            
                            <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 10px 0;">
                                Or copy and paste this link in your browser:
                            </p>
                            <p style="color:#10b981;font-size:13px;word-break:break-all;background:#f0fdf4;padding:12px;border-radius:8px;border-left:4px solid #10b981;">
                                VERIFICATION_LINK_HERE
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Security Note -->
                    <tr>
                        <td style="background:#f9fafb;padding:30px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="40" valign="top">
                                        <span style="font-size:24px;">🔒</span>
                                    </td>
                                    <td>
                                        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
                                            <strong style="color:#374151;">Security Tip:</strong> If you didn't send a link, please ignore this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background:#065f46;padding:30px 40px;text-align:center;">
                            <p style="color:#d1fae5;font-size:14px;margin:0 0 10px 0;">
                                Need help? Contact us at <a href="mailto:shadatucme@ygmail.com" style="color:#a7f3d0;text-decoration:none;">support@yourapp.com</a>
                            </p>
                            <p style="color:#86efac;font-size:12px;margin:0;">
                                ${new Date().getFullYear} Ebrahim Abouzaid. All rights reserved.
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
