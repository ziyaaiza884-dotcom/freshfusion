"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { easeOutExpo } from "@/components/ui/motion";
import { ProductArt } from "@/components/product-art";

const chips = [
  { label: "All pickles", href: "/shop?category=pickles" },
  { label: "All spices", href: "/shop?category=spices" },
  { label: "Specialty", href: "/shop?category=specialty" },
];

const jars = [
  {
    art: "from-[#5b2b1e] to-[#8c3d21]",
    category: "pickles" as const,
    delay: 0,
    photo: "/images/4suares/pickle.png",
    alt: "Fresh Fusion beef pickle jar",
  },
  {
    art: "from-[#c9a227] to-[#e6c84f]",
    category: "spices" as const,
    delay: 0.08,
    photo: "/images/4suares/seeds-square.jpg",
    alt: "Whole Kerala spices — cloves and cinnamon in bowls",
  },
  { art: "from-[#3f6b4c] to-[#7aa85f]", category: "spices" as const, delay: 0.16 },
  { art: "from-[#8a3d1f] to-[#c25f2c]", category: "specialty" as const, delay: 0.24 },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-30">
        <Image
          src="/images/beef-pickle-hero.jpg"
          alt="A jar of Fresh Fusion beef pickle on a wooden kitchen counter, surrounded by whole spices"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_42%]"
        />
      </div>
      {/* the jar sits dead-centre in the source photo, right under the
          headline column — a stronger wash on the left keeps the text
          readable while the jar itself stays clear on the right, next to
          the product tiles */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-r from-background/92 via-background/55 to-background/15"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-t from-background/60 via-transparent to-background/35"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary"
          >
            100% home-cooked · FSSAI-approved
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.06 }}
            className="mt-5 text-4xl font-bold leading-[1.05] drop-shadow-[0_3px_16px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl"
          >
            Home-cooked flavours,
            <span className="block text-primary-strong">delivered fresh.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.12 }}
            className="mt-5 max-w-md text-base text-foreground/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:text-lg"
          >
            Small batches of beef, fish and baby-mango pickles, whole hill
            spices, and ready-to-cook gravies — made in a family kitchen and
            packed within 48 hours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <ButtonLink href="/shop" size="lg">
              Shop the kitchen <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <Link
              href="/shop?category=spices"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Browse spice packs
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {chips.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {c.label}
              </Link>
            ))}
          </motion.div>
        </div>

        <div className="relative mx-auto grid w-full max-w-sm grid-cols-2 gap-4 lg:max-w-none">
          <div className="ff-lamplight" aria-hidden />
          {jars.map((j, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, rotate: i % 2 ? 3 : -3 }}
              animate={{ opacity: 1, y: 0, rotate: i % 2 ? 1.5 : -1.5 }}
              transition={{
                duration: 0.7,
                ease: easeOutExpo,
                delay: 0.2 + j.delay,
              }}
              whileHover={{ y: -6, rotate: 0 }}
              className="aspect-square rounded-2xl border border-border shadow-[0_20px_45px_-20px_var(--glow-soft)] transition-shadow duration-300 hover:shadow-[0_24px_55px_-16px_var(--glow)]"
            >
              {j.photo ? (
                <Image
                  src={j.photo}
                  alt={j.alt ?? "Fresh Fusion product"}
                  width={300}
                  height={300}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <ProductArt
                  art={j.art}
                  category={j.category}
                  className="h-full w-full rounded-2xl"
                  label="Fresh Fusion jar"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
