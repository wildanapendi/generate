"use client";

/**
 * DOCX export service using the `docx` npm package.
 * Generates a Word-compatible .docx file from module content.
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  TableOfContents,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  AlignmentType,
  SectionType,
  ImageRun,
  TabStopType,
  TabStopPosition,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import type { Module, ModuleContent, ModuleSection } from "@/types/module";
import {
  type TemplateConfig,
  PAGE_SIZES_MM,
  DEFAULT_TEMPLATE_CONFIG,
} from "@/types/template";
import { containsLatex, extractLatexFormulas } from "./latex-to-omml";

interface ExportDocxOptions {
  module: Module;
  template?: TemplateConfig;
}

/**
 * Generate a professional DOCX document from a module.
 * Returns a Blob suitable for downloading.
 */
export async function generateDocx({
  module,
  template = DEFAULT_TEMPLATE_CONFIG,
}: ExportDocxOptions): Promise<Blob> {
  const dim = PAGE_SIZES_MM[template.layout.pageSize];
  const isLandscape = template.layout.orientation === "landscape";
  const pageW = isLandscape ? dim.h : dim.w;
  const pageH = isLandscape ? dim.w : dim.h;

  const content: ModuleContent =
    (module.content as unknown as ModuleContent) ?? { sections: [] };
  const sections = [...(content.sections ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const baseFontSize = template.typography.baseSize * 2; // half-points
  const headingFontSize = Math.round(
    baseFontSize * template.typography.headingScale,
  );

  // ── Build document paragraphs ──────────────────────────────────────
  const paragraphs: Paragraph[] = [];

  // Cover page
  if (template.cover.enabled) {
    paragraphs.push(
      new Paragraph({ spacing: { before: 3000 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: module.title ?? "Modul Praktikum",
            bold: true,
            size: Math.round(baseFontSize * 2),
            font: getFontName(template.typography.fontFamily),
          }),
        ],
      }),
    );

    if (module.subject) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: module.subject,
              size: Math.round(baseFontSize * 1.3),
              font: getFontName(template.typography.fontFamily),
              color: "555555",
            }),
          ],
        }),
      );
    }

    // Metadata
    const metaLines = [
      module.lecturer && `Dosen: ${module.lecturer}`,
      module.program && `Program Studi: ${module.program}`,
      module.semester && `Semester: ${module.semester}`,
      module.lab && `Laboratorium: ${module.lab}`,
      module.academic_year && `Tahun Akademik: ${module.academic_year}`,
    ].filter(Boolean) as string[];

    paragraphs.push(new Paragraph({ spacing: { before: 1000 } }));

    for (const line of metaLines) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: line,
              size: baseFontSize,
              font: getFontName(template.typography.fontFamily),
              color: "666666",
            }),
          ],
        }),
      );
    }

    // Page break after cover
    paragraphs.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
    );
  }

  // Table of Contents
  if (content.toc !== false && sections.length > 0) {
    paragraphs.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: "Daftar Isi",
            bold: true,
            size: headingFontSize,
            font: getFontName(
              template.typography.headingFamily ??
                template.typography.fontFamily,
            ),
          }),
        ],
      }),
      new TableOfContents("Daftar Isi", {
        hyperlink: true,
        headingStyleRange: "1-3",
      }),
      new Paragraph({
        children: [new PageBreak()],
      }),
    );
  }

  // Content sections
  let sectionIdx = 1;
  for (const section of sections) {
    // Section heading
    if (section.title) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          children: [
            new TextRun({
              text: `${sectionIdx}. ${section.title}`,
              bold: true,
              size: headingFontSize,
              font: getFontName(
                template.typography.headingFamily ??
                  template.typography.fontFamily,
              ),
            }),
          ],
        }),
      );
      sectionIdx++;
    }

    // Section content
    if (section.content) {
      const contentParagraphs = parseContentToParagraphs(
        section,
        baseFontSize,
        template,
      );
      paragraphs.push(...contentParagraphs);
    }
  }

  // ── Build the Document ─────────────────────────────────────────────
  const doc = new Document({
    creator: module.lecturer ?? "Modul Praktikum Generator",
    title: module.title ?? "Modul Praktikum",
    description: `Modul praktikum ${module.subject ?? ""}`,
    sections: [
      {
        properties: {
          page: {
            size: {
              width: `${pageW}mm`,
              height: `${pageH}mm`,
              orientation: isLandscape ? "landscape" : undefined,
            },
            margin: {
              top: `${template.layout.marginTop}mm`,
              right: `${template.layout.marginRight}mm`,
              bottom: `${template.layout.marginBottom}mm`,
              left: `${template.layout.marginLeft}mm`,
            },
          },
          titlePage: template.header.differentFirstPage,
        },
        headers: template.header.enabled
          ? {
              default: new Header({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: template.header.text ?? module.title ?? "",
                        size: 16,
                        color: "888888",
                        font: getFontName(template.typography.fontFamily),
                      }),
                    ],
                  }),
                ],
              }),
            }
          : undefined,
        footers: template.footer.enabled
          ? {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      ...(template.footer.showPageNumber
                        ? [
                            new TextRun({
                              children: [PageNumber.CURRENT],
                              size: 16,
                              color: "888888",
                            }),
                          ]
                        : []),
                    ],
                  }),
                  ...(template.footer.showCopyright && template.footer.copyright
                    ? [
                        new Paragraph({
                          alignment: AlignmentType.LEFT,
                          children: [
                            new TextRun({
                              text: template.footer.copyright,
                              size: 14,
                              color: "AAAAAA",
                            }),
                          ],
                        }),
                      ]
                    : []),
                ],
              }),
            }
          : undefined,
        children: paragraphs,
      },
    ],
  });

  return Packer.toBlob(doc);
}

/**
 * Trigger browser download of the generated DOCX.
 */
export async function downloadDocx(options: ExportDocxOptions): Promise<void> {
  const blob = await generateDocx(options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${options.module.title ?? "modul"}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Parse content into docx Paragraphs ────────────────────────────────

function parseContentToParagraphs(
  section: ModuleSection,
  baseFontSize: number,
  template: TemplateConfig,
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const fontName = getFontName(template.typography.fontFamily);

  // Split by newlines for basic paragraph separation
  const lines = section.content.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    const trimmed = line.trim();

    // Numbered list items
    if (/^\d+\.\s/.test(trimmed)) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: trimmed,
              size: baseFontSize,
              font: fontName,
            }),
          ],
        }),
      );
      continue;
    }

    // Bullet list items
    if (/^[-*]\s/.test(trimmed)) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 60 },
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: trimmed.replace(/^[-*]\s/, ""),
              size: baseFontSize,
              font: fontName,
            }),
          ],
        }),
      );
      continue;
    }

    // Lines with LaTeX
    if (containsLatex(trimmed)) {
      const runs = parseLatexLine(trimmed, baseFontSize, fontName);
      paragraphs.push(
        new Paragraph({
          spacing: {
            after: Math.round(template.typography.paragraphSpacing * 20),
          },
          children: runs,
        }),
      );
      continue;
    }

    // Regular paragraph
    paragraphs.push(
      new Paragraph({
        spacing: {
          after: Math.round(template.typography.paragraphSpacing * 20),
        },
        children: [
          new TextRun({
            text: trimmed,
            size: baseFontSize,
            font: fontName,
          }),
        ],
      }),
    );
  }

  return paragraphs;
}

/**
 * Parse a line containing LaTeX into TextRun[] with formulas as italic text.
 * (Full OMML integration requires xml injection which is complex;
 *  this approach renders formulas as styled italic text as a practical fallback.)
 */
function parseLatexLine(
  line: string,
  fontSize: number,
  fontName: string,
): TextRun[] {
  const runs: TextRun[] = [];
  // Split on block math first, then inline
  const parts = line.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);

  for (const part of parts) {
    if (!part) continue;

    // Block math $$...$$
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const formula = part.slice(2, -2).trim();
      runs.push(
        new TextRun({
          text: `[ ${cleanLatexForText(formula)} ]`,
          italics: true,
          size: fontSize,
          font: "Cambria Math",
        }),
      );
      continue;
    }

    // Inline math $...$
    if (part.startsWith("$") && part.endsWith("$")) {
      const formula = part.slice(1, -1).trim();
      runs.push(
        new TextRun({
          text: cleanLatexForText(formula),
          italics: true,
          size: fontSize,
          font: "Cambria Math",
        }),
      );
      continue;
    }

    // Plain text
    runs.push(
      new TextRun({
        text: part,
        size: fontSize,
        font: fontName,
      }),
    );
  }

  return runs;
}

/** Clean LaTeX commands to a readable text representation. */
function cleanLatexForText(latex: string): string {
  return latex
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1/$2)")
    .replace(/\\sqrt\{([^}]*)\}/g, "√($1)")
    .replace(/\\sum/g, "Σ")
    .replace(/\\int/g, "∫")
    .replace(/\\prod/g, "∏")
    .replace(/\\infty/g, "∞")
    .replace(/\\partial/g, "∂")
    .replace(/\\alpha/g, "α").replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ").replace(/\\delta/g, "δ")
    .replace(/\\theta/g, "θ").replace(/\\pi/g, "π")
    .replace(/\\sigma/g, "σ").replace(/\\omega/g, "ω")
    .replace(/\\bar\{([^}]*)\}/g, "$1̄")
    .replace(/\\hat\{([^}]*)\}/g, "$1̂")
    .replace(/\\_/g, "_")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getFontName(family: string): string {
  switch (family) {
    case "poppins":
      return "Poppins";
    case "serif":
      return "Times New Roman";
    case "mono":
      return "Courier New";
    default:
      return "Inter";
  }
}
