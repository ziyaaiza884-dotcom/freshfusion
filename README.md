# Fresh Fusion

> Home-cooked flavours, delivered fresh.

Storefront + admin for a small-batch home-kitchen brand selling pickles, whole
spices and ready-to-cook specialties. Built in slices:

- **Slice 1 — storefront** (done): browse / product / cart / checkout / order.
- **Slice 2 — admin dashboard** (done): JSON-file data store, order API,
  password-gated `/admin` with inventory, orders and an analytics overview.
- **Slice 3 — payments** (done): a mock gateway shaped like Razorpay
  (create-order → payment modal → server-side signature verify → paid/failed
  order state), COD vs prepaid, admin payment badges + "mark COD collected",
  and server-side price/total recomputation so client amounts can't be spoofed.
- **Slice 4 — reviews & ratings** (done): per-product reviews (name · stars ·
  text), auto-published with a "Verified purchase" badge when a matching local
  order exists, product ratings computed from visible reviews, and an admin
  moderation page (hide / show / delete).
- **Slice 5 — themes** (done): 7 admin-set seasonal/festival themes (Everyday,
  Onam, Diwali, Ramadan, Eid, Christmas, Nowruz) — each swaps palette, font
  pairing and corner radius. Chosen in `/admin/settings`, applied to every
  visitor.
- **Deploy** (done): storage moved off the JSON file to **MongoDB** so it runs
  on serverless. `netlify.toml` + `@netlify/plugin-nextjs` included.

Payments still use a local mock gateway.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **MongoDB** (Atlas free M0) — the whole store is one document in a `state`
  collection; `src/server/store.ts` is the only file that talks to it
- **Tailwind CSS v4** — theme tokens in `src/app/globals.css` + `src/lib/themes.ts`
- **Framer Motion** — page transitions, scroll reveals, micro-interactions
- **lucide-react** icons, hand-drawn SVG product art (`src/components/product-art.tsx`)
- **Jest** + Testing Library — pure logic + the store (against `mongodb-memory-server`)

## Environment

Copy `.env.example` → `.env.local`. Keys: `MONGODB_URI`, `MONGODB_DB`,
`ADMIN_PASSWORD`, `PAYMENTS_KEY_SECRET`, `NEXT_PUBLIC_SITE_URL`. The DB seeds
itself (catalogue, reviews, default theme) on the first request.

## Deploy (Netlify + MongoDB Atlas — free tier)

1. **MongoDB Atlas**: create a free M0 cluster, a DB user, and add `0.0.0.0/0`
   under Network Access (Netlify has no fixed IP). Copy the `mongodb+srv://…`
   connection string.
2. **Netlify**: import the Git repo. `netlify.toml` sets the build; just add the
   environment variables from `.env.example` (real values) in Site settings →
   Environment variables, including `NEXT_PUBLIC_SITE_URL` = your Netlify URL.
3. Deploy. First page load seeds the database.

## Scripts

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the build
npm run lint     # eslint (next config)
npm test         # jest
```

## Storefront

| Route | Page |
|-------|------|
| `/` | Home — hero, best-sellers & new-spice carousels, trust badges, subscribe banner |
| `/shop` | Browse — grid, sidebar filters (category / diet / price / flags), search w/ autocomplete, sort, mobile filter drawer |
| `/product/[slug]` | PDP — art gallery w/ zoom, ingredients & allergens, qty + note-for-packer, low-stock hint, **ratings & reviews** (summary + breakdown + write-a-review form), "customers also bought" |
| `/cart` | Line items, qty / remove / save-for-later, discount codes (`FRESH10`, `PICKLE50`), order summary, free-delivery meter |
| `/checkout` | Address w/ pincode auto-fill, delivery-slot picker, payment method. COD posts straight through; card/UPI/wallet open a mock Razorpay-style modal, then the order is placed with a verified payment |
| `/order/[id]` | Confirmation — order number, payment status, live status steps (from the API), reorder |

Storefront pages are dynamic and read products from the store, so admin edits
show up immediately.

## Admin (`/admin`)

Password gate: set `ADMIN_PASSWORD` in `.env.local` (default `freshfusion`).
`src/proxy.ts` redirects unauthenticated `/admin/*` to `/admin/login` and 401s
`/api/admin/*`. Login exchanges the password for an httpOnly `ff_admin` cookie.

| Route | Page |
|-------|------|
| `/admin` | Overview — revenue today / 7-day, AOV, **COD-to-collect**, 7-day bar chart (inline SVG), top SKUs, low-stock alerts |
| `/admin/inventory` | Product table — inline-edit price / stock / made-on date, in-stock toggle; saves via `PATCH /api/admin/products/[slug]` |
| `/admin/orders` | Order list — expandable rows (items, address, **payment ids**, status history), status workflow + **"mark COD collected"** via `PATCH /api/admin/orders/[id]` |
| `/admin/reviews` | Moderation — every review with hide/show (`PATCH /api/admin/reviews/[id]`) and delete (`DELETE`); ratings recompute from visible reviews |

Admin mutations call `revalidatePath` on the affected storefront routes.

## Payments (mock gateway)

`src/server/payments/gateway.ts` mimics the Razorpay calls used at checkout —
`createGatewayOrder`, and `signPayment` / `verifySignature` using the real
`HMAC_SHA256(orderId + "|" + paymentId, KEY_SECRET)` scheme. Config:
`PAYMENTS_KEY_ID` (default `rzp_test_mock`), `PAYMENTS_KEY_SECRET` (default
`mock_secret`), `PAYMENTS_PROVIDER` (`mock`). To go real: set
`PAYMENTS_PROVIDER=razorpay` + real keys and implement the `razorpay` branch.

Flow: prepaid checkout → `POST /api/payments/create-order` → mock modal →
`POST /api/payments/mock-pay` (returns a signed `{ paymentId, signature }`) →
`POST /api/orders` with the payment, which **verifies the signature and
recomputes every line price + total from the store** before saving. Bad
signature → 402, no order. COD orders are saved `payment.status: "pending"`.

## Data

- Seed catalogue (27 products) — `src/data/catalog.ts`. Seed reviews —
  `src/data/seed-reviews.ts` (deterministic, so every product has reviews on
  first run; `catalog.ts` `rating`/`reviewCount` are just hints for it).
- Runtime store — one document (`_id: "singleton"`) in the `state` collection of
  the MongoDB database. Holds products (with `stockQty`), orders (`status`,
  `statusHistory`, `payment`), `reviews` and `settings` (theme). `src/server/mongo.ts`
  owns the pooled connection (cached on `globalThis`, with a public-DNS fallback
  for `+srv` on flaky local resolvers); `src/server/store.ts` is the only caller.
  `getStoreProducts()` overlays each product's rating with the value computed
  from visible reviews.
- To reseed: drop the `state` collection (or the whole DB) in Atlas — it
  re-seeds on the next request.
- Cart still lives in `localStorage` (`src/context/cart-context.tsx` +
  `src/lib/cart.ts`); the confirmation page also keeps a local order mirror.

## Deferred to later slices

Full auth (NextAuth + user table), real Razorpay/Stripe + webhooks, rate
limiting + body-size limits on the public `order` / `payment` / `reviews`
endpoints, live rider tracking, subscriptions, coupon creator, multi-language
(English / Malayalam / Tamil), review photos,
product photography.
