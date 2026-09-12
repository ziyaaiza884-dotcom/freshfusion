import Image from "next/image";
import { festiveFor, PARTICLE_SLOTS } from "@/lib/festive";

const PARTICLE_COUNT = 12;

/**
 * Ambient festive particles + a real-photo corner badge, layered behind the
 * hero's text/photo content (z-index sits between the background photo and
 * the foreground grid — see hero.tsx) and above the scrim. Renders nothing
 * for themes without a festive config (e.g. "everyday").
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
      <div className="ff-festive-badge absolute right-4 top-4 h-16 w-16 overflow-hidden rounded-full ring-2 ring-primary-strong/80 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)] sm:right-8 sm:top-8 sm:h-24 sm:w-24">
        <Image
          src={config.photo}
          alt={config.photoAlt}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
