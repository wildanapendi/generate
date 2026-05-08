"use client";

import { useTemplateStore } from "@/stores/template-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { NumberField, TextField, Toggle } from "./designer-controls";

export function WatermarkDesigner() {
  const { config, set } = useTemplateStore();
  const w = config.watermark;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watermark</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Toggle
          label="Aktifkan watermark"
          checked={w.enabled}
          onCheckedChange={(v) => set("watermark", { enabled: v })}
        />
        {w.enabled && (
          <>
            <TextField
              label="Teks watermark"
              value={w.text}
              placeholder="DRAFT / RAHASIA / dll."
              onChange={(v) => set("watermark", { text: v || undefined })}
            />
            <TextField
              label="URL gambar (opsional)"
              value={w.imageUrl}
              onChange={(v) => set("watermark", { imageUrl: v || undefined })}
            />
            <NumberField
              label="Opacity"
              value={w.opacity}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => set("watermark", { opacity: v })}
            />
            <NumberField
              label="Rotasi"
              unit="deg"
              value={w.rotation}
              min={-90}
              max={90}
              step={5}
              onChange={(v) => set("watermark", { rotation: v })}
            />
            <div className="space-y-1.5">
              <Label className="text-xs">Posisi</Label>
              <Select
                value={w.position ?? "diagonal"}
                onValueChange={(v) =>
                  set("watermark", {
                    position: v as "center" | "diagonal",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diagonal">Diagonal</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
