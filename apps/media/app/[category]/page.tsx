import { notFound } from "next/navigation";
import { getArticlesByCategory } from "@/lib/data";
import ArticleCard from "@/components/ArticleCard";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES: Record<string, string> = {
  gundem: "Gündem",
  teknoloji: "Teknoloji",
  ekonomi: "Ekonomi",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const label = VALID_CATEGORIES[category];
  if (!label) notFound();

  const articles = await getArticlesByCategory(category);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{label}</h1>
      {articles.length === 0 ? (
        <p className="text-neutral-500">Bu kategoride henüz içerik yok.</p>
      ) : (
        <div>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
