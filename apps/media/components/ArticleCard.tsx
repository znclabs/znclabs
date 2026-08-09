import Link from "next/link";
import type { Article } from "@znclabs/shared";

const CATEGORY_LABELS: Record<string, string> = {
  gundem: "Gündem",
  teknoloji: "Teknoloji",
  ekonomi: "Ekonomi",
};

function excerpt(markdown: string, length = 180): string {
  const plain = markdown
    .replace(/^Source:.*$/m, "")
    .replace(/[#*_>`]/g, "")
    .trim();
  return plain.length > length ? `${plain.slice(0, length)}…` : plain;
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="py-6 border-b border-neutral-200">
      <div className="text-xs font-medium text-neutral-500 mb-1">
        {CATEGORY_LABELS[article.category] ?? article.category}
      </div>
      <h2 className="text-xl font-semibold mb-2">
        <Link href={`/article/${article.slug}`} className="hover:underline">
          {article.title}
        </Link>
      </h2>
      <p className="text-neutral-600 text-sm leading-relaxed">{excerpt(article.body_markdown)}</p>
    </article>
  );
}
