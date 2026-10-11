# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primarily expat households in the UAE/Gulf (Keralite and broader South Asian diaspora) who miss home-cooked pickles and spices, ordering for regular household stock-up or gifting. A secondary, broader audience of food enthusiasts anywhere is drawn by the same small-batch, home-cooked positioning.

## Product Purpose

An online storefront for home-cooked Kerala pickles, whole spices, and specialty jars, made in small batches in a real family kitchen and delivered fresh. Success is a repeat customer who orders again because it genuinely tastes like home.

## Positioning

Family-kitchen authenticity and speed: genuinely home-cooked in small batches by a real family kitchen (not a factory), FSSAI-approved, packed and delivered within 48 hours — not mass-produced, shelf-stable jars sitting in a warehouse. A neighboring seller competing on price or catalog breadth could not truthfully copy the "home-cooked, 48-hour-fresh" claim.

## Operating Context

- Storefront: browse, cart, checkout, customer accounts/order history, reviews, festival-themed storefront takeovers (Ramadan, Eid, Onam, Diwali, Christmas).
- Checkout currently hands off to WhatsApp (no live online payment gateway) — the customer sends their order as a pre-filled WhatsApp message, the admin confirms and logs it.
- Admin dashboard: inventory (add/edit/delete products, stock, photos), orders (status updates that auto-notify customers via WhatsApp), customers report, reviews moderation, homepage media, theme/settings, multiple named admin logins.
- New customers get a one-time 10% discount, enforced server-side and de-duplicated by email + phone so one person can't re-claim it with a second account.

## Capabilities and Constraints

- Built on Next.js (App Router) with MongoDB Atlas as the single data store (one "state" document holding products, orders, customers, reviews, settings, media).
- Hosted on Render (free tier — the instance sleeps after ~15 minutes idle; a scheduled uptime ping keeps it warm during business hours).
- No real payment gateway integrated yet — COD/UPI are presented as options but checkout currently always routes to WhatsApp for manual confirmation.
- Product images are either bundled defaults or admin-uploaded (stored as base64 in MongoDB, served via versioned, immutable-cacheable URLs).

## Brand Commitments

- Name: Fresh Fusion.
- The only hard, must-stay-accurate claims are **"FSSAI-approved"** and **"packed within 48 hours"** — do not add unverified certifications, awards, stats, or testimonials beyond what's genuinely true.
- Tone: warm, home-kitchen, unpretentious — not a slick corporate FMCG brand.

## Evidence on Hand

- Real bundled product photography exists for several items (e.g. Beef Pickle, Fish Pickle, spice grids) under `public/images/`; many catalog items still fall back to placeholder color-gradient art until an admin uploads a real photo.
- No customer testimonials, press mentions, or third-party reviews exist yet beyond the site's own (admin-moderated) review system — do not fabricate any.

## Product Principles

1. Home-cooked authenticity over mass-production polish — design and copy should feel like a real family kitchen, not a slick FMCG brand.
2. Freshness and speed are the differentiator — "packed within 48 hours" and FSSAI-approval should stay visible and accurate wherever trust matters (hero, checkout, footer).
3. Never trust the client for anything money- or stock-related — prices, discounts, and totals are always recomputed server-side.
4. WhatsApp is the real transaction channel right now, not a gimmick — checkout, order-status updates, and admin tooling should treat it as first-class, not an afterthought bolted onto a "real" payment flow.
5. Admin tooling should stay simple enough for a small family operation to run day-to-day without training.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established beyond standard web accessibility practice.
