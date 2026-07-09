# World Dishes — Visual Direction

*Product design director recommendation. React SPA, self-contained/CSP: no external web fonts, no remote images — system-font stacks or self-hosted only, vector/inline assets only.*

---

## 1. Where the current design stands

The existing system is genuinely good and worth building **on top of**, not replacing:

- Warm cream base (`#fbf7f0`), confident red primary (`#d1462f`), amber accent, success green — appetizing and distinct.
- One cohesive **inline-SVG dish icon family** (`DishSprites.tsx`): two-tone, `currentColor`, theme-aware. This is the strongest asset in the app and already CSP-clean.
- SVG progress-ring donut, pill chips, sticky blurred header, light/dark via `prefers-color-scheme`.
- Sensible density and rounded-card language.

What holds it back from reading "worldly, appetizing, collectible, trustworthy, modern":

1. **One typeface, no editorial voice.** A single system-sans stack makes it read like a generic dashboard. Food-media and guide products (Michelin, TasteAtlas, Bon Appétit, Atlas Obscura) all lean on a display/serif tier for authority and appetite.
2. **Emoji as load-bearing UI** (🌍 brandmark, flag emojis, allergen/spice glyphs). Emoji render differently per OS, look like clip-art, and undercut the "trustworthy guide" feel. They are also inconsistent in size/baseline.
3. **The collection/"tried" state is under-celebrated.** A green border is the only reward for the core action. There is no collectible payoff — the thing that makes Untappd/Letterboxd sticky.
4. **No motif.** Nothing ties the visuals to travel/passport/world beyond the color.
5. **Real contrast failures** (measured, sRGB WCAG):
   - Amber `#e8a020` as text/border on cream = **2.07:1** (mockTag, regionTag, review stars) — fails.
   - Diet pills use white text on light fills: vegetarian **2.50:1** (fail), vegan **3.42:1** (fails AA small), pescatarian **3.88:1** (fails AA small). Only meat passes.
   - Primary red on cream = **4.25:1** — AA-large only; fine for buttons/headings, risky for small body text.

---

## 2. Concept / motif: **"The Culinary Passport"**

A field guide you stamp. The app is framed as a passport + collector's atlas: you travel the world's cuisines, and each dish you've tried gets **stamped** into your collection. This motif does triple duty:

- **Worldly & trustworthy** — passport/guide language borrows the authority of Michelin and the exploration feel of Atlas Obscura without costume-y skeuomorphism.
- **Collectible** — the stamp is the reward loop (Untappd badges, Letterboxd's logged/liked marks). It turns "mark as tried" into a moment.
- **Appetizing** — kept warm and food-forward via the retained cream+red palette and the existing dish-icon family.

Executed with restraint, the motif shows up in **exactly three places**: (a) a **stamp for the country-completion moment** (earned and rare — you don't stamp a passport 428 times), (b) **flags/country marks** (self-hosted SVG flags as the target, ISO-code chips as the zero-asset interim) in place of emoji, and (c) the **collection progress** treatment (rings + passport-progress bar). It is a *motif*, not a theme-park skin — no faux leather, no distressed-paper filters, no dotted-world-map wallpaper, no rotated-everything.

> **Review note (folded in):** an earlier draft stamped *every dish* and added a faint world-map texture + "Top 10" rank ribbons. A skeptical design review flagged these as metaphor-breaking and AI-slop clichés. Corrected below: the stamp is **country-level only**, per-dish "tried" is a quiet filled-plate chip + check, and the map texture / invented ranks are cut.

---

## 3. Palette (mapped to `theme.css` variables)

Keep the warm identity. Refine the reds for contrast, demote amber to decoration, add a dark **gold-ink** for amber-colored text, and add a deep **"passport ink"** secondary for trust. New tokens are additive.

### Light
| Token | Current | Proposed | Note |
|---|---|---|---|
| `--c-bg` | `#fbf7f0` | `#faf6ef` | ~unchanged warm cream |
| `--c-surface` | `#ffffff` | `#ffffff` | keep |
| `--c-surface-2` | `#f4ede1` | `#f3ebdd` | keep |
| `--c-border` | `#e7ddcd` | `#e6dccb` | keep |
| `--c-text` | `#2c2620` | `#2a241d` | espresso, slightly deeper |
| `--c-text-muted` | `#6f6858` | `#6b6454` | keep (5.2:1, passes) |
| `--c-primary` | `#d1462f` | `#c23d29` | deeper paprika → **4.9:1** on cream, passes AA small |
| `--c-primary-ink` | `#ffffff` | `#ffffff` | keep |
| `--c-accent` | `#e8a020` | `#e8a020` | **keep as fill/decoration only** (stamps, ring, stars-on-dark) |
| **`--c-accent-ink`** *(new)* | — | `#8a5410` | gold-ink for amber-colored **text/borders on light** (5.7:1 on white, 4.4:1 on cream) |
| `--c-success` | `#4a8f3c` | `#3f8a34` | tuned |
| **`--c-ink`** *(new)* | — | `#26303a` | passport-ink navy for secondary/trust accents, map lines |

### Diet colors — switch to **tinted pills** (fixes contrast + more modern)
White-on-color fails. Use a light tint background + dark colored text instead. Define paired tokens:

| Diet | Text/ink | Tint bg (light) |
|---|---|---|
| vegan | `#2f7a3c` | `#e6f2e6` |
| vegetarian | `#4f7a1f` | `#eef4e0` |
| pescatarian | `#1f6a9c` | `#e3f0f8` |
| meat | `#a5342a` | `#f7e6e3` |

All comfortably clear 4.5:1. (If solid pills are preferred for punch, darken the fills so white text hits 4.5:1 — but tinted reads more premium and is the recommendation.)

### Dark (largely keep; nudge for depth + a touch of green-black à la Letterboxd)
| Token | Current | Proposed |
|---|---|---|
| `--c-bg` | `#191512` | `#17130f` |
| `--c-surface` | `#23201c` | `#221e19` |
| `--c-surface-2` | `#2c2823` | `#2b2620` |
| `--c-border` | `#38332c` | `#39332b` |
| `--c-text` | `#f2ece2` | keep |
| `--c-text-muted` | `#a89f90` | `#ab9f8d` |
| `--c-primary` | `#e8624b` | `#ef6a52` (brighter on dark) |
| `--c-accent` | `#edb04a` | keep (amber text is fine on dark; `--c-accent-ink` = `--c-accent` in dark) |
| `--c-ink` | — | `#9fc0d8` (light navy, legible on dark) |

Dark stays a first-class citizen (Letterboxd/Untappd audiences skew evening use).

---

## 4. Typography — add a display tier

Keep the sans stack for UI/body. **Add a display serif** for dish names, page titles, and country names — the highest-leverage move to escape the generic look.

**Honest cross-platform caveat:** a pure system-serif stack is CSP-clean but resolves to *different faces per OS* — Iowan Old Style (Apple only), Palatino Linotype (Windows), and on **Android/ChromeOS there is no Georgia/Palatino**, so it falls through to `ui-serif`→Noto Serif. The "editorial/Michelin" look is therefore only guaranteed on Apple. If a consistent display voice matters (it does, for brand), a **self-hosted display woff2 is the real answer, not a stretch** — it's the only CSP-clean way to look the same everywhere. Two tiers:

- **Tier A (ship first, zero assets):** the system-serif stack below. Accept per-OS variation.
- **Tier B (recommended target):** self-host ONE display face (e.g. Fraunces or Bricolage Grotesque) as a subsetted Latin `woff2` in `/public/fonts`, `@font-face` with `font-display: swap`. Budget ~30–60KB for a **single static weight** (a variable-font Latin subset runs larger — don't assume 30–60KB covers variable).

```css
--font: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;   /* UI + body, unchanged */
--font-display: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, ui-serif, serif;  /* NEW */
--font-num: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, monospace;               /* optional, for scores */
```

Usage:
- `--font-display` on: page `.title`, dish `.name`, country `.detailTitle`/`.name`, big stat numbers. Set `font-weight: 600–700`, slightly tighter tracking. This reads editorial/Michelin instantly.
- Add `font-variant-numeric: tabular-nums` to stats, the progress-ring text, and rating counts so numbers don't jitter.
- Keep sans for chips, buttons, nav, badges, body copy.


---

## 5. Components

### Cards (`DishCard`)
- Give the header a **display-serif dish name**; keep the sans local name/origin.
- Move the dish-icon sprite into a slightly larger, tinted "plate" chip and let its color shift on the tried state.
- **Per-dish tried = quiet, not a stamp.** The dish-icon plate fills in (tinted `--c-success`) with a small check; the card relaxes slightly to read as "collected." *No per-dish stamp* — stamping all 428 dishes breaks the passport metaphor and produces a grid of identical tilted marks (the collectible stamp is reserved for country completion, below).
- Keep the compact collapsed-review affordance; use a plain, well-styled toggle (no "ticket stub" skeuomorphism — that would contradict §8).

### Grid (`DishGrid`, `CollectionPage`)
- Keep `auto-fill minmax()`. Standardize gutters to a spacing scale (see §7). Popular grid 280px, country/collection cards fine at 230px.
- The data already carries a `rank`, so a restrained numbered treatment on Popular is fine — but **do not invent global "Top 10 Worldwide" ribbons** unless a real global-ranking model backs them (that would be TasteAtlas cosplay and misleading). Prefer a simple `.rank` numeral in the display serif.

### Badges (`DishBadges`)
- Diet pills → **tinted style** (§3) — this is the contrast fix and looks more refined.
- Spice: replace 🌶️ emoji with a small inline-SVG chili glyph in the sprite sheet, filled `--c-primary`, N repeated — consistent cross-platform.
- Allergens: replace emoji with tiny inline-SVG monochrome glyphs (`currentColor`) — same family as dish sprites. Keep the `cursor:help` + title.
- Flags: **this is a correctness fix, not just taste** — emoji flags do NOT render as flags on Windows/Chrome (they show the two ISO letters), so the current UI is already broken cross-platform. Country records already carry the lowercase ISO code as `id` (`id: 'jp'`), so both options are cheap:
  - **Target: self-hosted SVG flags** for the 35 countries (a bounded, small, self-hostable set). Worldliness is the whole brand hook — flags carry instant recognition that text loses, so make real flags the endpoint.
  - **Interim: ISO-code chips** (`IT`, `JP`) in a rounded rect (`--c-surface-2`/`--c-ink`) — zero assets, perfectly consistent, ship day one.
  Both beat emoji; ship the chip first, land the SVG flags soon after.

### Country completion = the stamp (the collectible payoff)
- Reserve the **circular "stamp" moment for finishing a country** (all dishes tried). This is rare and earned, so it stays special: a small rotated circular stamp ("TASTED" + country + date, inline SVG, `~8–10°` tilt, `--c-accent`/`--c-ink` outline) appears on the country card/header. This is where the passport metaphor actually lands.

### Progress ring (`CountryProgressRing`)
- Keep the SVG donut. Add: `tabular-nums`, a subtle two-stop stroke (primary→accent) via `<linearGradient>`, and a satisfying complete state (fill the ring + the country stamp rather than a bare ✓ glyph). Respect `prefers-reduced-motion` for the fill animation.
- Add a **top-level "passport progress"** summary somewhere on Collection: "You've tried 84 / 428 dishes across 19 / 35 countries" with a slim world-progress bar — the headline collection metric.

### Header / brand
- Replace 🌍 brandmark with a small **inline-SVG mark** — keep it a *simple abstract mark* (`currentColor`/`--c-primary`), not a literal globe-as-plate mashup (that's a predictable AI-logo move). Set wordmark "World Dishes" in `--font-display`.
- Fix the `mockTag` (see contrast) — restyle as a neutral `--c-ink` outline chip, not amber.

### Reviews & ratings — reflect the user's own data back (core of a tracker)
This is half the product and needs real direction, not one line. The stickiness of Letterboxd/Untappd is *your own history handed back to you*:
- **Star ratings:** a proper interactive star control (inline-SVG stars, `--c-accent` fill, empty = `--c-border`), consistent on cards and in `NoteEditor`. Show the user's own rating prominently on tried cards.
- **Notes:** render saved notes as a clean quoted block (display-serif, `--c-ink` hairline), not just an ellipsized line — the note is the memory.
- **Reflection surfaces:** let users sort/filter their collection by *their own rating*, add a "your top dishes" cut, and recall per-country notes. The current single progress bar is a thin payoff for a collection product.

### Texture
- **No world-map / dotted-route wallpaper** (cut per review — it's the most overused AI travel-decoration cliché). If any texture is wanted, derive it from the app's own dish-sprite family and use it in at most one place.

---

## 6. Motion, density, accessibility

**Motion / microinteractions**
- Keep the 120–150ms card hover lift; it's good.
- **Stamp-on-tried**: when marking tried, the stamp appears with a quick scale-from-1.15 + tiny rotate settle ("thunk"), ~180ms. This is the signature moment — make it feel physical but fast.
- Progress ring animates its fill (already does); guard with `@media (prefers-reduced-motion: reduce)` to disable transforms/fills.
- No parallax, no autoplay, no long easing. Restraint keeps it trustworthy.

**Density**
- Current density is close. Introduce a spacing scale (`--space-1..6`) and apply consistently; the app currently uses ad-hoc 6/8/12/14/18px values. Slightly increase breathing room on the Popular hero.

**Accessibility (targets: AA — 4.5:1 text, 3:1 UI/large text & non-text)**
- Fix amber-on-light text/borders → use `--c-accent-ink` (`#8a5410`): affects `mockTag`, `regionTag`, and review `summaryStars`/`statAccent` wherever they sit on light. **(contrast bug)**
- Fix diet pills → tinted style. **(contrast bug)**
- Deepen `--c-primary` to `#c23d29` so red small text/links pass AA. **(contrast bug)**
- Keep the existing 3px `--c-accent` focus ring, but verify it against tried/colored cards; consider `--c-ink` ring on amber surfaces.
- Ensure any new flag/stamp/glyph SVGs have `aria-hidden` + accessible text alternatives (the stamp needs an accessible "Tried" label; the ring already has `aria-label`).
- Maintain ≥44px hit targets on the try button and chips (buttons are fine; some chips at 5px padding are borderline — bump to ~7–8px vertical).

---

## 7. "Change first" — prioritized, mapped to files/tokens

Legend: **[FIX]** = UI/UX or accessibility correctness · **[AES]** = pure aesthetic · **[BOTH]** = overlaps.

**P0 — correctness, do first**
1. **[FIX]** Diet pills → tinted (light bg + dark text). Files: `DishBadges.module.css` `.dietPill`/`.dietDot`; tokens: add tinted diet pairs in `theme.css`. *(contrast: 2.5–3.9:1 → >4.5:1)*
2. **[FIX]** Amber text/border → `--c-accent-ink`. Files: `AppShell.module.css` `.mockTag`; `pages.module.css` `.regionTag`/`.statAccent`; `CollectionPage.module.css` `.regionTag`; `DishCard.module.css` `.summaryStars`. Token: add `--c-accent-ink` (`#8a5410` light / = accent dark). *(2.07:1 → 4.4–5.7:1)*
3. **[FIX]** Deepen `--c-primary` to `#c23d29` (light). Token: `theme.css`. *(4.25 → 4.9:1)*
4. **[FIX]** Bump chip vertical padding to ~7–8px for hit target. Files: `FilterBar.module.css` `.chip`, `CollectionPage.module.css` `.regionChip`.

**P0.5 — correctness (cross-platform rendering bug)**
5. **[FIX]** Replace emoji flags with ISO-code chips (interim) — emoji flags don't render on Windows/Chrome. Files: `DishBadges.tsx` `.flag`, `CollectionPage.tsx` `.flag`/`.detailFlag`; `country.id` already = ISO code.

**P1 — highest aesthetic leverage**
6. **[AES]** Add `--font-display` serif stack (Tier A); apply to titles + dish/country names + stat numbers; add `tabular-nums`. Tokens: `theme.css`; Files: `pages.module.css` `.title`/`.statNum`, `DishCard.module.css` `.name`, `CollectionPage.module.css` `.name`/`.detailTitle`, `AboutPage.module.css` `.statNum`, `AppShell.module.css` `.brand`.
7. **[AES]** Per-dish tried state → filled-plate chip + check (NOT a stamp). Files: `DishCard.tsx`/`.module.css` `.tried`, tie-in `DishSprites.tsx`.
8. **[BOTH]** Ratings + notes given real treatment (interactive SVG stars, quoted note block, rating shown on tried cards). Files: `NoteEditor.tsx`/`.module.css`, `DishCard.tsx`/`.module.css` `.summaryStars`/`.summaryNote`.
9. **[AES]** Replace 🌍 brandmark with a simple abstract inline-SVG mark; wordmark in display serif. File: `AppShell.tsx`.

**P2 — depth & delight**
10. **[BOTH]** Country-completion **stamp** + Collection "passport progress" summary (headline metric + slim bar). Files: `CountryProgressRing.tsx`, `CollectionPage.tsx`/`.module.css`, new stamp SVG. Motion: stamp "thunk" with reduced-motion guard.
11. **[AES]** Progress-ring gradient stroke + stamped complete state + tabular text. File: `CountryProgressRing.tsx`.
12. **[AES]** Replace emoji spice/allergen glyphs with inline-SVG family. Files: `DishSprites.tsx` (add glyphs), `DishBadges.tsx`.
13. **[BOTH]** Collection reflection cuts: sort/filter by own rating, "your top dishes". Files: `CollectionPage.tsx`, `lib/filters.ts`.
14. **[AES]** Self-hosted display font (Tier B) + spacing scale tokens (`--space-*`). Tokens/assets: `theme.css`, `/public/fonts`. **Cut from earlier draft:** world-map texture, invented rank ribbons.

**Effort note:** P0/P0.5 are a few hours of token/CSS edits with immediate accessibility + correctness payoff. P1 items 6–8 deliver ~80% of the "new look." P2 is depth.

---

## 8. Guardrails against AI-slop / over-theming
- Motif shows up in **exactly ≤3 places**: (1) country-completion **stamp**, (2) **flags/ISO chips**, (3) **collection progress** (rings + bar). Everything else is neutral UI. *(Cut to hit this count: per-dish stamps, world-map texture, rank ribbons, ticket-stub note, globe-plate logo.)*
- One display face, one UI face — no third font.
- Amber stays decorative; never body text. Keep the new `--c-ink` navy confined to hairline rules / trust accents — it must not become a second brand color competing with the appetizing warm red.
- Keep the existing icon family as the single source of iconography; all new glyphs join it (same 32px grid, `currentColor`, two-tone).
- Ship P0/P0.5 + P1 and evaluate on the live app before P2.
