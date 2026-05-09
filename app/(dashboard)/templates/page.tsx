import type { Metadata } from "next";
import Link from "next/link";
import { LayoutTemplate, ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTemplates } from "@/services/templates";
import { CreateTemplateButton } from "@/components/template/create-template-button";
import { isCurrentUserAdmin } from "@/services/modules";
import { formatRelativeIndo } from "@/lib/format";

export const metadata: Metadata = { title: "Template" };

export default async function TemplatesPage() {
  const [templates, isAdmin] = await Promise.all([
    getTemplates(),
    isCurrentUserAdmin(),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Template</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Desain cover, header, footer, watermark, dan tipografi modul Anda."
              : "Lihat template yang tersedia. Hubungi admin untuk perubahan."}
          </p>
        </div>
        {isAdmin && <CreateTemplateButton />}
      </header>

      {/* Info banner untuk user non-admin */}
      {!isAdmin && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="size-5 shrink-0" />
          <p>
            Hanya admin yang dapat membuat dan mengedit template. Anda dapat melihat
            template yang tersedia di sini.
          </p>
        </div>
      )}

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <LayoutTemplate className="size-10 text-muted-foreground" />
            <CardTitle>Belum ada template</CardTitle>
            <CardDescription>
              {isAdmin
                ? "Buat template pertama untuk menyatukan tampilan modul-modul Anda."
                : "Belum ada template yang tersedia. Hubungi admin untuk membuat template."}
            </CardDescription>
            {isAdmin && <CreateTemplateButton variant="default" />}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{t.name}</CardTitle>
                  {t.is_default && <Badge variant="success">Default</Badge>}
                </div>
                <CardDescription className="line-clamp-2">
                  {t.description ?? "Tanpa deskripsi"}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Diubah {formatRelativeIndo(t.updated_at)}
              </CardContent>
              {/* Hanya admin yang bisa membuka designer */}
              {isAdmin && (
                <CardFooter className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/templates/${t.id}`}>Buka designer</Link>
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
