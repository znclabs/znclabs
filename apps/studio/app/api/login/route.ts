import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({ password: "" }));

  if (!process.env.STUDIO_PASSWORD) {
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }

  if (password !== process.env.STUDIO_PASSWORD) {
    return NextResponse.json({ error: "invalid password" }, { status: 401 });
  }

  const session = await getSession();
  session.authed = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
