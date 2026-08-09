import { NextRequest, NextResponse } from "next/server";
import { generateImagesForArticle } from "@/lib/generate-image";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Called from the dashboard's "Generate" button. No bearer check needed —
 * this path is not excluded from proxy.ts, so only an authenticated
 * session cookie can reach it.
 */
export async function POST(request: NextRequest) {
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
