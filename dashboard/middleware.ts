import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, tokenFor } from "@/lib/auth";

// Gate every page behind the local password. If APP_PASSWORD is not configured,
// the gate is disabled (handy for a first run / demo). The login page and Next
// internals are always reachable.
export async function middleware(req: NextRequest) {
  const password = process.env.APP_PASSWORD?.trim();
  if (!password) return NextResponse.next();

  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  const expected = await tokenFor(password);
  if (cookie && cookie === expected) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Protect every page except the login route and Next internals. Anything with
  // a dot (favicon-32.png, site.webmanifest, etc.) is a static asset and is
  // left reachable so it loads on the login screen too.
  matcher: ["/((?!login|_next|.*\\.).*)"],
};
