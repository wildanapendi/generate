"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTemplateStore } from "@/stores/template-store";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  type TemplateConfig,
  DEFAULT_TEMPLATE_CONFIG,
} from "@/types/template";
import type { Module, Template } from "@/types/module";
import { CoverDesigner } from "./cover-designer";
import {
  HeaderDesigner,
  FooterDesigner,
} from "./header-footer-designer";
import { WatermarkDesigner } from "./watermark-designer";
import {
  LayoutDesigner,
  TypographyDesigner,
} from "./layout-typography-designer";
import { BlockBuilder } from "./block-builder";
import { DocumentPreview } from "@/components/preview/document-preview";

interface TemplateDesignerProps {
  template: Template;
  sampleModule: Module;
}

export function TemplateDesigner({
  template,
  sampleModule,
}: TemplateDesignerProps) {
  const router = useRouter();
  const { config, load, isDirty, markClean } = useTemplateStore();
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description ?? "");

  // Hydrate.
  useEffect(() => {
    load(
      ((template.config as unknown) as TemplateConfig) ??
        DEFAULT_TEMPLATE_CONFIG,
    );
  }, [template, load]);

  // Auto-save config + meta.
  const payload = useMemo(
    () => ({ name, description, config }),
    [name, description, config],
  );

  useAutoSave(
    payload,
    async () => {
      if (!isDirty && name === template.name && description === (template.description ?? "")) {
        return;
      }
      try {
        const res = await fetch(`/api/templates/${template.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        markClean();
      } catch {
        toast.error("Gagal menyimpan template");
      }
    },
    { delay: 3000 },
  );

  async function onDelete() {
    if (!confirm(`Hapus template "${template.name}"? Aksi ini tidak bisa dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Template dihapus");
      router.replace("/templates");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus template");
    }
  }

  async function onSaveNow() {
    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      markClean();
      toast.success("Tersimpan");
    } catch {
      toast.error("Gagal menyimpan");
    }
  }

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
      <aside className="flex max-h-[calc(100vh-160px)] flex-col gap-3 overflow-y-auto pr-1">
        <Card>
          <CardHeader>
            <CardTitle>Identitas Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama template"
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onSaveNow}>
                <Save className="size-4" />
                Simpan
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={onDelete}
                className="ml-auto"
              >
                <Trash2 className="size-4" />
                Hapus
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="cover">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="cover">Cover</TabsTrigger>
            <TabsTrigger value="page">Halaman</TabsTrigger>
            <TabsTrigger value="style">Gaya</TabsTrigger>
          </TabsList>
          <TabsContent value="cover" className="space-y-3">
            <CoverDesigner />
            <BlockBuilder />
          </TabsContent>
          <TabsContent value="page" className="space-y-3">
            <HeaderDesigner />
            <FooterDesigner />
            <WatermarkDesigner />
          </TabsContent>
          <TabsContent value="style" className="space-y-3">
            <LayoutDesigner />
            <TypographyDesigner />
          </TabsContent>
        </Tabs>
      </aside>

      <main className="overflow-y-auto rounded-lg border bg-muted/30 p-6">
        <DocumentPreview
          module={sampleModule}
          template={config}
          scale={0.7}
        />
      </main>
    </div>
  );
}
