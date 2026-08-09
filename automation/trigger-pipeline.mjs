// Drives one cycle of the content + image pipeline. Runnable locally
// (`node automation/trigger-pipeline.mjs`) against localhost or deployed
// URLs, and by the GitHub Actions scheduled workflow in production.

const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL;
const STUDIO_BASE_URL = process.env.STUDIO_BASE_URL;
const CRON_SECRET = process.env.CRON_SECRET;
const STUDIO_API_SECRET = process.env.STUDIO_API_SECRET;

function requireEnv(name, value) {
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
}

requireEnv("MEDIA_BASE_URL", MEDIA_BASE_URL);
requireEnv("STUDIO_BASE_URL", STUDIO_BASE_URL);
requireEnv("CRON_SECRET", CRON_SECRET);
requireEnv("STUDIO_API_SECRET", STUDIO_API_SECRET);

async function main() {
  console.log(`[pipeline] ingesting via ${MEDIA_BASE_URL}/api/cron/ingest`);

  const ingestRes = await fetch(`${MEDIA_BASE_URL}/api/cron/ingest`, {
    method: "POST",
    headers: { "x-cron-secret": CRON_SECRET },
  });

  if (!ingestRes.ok) {
    console.error(`[pipeline] ingest failed: ${ingestRes.status} ${await ingestRes.text()}`);
    process.exit(1);
  }

  const ingestBody = await ingestRes.json();
  const newArticleIds = ingestBody.newArticleIds ?? [];
  console.log(`[pipeline] ingest ok — ${newArticleIds.length} new article(s)`, ingestBody);

  for (const articleId of newArticleIds) {
    console.log(`[pipeline] generating images for article ${articleId}`);
    try {
      const imgRes = await fetch(`${STUDIO_BASE_URL}/api/generate-image`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${STUDIO_API_SECRET}`,
        },
        body: JSON.stringify({ articleId }),
      });

      if (!imgRes.ok) {
        console.error(`[pipeline] image gen failed for ${articleId}: ${imgRes.status} ${await imgRes.text()}`);
        continue;
      }

      console.log(`[pipeline] images ok for ${articleId}`, await imgRes.json());
    } catch (err) {
      console.error(`[pipeline] image gen error for ${articleId}:`, err);
    }
  }

  console.log("[pipeline] done");
}

main().catch((err) => {
  console.error("[pipeline] fatal error:", err);
  process.exit(1);
});
