"use client";

import { useEffect, useRef, useState } from "react";
import "@fontsource/anton/400.css";
import "@fontsource/chilanka/400.css";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/600.css";
import "@fontsource/figtree/800.css";
import "@fontsource/noto-sans-malayalam/500.css";
import "@fontsource/noto-sans-malayalam/700.css";
import "./beef-story.css";
import type { Product } from "@/data/types";
import { useCart } from "@/context/cart-context";
import { shopOrderWhatsAppUrl } from "@/lib/contact";
import { CalendarDays, Flame, PackageCheck, ShieldCheck } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/format";

/**
 * Cinematic scroll story for the beef pickle, pinned at the top of the home
 * page (from freshfusion-scroll-pack). GSAP + ScrollTrigger drive one
 * scrubbed timeline: sketch draws → real jar → ingredients fly out and back
 * → process panel → brand reveal → jar spin + order card.
 *
 * Each size is its own real store product, so "Add to cart" adds that exact
 * product and WhatsApp orders quote its real ₹ price. Hidden on veg-only
 * festival themes by the home page (not rendered at all).
 */

export interface BeefVariant {
  /** e.g. "500 g" */
  label: string;
  product: Product;
}

const IMG = "/scroll-story/img";
const SPIN = Array.from(
  { length: 60 },
  (_, i) => `${IMG}/spin/s${String(i).padStart(2, "0")}.webp`,
);

const INGREDIENTS = [
  { key: "beef", en: "Beef", ml: "ബീഫ്" },
  { key: "chilli", en: "Kashmiri chilli", ml: "മുളക്" },
  { key: "curry", en: "Curry leaves", ml: "കറിവേപ്പില" },
  { key: "garlic", en: "Garlic", ml: "വെളുത്തുള്ളി" },
  { key: "ginger", en: "Ginger", ml: "ഇഞ്ചി" },
  { key: "mustard", en: "Mustard seeds", ml: "കടുക്" },
];

const TICKER = [
  "SLOW-ROASTED BEEF •",
  "PURE COCONUT OIL •",
  "KASHMIRI CHILLI •",
  "NO PRESERVATIVES •",
  "KERALA HOME RECIPE •",
];

/** hand-traced jar outline, drawn on scroll */
const JAR_PATHS = [
  "M50 23 L43 29 L29 34 L26 39 L25 100 L29 104 L52 108 L52 116 L57 120 L52 126 L51 135 L61 144 L61 156 L54 171 L24 194 L15 211 L11 229 L13 876 L16 899 L24 923 L38 940 L48 942 L72 957 L98 960 L114 957 L121 961 L146 959 L150 962 L201 959 L206 962 L225 960 L230 963 L247 961 L268 964 L295 961 L433 964 L523 955 L541 948 L556 937 L567 919 L575 877 L574 231 L563 200 L551 186 L530 172 L521 153 L522 143 L531 135 L531 125 L524 119 L531 112 L530 106 L551 103 L556 97 L555 41 L552 34 L533 22 L522 19 L389 12 L173 13 L79 18 Z",
  "M29 107 L553 107",
  "M60 292 L536 292 L536 787 L60 787 Z",
  "M60 472 Q298 390 536 472",
  "M408 454 A112 112 0 1 1 184 454 A112 112 0 1 1 408 454",
];

const WORDMARK = "FRESH FUSION".split("");

/** at this width and up the final screen is jar | trust points | order card,
 *  grouped in the centre (keep in sync with beef-story.css) */
const GROUPED_MIN = 1180;
/** trust points column: left edge relative to the centre, and the gap to the jar */
const POINTS_LEFT = -167;
const GROUP_GAP = 40;

export function BeefStory({ variants }: { variants: BeefVariant[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const { dispatch } = useCart();
  const [selected, setSelected] = useState(() => {
    const i = variants.findIndex((v) => v.label === "500 g");
    return i >= 0 ? i : 0;
  });
  const [added, setAdded] = useState(false);

  const current = variants[selected];
  const inStock = current.product.inStock;
  const waUrl = shopOrderWhatsAppUrl(
    `Hi Fresh Fusion, I'd like to order Kerala beef pickle (${current.label}, ${formatPrice(current.product.price)}).`,
  );

  function addToCart() {
    if (!inStock) return;
    dispatch({ type: "add", product: current.product, qty: 1 });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // pin below the sticky site header instead of underneath it
    const header = document.querySelector<HTMLElement>("header");
    const headerH = () => header?.offsetHeight ?? 64;
    root.style.setProperty("--ffs-top", `${headerH()}px`);

    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const html = document.documentElement;
      const q = gsap.utils.selector(root);
      const jar = q(".ffs-jar")[0] as HTMLElement;
      const angles = [-160, -115, -30, 25, 90, 155];
      const jarH = () => jar.getBoundingClientRect().height;
      const W = () => root.clientWidth;
      const H = () => root.clientHeight;
      const pos = (i: number, narrow: boolean) => {
        const rx = Math.min(W() * (narrow ? 0.34 : 0.33), 400);
        const ry = Math.min(H() * (narrow ? 0.3 : 0.32), 300);
        const a = (angles[i] * Math.PI) / 180;
        return { x: Math.cos(a) * rx, y: Math.sin(a) * ry };
      };

      const mm = gsap.matchMedia(root);
      mm.add(
        {
          wide: "(min-width:760px) and (prefers-reduced-motion:no-preference)",
          narrow: "(max-width:759px) and (prefers-reduced-motion:no-preference)",
          reduce: "(prefers-reduced-motion:reduce)",
        },
        (ctx) => {
          const { narrow, reduce } = ctx.conditions as Record<string, boolean>;
          if (reduce) {
            html.classList.add("ffs-static");
            return () => html.classList.remove("ffs-static");
          }

          // spin frames (~1.8 MB) load only once the visitor is a third of
          // the way into the story, not on page load
          const cv = q(".ffs-spin")[0] as HTMLCanvasElement;
          const cx = cv.getContext("2d");
          const spin = { f: 0 };
          let frames: HTMLImageElement[] = [];
          const draw = () => {
            const im = frames[Math.min(frames.length - 1, Math.round(spin.f))];
            if (cx && im?.complete && im.naturalWidth) {
              cx.clearRect(0, 0, cv.width, cv.height);
              cx.drawImage(im, 0, 0, cv.width, cv.height);
            }
          };
          const loadFrames = () => {
            if (frames.length) return;
            frames = SPIN.map((src) => {
              const im = new Image();
              im.decoding = "async";
              // redraw as frames arrive, so landing mid-story (refresh,
              // fast scroll) still shows the jar once its frame is in
              im.onload = draw;
              im.src = src;
              return im;
            });
          };

          gsap.set(jar, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
          gsap.set(".ffs-ing", { xPercent: -50, yPercent: -50, x: 0, y: () => -jarH() * 0.4, scale: 0 });
          gsap.set(
            ".ffs-panel",
            narrow ? { x: 0, y: 0, xPercent: 0, yPercent: 100 } : { x: 0, y: 0, yPercent: 0, xPercent: 100 },
          );
          gsap.set(".ffs-wm span", { y: 0, yPercent: 110 });
          gsap.set(".ffs-spin", { xPercent: -50, yPercent: -50, x: 0, y: 0 });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root,
              pin: true,
              start: () => `top ${headerH()}px`,
              end: "+=650%",
              scrub: 0.6,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (self.progress > 0.35) loadFrames();
              },
            },
          });

          // 1. sketch draws itself
          tl.to(".ffs-hint", { opacity: 0, duration: 0.2 })
            .to(".ffs-outline path", { strokeDashoffset: 0, duration: 1, stagger: 0.12 }, 0)
            .to(".ffs-note", { opacity: 1, y: 0, duration: 0.4 }, 0.4)
            // 2. sketch becomes the real jar
            .to(".ffs-jar-closed", { opacity: 1, duration: 0.6 })
            .to(".ffs-jar-sketch", { opacity: 0, duration: 0.6 }, "<.2")
            .to(".ffs-note", { opacity: 0, duration: 0.3 }, "<.3")
            // 3. ticker
            .to(".ffs-ticker", { clipPath: "inset(0 0% 0 0)", duration: 0.6 })
            .to({}, { duration: 0.3 })
            // 4. lid pops, ingredients fly out
            .set(".ffs-lid-wrap", { opacity: 1 })
            .set(".ffs-jar-open", { opacity: 1 })
            .set(".ffs-jar-closed", { opacity: 0 })
            .to(
              ".ffs-lid-wrap",
              narrow
                ? { yPercent: -170, xPercent: 55, rotation: 18, duration: 0.5, ease: "power2.out" }
                : { yPercent: -120, xPercent: 62, rotation: 14, duration: 0.5, ease: "power2.out" },
            )
            .to(".ffs-lid-tilt", { opacity: 1, duration: 0.2 }, "<.15")
            .to(".ffs-lid-flat", { opacity: 0, duration: 0.2 }, "<")
            // headline steps aside so the flying ingredients never land on it
            .to(".ffs-hero-copy", { opacity: 0, duration: 0.3 }, "<")
            .to(
              ".ffs-ing",
              {
                opacity: 1,
                scale: 1,
                x: (i) => pos(i, narrow).x,
                y: (i) => pos(i, narrow).y,
                rotation: (i) => [-12, 8, -6, 10, -8, 6][i],
                duration: 1,
                stagger: 0.08,
                ease: "power2.out",
              },
              "-=.2",
            )
            .to(".ffs-ing-label", { opacity: 1, duration: 0.3, stagger: 0.05 }, "-=.4")
            .to({}, { duration: 0.5 })
            // 5. back into the jar, lid closes
            .to(".ffs-ing", {
              x: 0,
              y: () => -jarH() * 0.4,
              scale: 0,
              opacity: 0,
              rotation: 0,
              duration: 0.6,
              stagger: 0.04,
              ease: "power2.in",
            })
            .to(".ffs-lid-wrap", { yPercent: 0, xPercent: 0, rotation: 0, duration: 0.4, ease: "power2.in" })
            .to(".ffs-lid-flat", { opacity: 1, duration: 0.15 }, "-=.2")
            .to(".ffs-lid-tilt", { opacity: 0, duration: 0.15 }, "<")
            .set(".ffs-jar-closed", { opacity: 1 })
            .set(".ffs-jar-open", { opacity: 0 })
            .set(".ffs-lid-wrap", { opacity: 0 })
            .to(".ffs-ticker, .ffs-hero-copy", { opacity: 0, duration: 0.3 }, "<")
            // 6. process panel
            .to(".ffs-panel", narrow ? { yPercent: 0, duration: 0.6 } : { xPercent: 0, duration: 0.6 })
            .to(
              jar,
              narrow ? { y: () => -H() * 0.27, scale: 0.62, duration: 0.6 } : { x: () => -W() * 0.27, duration: 0.6 },
              "<",
            )
            .to(".ffs-step", { opacity: 1, y: 0, duration: 0.35, stagger: 0.3 })
            .to({}, { duration: 0.5 })
            // 7. brand reveal
            .to(".ffs-step", { opacity: 0, duration: 0.25 })
            .to(".ffs-panel", narrow ? { height: "100%", duration: 0.5 } : { width: "100%", duration: 0.5 }, "<")
            .to(jar, { opacity: 0, scale: narrow ? 0.5 : 0.85, duration: 0.4 }, "<")
            .to(".ffs-brand-line", { scaleY: 1, duration: 0.4 })
            .to(".ffs-brand-logo", { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.6)" })
            .to(".ffs-wm span", { yPercent: 0, duration: 0.5, stagger: 0.04, ease: "power3.out" })
            .to(".ffs-brand-ml", { opacity: 1, duration: 0.3 })
            .to({}, { duration: 0.5 })
            // 8. back to the shop: real jar turns once + order card
            .to(".ffs-brand", { opacity: 0, y: -60, duration: 0.4 })
            .to(".ffs-panel", { yPercent: -100, duration: 0.6 }, "<")
            .set(
              ".ffs-spin",
              narrow
                ? { x: 0, y: () => -H() * 0.2, scale: 0.62 }
                : {
                    // grouped: jar sits just left of the trust points
                    x: () =>
                      W() >= GROUPED_MIN ? POINTS_LEFT - GROUP_GAP - cv.offsetWidth / 2 : -W() * 0.18,
                    y: 0,
                    scale: 1,
                  },
              "<",
            )
            .to(".ffs-spin", { opacity: 1, duration: 0.4 }, "<.2")
            .to(
              ".ffs-cta",
              narrow ? { opacity: 1, y: -20, duration: 0.5 } : { opacity: 1, yPercent: -50, y: 0, duration: 0.5 },
              "<",
            )
            .to(spin, { f: SPIN.length - 1, duration: 1.6, onUpdate: draw }, "<")
            .to(".ffs-point", { opacity: 1, y: 0, duration: 0.35, stagger: 0.25 }, "<.3")
            .to({}, { duration: 0.3 });
        },
      );

      cleanup = () => {
        mm.revert();
        html.classList.remove("ffs-static");
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <section ref={rootRef} className="ffs-stage" aria-label="Beef pickle story">
      <div className="ffs-hero-copy">
        <h2>Beef pickle made with love, slow-roasted in coconut oil.</h2>
        <p>Small batches, made the Kerala way. Scroll to see what goes in the jar.</p>
      </div>

      <div className="ffs-note ffs-ml" aria-hidden="true">
        സ്നേഹത്തോടെ<small>Made with love</small>
      </div>

      <div className="ffs-ticker" aria-hidden="true">
        <div className="ffs-track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      <div className="ffs-jar" role="img" aria-label="Jar of Fresh Fusion beef pickle">
        <svg className="ffs-jar-sketch" viewBox="0 0 585 979" aria-hidden="true">
          {/* faint guide so the first screen already shows the jar; the
              scroll then draws the full outline over it */}
          <g
            className="ffs-outline-ghost"
            fill="none"
            stroke="var(--ffs-ink)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {JAR_PATHS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          <g
            className="ffs-outline"
            fill="none"
            stroke="var(--ffs-ink)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {JAR_PATHS.map((d) => (
              <path key={d} pathLength={1} d={d} />
            ))}
          </g>
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element -- GSAP animates these layered stills directly */}
        <img className="ffs-jar-photo ffs-jar-closed" src={`${IMG}/jar-closed.webp`} alt="" width={585} height={979} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ffs-jar-photo ffs-jar-open" src={`${IMG}/jar-open.webp`} alt="" width={585} height={979} loading="lazy" />
        <div className="ffs-lid-wrap" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ffs-lid-flat" src={`${IMG}/lid-flat.webp`} alt="" loading="lazy" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ffs-lid-tilt" src={`${IMG}/lid-tilt.webp`} alt="" loading="lazy" />
        </div>
      </div>

      <canvas
        className="ffs-spin"
        width={348}
        height={560}
        role="img"
        aria-label="Fresh Fusion beef pickle jar turning"
      />
      {INGREDIENTS.map((ing) => (
        <div key={ing.key} className="ffs-ing" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${IMG}/ing-${ing.key}.webp`} alt="" data-ing={ing.key} loading="lazy" />
          <div className="ffs-ing-label">
            {ing.en}
            <span className="ffs-ml">{ing.ml}</span>
          </div>
        </div>
      ))}

      <div className="ffs-panel">
        <ol className="ffs-steps">
          <li className="ffs-step">
            <h3>Cubed and pressure-cooked</h3>
            <p>Fresh beef with turmeric, salt and a little pepper.</p>
          </li>
          <li className="ffs-step">
            <h3>Fried crisp in coconut oil</h3>
            <p>Slowly, until the edges turn dark and chewy.</p>
          </li>
          <li className="ffs-step">
            <h3>Tossed in roasted masala</h3>
            <p>Kashmiri chilli, garlic, ginger, curry leaves and vinegar.</p>
          </li>
        </ol>
      </div>

      <div className="ffs-brand" aria-hidden="true">
        <div className="ffs-brand-inner">
          <div className="ffs-brand-line" />
          <div className="ffs-brand-logo ffs-logo-mark" />
          <div className="ffs-wm">
            {WORDMARK.map((ch, i) => (
              <span key={i}>{ch === " " ? " " : ch}</span>
            ))}
          </div>
          <div className="ffs-brand-ml ffs-ml">ബീഫ് അച്ചാർ</div>
        </div>
      </div>

      <ul className="ffs-points">
        <li className="ffs-point">
          <Flame aria-hidden />
          <span>
            <b>Slow-roasted</b> in small batches
          </span>
        </li>
        <li className="ffs-point">
          <ShieldCheck aria-hidden />
          <span>
            <b>FSSAI-approved</b> family kitchen
          </span>
        </li>
        <li className="ffs-point">
          <PackageCheck aria-hidden />
          <span>
            <b>Packed fresh</b> within 48 hours
          </span>
        </li>
        <li className="ffs-point">
          <CalendarDays aria-hidden />
          <span>
            <b>Last batch cooked</b> {formatDate(current.product.madeOn)}
          </span>
        </li>
      </ul>

      <div className="ffs-cta">
        <div className="ffs-cta-head">
          <div>
            <h2>Beef pickle</h2>
            <div className="ffs-ml">ബീഫ് അച്ചാർ</div>
          </div>
          <span className="ffs-logo-mark" role="img" aria-label="Fresh Fusion Spices & Pickles logo" />
        </div>
        <p>Made fresh every batch. Packed within 48 hours.</p>
        <div className="ffs-sizes" role="group" aria-label="Choose a size">
          {variants.map((v, i) => (
            <button
              key={v.product.slug}
              className="ffs-size"
              type="button"
              aria-pressed={i === selected}
              onClick={() => setSelected(i)}
            >
              <b>{v.label}</b>
              {v.product.inStock ? formatPrice(v.product.price) : "Sold out"}
            </button>
          ))}
        </div>
        <a className="ffs-btn ffs-btn-main" href={waUrl} target="_blank" rel="noopener noreferrer">
          Order {current.label} on WhatsApp
        </a>
        <button className="ffs-btn ffs-btn-alt" type="button" onClick={addToCart} disabled={!inStock}>
          {!inStock ? "Sold out" : added ? "Added to cart" : "Add to cart"}
        </button>
      </div>

      <div className="ffs-hint">Scroll ↓</div>
    </section>
  );
}
