"use client";

import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ModuleSection } from "@/types/module";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS: Array<{ value: ModuleSection["type"]; label: string }> = [
  { value: "heading", label: "Heading" },
  { value: "paragraph", label: "Paragraf" },
  { value: "list", label: "Daftar" },
  { value: "objective", label: "Tujuan" },
  { value: "procedure", label: "Prosedur" },
  { value: "result", label: "Hasil" },
  { value: "discussion", label: "Pembahasan" },
  { value: "reference", label: "Referensi" },
  { value: "code", label: "Kode" },
  { value: "formula", label: "Rumus" },
];

interface SectionManagerProps {
  sections: ModuleSection[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onUpdate: (id: string, patch: Partial<ModuleSection>) => void;
}

export function SectionManager({
  sections,
  activeId,
  onSelect,
  onAdd,
  onRemove,
  onMove,
  onUpdate,
}: SectionManagerProps) {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Sections</h2>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="size-4" />
          Tambah
        </Button>
      </div>

      <ul className="flex flex-col gap-2 overflow-y-auto pr-1">
        {sections.length === 0 && (
          <li className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            Belum ada section.
          </li>
        )}
        {sections.map((s, i) => {
          const isActive = s.id === activeId;
          return (
            <li
              key={s.id}
              className={cn(
                "rounded-md border bg-background p-3 transition-colors",
                isActive
                  ? "border-primary ring-1 ring-primary/30"
                  : "hover:border-ring/50",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className="block flex-1 text-left"
                >
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    #{i + 1} · {s.type}
                  </span>
                </button>
                <div className="flex gap-1">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(s.id, "up");
                      }}
                      disabled={i === 0}
                      aria-label="Pindah ke atas"
                    >
                      <ChevronUp className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(s.id, "down");
                      }}
                      disabled={i === sections.length - 1}
                      aria-label="Pindah ke bawah"
                    >
                      <ChevronDown className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(s.id);
                      }}
                      aria-label="Hapus section"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>

              {isActive && (
                <div className="mt-2 space-y-2">
                  <Input
                    placeholder="Judul section"
                    value={s.title ?? ""}
                    onChange={(e) =>
                      onUpdate(s.id, { title: e.target.value })
                    }
                  />
                  <Select
                    value={s.type}
                    onValueChange={(v) =>
                      onUpdate(s.id, { type: v as ModuleSection["type"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
