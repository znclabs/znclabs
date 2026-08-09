import { getRecentArticlesWithImages } from "@/lib/dashboard-data";
import GenerateButton from "@/components/GenerateButton";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  gundem: "Gündem",
  teknoloji: "Teknoloji",
  ekonomi: "Ekonomi",
};

export default async function DashboardPage() {
  const articles = await getRecentArticlesWithImages();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">ZNC Studio — Görsel Fabrikası</h1>
        <LogoutButton />
      </div>

      {articles.length === 0 ? (
        <p className="text-neutral-500">Henüz makale yok. Önce media pipeline&apos;ı çalıştır.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 flex gap-4"
            >
              <div className="flex-1">
                <div className="text-xs text-neutral-500 mb-1">
                  {CATEGORY_LABELS[article.category] ?? article.category}
                </div>
                <h2 className="font-medium mb-2">{article.title}</h2>
                <GenerateButton articleId={article.id} />
              </div>
              <div className="flex gap-2">
                {article.images.length === 0 ? (
                  <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-neutral-700 text-xs text-neutral-600">
                    yok
                  </div>
                ) : (
                  article.images.map((image) => (
                    <a
                      key={image.id}
                      href={image.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.public_url}
                        alt={`${article.title} — ${image.variant}`}
                        className="h-24 w-24 rounded-md object-cover border border-neutral-800"
                      />
                    </a>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
