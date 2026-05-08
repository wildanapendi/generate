import type { Metadata } from "next";
import { GenerateForm } from "@/components/generate/generate-form";

export const metadata: Metadata = {
  title: "Generate dengan AI",
  description:
    "Buat modul praktikum lengkap dengan bantuan Gemini dalam hitungan menit.",
};

export default function GeneratePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Generate Modul dengan AI
        </h1>
        <p className="text-sm text-muted-foreground">
          Isi parameter di bawah, lalu Gemini akan menghasilkan modul lengkap
          (tujuan, dasar teori, prosedur, hasil, pembahasan, dan referensi).
        </p>
      </header>
      <GenerateForm />
    </div>
  );
}
