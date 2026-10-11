---
name: Fresh Fusion
description: Kerala home-cooked pickles and spices, delivered fresh
colors:
  background: "#2a2015"
  surface: "#362a1a"
  surface-muted: "#423323"
  foreground: "#f6ecd8"
  muted-foreground: "#c7b08b"
  border: "#4f3f28"
  primary: "#c99a2e"
  primary-strong: "#dcae45"
  primary-foreground: "#251a0c"
  accent: "#a83a2a"
  accent-foreground: "#fbf1e2"
  spice: "#4c7a45"
typography:
  display:
    fontFamily: "Fraunces, Georgia, Times New Roman, serif"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9rem"
rounded:
  sm: "0.3rem"
  md: "0.5rem"
  lg: "0.75rem"
  full: "9999px"
spacing:
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-strong}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "1.25rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "2.75rem"
---

# Design System: Fresh Fusion

## Overview

**Creative North Star: "The Temple-Mural Evening"**

Fresh Fusion's storefront reads as a Kerala temple mural at dusk: a deep teak-wood dark background (never pure black), warm kasavu-gold borders and accents, and a signature amber "lamplight" glow that blooms behind product jars and interactive elements instead of a conventional drop shadow. The palette is a temple-mural triad — turmeric gold, mural maroon-red, and paddy-field green — applied with restraint so gold stays the dominant voice and the other two read as accents, not competing protagonists.

This is a home-cooked, family-kitchen brand, not a slick FMCG one. The design avoids sterile, corporate polish in favor of warmth: serif display type for headings (evoking printed menus and temple signage), a plain humanist sans for body text and UI chrome, and a flat-by-default surface language where depth is conveyed through a glowing light source rather than stacked shadows.

The system is also **themeable by design**: the same token names (`--background`, `--primary`, `--accent`, etc. — see `src/lib/themes.ts`) are redefined wholesale for festival storefront takeovers (Onam, Eid, Diwali, Ramadan, Christmas, Nowruz), each with its own font pairing. "The Temple-Mural Evening" described here is specifically the **"Everyday" default theme** — the house baseline every festival theme deviates from, and the one new UI should be designed against unless a specific festival theme is requested.

**Key Characteristics:**
- Deep warm-dark background (teak wood, never pure black or navy)
- Kasavu-gold as the single dominant accent; maroon-red and palm-green used sparingly
- Flat cards with a thin border at rest; warm gold glow appears only on hover/interaction
- Serif display (Fraunces) paired with a plain sans body (Inter) — self-hosted, not Google-Fonts-at-build-time
- Fully themeable token system that re-skins for festivals without changing component code

## Colors

A warm, dark, single-accent palette — gold does almost all of the work; maroon and green are used only where the UI needs a second or third signal (errors/alerts, a success/fresh cue).

### Primary
- **Turmeric Gold** (`#c99a2e`, strong variant `#dcae45`): the one dominant accent — primary buttons, active states, borders on hover, the signature lamplight glow (`--glow`, `--glow-soft`, derived from this color via `color-mix`).

### Secondary
- **Mural Maroon-Red** (`#a83a2a`): used sparingly — the accent button variant, error/alert text, "out of stock" and discount badges.

### Tertiary
- **Paddy-Field Green** (`#4c7a45`): the rarest accent — used for the "best seller" badge and similar single-purpose signals. Not a general-purpose second accent.

### Neutral
- **Teak Wood** (`#2a2015`): page background.
- **Rosewood Surface** (`#362a1a`): card/panel background, one step lighter than the page.
- **Muted Rosewood** (`#423323`): hover/muted surface (e.g. the `subtle` button, muted badges).
- **Kasavu Cream** (`#f6ecd8`): primary foreground text.
- **Warm Taupe** (`#c7b08b`): secondary/muted text.
- **Warm Bronze** (`#4f3f28`): borders and dividers.

### Named Rules
**The One Gold Rule.** Primary gold is the only color allowed to dominate a screen. Maroon and green exist to mark a single specific state (error, success, best-seller) — never as a second or third "brand" color competing with gold for attention.

## Typography

**Display Font:** Fraunces (with Georgia, Times New Roman, serif fallback)
**Body Font:** Inter (with ui-sans-serif, system-ui, sans-serif fallback)

**Character:** A printed-menu serif for headings against a workmanlike sans for everything functional — the pairing reads as "home kitchen with real craft," not generic SaaS. Both are self-hosted via Fontsource rather than fetched from Google at build time (a prior build-reliability fix), but the visual pairing itself is unchanged.

### Hierarchy
- **Display/Headline** (`font-serif`, `h1`–`h4`, weight 700, letter-spacing -0.01em): page titles, section headings, product names on hero/cards.
- **Body** (`font-sans`, ~0.9rem–1rem): paragraph copy, descriptions, form labels.
- **Label** (`font-sans`, `text-xs`, uppercase, tracking-wide, often `font-semibold`): badges, stat labels, eyebrow text above headings.

### Named Rules
**The Serif-Only-For-Headings Rule.** Fraunces (or the active theme's display face) never appears in body copy, buttons, or form inputs — those always use the sans body font, keeping the serif's impact reserved for moments that should feel considered.

## Layout

Centered content containers (`max-w-6xl`, `max-w-2xl` for narrower reading contexts) with generous horizontal padding (`px-4 sm:px-6`). Grids are used for product listings and stat rows, collapsing to a single column on mobile. Spacing is generous and airy rather than dense — this is a browsing/shopping experience, not a data-dense admin tool (the admin dashboard itself is denser, per its own Operate-mode needs).

## Elevation & Depth

**Flat-by-default, glow-on-hover.** Surfaces sit flat at rest — a card is just a filled rectangle (`bg-surface`) with a thin 1px border (`border-border`) and a rounded corner. There are no ambient drop-shadows at rest. Depth and interactivity are instead signaled by a warm gold **lamplight glow** (`box-shadow` using `--glow`/`--glow-soft`, which are the primary color blended to translucency via `color-mix`) that blooms in on hover, plus a small upward translate (`hover:-translate-y-0.5`). This makes gold do double duty as both the brand color and the depth cue.

### Shadow Vocabulary
- **Glow-soft** (`box-shadow: 0 20px 45px -20px var(--glow-soft)`): resting-state glow on hero product tiles — barely-there, signals "this is a real object."
- **Glow** (`box-shadow: 0 24px 55px -16px var(--glow)`): hover-state glow, stronger and warmer — the primary interactive depth cue across cards, buttons, and stat tiles.

### Named Rules
**The Flat-By-Default Rule.** Nothing gets a resting-state drop shadow. Shadows exist only as the glow response to hover/interaction state — a static screenshot of the site at rest should show no card "lifted" above another.

## Shapes

Rounded corners throughout, scaled from one root `--radius` (0.75rem): `rounded-lg` (cards, panels), `rounded-md` (buttons, inputs — `radius - 0.25rem`), `rounded-sm` (small chips — `radius - 0.45rem`). Product-tile imagery and the hero photo grid use a larger `rounded-2xl` for a softer, more "jar-like" silhouette. Badges and pills are fully rounded (`rounded-full`). Borders are thin (1–1.5px) and always use the theme's `--border` token, never a hardcoded gray.

## Components

### Buttons
- **Shape:** `rounded-md` (0.5rem), medium corner radius consistent with inputs.
- **Primary:** gold background (`--primary`), dark text (`--primary-foreground`) for contrast on gold; `h-11 px-5` at the default `md` size.
- **Hover/Focus:** background shifts to the stronger gold (`--primary-strong`), lifts `-translate-y-0.5`, and gains the lamplight glow shadow. A press state scales down slightly (`active:scale-[0.97]`).
- **Accent:** maroon background, used only for destructive/attention actions — same hover-lift-and-glow behavior with a maroon-tinted glow.
- **Outline/Ghost/Subtle:** transparent or muted-surface backgrounds with gold or foreground text — used for secondary actions so only one gold-filled button competes for attention per view.

### Badges
- **Style:** fully rounded pill, `text-xs font-semibold uppercase tracking-wide`.
- **Variants:** `hot` (maroon/accent — spicy items), `new` (gold/primary), `best` (green/spice — best-sellers), `stock` (soft maroon-tinted — low/out of stock), `muted`/`outline` for neutral tags.

### Cards / Containers
- **Corner Style:** `rounded-xl` (0.75rem).
- **Background:** `--surface`, one step lighter than the page background.
- **Shadow Strategy:** flat at rest; see Elevation & Depth for the hover glow.
- **Border:** 1px, `--border`.
- **Internal Padding:** `p-4` to `p-7` depending on card density (admin stat cards tighter, content cards and forms more generous).

### Inputs / Fields
- **Style:** `--surface` background, 1px `--border`, `rounded-md`, `h-11`.
- **Focus:** border shifts to `--primary`, no glow/ring — a quiet, precise focus cue rather than a loud one.

### Navigation
- Sticky header on a translucent/blurred background; active/hover link states use the muted-surface background and shift text to full foreground color. Mobile collapses to a slide-down menu.

### Festival Hero Takeover (signature component)
The homepage hero is a themeable "festival takeover" system (`src/lib/festivals.ts`): badge text, headline, sub-copy, CTAs, an offer strip, featured products, and a bespoke SVG decoration (lanterns for Ramadan, a pookalam for Onam, diyas for Diwali, a star lantern for Christmas, etc.) all swap together based on the active theme/date, while the component code itself never hardcodes festival-specific text or art.

## Do's and Don'ts

### Do:
- **Do** derive every color from the active theme's CSS custom properties (`var(--primary)`, etc.) — never hardcode a hex value in a component, since the same component must work correctly across every festival theme.
- **Do** use the lamplight glow (`--glow`/`--glow-soft`) as the only depth cue on hover; keep rest-state surfaces flat.
- **Do** keep gold as the single dominant accent; reach for maroon or green only for their one specific meaning (alert/error, best-seller).
- **Do** pair serif headings with sans body/UI text — never swap them.

### Don't:
- **Don't** add resting-state drop shadows to cards or panels — flat-by-default is a deliberate invariant, not an oversight.
- **Don't** introduce a second gold-weight accent color; secondary colors stay rare and single-purpose.
- **Don't** use the serif display font for body copy, buttons, or form inputs.
- **Don't** fetch fonts from Google at build time — fonts are self-hosted via Fontsource (a prior Render build-reliability fix); any new font must follow the same pattern.
