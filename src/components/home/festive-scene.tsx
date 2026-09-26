import Image from "next/image";
import { PARTICLE_SLOTS } from "@/lib/festive-particles";
import { festivalFor, LEGACY_FESTIVE } from "@/lib/festivals";
import { DECORATIONS } from "@/components/home/festival-decorations";

const PARTICLE_COUNT = 12;

/**
 * Ambient festive particles + bespoke decoration scene, layered behind the
 * hero's text/photo content (z-index sits between the background photo and
 * the foreground grid — see hero.tsx). Renders nothing for themes without
 * any festive config (e.g. "everyday").
 */
export function FestiveScene({ themeId }: { themeId: string }) {
  const festival = festivalFor(themeId);
  const legacy = !festival ? LEGACY_FESTIVE[themeId] : undefined;
  const particle = festival?.particle ?? legacy?.particle;
  const Decoration = festival?.decoration
    ? DECORATIONS[festival.decoration]
    : undefined;

  if (!particle && !Decoration && !legacy) return null;

  const slots = PARTICLE_SLOTS.slice(0, PARTICLE_COUNT);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden text-primary"
    >
      {particle &&
        slots.map((s, i) => (
          <span
            key={i}
            className={`ff-particle ff-particle--${particle}`}
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

      {Decoration && <Decoration />}

      {/* legacy themes (e.g. Nowruz) without a full takeover keep the
          original small round corner photo */}
      {legacy && (
        <div className="ff-festive-badge absolute right-4 top-4 h-16 w-16 overflow-hidden rounded-full ring-2 ring-primary-strong/80 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)] sm:right-8 sm:top-8 sm:h-24 sm:w-24">
          <Image
            src={legacy.photo}
            alt={legacy.photoAlt}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
