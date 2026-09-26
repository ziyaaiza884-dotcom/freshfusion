import type { DecorationKey } from "@/lib/festivals";

/**
 * Bespoke SVG scenes layered into the hero for festivals with a full
 * takeover (see lib/festivals.ts `decoration` field). Each one is
 * `pointer-events-none`, sits behind the hero's text/photo content (same
 * stacking layer as the ambient particles in festive-scene.tsx), stays out
 * of the CTA/headline area, and scales down or drops extra elements on
 * mobile. Animations respect prefers-reduced-motion via the .ff-lantern-sway
 * / .ff-flame classes in globals.css.
 */

function Lantern({
  x,
  size = 34,
  delay = 0,
}: {
  x: string;
  size?: number;
  delay?: number;
}) {
  return (
    <div
      className="ff-lantern-sway absolute top-0 hidden sm:block"
      style={{ left: x, animationDelay: `${delay}s` }}
    >
      <svg width={size} height={size * 2.1} viewBox="0 0 34 71" fill="none">
        <line x1="17" y1="0" x2="17" y2="18" stroke="var(--spice)" strokeWidth="1" opacity="0.7" />
        <ellipse cx="17" cy="24" rx="4" ry="3" fill="var(--spice)" opacity="0.9" />
        <path
          d="M6 27 Q6 20 17 20 Q28 20 28 27 L26 52 Q26 60 17 60 Q8 60 8 52 Z"
          fill="var(--spice)"
          opacity="0.9"
        />
        <path
          d="M6 27 Q6 20 17 20 Q28 20 28 27 L26 52 Q26 60 17 60 Q8 60 8 52 Z"
          fill="none"
          stroke="var(--primary-strong)"
          strokeWidth="1"
          opacity="0.6"
        />
        <ellipse cx="17" cy="63" rx="4" ry="2.5" fill="var(--spice)" opacity="0.8" />
      </svg>
    </div>
  );
}

function CrescentMoon({
  size = 56,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      className={className}
    >
      <path
        d="M36 6C24 6 14 16 14 28C14 40 24 50 36 50C29 46 24 38 24 28C24 18 29 10 36 6Z"
        fill="var(--spice)"
      />
    </svg>
  );
}

export function RamadanDecoration() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <CrescentMoon
        size={64}
        className="absolute right-6 top-6 opacity-90 sm:right-10 sm:top-10"
      />
      <Lantern x="18%" size={28} delay={0} />
      <Lantern x="48%" size={34} delay={0.6} />
      <Lantern x="78%" size={26} delay={1.1} />
    </div>
  );
}

export function EidDecoration() {
  const patternId = "ff-eid-geo";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.07]">
        <defs>
          <pattern id={patternId} width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M24 2 L34 14 L46 24 L34 34 L24 46 L14 34 L2 24 L14 14 Z"
              fill="none"
              stroke="var(--spice)"
              strokeWidth="1.2"
            />
          </pattern>
        </defs>
        <rect
          x="35%"
          width="65%"
          height="100%"
          fill={`url(#${patternId})`}
        />
      </svg>
      <svg
        width="88"
        height="88"
        viewBox="0 0 88 88"
        className="absolute right-6 top-6 opacity-95 sm:right-10 sm:top-10"
      >
        <path
          d="M56 8C38 8 24 22 24 40C24 58 38 72 56 72C46 66 39 54 39 40C39 26 46 14 56 8Z"
          fill="var(--spice)"
        />
        <path
          d="M64 20l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5-6-3.6-6 3.6 1.6-6.5-5.1-4.4 6.7-.5z"
          fill="var(--spice)"
        />
      </svg>
    </div>
  );
}

function Pookalam({ className = "" }: { className?: string }) {
  const petals = 10;
  const colors = ["var(--accent)", "var(--spice)", "var(--primary)"];
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" className={className}>
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (i / petals) * 360;
        return (
          <ellipse
            key={i}
            cx="75"
            cy="34"
            rx="12"
            ry="22"
            fill={colors[i % colors.length]}
            opacity="0.85"
            transform={`rotate(${angle} 75 75)`}
          />
        );
      })}
      <circle cx="75" cy="75" r="16" fill="var(--spice)" />
    </svg>
  );
}

export function OnamDecoration() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Pookalam className="absolute -bottom-10 -right-10 opacity-80 sm:-bottom-6 sm:-right-6" />
      <svg
        className="absolute bottom-0 left-0 w-full"
        height="10"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
      >
        <path
          d="M0 6 Q 25 0 50 6 T 100 6"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.4"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}

function Diya({ x, delay = 0 }: { x: string; delay?: number }) {
  return (
    <div className="absolute bottom-0" style={{ left: x }}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path
          d="M2 20 Q15 30 28 20 L25 22 Q15 27 5 22 Z"
          fill="var(--spice)"
        />
        <ellipse cx="15" cy="19" rx="12" ry="4" fill="var(--primary-strong)" />
        <path
          d="M15 16 Q13 11 15 7 Q17 11 15 16Z"
          fill="var(--accent)"
          className="ff-flame"
          style={{ animationDelay: `${delay}s` }}
        />
      </svg>
    </div>
  );
}

export function DiwaliDecoration() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Pookalam className="absolute -top-12 -right-8 opacity-60 sm:-top-8" />
      <Diya x="8%" delay={0} />
      <Diya x="28%" delay={0.3} />
      <div className="hidden sm:block">
        <Diya x="48%" delay={0.6} />
        <Diya x="68%" delay={0.15} />
        <Diya x="88%" delay={0.45} />
      </div>
    </div>
  );
}

function StarLantern({ className = "" }: { className?: string }) {
  return (
    <div className={`ff-lantern-sway ${className}`}>
      <svg width="60" height="90" viewBox="0 0 60 90" fill="none">
        <line x1="30" y1="0" x2="30" y2="16" stroke="var(--spice)" strokeWidth="1" opacity="0.7" />
        <polygon
          points="30,18 37,34 55,34 41,45 46,62 30,52 14,62 19,45 5,34 23,34"
          fill="var(--spice)"
          opacity="0.95"
          style={{ filter: "drop-shadow(0 0 10px var(--glow-soft))" }}
        />
      </svg>
    </div>
  );
}

function Holly({ className = "" }: { className?: string }) {
  return (
    <svg
      width="70"
      height="60"
      viewBox="0 0 70 60"
      className={className}
      style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}
    >
      <path
        d="M10 40 Q0 25 15 15 Q20 28 30 30 Q22 34 10 40Z"
        fill="var(--spice)"
        opacity="0.95"
      />
      <path
        d="M35 45 Q28 28 42 18 Q46 32 55 35 Q46 38 35 45Z"
        fill="var(--spice)"
        opacity="0.95"
      />
      <circle cx="24" cy="38" r="4.5" fill="var(--accent)" />
      <circle cx="33" cy="42" r="4.5" fill="var(--accent)" />
      <circle cx="29" cy="48" r="4.5" fill="var(--accent)" />
    </svg>
  );
}

export function ChristmasDecoration() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <StarLantern className="absolute right-8 top-0 sm:right-14" />
      <Holly className="absolute bottom-4 left-4 opacity-95" />
    </div>
  );
}

export const DECORATIONS: Record<DecorationKey, () => React.JSX.Element> = {
  ramadan: RamadanDecoration,
  eid: EidDecoration,
  onam: OnamDecoration,
  diwali: DiwaliDecoration,
  christmas: ChristmasDecoration,
};
