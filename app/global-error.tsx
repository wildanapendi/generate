"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4 text-center dark:bg-zinc-950">
        <div className="space-y-2">
          <h1 className="text-7xl font-bold tracking-tighter text-red-500">
            500
          </h1>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Terjadi Kesalahan
          </h2>
          <p className="max-w-md text-zinc-500 dark:text-zinc-400">
            Maaf, terjadi kesalahan pada server. Silakan coba lagi atau hubungi
            administrator jika masalah berlanjut.
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-zinc-400">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Coba Lagi
          </button>
          <a
            href="/dashboard"
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Ke Dashboard
          </a>
        </div>
      </body>
    </html>
  );
}
