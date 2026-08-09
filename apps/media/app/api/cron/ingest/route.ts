import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";
import { fetchFeedItems } from "@/lib/rss";
import { generateArticle } from "@/lib/groq";
import { SYSTEM_PROMPT, buildUserPrompt, hasVerbatimOverlap } from "@/lib/prompt";
import { makeSlug } from "@/lib/slug";
import { GROQ_MODEL } from "@/lib/groq";
import type { Source, RawItem } from "@znclabs/shared";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH_SIZE = 5;

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();

  // 1. Ingest fresh items from every active RSS source.
  const { data: sources, error: sourcesError } = await supabase
    .from("sources")
    .select("*")
    .eq("active", true);

  if (sourcesError) {
    return NextResponse.json({ error: sourcesError.message }, { status: 500 });
  }

  const feedErrors: Record<string, string> = {};

  for (const source of (sources ?? []) as Source[]) {
    try {
      const items = await fetchFeedItems(source);
      if (items.length === 0) continue;

      const rows = items.map((item) => ({
        source_id: source.id,
        guid: item.guid,
        title: item.title,
        link: item.link,
        summary: item.summary,
        published_at: item.publishedAt,
      }));

      await supabase
        .from("raw_items")
        .upsert(rows, { onConflict: "source_id,guid", ignoreDuplicates: true });
    } catch (err) {
      feedErrors[source.feed_url] = err instanceof Error ? err.message : String(err);
    }
  }

  // 2. Pull a bounded batch of pending items (joined with their source) to
  //    generate original articles for.
  const { data: pendingItems, error: pendingError } = await supabase
    .from("raw_items")
    .select("*, sources(name, category)")
    .eq("status", "pending")
    .order("published_at", { ascending: false })
    .limit(BATCH_SIZE);

  if (pendingError) {
    return NextResponse.json({ error: pendingError.message }, { status: 500 });
  }

  const newArticleIds: string[] = [];
  const generationErrors: Record<string, string> = {};

  for (const item of (pendingItems ?? []) as (RawItem & {
    sources: { name: string; category: string } | null;
  })[]) {
    const sourceName = item.sources?.name ?? "Unknown source";
    const category = item.sources?.category ?? "gundem";

    try {
      const userPrompt = buildUserPrompt({
        sourceTitle: item.title,
        sourceSummary: item.summary ?? item.title,
        sourceUrl: item.link,
        sourceName,
        category,
      });

      let output = await generateArticle(SYSTEM_PROMPT, userPrompt);

      if (hasVerbatimOverlap(item.summary ?? item.title, output.body_markdown)) {
        // one retry — the model may just need a nudge away from the source phrasing
        output = await generateArticle(
          SYSTEM_PROMPT,
          userPrompt + "\n\nYour previous attempt copied phrasing from the source. Rewrite using entirely your own words."
        );
        if (hasVerbatimOverlap(item.summary ?? item.title, output.body_markdown)) {
          throw new Error("verbatim overlap with source persisted after retry");
        }
      }

      const slug = makeSlug(output.title);

      const { data: article, error: insertError } = await supabase
        .from("articles")
        .insert({
          raw_item_id: item.id,
          title: output.title,
          slug,
          body_markdown: output.body_markdown,
          category,
          source_name: sourceName,
          source_url: item.link,
          model_used: GROQ_MODEL,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertError) throw new Error(insertError.message);

      newArticleIds.push(article.id);
      await supabase.from("raw_items").update({ status: "processed" }).eq("id", item.id);
    } catch (err) {
      generationErrors[item.id] = err instanceof Error ? err.message : String(err);
      await supabase.from("raw_items").update({ status: "failed" }).eq("id", item.id);
    }
  }

  return NextResponse.json({
    newArticleIds,
    ingested: (sources ?? []).length,
    generated: newArticleIds.length,
    feedErrors,
    generationErrors,
  });
}
