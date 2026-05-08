"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
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
import { useGenerateStore } from "@/stores/generate-store";
import { GenerateProgress } from "./generate-progress";

export function GenerateForm() {
  const router = useRouter();
  const { generate, stage } = useGenerateStore();
  const isRunning = stage !== "idle" && stage !== "done" && stage !== "error";

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [semester, setSemester] = useState("Ganjil 2025/2026");
  const [program, setProgram] = useState("");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [duration, setDuration] = useState(120);
  const [outcomes, setOutcomes] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !topic || !program) {
      toast.error("Lengkapi mata kuliah, topik, dan program studi.");
      return;
    }
    const learningOutcomes = outcomes
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const result = await generate({
      subject,
      topic,
      semester,
      program,
      difficulty,
      duration,
      learningOutcomes,
      language: "id",
    });

    if (result.ok && result.id) {
      toast.success("Modul berhasil dibuat");
      router.push(`/modules/${result.id}`);
      router.refresh();
    } else {
      toast.error("Gagal membuat modul", {
        description: result.message,
      });
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={onSubmit} className="space-y-5 lg:col-span-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subject">Mata Kuliah *</Label>
            <Input
              id="subject"
              placeholder="contoh: Algoritma & Struktur Data"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isRunning}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Topik Praktikum *</Label>
            <Input
              id="topic"
              placeholder="contoh: Implementasi Stack & Queue"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isRunning}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="program">Program Studi *</Label>
            <Input
              id="program"
              placeholder="contoh: S1 Informatika"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              disabled={isRunning}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Input
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              disabled={isRunning}
            />
          </div>
          <div className="space-y-2">
            <Label>Tingkat Kesulitan</Label>
            <Select
              value={difficulty}
              onValueChange={(v) =>
                setDifficulty(v as "beginner" | "intermediate" | "advanced")
              }
              disabled={isRunning}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Pemula</SelectItem>
                <SelectItem value="intermediate">Menengah</SelectItem>
                <SelectItem value="advanced">Lanjutan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Durasi (menit)</Label>
            <Input
              id="duration"
              type="number"
              min={30}
              max={480}
              step={15}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 120)}
              disabled={isRunning}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="outcomes">
            Capaian Pembelajaran{" "}
            <span className="text-muted-foreground">(satu per baris)</span>
          </Label>
          <Textarea
            id="outcomes"
            placeholder={`Mahasiswa mampu menjelaskan konsep stack\nMahasiswa mampu mengimplementasikan queue di Python`}
            value={outcomes}
            onChange={(e) => setOutcomes(e.target.value)}
            disabled={isRunning}
            rows={5}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto"
          disabled={isRunning}
        >
          <Sparkles className="size-4" />
          {isRunning ? "Sedang membuat…" : "Generate dengan AI"}
        </Button>
      </form>

      <GenerateProgress />
    </div>
  );
}
