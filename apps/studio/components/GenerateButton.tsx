"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateButton({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/dashboard/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ articleId }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Üretim başarısız oldu.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 disabled:opacity-50"
      >
        {loading ? "Üretiliyor…" : "Görsel üret"}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
