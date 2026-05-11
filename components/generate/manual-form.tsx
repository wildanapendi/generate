"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, ChevronUp, ChevronDown, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { ModuleSection } from "@/types/module";

const SECTION_TYPES: Record<ModuleSection["type"], string> = {
  heading: "Heading",
  paragraph: "Paragraf",
  list: "Daftar",
  table: "Tabel",
  image: "Gambar",
  code: "Kode",
  formula: "Rumus",
  objective: "Tujuan",
  procedure: "Prosedur",
  result: "Hasil",
  discussion: "Pembahasan",
  reference: "Referensi",
};

interface SectionDraft {
  _key: string;
  type: ModuleSection["type"];
  title: string;
  content: string;
}

function generateSafeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function createEmptySection(): SectionDraft {
  return {
    _key: generateSafeId(),
    type: "paragraph",
    title: "",
    content: "",
  };
}

function getPlaceholderForType(type: ModuleSection["type"]): string {
  switch (type) {
    case "image":
      return "Masukkan URL gambar atau deksripsi gambar di sini...";
    case "code":
      return "Tulis kode program di sini...";
    case "list":
      return "Tulis daftar item (gunakan format markdown bullet - atau 1.)...";
    case "formula":
      return "Tulis rumus matematika (gunakan format LaTeX)...";
    case "table":
      return "Buat tabel menggunakan format markdown...";
    default:
      return "Tulis konten section di sini...";
  }
}

export function ManualForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // metadata modul
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [semester, setSemester] = useState("Ganjil 2025/2026");
  const [program, setProgram] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [lab, setLab] = useState("");
  const [code, setCode] = useState("");

  // sections - initialize empty to prevent hydration mismatch
  const [sections, setSections] = useState<SectionDraft[]>([]);

  // Hydrate initial section on client
  useEffect(() => {
    setSections([createEmptySection()]);
  }, []);

  function addSection() {
    setSections((prev) => [...prev, createEmptySection()]);
  }

  function removeSection(key: string) {
    setSections((prev) => prev.filter((s) => s._key !== key));
  }

  function updateSection(key: string, field: keyof SectionDraft, value: string) {
    setSections((prev) =>
      prev.map((s) => (s._key === key ? { ...s, [field]: value } : s)),
    );
  }

  function moveSection(key: string, direction: "up" | "down") {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s._key === key);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;

      const newSections = [...prev];
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      const temp = newSections[idx];
      newSections[idx] = newSections[targetIdx];
      newSections[targetIdx] = temp;
      return newSections;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul modul wajib diisi.");
      return;
    }

    const moduleSections: ModuleSection[] = sections
      .filter((s) => s.title.trim() || s.content.trim())
      .map((s, i) => ({
        id: generateSafeId(),
        type: s.type,
        title: s.title.trim(),
        content: s.content.trim(),
        order: i,
      }));

    setSaving(true);
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          code: code.trim() || null,
          subject: subject.trim() || null,
          semester: semester.trim() || null,
          program: program.trim() || null,
          lecturer: lecturer.trim() || null,
          lab: lab.trim() || null,
          content: {
            sections: moduleSections,
            toc: true,
            version: 1,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("CREATE_FAILED");
      }

      const data = (await res.json()) as { id: string };
      toast.success("Modul berhasil dibuat");
      router.push(`/modules/${data.id}`);
      router.refresh();
    } catch {
      toast.error("Gagal membuat modul. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Metadata modul */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="manual-title">Judul Modul *</Label>
          <Input
            id="manual-title"
            placeholder="contoh: Modul Praktikum Stack & Queue"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-code">Kode Modul</Label>
          <Input
            id="manual-code"
            placeholder="contoh: ASD-03"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-subject">Mata Kuliah</Label>
          <Input
            id="manual-subject"
            placeholder="contoh: Algoritma & Struktur Data"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-topic">Topik</Label>
          <Input
            id="manual-topic"
            placeholder="contoh: Implementasi Stack & Queue"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-program">Program Studi</Label>
          <Input
            id="manual-program"
            placeholder="contoh: S1 Informatika"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-semester">Semester</Label>
          <Input
            id="manual-semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-lecturer">Dosen Pengampu</Label>
          <Input
            id="manual-lecturer"
            placeholder="contoh: Dr. Budi Santoso, M.Kom."
            value={lecturer}
            onChange={(e) => setLecturer(e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manual-lab">Laboratorium</Label>
          <Input
            id="manual-lab"
            placeholder="contoh: Lab Pemrograman Dasar"
            value={lab}
            onChange={(e) => setLab(e.target.value)}
            disabled={saving}
          />
        </div>
      </div>

      {/* Section builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Konten Section</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSection}
            disabled={saving}
          >
            <Plus className="size-4" />
            Tambah Section
          </Button>
        </div>

        {sections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Belum ada section. Klik "Tambah Section" untuk mulai menulis
                konten modul.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sections.map((section, idx) => (
              <Card key={section._key}>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
                  <span className="text-xs font-medium text-muted-foreground w-6 text-center">
                    #{idx + 1}
                  </span>
                  <div className="flex flex-1 items-center gap-2">
                    <Select
                      value={section.type}
                      onValueChange={(v) =>
                        updateSection(
                          section._key,
                          "type",
                          v as ModuleSection["type"],
                        )
                      }
                      disabled={saving}
                    >
                      <SelectTrigger className="h-8 w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SECTION_TYPES).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => moveSection(section._key, "up")}
                      disabled={saving || idx === 0}
                      aria-label="Pindah ke atas"
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => moveSection(section._key, "down")}
                      disabled={saving || idx === sections.length - 1}
                      aria-label="Pindah ke bawah"
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSection(section._key)}
                      disabled={saving}
                      aria-label="Hapus section"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <Input
                    placeholder="Judul section"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(section._key, "title", e.target.value)
                    }
                    disabled={saving}
                  />
                  <Textarea
                    placeholder={getPlaceholderForType(section.type)}
                    value={section.content}
                    onChange={(e) =>
                      updateSection(section._key, "content", e.target.value)
                    }
                    disabled={saving}
                    rows={4}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={saving}
      >
        <Save className="size-4" />
        {saving ? "Menyimpan..." : "Simpan Modul"}
      </Button>
    </form>
  );
}
