import { cn } from "@/lib/utils";

/**
 * A Kerala backwaters silhouette at dusk — coconut palms, gentle water and a
 * kettuvallam (houseboat) — rendered entirely in the theme's "spice" green so
 * it re-colors automatically with every festival theme. Sits low in the hero,
 * behind the copy, fading into the background.
 */
export function KeralaScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 320"
      preserveAspectRatio="none"
      className={cn("w-full text-spice", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="ff-kerala-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* backwater */}
      <rect y="230" width="1200" height="90" fill="url(#ff-kerala-fade)" opacity="0.35" />
      <path
        d="M0 244 Q 60 236 120 244 T 240 244 T 360 244 T 480 244 T 600 244 T 720 244 T 840 244 T 960 244 T 1080 244 T 1200 244"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.35"
      />
      <path
        d="M0 268 Q 70 258 140 268 T 280 268 T 420 268 T 560 268 T 700 268 T 840 268 T 980 268 T 1120 268 T 1200 268"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.25"
      />

      {/* kettuvallam houseboat, low opacity, far bank */}
      <g opacity="0.4" transform="translate(150,214)">
        <path
          d="M0 26 C 14 34 96 34 110 26 L 100 20 L 10 20 Z"
          fill="currentColor"
        />
        <path
          d="M14 20 C 20 2 90 2 96 20 Z"
          fill="currentColor"
          opacity="0.85"
        />
      </g>

      {/* distant palm cluster (lighter, smaller — atmospheric depth) */}
      {[
        { x: 60, s: 0.55, o: 0.25 },
        { x: 980, s: 0.5, o: 0.22 },
        { x: 1080, s: 0.6, o: 0.28 },
      ].map((p, i) => (
        <g
          key={`far-${i}`}
          transform={`translate(${p.x},246) scale(${p.s})`}
          opacity={p.o}
        >
          <Palm />
        </g>
      ))}

      {/* foreground palms — fuller opacity, sets the scene */}
      {[
        { x: 40, s: 1, o: 0.85, lean: -6 },
        { x: 230, s: 0.8, o: 0.7, lean: 4 },
        { x: 1140, s: 1.05, o: 0.9, lean: 7 },
        { x: 960, s: 0.75, o: 0.65, lean: -3 },
      ].map((p, i) => (
        <g
          key={`near-${i}`}
          transform={`translate(${p.x},252) scale(${p.s}) rotate(${p.lean})`}
          opacity={p.o}
        >
          <Palm />
        </g>
      ))}
    </svg>
  );
}

function Palm() {
  return (
    <>
      <path
        d="M0 0 C -4 -18 2 -40 10 -58"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {[
        "M10 -58 C -6 -66 -26 -64 -40 -52",
        "M10 -58 C -2 -74 -20 -82 -38 -80",
        "M10 -58 C 8 -78 -2 -94 -12 -104",
        "M10 -58 C 20 -76 36 -84 54 -82",
        "M10 -58 C 24 -70 44 -70 58 -60",
        "M10 -58 C 18 -66 32 -68 44 -64",
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ))}
    </>
  );
}
