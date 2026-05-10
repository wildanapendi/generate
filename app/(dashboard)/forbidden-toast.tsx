"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Client component yang mendeteksi query param `?forbidden=1` dan
 * menampilkan toast "Akses ditolak". Setelah toast ditampilkan,
 * param dihapus dari URL untuk mencegah re-trigger saat refresh.
 *
 * Mounted di dashboard layout — trigger saat user di-redirect dari
 * admin-only routes (middleware atau requireRole guard).
 */
export function ForbiddenToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("forbidden") === "1") {
      toast.error("Akses ditolak: halaman ini hanya untuk admin.");

      // Strip param dari URL tanpa full-page reload
      const params = new URLSearchParams(searchParams.toString());
      params.delete("forbidden");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }
  }, [searchParams, pathname, router]);

  return null;
}
