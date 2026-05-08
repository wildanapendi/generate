"use client";

import { useTemplateStore } from "@/stores/template-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NumberField, TextField, Toggle } from "./designer-controls";

export function CoverDesigner() {
  const { config, set } = useTemplateStore();
  const c = config.cover;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cover</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Toggle
          label="Aktifkan halaman cover"
          checked={c.enabled}
          onCheckedChange={(v) => set("cover", { enabled: v })}
          description="Halaman judul ditampilkan sebagai halaman pertama."
        />
        {c.enabled && (
          <>
            <TextField
              label="Judul cover (opsional, override judul modul)"
              value={c.title}
              onChange={(v) => set("cover", { title: v || undefined })}
            />
            <TextField
              label="Subjudul"
              value={c.subtitle}
              onChange={(v) => set("cover", { subtitle: v || undefined })}
            />
            <TextField
              label="URL logo"
              value={c.logoUrl}
              placeholder="https://…"
              onChange={(v) => set("cover", { logoUrl: v || undefined })}
            />
            <NumberField
              label="Ukuran logo"
              unit="px"
              value={c.logoSize}
              min={32}
              max={256}
              step={4}
              onChange={(v) => set("cover", { logoSize: v })}
            />
            <TextField
              label="Warna background"
              value={c.backgroundColor}
              placeholder="#ffffff"
              onChange={(v) => set("cover", { backgroundColor: v })}
            />
            <Toggle
              label="Tampilkan dosen"
              checked={!!c.showLecturer}
              onCheckedChange={(v) => set("cover", { showLecturer: v })}
            />
            <Toggle
              label="Tampilkan program studi"
              checked={!!c.showProgram}
              onCheckedChange={(v) => set("cover", { showProgram: v })}
            />
            <Toggle
              label="Tampilkan tahun akademik"
              checked={!!c.showAcademicYear}
              onCheckedChange={(v) => set("cover", { showAcademicYear: v })}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
