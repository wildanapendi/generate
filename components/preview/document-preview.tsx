"use client";

import { useEffect, useRef, useState } from "react";
import type { Module, ModuleContent, ModuleSection } from "@/types/module";
import {
  type TemplateConfig,
  PAGE_SIZES_MM,
  DEFAULT_TEMPLATE_CONFIG,
} from "@/types/template";
import { CoverPage } from "./cover-page";
import { TableOfContents } from "./table-of-contents";
import { SectionBlock } from "./section-block";
import { PageHeader, PageFooter } from "./header-footer";
import { Watermark } from "./watermark";
import { cn } from "@/lib/utils";

interface DocumentPreviewProps {
  module: Module;
  template?: TemplateConfig;
  className?: string;
  /** Container scale (e.g. 0.85 to fit in editor split-view) */
  scale?: number;
}

const MM_TO_PX = 96 / 25.4; // 1mm at 96dpi

export function DocumentPreview({
  module,
  template: rawTemplate,
  className,
  scale = 1,
}: DocumentPreviewProps) {
  // Deep-merge dengan default config agar setiap sub-object selalu terdefinisi,
  // mencegah crash saat store belum hydrate atau config dari DB tidak lengkap.
  const template: TemplateConfig = {
    cover: { ...DEFAULT_TEMPLATE_CONFIG.cover, ...rawTemplate?.cover },
    header: { ...DEFAULT_TEMPLATE_CONFIG.header, ...rawTemplate?.header },
    footer: { ...DEFAULT_TEMPLATE_CONFIG.footer, ...rawTemplate?.footer },
    watermark: { ...DEFAULT_TEMPLATE_CONFIG.watermark, ...rawTemplate?.watermark },
    layout: { ...DEFAULT_TEMPLATE_CONFIG.layout, ...rawTemplate?.layout },
    typography: { ...DEFAULT_TEMPLATE_CONFIG.typography, ...rawTemplate?.typography },
  };

  const content = (module.content as unknown as ModuleContent) ?? {
    sections: [],
  };
  const sections = [...(content.sections ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const dim = PAGE_SIZES_MM[template.layout.pageSize];
  const isLandscape = template.layout.orientation === "landscape";
  const widthMm = isLandscape ? dim.h : dim.w;
  const heightMm = isLandscape ? dim.w : dim.h;
  const pageWidth = widthMm * MM_TO_PX;
  const pageHeight = heightMm * MM_TO_PX;

  const innerHeight =
    pageHeight -
    (template.layout.marginTop + template.layout.marginBottom) * MM_TO_PX -
    (template.header.enabled ? (template.header.height ?? 48) + 8 : 0) -
    32; /* footer reserve */

  // Measure section blocks and group into pages.
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<number[][]>([sections.map((_, i) => i)]);

  useEffect(() => {
    const root = measureRef.current;
    if (!root) return;

    function compute() {
      if (!root) return;
      const els = Array.from(
        root.querySelectorAll<HTMLElement>("[data-section-block]"),
      );
      if (els.length === 0) {
        setPages([[]]);
        return;
      }
      const result: number[][] = [];
      let current: number[] = [];
      let used = 0;
      els.forEach((el, i) => {
        const h = el.offsetHeight + 16;
        if (used + h > innerHeight && current.length > 0) {
          result.push(current);
          current = [];
          used = 0;
        }
        current.push(i);
        used += h;
      });
      if (current.length > 0) result.push(current);
      setPages(result);
    }

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(root);
    Array.from(root.children).forEach((c) => ro.observe(c as Element));
    return () => ro.disconnect();
  }, [innerHeight, sections.length]);

  // Page list: cover (optional), TOC, then content pages.
  const totalPages =
    (template.cover.enabled ? 1 : 0) +
    (content.toc !== false ? 1 : 0) +
    pages.length;

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* Off-screen measurement */}
      <div
        ref={measureRef}
        className="invisible absolute -left-[9999px] top-0"
        style={{ width: pageWidth - (template.layout.marginLeft + template.layout.marginRight) * MM_TO_PX }}
      >
        {sections.map((s, i) => (
          <div key={s.id} data-section-block>
            <SectionBlock section={s} index={i} />
          </div>
        ))}
      </div>

      {/* Cover */}
      {template.cover.enabled && (
        <Page
          width={pageWidth}
          height={pageHeight}
          scale={scale}
          template={template}
          pageNumber={1}
          pageCount={totalPages}
          isFirst
        >
          <CoverPage module={module} config={template.cover} />
        </Page>
      )}

      {/* TOC */}
      {content.toc !== false && (
        <Page
          width={pageWidth}
          height={pageHeight}
          scale={scale}
          template={template}
          pageNumber={template.cover.enabled ? 2 : 1}
          pageCount={totalPages}
        >
          <TableOfContents sections={sections} />
        </Page>
      )}

      {/* Content pages */}
      {pages.map((idxs, pi) => {
        const pageNumber =
          (template.cover.enabled ? 1 : 0) +
          (content.toc !== false ? 1 : 0) +
          pi +
          1;
        return (
          <Page
            key={pi}
            width={pageWidth}
            height={pageHeight}
            scale={scale}
            template={template}
            pageNumber={pageNumber}
            pageCount={totalPages}
          >
            <div className="space-y-4">
              {idxs.map((i) => {
                const s = sections[i] as ModuleSection | undefined;
                if (!s) return null;
                return <SectionBlock key={s.id} section={s} index={i} />;
              })}
            </div>
          </Page>
        );
      })}
    </div>
  );
}

interface PageProps {
  width: number;
  height: number;
  scale: number;
  template: TemplateConfig;
  pageNumber: number;
  pageCount: number;
  isFirst?: boolean;
  children: React.ReactNode;
}

function Page({
  width,
  height,
  scale,
  template,
  pageNumber,
  pageCount,
  isFirst,
  children,
}: PageProps) {
  return (
    <div
      className="relative bg-white text-black shadow-md ring-1 ring-border dark:bg-zinc-100"
      style={{
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        paddingTop: template.layout.marginTop * MM_TO_PX,
        paddingRight: template.layout.marginRight * MM_TO_PX,
        paddingBottom: template.layout.marginBottom * MM_TO_PX,
        paddingLeft: template.layout.marginLeft * MM_TO_PX,
        fontFamily:
          template.typography.fontFamily === "serif"
            ? "Georgia, serif"
            : template.typography.fontFamily === "mono"
              ? "ui-monospace, monospace"
              : "var(--font-sans), Inter, system-ui, sans-serif",
        fontSize: template.typography.baseSize,
      }}
    >
      <Watermark config={template.watermark} />
      <div className="relative z-10 flex h-full flex-col">
        <PageHeader config={template.header} isFirstPage={isFirst} />
        <div className="flex-1 overflow-hidden">{children}</div>
        <PageFooter
          config={template.footer}
          pageNumber={pageNumber}
          pageCount={pageCount}
        />
      </div>
    </div>
  );
}
