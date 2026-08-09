import { getServiceSupabase } from "./supabase-server";
import type { Article, ImageAsset } from "@znclabs/shared";

export interface ArticleWithImages extends Article {
  images: ImageAsset[];
}

export async function getRecentArticlesWithImages(limit = 30): Promise<ArticleWithImages[]> {
  const supabase = getServiceSupabase();

  const { data: articles, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!articles || articles.length === 0) return [];

  const { data: images } = await supabase
    .from("images")
    .select("*")
    .in(
      "article_id",
      articles.map((a) => a.id)
    );

  const imagesByArticle = new Map<string, ImageAsset[]>();
  for (const image of (images ?? []) as ImageAsset[]) {
    const list = imagesByArticle.get(image.article_id) ?? [];
    list.push(image);
    imagesByArticle.set(image.article_id, list);
  }

  return (articles as Article[]).map((article) => ({
    ...article,
    images: imagesByArticle.get(article.id) ?? [],
  }));
}
