"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Heuristic pagination: measures rendered children inside the container
 * and groups them into pages of `pageHeight` pixels.
 *
 * Caller renders a list of "blocks" (one per child) and we tell them which
 * page each block lands on.
 */
export function usePagination(opts: {
  pageHeight: number; // px
  blockCount: number; // total blocks
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<number[][]>([[0]]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function recompute() {
      if (!el) return;
      const blocks = Array.from(
        el.querySelectorAll<HTMLElement>("[data-block]"),
      );
      if (blocks.length === 0) {
        setPages([[]]);
        return;
      }
      const result: number[][] = [];
      let current: number[] = [];
      let used = 0;
      blocks.forEach((b, i) => {
        const h = b.offsetHeight + 12; // small gap
        if (used + h > opts.pageHeight && current.length > 0) {
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

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [opts.pageHeight, opts.blockCount]);

  const pageCount = useMemo(() => Math.max(1, pages.length), [pages]);

  return { containerRef, pages, pageCount };
}
