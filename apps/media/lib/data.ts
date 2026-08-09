import { getPublicSupabase } from "./supabase-public";
import type { Article } from "@znclabs/shared";

const ARTICLE_COLUMNS =
  "id, title, slug, body_markdown, category, source_name, source_url, created_at, published_at";

export async function getLatestArticles(limit = 30): Promise<Article[]> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as Article[];
}

export async function getArticlesByCategory(category: string, limit = 30): Promise<Article[]> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("status", "published")
    .eq("category", category)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = getPublicSupabase();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Article) ?? null;
}
