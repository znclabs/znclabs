import { NextRequest, NextResponse } from "next/server";
import { generateImagesForArticle } from "@/lib/generate-image";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Machine-to-machine endpoint: called by the GitHub Actions automation
 * script, so it authenticates via bearer secret rather than the studio
 * session cookie. Excluded from proxy.ts's auth matcher for that reason.
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.STUDIO_API_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { articleId } = await request.json().catch(() => ({ articleId: null }));
  if (!articleId) {
    return NextResponse.json({ error: "articleId is required" }, { status: 400 });
  }

  try {
    const result = await generateImagesForArticle(articleId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 404 }
    );
  }
}
