"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Dashboard-level error boundary.
 * Catches errors in dashboard routes without replacing the entire page chrome.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Terjadi Kesalahan</h2>
        <p className="max-w-md text-muted-foreground">
          Terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Coba Lagi</Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Ke Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
