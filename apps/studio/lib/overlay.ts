import sharp from "sharp";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Rough character-count based wrapping — good enough for a bold display font. */
function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);

  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (last.length >= maxCharsPerLine - 1) {
      lines[maxLines - 1] = `${last.slice(0, maxCharsPerLine - 1).trimEnd()}…`;
    }
  }

  return lines;
}

function buildOverlaySvg(width: number, height: number, headline: string): string {
  const maxCharsPerLine = Math.round(width / 34);
  const lines = wrapText(headline, maxCharsPerLine, 5);
  const fontSize = Math.round(width / 16);
  const lineHeight = fontSize * 1.2;
  const scrimHeight = Math.round(height * 0.4 + lines.length * lineHeight);
  const textBlockHeight = lines.length * lineHeight;
  const startY = height - 60 - textBlockHeight + fontSize;

  const tspans = lines
    .map((line, i) => `<tspan x="48" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.85" />
    </linearGradient>
  </defs>
  <rect x="0" y="${height - scrimHeight}" width="${width}" height="${scrimHeight}" fill="url(#scrim)" />
  <text
    x="48"
    y="${startY}"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="800"
    font-size="${fontSize}"
    fill="#ffffff"
  >${tspans}</text>
  <text
    x="48"
    y="${height - 24}"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="700"
    font-size="24"
    letter-spacing="2"
    fill="#ffffff"
    opacity="0.85"
  >ZNCLABS</text>
</svg>`;
}

export async function compositeHeadline(
  baseImage: Buffer,
  width: number,
  height: number,
  headline: string
): Promise<Buffer> {
  const svg = buildOverlaySvg(width, height, headline);

  return sharp(baseImage)
    .resize(width, height, { fit: "cover" })
    .composite([{ input: Buffer.from(svg) }])
    .png()
    .toBuffer();
}
