import Groq from "groq-sdk";
import { parseArticleOutput, type ArticleOutput } from "./prompt";

export const GROQ_MODEL = "llama-3.3-70b-versatile";

let client: Groq | null = null;

function getGroqClient(): Groq {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Missing GROQ_API_KEY");
    client = new Groq({ apiKey });
  }
  return client;
}

export async function generateArticle(
  systemPrompt: string,
  userPrompt: string
): Promise<ArticleOutput> {
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Groq returned empty response");

  return parseArticleOutput(raw);
}
