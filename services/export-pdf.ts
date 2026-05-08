"use client";

/**
 * PDF export service using jsPDF.
 * Renders module content as a professional A4 academic document.
 */
import jsPDF from "jspdf";
import type { Module, ModuleContent, ModuleSection } from "@/types/module";
import {
  type TemplateConfig,
  PAGE_SIZES_MM,
  DEFAULT_TEMPLATE_CONFIG,
} from "@/types/template";

const LINE_HEIGHT_FACTOR = 1.4;

interface ExportPdfOptions {
  module: Module;
  template?: TemplateConfig;
}

/**
 * Generate a professional A4 PDF document from a module.
 * Returns a Blob suitable for downloading.
 */
export async function generatePdf({
  module,
  template = DEFAULT_TEMPLATE_CONFIG,
}: ExportPdfOptions): Promise<Blob> {
  const dim = PAGE_SIZES_MM[template.layout.pageSize];
  const isLandscape = template.layout.orientation === "landscape";
  const orientation = isLandscape ? "landscape" : "portrait";

  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: [dim.w, dim.h],
  });

  const pageW = isLandscape ? dim.h : dim.w;
  const pageH = isLandscape ? dim.w : dim.h;
  const ml = template.layout.marginLeft;
  const mr = template.layout.marginRight;
  const mt = template.layout.marginTop;
  const mb = template.layout.marginBottom;
  const contentW = pageW - ml - mr;
  const contentH = pageH - mt - mb;

  const fontFamily = getFontFamily(template.typography.fontFamily);
  const baseFontSize = template.typography.baseSize;

  let currentPage = 1;
  let cursorY = mt;

  // ── Helper: add watermark to current page ───────────────────────────
  function addWatermark() {
    if (!template.watermark.enabled || !template.watermark.text) return;
    doc.saveGraphicsState();
    const opacity = template.watermark.opacity ?? 0.08;
    // @ts-expect-error - jsPDF setGState for opacity
    doc.setGState(new doc.GState({ opacity }));
    doc.setFontSize(48);
    doc.setTextColor(150);
    const rotation = template.watermark.rotation ?? -30;
    doc.text(template.watermark.text, pageW / 2, pageH / 2, {
      align: "center",
      angle: rotation,
    });
    doc.restoreGraphicsState();
  }

  // ── Helper: add header ──────────────────────────────────────────────
  function addHeader(isFirst: boolean) {
    if (!template.header.enabled) return;
    if (isFirst && template.header.differentFirstPage) return;
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.setFont(fontFamily, "normal");
    const headerText = template.header.text ?? module.title ?? "";
    doc.text(headerText, ml, mt - 5, { maxWidth: contentW });
    doc.setDrawColor(200);
    doc.line(ml, mt - 2, pageW - mr, mt - 2);
  }

  // ── Helper: add footer ──────────────────────────────────────────────
  function addFooter(pageNum: number, totalPages: number) {
    if (!template.footer.enabled) return;
    const footerY = pageH - mb + 8;
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.setFont(fontFamily, "normal");

    if (template.footer.showPageNumber) {
      doc.text(`${pageNum}`, pageW / 2, footerY, { align: "center" });
    }
    if (template.footer.showCopyright && template.footer.copyright) {
      doc.text(template.footer.copyright, ml, footerY + 4, {
        maxWidth: contentW,
      });
    }
    doc.setDrawColor(200);
    doc.line(ml, footerY - 3, pageW - mr, footerY - 3);
  }

  // ── Helper: ensure space or add new page ────────────────────────────
  function ensureSpace(needed: number) {
    if (cursorY + needed > pageH - mb) {
      // Finish current page
      addWatermark();
      addFooter(currentPage, 0); // totalPages patched at end
      doc.addPage([dim.w, dim.h], orientation);
      currentPage++;
      cursorY = mt;
      addHeader(false);
    }
  }

  // ── Helper: write heading text ──────────────────────────────────────
  function writeHeading(text: string, level: 1 | 2 | 3 = 2) {
    const sizes: Record<number, number> = {
      1: baseFontSize * 1.6,
      2: baseFontSize * 1.3,
      3: baseFontSize * 1.1,
    };
    const size = sizes[level] ?? baseFontSize;
    doc.setFontSize(size);
    doc.setFont(fontFamily, "bold");
    doc.setTextColor(30);
    const lines = doc.splitTextToSize(text, contentW) as string[];
    const blockH = lines.length * size * 0.353 * LINE_HEIGHT_FACTOR + 4;
    ensureSpace(blockH);
    doc.text(lines, ml, cursorY + size * 0.353);
    cursorY += blockH;
  }

  // ── Helper: write body text ─────────────────────────────────────────
  function writeBody(text: string) {
    doc.setFontSize(baseFontSize);
    doc.setFont(fontFamily, "normal");
    doc.setTextColor(50);

    // Strip simple LaTeX for PDF body (KaTeX not available in jsPDF)
    const cleaned = text
      .replace(/\$\$(.*?)\$\$/g, "[$1]")
      .replace(/\$(.*?)\$/g, "[$1]");

    const lines = doc.splitTextToSize(cleaned, contentW) as string[];
    const lineH = baseFontSize * 0.353 * LINE_HEIGHT_FACTOR;

    for (const line of lines) {
      ensureSpace(lineH + 1);
      doc.text(line, ml, cursorY + baseFontSize * 0.353);
      cursorY += lineH;
    }
    cursorY += template.typography.paragraphSpacing * 0.353;
  }

  // ── COVER PAGE ──────────────────────────────────────────────────────
  if (template.cover.enabled) {
    // Background color
    if (template.cover.backgroundColor && template.cover.backgroundColor !== "#ffffff") {
      doc.setFillColor(template.cover.backgroundColor);
      doc.rect(0, 0, pageW, pageH, "F");
    }

    // Title
    doc.setFontSize(baseFontSize * 2.2);
    doc.setFont(fontFamily, "bold");
    doc.setTextColor(20);
    const titleLines = doc.splitTextToSize(
      module.title ?? "Modul Praktikum",
      contentW * 0.8,
    ) as string[];
    const titleStartY = pageH * 0.3;
    doc.text(titleLines, pageW / 2, titleStartY, { align: "center" });

    // Subject
    if (module.subject) {
      doc.setFontSize(baseFontSize * 1.3);
      doc.setFont(fontFamily, "normal");
      doc.setTextColor(80);
      doc.text(module.subject, pageW / 2, titleStartY + 25, {
        align: "center",
      });
    }

    // Metadata block
    let metaY = pageH * 0.55;
    doc.setFontSize(baseFontSize);
    doc.setTextColor(60);

    const metaItems = [
      module.lecturer && `Dosen: ${module.lecturer}`,
      module.program && `Program Studi: ${module.program}`,
      module.semester && `Semester: ${module.semester}`,
      module.lab && `Laboratorium: ${module.lab}`,
      module.academic_year && `Tahun Akademik: ${module.academic_year}`,
    ].filter(Boolean) as string[];

    for (const item of metaItems) {
      doc.text(item, pageW / 2, metaY, { align: "center" });
      metaY += 7;
    }

    addWatermark();
    // New page for content
    doc.addPage([dim.w, dim.h], orientation);
    currentPage++;
    cursorY = mt;
  }

  // ── TABLE OF CONTENTS ───────────────────────────────────────────────
  const content: ModuleContent =
    (module.content as unknown as ModuleContent) ?? { sections: [] };
  const sections = [...(content.sections ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  if (content.toc !== false && sections.length > 0) {
    addHeader(true);
    writeHeading("Daftar Isi", 1);

    doc.setFontSize(baseFontSize);
    doc.setFont(fontFamily, "normal");
    doc.setTextColor(50);

    let tocIdx = 1;
    for (const s of sections) {
      if (s.title) {
        const tocLine = `${tocIdx}. ${s.title}`;
        const lineH = baseFontSize * 0.353 * LINE_HEIGHT_FACTOR;
        ensureSpace(lineH + 1);
        doc.text(tocLine, ml + 5, cursorY + baseFontSize * 0.353);
        cursorY += lineH + 1;
        tocIdx++;
      }
    }

    addWatermark();
    addFooter(currentPage, 0);
    doc.addPage([dim.w, dim.h], orientation);
    currentPage++;
    cursorY = mt;
  }

  // ── CONTENT PAGES ───────────────────────────────────────────────────
  addHeader(false);

  let sectionIdx = 1;
  for (const section of sections) {
    // Section heading
    if (section.title) {
      writeHeading(`${sectionIdx}. ${section.title}`, 2);
      sectionIdx++;
    }

    // Section body
    if (section.content) {
      writeBody(section.content);
    }

    cursorY += 4; // spacing between sections
  }

  // Final page watermark & footer
  addWatermark();

  // ── Patch total page count in all footers ───────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  return doc.output("blob");
}

/**
 * Trigger browser download of the generated PDF.
 */
export async function downloadPdf(options: ExportPdfOptions): Promise<void> {
  const blob = await generatePdf(options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${options.module.title ?? "modul"}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Utility ─────────────────────────────────────────────────────────────
function getFontFamily(
  family: string,
): "helvetica" | "courier" | "times" {
  switch (family) {
    case "serif":
      return "times";
    case "mono":
      return "courier";
    default:
      return "helvetica";
  }
}
