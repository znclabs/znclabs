import Parser from "rss-parser";
import type { Source } from "@znclabs/shared";

export interface FeedItem {
  guid: string;
  title: string;
  link: string;
  summary: string | null;
  publishedAt: string | null;
}

const parser = new Parser({ timeout: 15_000 });

export async function fetchFeedItems(source: Source): Promise<FeedItem[]> {
  const feed = await parser.parseURL(source.feed_url);
  return (feed.items ?? [])
    .filter((item) => item.title && item.link)
    .map((item) => ({
      guid: item.guid ?? item.link!,
      title: item.title!,
      link: item.link!,
      summary: item.contentSnippet ?? item.summary ?? item.content ?? null,
      publishedAt: item.isoDate ?? item.pubDate ?? null,
    }));
}
