import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZNC Media",
  description: "Otomatik üretilen, kaynak gösterilen özgün haber analizleri.",
};

const CATEGORIES: { slug: string; label: string }[] = [
  { slug: "gundem", label: "Gündem" },
  { slug: "teknoloji", label: "Teknoloji" },
  { slug: "ekonomi", label: "Ekonomi" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <header className="border-b border-neutral-200">
          <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-6">
            <Link href="/" className="text-lg font-bold tracking-tight">
              ZNC Media
            </Link>
            <nav className="flex gap-4 text-sm text-neutral-600">
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/${c.slug}`} className="hover:text-neutral-900">
                  {c.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200">
          <div className="mx-auto max-w-3xl px-4 py-6 text-xs text-neutral-500">
            İçerikler yapay zeka destekli özgün analizlerdir; her makalenin altında kaynağı belirtilir.
          </div>
        </footer>
      </body>
    </html>
  );
}
