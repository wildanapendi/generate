"use client";

import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGenerateStore, type GenerateStage } from "@/stores/generate-store";
import { cn } from "@/lib/utils";

const STAGES: Array<{ key: GenerateStage; label: string }> = [
  { key: "preparing", label: "Menyusun konteks" },
  { key: "drafting", label: "Menulis draft awal" },
  { key: "structuring", label: "Menyusun struktur section" },
  { key: "polishing", label: "Memoles bahasa & rumus" },
  { key: "saving", label: "Menyimpan ke database" },
];

const ORDER: GenerateStage[] = [
  "idle",
  "preparing",
  "drafting",
  "structuring",
  "polishing",
  "saving",
  "done",
];

export function GenerateProgress() {
  const { stage, progress, error } = useGenerateStore();
  const idx = ORDER.indexOf(stage);

  return (
    <Card className="self-start">
      <CardHeader>
        <CardTitle>Progress</CardTitle>
        <CardDescription>
          Pantau proses pembuatan modul oleh AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full transition-all duration-500",
              stage === "error" ? "bg-destructive" : "bg-primary",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {stage === "idle" ? (
          <p className="text-sm text-muted-foreground">
            Isi formulir lalu klik “Generate”. Proses biasanya 10–30 detik.
          </p>
        ) : (
          <ul className="space-y-2">
            {STAGES.map((s) => {
              const done = idx > ORDER.indexOf(s.key);
              const active = stage === s.key;
              return (
                <li key={s.key} className="flex items-center gap-2 text-sm">
                  {done ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : active ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <span className="size-2 rounded-full bg-muted-foreground/30" />
                  )}
                  <span
                    className={cn(
                      done && "text-foreground",
                      !done && !active && "text-muted-foreground",
                      active && "font-medium",
                    )}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {stage === "error" && error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
