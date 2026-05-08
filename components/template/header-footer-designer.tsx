"use client";

import { useTemplateStore } from "@/stores/template-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NumberField, TextField, Toggle } from "./designer-controls";

export function HeaderDesigner() {
  const { config, set } = useTemplateStore();
  const h = config.header;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Header Halaman</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Toggle
          label="Aktifkan header"
          checked={h.enabled}
          onCheckedChange={(v) => set("header", { enabled: v })}
        />
        {h.enabled && (
          <>
            <TextField
              label="Teks header"
              value={h.text}
              onChange={(v) => set("header", { text: v || undefined })}
            />
            <Toggle
              label="Tampilkan logo"
              checked={!!h.showLogo}
              onCheckedChange={(v) => set("header", { showLogo: v })}
            />
            {h.showLogo && (
              <TextField
                label="URL logo header"
                value={h.logoUrl}
                onChange={(v) => set("header", { logoUrl: v || undefined })}
              />
            )}
            <NumberField
              label="Tinggi header"
              unit="px"
              value={h.height}
              min={32}
              max={120}
              onChange={(v) => set("header", { height: v })}
            />
            <Toggle
              label="Halaman pertama berbeda"
              description="Header tidak ditampilkan di halaman pertama."
              checked={!!h.differentFirstPage}
              onCheckedChange={(v) =>
                set("header", { differentFirstPage: v })
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function FooterDesigner() {
  const { config, set } = useTemplateStore();
  const f = config.footer;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Footer Halaman</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Toggle
          label="Aktifkan footer"
          checked={f.enabled}
          onCheckedChange={(v) => set("footer", { enabled: v })}
        />
        {f.enabled && (
          <>
            <TextField
              label="Teks footer"
              value={f.text}
              onChange={(v) => set("footer", { text: v || undefined })}
            />
            <Toggle
              label="Tampilkan nomor halaman"
              checked={!!f.showPageNumber}
              onCheckedChange={(v) => set("footer", { showPageNumber: v })}
            />
            <Toggle
              label="Tampilkan copyright"
              checked={!!f.showCopyright}
              onCheckedChange={(v) => set("footer", { showCopyright: v })}
            />
            {f.showCopyright && (
              <TextField
                label="Teks copyright"
                value={f.copyright}
                placeholder="© 2026 Nama Kampus"
                onChange={(v) => set("footer", { copyright: v || undefined })}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
