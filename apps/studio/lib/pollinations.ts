function hashToSeed(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash) % 1_000_000;
}

export interface PollinationsOptions {
  prompt: string;
  width: number;
  height: number;
  seedKey: string;
}

/** Free, no-API-key image generation (github.com/pollinations/pollinations). */
export async function fetchBaseImage(options: PollinationsOptions): Promise<Buffer> {
  const seed = hashToSeed(options.seedKey);
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(options.prompt)}` +
    `?width=${options.width}&height=${options.height}&nologo=true&seed=${seed}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Pollinations request failed: ${res.status} ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
