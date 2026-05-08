"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Module } from "@/types/module";

type Patch = Partial<
  Pick<
    Module,
    | "title"
    | "code"
    | "subject"
    | "semester"
    | "program"
    | "lecturer"
    | "lab"
    | "academic_year"
    | "status"
  >
>;

interface MetadataFormProps {
  module: Module;
  onChange: (patch: Patch) => void;
}

export function ModuleMetadataForm({ module, onChange }: MetadataFormProps) {
  const fields: Array<{
    key: keyof Patch;
    label: string;
    placeholder?: string;
  }> = [
    { key: "title", label: "Judul Modul *" },
    { key: "code", label: "Kode" },
    { key: "subject", label: "Mata Kuliah" },
    { key: "semester", label: "Semester", placeholder: "Ganjil 2025/2026" },
    { key: "program", label: "Program Studi" },
    { key: "lecturer", label: "Dosen Pengampu" },
    { key: "lab", label: "Laboratorium" },
    { key: "academic_year", label: "Tahun Akademik" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {fields.map((f) => (
          <div key={String(f.key)} className="space-y-1.5">
            <Label htmlFor={`meta-${String(f.key)}`}>{f.label}</Label>
            <Input
              id={`meta-${String(f.key)}`}
              placeholder={f.placeholder}
              value={(module[f.key] as string | null) ?? ""}
              onChange={(e) =>
                onChange({ [f.key]: e.target.value || null } as Patch)
              }
            />
          </div>
        ))}
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={module.status}
            onValueChange={(v) =>
              onChange({ status: v as Module["status"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
