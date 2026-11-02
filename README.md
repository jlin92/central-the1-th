# The 1 (Central Group) × Dynamic Yield — App Demo

A high-fidelity, clickable prototype of Central Group's **The 1** loyalty app, personalised by **Dynamic Yield** (sorting optimiser, merchandising rules, real-time affinity, generative banners) with a conversational **The 1 assistant** powered by **Shopping Muse**.

It reuses the architecture, interaction model and presenter tooling of the [Telstra Plus](https://github.com/jlin92/telstra-au), [MTN MoMo](https://github.com/jlin92/mtn-momo-dy) and [Rakuten](https://github.com/chris9689/rakuten-loyalty) prototypes (React + TypeScript + Vite + Tailwind + framer-motion; chapters, persona context, presenter rail, "Why shown now" rail). The visual layer replicates The 1 app: dark home header with `Points (≈฿)` and coupon counter, brand bubbles, *Only for You* / *Challenge of The Month* / *Free Entertainment & Food Perks* / *Central App Extra Discounts* / *The 1 Phrom Pay* shelves, the Search tab with chips and coupon tickets, the Challenge tab, the `The 1 | Level` badge, the red *Points History | Member Benefits* band and the floating *Scan | Show QR* pill.

## Run it

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20   # Node ≥ 20.19
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build
npm run catalogue    # regenerate src/mock-data/catalogue.json from feed/*.csv
```

> Behind a corporate TLS proxy: `npm install --cafile=<your-ca-bundle.pem>`.

## Controls

| Key / control | What it does |
|---|---|
| `P` or **Presenter** button | Presenter panel: persona switch, DY controls, persona story, screen jumper, reset |
| `T` | Toggle **"The 1 today"** (newest-first, no filtering — the current app) vs Dynamic Yield sorting |
| `L` | Toggle the **store-location signal** (Nat at Tops Central Rama 9) |
| **Why this?** / **Why this order?** in the app | Opens the reasoning rail: signals, treatment on this screen, live affinity, and the **sorting optimiser board** (weighted factors + what merchandising rules filtered out) |
| Banner variant **A / B / C** | Switch the generative banner creative for the persona |

See [DEMO_FLOWS.md](DEMO_FLOWS.md) for the two scripted journeys.

## What is personalised (and where)

| Use case (from The 1 conversations) | Where to see it |
|---|---|
| **Dynamic sorting of hubs / PLPs by real-time affinity** | Search tab (category pages), Tops brand hub, *Only for You*. Tap chips / open offers and watch the order change |
| **User-margin algorithm** (highest value for lowest points / spend; 8 pts = ฿1 benchmark) | *Best value for your points* shelf, Redeem Cash screen, offer detail value panel |
| **Merchandising rules**: hide out-of-stock, not-enough-points, level-gated, already redeemed, already in wallet, cardholder, online-only when in store | "N hidden" line on lists; reasoning rail lists each rule and count |
| **Personal (targeted) items pinned on top** | Central ฿20 Off (Ploy), Tops Weekly Shopper mission (Nat) — "Targeted offer — always on top" |
| **Store location → re-sort at the moment of purchase** | `L` with Nat → home banner, Tops hub (in-store first, Tops Online hidden), wallet re-order, assistant nudge |
| **Gamification promoted when short of points** | Ploy: challenges boosted on home/search; offer detail suggests the mission that covers the gap |
| **Running out / ending soon urgency** | "Running out", "Ends in 2 days" badges and ranking factor |
| **Purchase-cadence suppression (AffinityML)** | Nat bought a TV at Power Buy → Power Buy electronics demoted |
| **Banner personalisation + generative experiences** | Home hero: 3 generated variants per persona (A/B/C), a live-generated variant from in-session affinity (Ploy), a location-triggered variant (Nat) |
| **Smart search → Shopping Muse** | Type "coffee", "กาแฟ", "movie", "luxury bag": intent expansion, then *Ask The 1 assistant about "coffee"* hands the query to Muse |
| **Shopping Muse: support + commerce** | Education ("How does The 1 work?"), value ("Use my expiring points"), guided discovery with offer cards from the same feed; every intent feeds affinity |
| **Level-aware content** | `The 1 | Level 1/3` badge, benefits, Level 2+ coupons gated |
| **Compare with today** | `T` flips every list to newest-first/no-filter so the contrast is visible |

## Personas

- **Ploy Siriwan — new member, first open.** Level 1, 0 points, no history. Cold start on popularity + free coupons; gamification promoted; the app re-ranks within the session (chips, offers, assistant intents) and generates a banner from the live signal.
- **Natthaporn "Nat" Chaiyaporn — returning Level 3.** 24,850 pts (3,200 expiring 31 Dec), weekly Tops in-store shopper, mum of two (The 1 Family), Sephora regular, Central The 1 REDZ cardholder, redeemed Starbucks ฿50 two weeks ago, bought a TV six weeks ago. Expiry urgency, affinity + user-margin sorting, suppression of what she already has, challenge progress, store-location re-sort.

## Data

`feed/the1_offers_dy_feed_v2.csv` is the supplied DY product feed (200 offers). `scripts/build-catalogue.mjs` derives card titles, popularity, tags and store formats and adds 37 generated offers that make the stories richer (Tops store formats, coffee, luxury, kids, out-of-stock and expiring examples). Brand "logos" are rendered as wordmarks on brand colours so nothing can 404 in a live demo.

## Structure

```
src/app/            chapters, DemoContext (persona, wallet, points, affinity, location, sort mode), screens
src/services/       sortEngine (scoring + merchandising rules), selectors (shelves, banners, best value)
src/mock-data/      catalogue.json, offers.ts (brand palette, chips, smart-search synonyms), appUsers.ts, muse.ts
src/components/     layout (frame, header, bottom nav, scan pill), offers (cards, brand tiles), presenter, muse, ui
```

*All balances, levels, coupons, points prices and offers are illustrative demo data.*
