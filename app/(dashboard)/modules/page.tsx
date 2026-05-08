import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getModules } from "@/services/modules";
import { formatRelativeIndo } from "@/lib/format";
import type { ModuleStatus } from "@/types/module";

export const metadata: Metadata = {
  title: "Modul",
  description: "Daftar seluruh modul praktikum yang Anda buat.",
};

const STATUS_VARIANT: Record<string, "secondary" | "success" | "outline"> = {
  draft: "secondary",
  published: "success",
  archived: "outline",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function ModulesListPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const search = sp.q?.trim() || undefined;
  const status =
    sp.status && ["draft", "published", "archived"].includes(sp.status)
      ? (sp.status as ModuleStatus)
      : undefined;
  const sort =
    sp.sort && ["newest", "oldest", "title"].includes(sp.sort)
      ? (sp.sort as "newest" | "oldest" | "title")
      : "newest";
  const page = Math.max(1, Number(sp.page) || 1);

  const { data, total, pageSize } = await getModules({
    search,
    status,
    sort,
    page,
    pageSize: 12,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (status) params.set("status", status);
    if (sort !== "newest") params.set("sort", sort);
    if (p !== 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/modules?${qs}` : "/modules";
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Modul</h1>
          <p className="text-sm text-muted-foreground">
            {total} modul tersimpan
          </p>
        </div>
        <Button asChild>
          <Link href="/generate">
            <Sparkles className="size-4" />
            Generate dengan AI
          </Link>
        </Button>
      </header>

      <form
        action="/modules"
        method="get"
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Cari berdasarkan judul…"
            defaultValue={search}
            className="pl-9"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Semua status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="title">Judul (A-Z)</option>
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Plus className="size-10 text-muted-foreground" />
            <CardTitle>Belum ada modul</CardTitle>
            <CardDescription>
              Mulai dengan AI Generate untuk membuat modul pertama Anda dalam
              hitungan menit.
            </CardDescription>
            <Button asChild className="mt-2">
              <Link href="/generate">Generate dengan AI</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((m) => (
            <Card key={m.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="line-clamp-2 text-base">
                    {m.title}
                  </CardTitle>
                  <Badge variant={STATUS_VARIANT[m.status] ?? "secondary"}>
                    {m.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-1">
                  {[m.subject, m.semester, m.program]
                    .filter(Boolean)
                    .join(" · ") || "Tanpa metadata"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-muted-foreground">
                {m.code ? <p>Kode: {m.code}</p> : null}
                {m.lecturer ? <p>Dosen: {m.lecturer}</p> : null}
              </CardContent>
              <CardFooter className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatRelativeIndo(m.updated_at)}
                </span>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/modules/${m.id}`}>Buka</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={pageHref(p)}>{p}</Link>
            </Button>
          ))}
        </nav>
      )}
    </div>
  );
}
