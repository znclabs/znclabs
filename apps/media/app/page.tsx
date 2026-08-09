import { getLatestArticles } from "@/lib/data";
import ArticleCard from "@/components/ArticleCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await getLatestArticles();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Son Analizler</h1>
      {articles.length === 0 ? (
        <p className="text-neutral-500">Henüz yayınlanmış içerik yok.</p>
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
