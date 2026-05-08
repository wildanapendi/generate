"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Module } from "@/types/module";
import type { TemplateConfig } from "@/types/template";
import { DEFAULT_TEMPLATE_CONFIG } from "@/types/template";

interface ExportDialogProps {
  module: Module;
  template?: TemplateConfig;
  /** Render trigger — if omitted, a default button is shown. */
  trigger?: React.ReactNode;
}

export function ExportDialog({
  module,
  template = DEFAULT_TEMPLATE_CONFIG,
  trigger,
}: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  async function handleExport(format: "pdf" | "docx") {
    setExporting(format);
    try {
      // 1. Log export event on server
      const res = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ moduleId: module.id }),
      });

      if (!res.ok) {
        throw new Error("Export logging failed");
      }

      // 2. Generate file client-side
      if (format === "pdf") {
        const { downloadPdf } = await import("@/services/export-pdf");
        await downloadPdf({ module, template });
      } else {
        const { downloadDocx } = await import("@/services/export-docx");
        await downloadDocx({ module, template });
      }

      toast.success(
        `${format.toUpperCase()} berhasil di-export`,
      );
      setOpen(false);
    } catch (err) {
      console.error("Export error:", err);
      toast.error(`Gagal mengexport ${format.toUpperCase()}`);
    } finally {
      setExporting(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 size-4" />
            Export
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Modul</DialogTitle>
          <DialogDescription>
            Pilih format dokumen untuk mengexport modul &ldquo;{module.title}&rdquo;.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* PDF */}
          <button
            type="button"
            disabled={exporting !== null}
            onClick={() => handleExport("pdf")}
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 transition-all hover:border-primary hover:bg-primary/5 disabled:opacity-50"
          >
            {exporting === "pdf" ? (
              <Loader2 className="size-10 animate-spin text-primary" />
            ) : (
              <FileText className="size-10 text-red-500 transition-transform group-hover:scale-110" />
            )}
            <div className="text-center">
              <p className="font-semibold">PDF</p>
              <p className="text-xs text-muted-foreground">
                Print-ready A4 layout
              </p>
            </div>
          </button>

          {/* DOCX */}
          <button
            type="button"
            disabled={exporting !== null}
            onClick={() => handleExport("docx")}
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 transition-all hover:border-primary hover:bg-primary/5 disabled:opacity-50"
          >
            {exporting === "docx" ? (
              <Loader2 className="size-10 animate-spin text-primary" />
            ) : (
              <FileText className="size-10 text-blue-500 transition-transform group-hover:scale-110" />
            )}
            <div className="text-center">
              <p className="font-semibold">DOCX</p>
              <p className="text-xs text-muted-foreground">
                Editable di Word
              </p>
            </div>
          </button>
        </div>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          Hasil export menggunakan template yang sedang aktif.
        </p>
      </DialogContent>
    </Dialog>
  );
}
