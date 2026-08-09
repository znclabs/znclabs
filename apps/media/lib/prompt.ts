import { z } from "zod";

export const articleOutputSchema = z.object({
  title: z.string().min(10).max(160),
  body_markdown: z.string().min(400),
});

export type ArticleOutput = z.infer<typeof articleOutputSchema>;

interface PromptInput {
  sourceTitle: string;
  sourceSummary: string;
  sourceUrl: string;
  sourceName: string;
  category: string;
}

export const OUTPUT_DELIMITER = "---ARTICLE-BODY---";

export const SYSTEM_PROMPT = `You are an independent commentator writing for a general-interest news analysis site.

You will be given the title and a short summary of a news item, plus its source. Your job is to write a genuinely ORIGINAL analysis/commentary article inspired by it — your own take, context, and implications for the reader.

Hard rules:
- Do NOT quote, closely paraphrase, or follow the sentence structure of the source summary.
- Do NOT reproduce the source's specific phrasing. Assume the reader has NOT read the source.
- Write at least 400 words of substantive, original analysis (background, why it matters, possible implications). Do not pad with filler.
- End the article body with exactly one line, on its own paragraph, in this exact format: "Source: {source_name} — {source_url}"

Output format (plain text, NOT JSON):
- Line 1: the article title only, nothing else.
- Line 2: exactly the literal text ---ARTICLE-BODY---
- Then: the full article body as markdown prose (paragraphs, optionally a subheading or two), ending with the required Source line.
Do not wrap any of this in markdown code fences, and do not add any commentary before or after it.`;

export function parseArticleOutput(raw: string): ArticleOutput {
  const delimiterIndex = raw.indexOf(OUTPUT_DELIMITER);
  if (delimiterIndex === -1) {
    throw new Error(`model output missing ${OUTPUT_DELIMITER} delimiter`);
  }

  const title = raw.slice(0, delimiterIndex).trim();
  const body_markdown = raw.slice(delimiterIndex + OUTPUT_DELIMITER.length).trim();

  return articleOutputSchema.parse({ title, body_markdown });
}

export function buildUserPrompt(input: PromptInput): string {
  return `Category: ${input.category}
Source name: ${input.sourceName}
Source URL: ${input.sourceUrl}
Source item title: ${input.sourceTitle}
Source item summary: ${input.sourceSummary}

Write the original analysis article now, following all the rules in the system prompt.`;
}

/**
 * Basic copy-detector: flags generated bodies that lifted an 8-word
 * shingle verbatim from the source summary. A cheap guard against the
 * model degenerating into paraphrase-by-substitution.
 */
export function hasVerbatimOverlap(sourceSummary: string, generatedBody: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

  const sourceWords = normalize(sourceSummary);
  if (sourceWords.length < 8) return false;

  const bodyText = normalize(generatedBody).join(" ");

  for (let i = 0; i <= sourceWords.length - 8; i++) {
    const shingle = sourceWords.slice(i, i + 8).join(" ");
    if (bodyText.includes(shingle)) return true;
  }
  return false;
}
