import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getModuleById } from "@/services/modules";
import { formatDateIndo } from "@/lib/format";
import type { ModuleContent, ModuleSection } from "@/types/module";
import { ExportDialog } from "@/components/export/export-dialog";

export const metadata: Metadata = {
  title: "Detail Modul",
};

const STATUS_VARIANT: Record<string, "secondary" | "success" | "outline"> = {
  draft: "secondary",
  published: "success",
  archived: "outline",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const mod = await getModuleById(id);
  if (!mod) notFound();

  const content = (mod.content ?? { sections: [] }) as unknown as ModuleContent;
  const sections: ModuleSection[] = Array.isArray(content.sections)
    ? (content.sections as ModuleSection[])
    : [];

  const meta: Array<[string, string | null | undefined]> = [
    ["Kode Mata Kuliah", mod.code],
    ["Mata Kuliah", mod.subject],
    ["Semester", mod.semester],
    ["Program Studi", mod.program],
    ["Dosen Pengampu", mod.lecturer],
    ["Laboratorium", mod.lab],
    ["Tahun Akademik", mod.academic_year],
    ["Dibuat", formatDateIndo(mod.created_at)],
    ["Terakhir diubah", formatDateIndo(mod.updated_at)],
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Button variant="ghost" size="sm" asChild className="self-start">
        <Link href="/modules">
          <ChevronLeft className="size-4" />
          Kembali ke daftar modul
        </Link>
      </Button>

      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[mod.status] ?? "secondary"}>
              {mod.status}
            </Badge>
            {mod.code && (
              <span className="text-xs text-muted-foreground">{mod.code}</span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {mod.title}
          </h1>
          {mod.subject && (
            <p className="text-sm text-muted-foreground">{mod.subject}</p>
          )}
        </div>
        <div className="flex gap-2">
          <ExportDialog module={mod} />
          <Button asChild>
            <Link href={`/editor/${mod.id}`}>Edit di Editor</Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Isi Modul</CardTitle>
            <CardDescription>
              {sections.length === 0
                ? "Belum ada konten — gunakan editor untuk menambahkan section."
                : `${sections.length} section`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-12 text-center">
                <FileText className="size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Konten kosong. Editor akan tersedia di Phase 4.
                </p>
              </div>
            ) : (
              sections
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((s) => (
                  <article key={s.id} className="space-y-2">
                    {s.title && (
                      <h2 className="font-semibold">{s.title}</h2>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {s.content}
                    </p>
                    <Separator />
                  </article>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {meta
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label} className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    {label}
                  </span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
