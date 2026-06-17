import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/(?!admin)).*)",
  ],
};
