export type SourceCategory = "gundem" | "teknoloji" | "ekonomi";

export interface Source {
  id: string;
  name: string;
  feed_url: string;
  category: SourceCategory | string;
  active: boolean;
  created_at: string;
}

export type RawItemStatus = "pending" | "processed" | "skipped" | "failed";

export interface RawItem {
  id: string;
  source_id: string;
  guid: string;
  title: string;
  link: string;
  summary: string | null;
  published_at: string | null;
  fetched_at: string;
  status: RawItemStatus;
}

export type ArticleStatus = "draft" | "published";

export interface Article {
  id: string;
  raw_item_id: string | null;
  title: string;
  slug: string;
  body_markdown: string;
  category: string;
  source_name: string;
  source_url: string;
  model_used: string;
  status: ArticleStatus;
  created_at: string;
  published_at: string | null;
}

export type ImageVariant = "square" | "portrait";

export interface ImageAsset {
  id: string;
  article_id: string;
  variant: ImageVariant;
  prompt: string;
  storage_path: string;
  public_url: string;
  status: string;
  created_at: string;
}

export interface IngestResponse {
  newArticleIds: string[];
}
