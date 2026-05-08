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
import { NumberField } from "./designer-controls";
import type { LayoutConfig, TypographyConfig } from "@/types/template";

export function LayoutDesigner() {
  const { config, set } = useTemplateStore();
  const l = config.layout;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Layout Halaman</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Ukuran kertas</Label>
          <Select
            value={l.pageSize}
            onValueChange={(v) =>
              set("layout", { pageSize: v as LayoutConfig["pageSize"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="F4">F4</SelectItem>
              <SelectItem value="Letter">Letter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Orientasi</Label>
          <Select
            value={l.orientation}
            onValueChange={(v) =>
              set("layout", {
                orientation: v as LayoutConfig["orientation"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <NumberField
          label="Margin atas"
          unit="mm"
          value={l.marginTop}
          min={0}
          max={50}
          onChange={(v) => set("layout", { marginTop: v })}
        />
        <NumberField
          label="Margin bawah"
          unit="mm"
          value={l.marginBottom}
          min={0}
          max={50}
          onChange={(v) => set("layout", { marginBottom: v })}
        />
        <NumberField
          label="Margin kiri"
          unit="mm"
          value={l.marginLeft}
          min={0}
          max={50}
          onChange={(v) => set("layout", { marginLeft: v })}
        />
        <NumberField
          label="Margin kanan"
          unit="mm"
          value={l.marginRight}
          min={0}
          max={50}
          onChange={(v) => set("layout", { marginRight: v })}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Kolom</Label>
          <Select
            value={String(l.columns)}
            onValueChange={(v) =>
              set("layout", { columns: Number(v) as 1 | 2 })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Satu kolom</SelectItem>
              <SelectItem value="2">Dua kolom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <NumberField
          label="Spasi baris"
          value={l.lineSpacing}
          min={1}
          max={3}
          step={0.1}
          onChange={(v) => set("layout", { lineSpacing: v })}
        />
      </CardContent>
    </Card>
  );
}

export function TypographyDesigner() {
  const { config, set } = useTemplateStore();
  const t = config.typography;
  const opts: Array<TypographyConfig["fontFamily"]> = [
    "inter",
    "poppins",
    "serif",
    "mono",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipografi</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">Font tubuh</Label>
          <Select
            value={t.fontFamily}
            onValueChange={(v) =>
              set("typography", {
                fontFamily: v as TypographyConfig["fontFamily"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {opts.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <NumberField
          label="Ukuran dasar"
          unit="px"
          value={t.baseSize}
          min={9}
          max={18}
          onChange={(v) => set("typography", { baseSize: v })}
        />
        <NumberField
          label="Skala heading"
          value={t.headingScale}
          min={1}
          max={2}
          step={0.05}
          onChange={(v) => set("typography", { headingScale: v })}
        />
        <NumberField
          label="Spasi paragraf"
          unit="px"
          value={t.paragraphSpacing}
          min={0}
          max={24}
          onChange={(v) => set("typography", { paragraphSpacing: v })}
        />
      </CardContent>
    </Card>
  );
}
