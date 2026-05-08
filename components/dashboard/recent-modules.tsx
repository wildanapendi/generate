import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Module } from "@/types/module";
import { formatRelativeIndo } from "@/lib/format";

const STATUS_VARIANT: Record<string, "secondary" | "success" | "outline"> = {
  draft: "secondary",
  published: "success",
  archived: "outline",
};

export function RecentModules({ modules }: { modules: Module[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Modul Terbaru</CardTitle>
          <CardDescription>
            5 modul yang baru saja Anda kerjakan.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/modules">
            Semua modul
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {modules.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <FileText className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Belum ada modul. Buat yang pertama dengan AI Generate.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/generate">Generate dengan AI</Link>
            </Button>
          </div>
        ) : (
          modules.map((m) => (
            <Link
              key={m.id}
              href={`/modules/${m.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{m.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[m.subject, m.semester].filter(Boolean).join(" · ") ||
                    "Tanpa metadata"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {formatRelativeIndo(m.updated_at)}
                </span>
                <Badge variant={STATUS_VARIANT[m.status] ?? "secondary"}>
                  {m.status}
                </Badge>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
