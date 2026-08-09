import { getServiceSupabase } from "@/lib/supabase-server";
import { fetchBaseImage } from "@/lib/pollinations";
import { compositeHeadline } from "@/lib/overlay";
import type { ImageVariant } from "@znclabs/shared";

const VARIANTS: { variant: ImageVariant; width: number; height: number }[] = [
  { variant: "square", width: 1080, height: 1080 },
  { variant: "portrait", width: 1080, height: 1350 },
];

const CATEGORY_STYLE: Record<string, string> = {
  gundem: "editorial photojournalism style, newsroom mood",
  teknoloji: "modern tech illustration, clean minimal futuristic",
  ekonomi: "editorial finance illustration, charts and skylines mood",
};

function buildImagePrompt(title: string, category: string): string {
  const style = CATEGORY_STYLE[category] ?? "editorial illustration style";
  return `${style}, visual metaphor for: ${title}, dramatic lighting, high detail, no text, no words, no letters`;
}

export interface GenerateImagesResult {
  articleId: string;
  images: { variant: ImageVariant; public_url: string }[];
  errors: Record<string, string>;
}

export async function generateImagesForArticle(articleId: string): Promise<GenerateImagesResult> {
  const supabase = getServiceSupabase();

  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("id, title, category")
    .eq("id", articleId)
    .single();

  if (articleError || !article) {
    throw new Error("article not found");
  }

  const prompt = buildImagePrompt(article.title, article.category);
  const images: { variant: ImageVariant; public_url: string }[] = [];
  const errors: Record<string, string> = {};

  for (const { variant, width, height } of VARIANTS) {
    try {
      const base = await fetchBaseImage({
        prompt,
        width,
        height,
        seedKey: `${article.id}:${variant}`,
      });
      const composited = await compositeHeadline(base, width, height, article.title);

      const storagePath = `${article.id}/${variant}.png`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(storagePath, composited, { contentType: "image/png", upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(storagePath);

      const { error: upsertError } = await supabase
        .from("images")
        .upsert(
          {
            article_id: article.id,
            variant,
            prompt,
            storage_path: storagePath,
            public_url: publicUrlData.publicUrl,
            status: "generated",
          },
          { onConflict: "article_id,variant" }
        );

      if (upsertError) throw new Error(upsertError.message);

      images.push({ variant, public_url: publicUrlData.publicUrl });
    } catch (err) {
      errors[variant] = err instanceof Error ? err.message : String(err);
    }
  }

  return { articleId: article.id, images, errors };
}
