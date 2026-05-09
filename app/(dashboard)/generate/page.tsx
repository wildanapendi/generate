import type { Metadata } from "next";
import { GenerateModeTabs } from "@/components/generate/generate-mode-tabs";

export const metadata: Metadata = {
  title: "Generate Modul",
  description:
    "Buat modul praktikum dengan AI atau tulis secara manual.",
};

export default function GeneratePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Generate Modul
        </h1>
        <p className="text-sm text-muted-foreground">
          Buat modul praktikum menggunakan AI atau tulis konten secara manual.
        </p>
      </header>
      <GenerateModeTabs />
    </div>
  );
}
