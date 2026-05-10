import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTemplateById } from "@/services/templates";
import { TemplateDesigner } from "@/components/template/template-designer";
import type { Module, ModuleContent } from "@/types/module";

export const metadata: Metadata = { title: "Template Designer" };

/**
 * Provide a minimal sample module so the live preview has something to render.
 * In a real scenario this could come from the user's latest draft.
 */
function buildSampleModule(): Module {
  const sampleContent: ModuleContent = {
    sections: [
      {
        id: "s1",
        type: "heading",
        title: "Tujuan Praktikum",
        content:
          "Memahami konsep dasar pengukuran dan analisis data laboratorium.",
        order: 1,
      },
      {
        id: "s2",
        type: "paragraph",
        title: "Dasar Teori",
        content:
          "Dalam praktikum ini mahasiswa akan mempelajari prinsip-prinsip dasar pengukuran menggunakan alat laboratorium standar. Teori pengukuran mencakup konsep ketidakpastian, presisi, dan akurasi.",
        order: 2,
      },
      {
        id: "s3",
        type: "procedure",
        title: "Langkah Praktikum",
        content:
          "1. Siapkan alat dan bahan yang diperlukan\n2. Lakukan kalibrasi alat ukur\n3. Catat hasil pengukuran pada tabel pengamatan\n4. Analisis data yang diperoleh",
        order: 3,
      },
      {
        id: "s4",
        type: "formula",
        title: "Rumus Perhitungan",
        content:
          "Gunakan rumus berikut untuk menghitung rata-rata: $\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i$",
        order: 4,
      },
      {
        id: "s5",
        type: "reference",
        title: "Daftar Pustaka",
        content:
          "1. Sutrisno, H. (2024). Fisika Dasar Laboratorium. Penerbit Erlangga.\n2. Tipler, P. (2023). Physics for Scientists and Engineers. W.H. Freeman.",
        order: 5,
      },
    ],
    toc: true,
    version: 1,
  };

  return {
    id: "sample",
    user_id: "sample",
    template_id: null,
    title: "Modul Praktikum - Contoh",
    code: "PRAK-001",
    subject: "Fisika Dasar",
    semester: "Ganjil 2025/2026",
    program: "Teknik Informatika",
    lecturer: "Dr. Contoh Dosen",
    lab: "Lab Fisika Dasar",
    academic_year: "2025/2026",
    status: "draft",
    content: sampleContent as unknown as Module["content"],
    metadata: {} as Module["metadata"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Template designer page (admin only).
 * Guard sudah di-handle oleh templates/layout.tsx via requireRole('admin').
 */
export default async function TemplateDesignerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplateById(id);

  if (!template) {
    notFound();
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] max-w-screen-2xl flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Template Designer
        </h1>
        <p className="text-sm text-muted-foreground">
          Desain layout dokumen secara visual dengan live preview realtime.
        </p>
      </header>

      <TemplateDesigner template={template} sampleModule={buildSampleModule()} />
    </div>
  );
}

