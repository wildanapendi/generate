"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useEditorStore, type SaveStatus } from "@/stores/editor-store";
import { useAutoSave } from "@/hooks/useAutoSave";
import { SectionEditor } from "./section-editor";
import { SectionManager } from "./section-manager";
import { ModuleMetadataForm } from "./module-metadata-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Module, ModuleSection } from "@/types/module";

interface ModuleEditorProps {
  module: Module;
}

function newSection(order: number): ModuleSection {
  return {
    id: `sec-${crypto.randomUUID().slice(0, 8)}`,
    type: "paragraph",
    title: "Section baru",
    content: "",
    order,
  };
}

export function ModuleEditor({ module }: ModuleEditorProps) {
  const {
    load,
    content,
    setSection,
    addSection,
    removeSection,
    reorderSections,
    saveStatus,
    setStatus,
    markSaved,
    isDirty,
  } = useEditorStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [meta, setMeta] = useState<Partial<Module>>({});
  const [, startTransition] = useTransition();

  // Hydrate once.
  useEffect(() => {
    load(module);
    const sections = (module.content as { sections?: ModuleSection[] })
      ?.sections;
    if (sections && sections.length > 0) setActiveId(sections[0].id);
  }, [module, load]);

  const sortedSections = useMemo(
    () =>
      [...content.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [content.sections],
  );

  const activeSection = sortedSections.find((s) => s.id === activeId) ?? null;

  // Auto-save (5s debounce). Persists content + metadata together.
  const payload = useMemo(
    () => ({ content, ...meta }),
    [content, meta],
  );

  useAutoSave(
    payload,
    async () => {
      if (!isDirty && Object.keys(meta).length === 0) return;
      setStatus("saving");
      try {
        const res = await fetch(`/api/modules/${module.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("SAVE_FAILED");
        markSaved();
      } catch {
        setStatus("error");
        toast.error("Gagal menyimpan", {
          description: "Perubahan akan dicoba lagi otomatis.",
        });
      }
    },
    { delay: 4000, enabled: true },
  );

  // Save on unload.
  useEffect(() => {
    const handler = () => {
      if (!isDirty) return;
      // sendBeacon is best-effort.
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon?.(`/api/modules/${module.id}`, blob);
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, payload, module.id]);

  function onAddSection() {
    const order = sortedSections.length + 1;
    const s = newSection(order);
    addSection(s);
    setActiveId(s.id);
  }

  function onMove(id: string, direction: "up" | "down") {
    const ids = sortedSections.map((s) => s.id);
    const i = ids.indexOf(id);
    if (i < 0) return;
    const j = direction === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    reorderSections(ids);
  }

  function onRemove(id: string) {
    removeSection(id);
    if (activeId === id) {
      const remaining = sortedSections.filter((s) => s.id !== id);
      setActiveId(remaining[0]?.id ?? null);
    }
  }

  function onMetaChange(patch: Partial<Module>) {
    setMeta((m) => ({ ...m, ...patch }));
  }

  function onContentChange(html: string) {
    if (!activeId) return;
    startTransition(() => setSection(activeId, { content: html }));
  }

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col gap-4">
        <SectionManager
          sections={sortedSections}
          activeId={activeId}
          onSelect={setActiveId}
          onAdd={onAddSection}
          onRemove={onRemove}
          onMove={onMove}
          onUpdate={(id, patch) => setSection(id, patch)}
        />
      </aside>

      <main className="flex min-w-0 flex-col gap-4">
        <SaveIndicator status={saveStatus} />
        <ModuleMetadataForm
          module={{ ...module, ...meta }}
          onChange={onMetaChange}
        />

        {activeSection ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{activeSection.title || "Section"}</CardTitle>
              <span className="text-xs text-muted-foreground">
                {activeSection.type}
              </span>
            </CardHeader>
            <CardContent>
              <SectionEditor
                key={activeSection.id}
                initialHTML={activeSection.content}
                onChange={onContentChange}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="grid place-items-center gap-3 p-12 text-center">
              <p className="text-muted-foreground">
                Pilih atau tambahkan section untuk mulai mengedit.
              </p>
              <Button onClick={onAddSection}>Tambah section</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {status === "saving" && (
        <>
          <Loader2 className="size-3 animate-spin" /> Menyimpan…
        </>
      )}
      {status === "saved" && (
        <>
          <CheckCircle2 className="size-3 text-emerald-500" /> Tersimpan
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="size-3 text-destructive" /> Gagal menyimpan
        </>
      )}
    </div>
  );
}
