import { getIronSession, unsealData, type IronSessionData, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

declare module "iron-session" {
  interface IronSessionData {
    authed?: boolean;
  }
}

export const SESSION_COOKIE_NAME = "znclabs_studio_session";

function getSessionPassword(): string {
  const password = process.env.STUDIO_SESSION_SECRET;
  if (!password) throw new Error("Missing STUDIO_SESSION_SECRET");
  return password;
}

export const sessionOptions: SessionOptions = {
  get password() {
    return getSessionPassword();
  },
  cookieName: SESSION_COOKIE_NAME,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

/** For use inside Route Handlers / Server Components (has next/headers access). */
export async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

/** For use inside proxy.ts, which only has the raw cookie string from the request. */
export async function isAuthedCookieValue(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  try {
    const data = await unsealData<IronSessionData>(cookieValue, {
      password: getSessionPassword(),
    });
    return data.authed === true;
  } catch {
    return false;
  }
}
