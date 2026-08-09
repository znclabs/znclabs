import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getArticleBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  gundem: "Gündem",
  teknoloji: "Teknoloji",
  ekonomi: "Ekonomi",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} — ZNC Media`,
    description: article.body_markdown.slice(0, 160),
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // the model is instructed to end with a "Source: ..." line; we render
  // attribution separately below using the DB columns, so strip it here
  // to avoid showing it twice.
  const body = article.body_markdown.replace(/\n*Source:[\s\S]*$/, "").trim();

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <div className="text-xs font-medium text-neutral-500 mb-2">
        {CATEGORY_LABELS[article.category] ?? article.category}
      </div>
      <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
      {publishedDate && <p className="text-sm text-neutral-500 mb-6">{publishedDate}</p>}

      <div className="article-body">
        <ReactMarkdown>{body}</ReactMarkdown>
      </div>

      <div className="mt-8 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
        Kaynak:{" "}
        <a
          href={article.source_url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="font-medium text-neutral-900 hover:underline"
        >
          {article.source_name}
        </a>
      </div>
    </article>
  );
}
