import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, isAuthedCookieValue } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authed = await isAuthedCookieValue(cookieValue);

  if (!authed) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // protect everything except: login page, the login/logout/generate-image
    // API routes (generate-image checks its own bearer secret for
    // machine-to-machine calls from GitHub Actions), and static assets.
    "/((?!login|api/login|api/logout|api/generate-image|_next/static|_next/image|favicon.ico).*)",
  ],
};
