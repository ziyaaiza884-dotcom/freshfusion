"use client";

import { useEffect, useRef } from "react";

/**
 * A chilli-red thread that carries the beef story's red down the rest of the
 * home page: it drops from the bottom of the story, swings to the left
 * gutter and runs down the page, with a dot (and a dotted tie) at each
 * section heading. Purely decorative; measured from the rendered layout and
 * redrawn whenever the page's height or width changes.
 */

const RED = "#C1271A";
/** width of the storefront's content column (max-w-6xl) */
const CONTENT_MAX = 1152;

export function RedThread() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const main = svg?.closest("main");
    if (!svg || !main) return;

    const draw = () => {
      const story = main.querySelector(".pin-spacer") ?? main.querySelector(".ffs-stage");
      if (!story) return;
      const mainTop = main.getBoundingClientRect().top + window.scrollY;
      const W = main.clientWidth;
      const H = main.scrollHeight;
      const narrow = W < 768;
      const start = story.getBoundingClientRect().bottom + window.scrollY - mainTop;
      const end = H - 40;
      // left gutter beside the content column; inside the page padding on phones
      const x = narrow ? 6 : Math.max(18, (W - CONTENT_MAX) / 2 - 36);
      const cx = W / 2;
      const r = narrow ? 24 : 40;
      const drop = 30;

      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.style.height = `${H}px`;
      const d =
        `M${cx},${start} L${cx},${start + drop} ` +
        `Q${cx},${start + drop + r} ${cx - r},${start + drop + r} ` +
        `L${x + r},${start + drop + r} Q${x},${start + drop + r} ${x},${start + drop + 2 * r} ` +
        `L${x},${end}`;
      let inner = `<path d="${d}" fill="none" stroke="${RED}" stroke-width="${narrow ? 3 : 4}" stroke-linecap="round"/>`;
      main.querySelectorAll("section h2").forEach((h) => {
        if (h.closest(".ffs-stage")) return;
        const box = h.getBoundingClientRect();
        const y = box.top + window.scrollY - mainTop + box.height / 2;
        if (y < start + drop + 2 * r) return;
        inner += `<circle cx="${x}" cy="${y}" r="${narrow ? 5 : 9}" fill="${RED}"/>`;
        if (!narrow) {
          inner += `<line x1="${x}" y1="${y}" x2="${box.left - 14}" y2="${y}" stroke="${RED}" stroke-width="2" stroke-dasharray="3 6"/>`;
        }
      });
      svg.innerHTML = inner;
    };

    // the pinned story and lazy images settle after mount, and carousels or
    // fonts can change the page height later — redraw (debounced) on any of it
    let t = 0;
    const schedule = () => {
      window.clearTimeout(t);
      t = window.setTimeout(draw, 150);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(main);
    window.addEventListener("load", schedule);
    schedule();
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("load", schedule);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-[5] w-full"
    />
  );
}
