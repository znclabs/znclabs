"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleClick() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleClick} className="text-sm text-neutral-400 hover:text-neutral-100">
      Çıkış yap
    </button>
  );
}
