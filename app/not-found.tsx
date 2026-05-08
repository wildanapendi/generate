import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-7xl font-bold tracking-tighter text-primary">
          404
        </h1>
        <h2 className="text-2xl font-semibold">Halaman Tidak Ditemukan</h2>
        <p className="max-w-md text-muted-foreground">
          Halaman yang Anda cari tidak ada atau telah dipindahkan. Periksa
          kembali URL atau kembali ke dashboard.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard">Ke Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
