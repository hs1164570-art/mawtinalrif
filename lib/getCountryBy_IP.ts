import { headers } from "next/headers";

export async function getCountryByIp(): Promise<string> {
  const DEFAULT_COUNTRY = "unKnown";

  try {
    // احنا بنجيب الي بي من الاستضافه
    //  يعدين نستخدم الريكوسيست عشان نحدد الدوله عن طريق الاي بي ده

    const headerList = headers();
    const ip =
      (await headerList).get("x-forwarded-for")?.split(",")[0] ||
      (await headerList).get("x-real-ip") ||
      "";

    if (!ip || ip === "::1" || ip === "127.0.0.1") {
      return DEFAULT_COUNTRY;
    }

    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(4000),
      },
    );

    const data = await response.json();

    if (data.status === "success" && data.country) {
      return data.country;
    }

    return DEFAULT_COUNTRY;
  } catch (error) {
    return DEFAULT_COUNTRY;
  }
}
