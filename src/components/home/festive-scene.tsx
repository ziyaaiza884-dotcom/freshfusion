import { festiveFor, PARTICLE_SLOTS, type FestiveIcon } from "@/lib/festive";

const PARTICLE_COUNT = 12;

/**
 * Ambient festive particles + a themed corner illustration, layered behind
 * the hero's text/photo content (z-index sits between the background photo
 * and the foreground grid — see hero.tsx) and above the scrim. Renders
 * nothing for themes without a festive config (e.g. "everyday").
 */
export function FestiveScene({ themeId }: { themeId: string }) {
  const config = festiveFor(themeId);
  if (!config) return null;

  const slots = PARTICLE_SLOTS.slice(0, PARTICLE_COUNT);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden text-primary"
    >
      {slots.map((s, i) => (
        <span
          key={i}
          className={`ff-particle ff-particle--${config.particle}`}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            ["--ff-drift" as string]: `${(i % 2 ? 1 : -1) * (6 + s.size)}px`,
          }}
        />
      ))}
      <div className="absolute right-4 top-4 h-16 w-16 text-primary-strong opacity-70 sm:right-8 sm:top-8 sm:h-24 sm:w-24">
        <FestiveIconArt icon={config.icon} className="ff-festive-icon h-full w-full" />
      </div>
    </div>
  );
}

function FestiveIconArt({
  icon,
  className,
}: {
  icon: FestiveIcon;
  className?: string;
}) {
  switch (icon) {
    case "mosque":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="72" cy="16" r="7" />
            <path d="M76 10a5 5 0 1 1-3 9" />
            <path d="M50 90V60c0-9 6-16 14-16s14 7 14 16v30" />
            <path d="M22 90V66c0-8 5-14 12-14s12 6 12 14v24" />
            <path d="M64 44a14 14 0 0 1 28 0" />
            <path d="M34 52a12 12 0 0 1 24 0" />
            <path d="M14 90h72" />
            <path d="M46 90V76a4 4 0 0 1 8 0v14" />
          </g>
        </svg>
      );
    case "diya":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 40c4 6 4 12 0 16-4-4-4-10 0-16Z" />
            <path d="M50 40c2-6 0-11-3-14 5 0 8 5 3 14Z" opacity={0.7} />
            <path d="M18 62c6 8 18 13 32 13s26-5 32-13" />
            <path d="M18 62c0-5 4-8 8-8h48c4 0 8 3 8 8" />
            <circle cx="24" cy="58" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="76" cy="58" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="14" cy="46" r="2" fill="currentColor" stroke="none" opacity={0.8} />
            <circle cx="86" cy="46" r="2" fill="currentColor" stroke="none" opacity={0.8} />
          </g>
        </svg>
      );
    case "pookalam":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <g stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
            <circle cx="50" cy="50" r="10" />
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * Math.PI) / 4;
              const x = 50 + Math.cos(angle) * 26;
              const y = 50 + Math.sin(angle) * 26;
              return (
                <path
                  key={i}
                  d={`M50 50 Q${x} ${y - 8} ${x} ${y} Q${x} ${y + 8} 50 50Z`}
                  opacity={i % 2 ? 0.55 : 0.85}
                />
              );
            })}
            <circle cx="50" cy="50" r="38" opacity={0.4} />
          </g>
        </svg>
      );
    case "tree":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 10 L34 38h10L28 62h12L24 88h52L60 62h12L56 38h10Z" />
            <path d="M46 88v8h8v-8" />
          </g>
          <g fill="currentColor" stroke="none">
            <circle cx="50" cy="8" r="3" />
            <circle cx="40" cy="46" r="2" opacity={0.8} />
            <circle cx="60" cy="52" r="2" opacity={0.8} />
            <circle cx="36" cy="72" r="2" opacity={0.8} />
            <circle cx="64" cy="76" r="2" opacity={0.8} />
          </g>
        </svg>
      );
    case "tulip":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <g stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 92V52" />
            <path d="M50 66c-10 2-16-4-18-14 10-2 16 4 18 14Z" opacity={0.75} />
            <path d="M50 92c-14-2-22-14-16-30 8 10 12 18 16 30Z" opacity={0.85} />
            <path d="M38 40c0-10 5-18 12-22 7 4 12 12 12 22 0 8-6 12-12 12s-12-4-12-12Z" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}
