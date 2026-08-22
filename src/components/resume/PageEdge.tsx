"use client";

import { useEffect, useRef, useState } from "react";

// 1in = 96 CSS px (W3C-fixed, independent of device DPR).
const PAGE_PX = 11 * 96;
// Same threshold as Tailwind `md` and `ResumeScaler`: below this width the
// article is responsive, not a letter-size print preview.
const PAGE_LAYOUT_MIN_WIDTH_PX = 768;

function countCharsBelow(article: HTMLElement, boundaryY: number): number {
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let count = 0;
  let node: Node | null = walker.nextNode();
  while (node) {
    const text = node.nodeValue ?? "";
    if (text.length > 0) {
      range.selectNodeContents(node);
      const rect = range.getBoundingClientRect();
      if (rect.bottom > boundaryY) {
        if (rect.top >= boundaryY) {
          count += text.length;
        } else {
          let lo = 0;
          let hi = text.length;
          while (lo < hi) {
            const mid = (lo + hi) >>> 1;
            range.setStart(node, mid);
            range.setEnd(node, Math.min(mid + 1, text.length));
            const r = range.getBoundingClientRect();
            if (r.top >= boundaryY) hi = mid;
            else lo = mid + 1;
          }
          count += text.length - lo;
        }
      }
    }
    node = walker.nextNode();
  }
  return count;
}

export function PageEdge() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [overflowChars, setOverflowChars] = useState(0);
  const [isPageLayoutViewport, setIsPageLayoutViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${PAGE_LAYOUT_MIN_WIDTH_PX}px)`);
    const sync = () => setIsPageLayoutViewport(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const article = anchorRef.current?.closest("article");
    if (!article) return;

    const measure = () => {
      const rect = article.getBoundingClientRect();
      const overflow = Math.max(0, rect.height - PAGE_PX);
      if (overflow > 0) {
        const boundaryY = rect.top + PAGE_PX;
        setOverflowChars(countCharsBelow(article, boundaryY));
      } else {
        setOverflowChars(0);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(article);
    return () => ro.disconnect();
  }, []);

  const showWarning = overflowChars > 0 && isPageLayoutViewport;

  if (!showWarning) {
    return <div ref={anchorRef} className="hidden" />;
  }

  return (
    <div
      ref={anchorRef}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-[11in] border-t-2 border-dashed border-red-500/80 print:hidden">
      <span className="absolute -top-[10pt] right-0 pr-[0.2in] text-[7pt] font-semibold uppercase tracking-[0.08em] text-red-600 bg-red-950/80 px-1 py-0.5 rounded-md backdrop-blur">
        ~{overflowChars} char{overflowChars === 1 ? "" : "s"} overflow
      </span>
    </div>
  );
}
