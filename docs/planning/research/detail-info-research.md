# World Dishes — Detail-Page Info Research

Product research on what ADDITIONAL info to add to the dish detail page
(`src/pages/DishPage.tsx`). No source code was changed.

## Baseline

**Shown today:** category sprite, name + localName, worldwide popularity rank,
flag-linked country/region, description, origin note, dietary badges (base,
pork/beef/alcohol flags, spice level, allergens), "Mark as tried" toggle,
star + note review editor, "More from {country}" grid.

**Data per dish today** (`types.ts`): id, name, localName, countryId, regionId,
category, dietary{base, containsPork, containsBeef, containsAlcohol}, allergens[],
spiceLevel (0–3), popularityRank (derived from `fame`), description, origin.
Countries: name/flag(emoji)/continent/region. Per-user progress: tried, rating,
note, triedAt (Supabase-backed).

**Curation surface — the key constraint.** The dataset is **~473 dishes**
(124 world-famous + 45 regional + 304 local; counted from the data files). So
**every new REQUIRED field ≈ 473 authored values.** That is the single biggest
cost driver below. Short/optional/enum fields are cheap; free-prose fields at
473× are the expensive ones. Prefer (a) info DERIVED from existing data =
zero curation, (b) short enum/array fields, (c) optional fields populated only
for notable dishes.

**Platform constraints.** Static SPA on GitHub Pages + Supabase. CSP /
self-contained: no arbitrary runtime external APIs, no remote images (no photos
or audio unless self-hosted/inline — both heavy). Community data must come from
our own Supabase.

---

## Prioritized recommendations

Ratings: Value and Effort each High/Med/Low. "Add first" = best value-for-effort.

### 1. Key ingredients  ⭐ ADD FIRST
- **What:** 3–6 signature ingredients as chips (e.g. Pad Thai → rice noodles,
  tamarind, egg, peanuts, shrimp). New field `keyIngredients: string[]`.
- **Why interesting:** The single most-requested fact on every food reference —
  Wikipedia's infobox leads with `main_ingredient`; TasteAtlas descriptions
  center on ingredients. Answers "what's actually in this?" at a glance, and is
  exactly the allergy/curiosity question the current allergen badges only hint at.
- **Curation:** New field. ~473 short arrays, but these are already implicit in
  the existing `description` prose — fast to extract, low ambiguity. Bounded.
- **Feasibility:** Trivial client-side (render chips). Bonus: chips can link to a
  future ingredient filter, turning data into navigation.
- **Value High / Effort Med.**

### 2. Community stats — "X people tried this · avg ★4.2"  ⭐ ADD FIRST
- **What:** Aggregate the existing Supabase progress data: number of users who
  marked it tried, and average community rating. The Untappd/Vivino check-in
  social-proof analog.
- **Why interesting:** This is the whole point of a tracking app — social proof
  and "am I with the crowd or off the beaten path?". Makes the private tracking
  loop feel alive; rewards rating. Vivino/Untappd put community rating front and
  center on every item page.
- **Curation:** ZERO — derived from data we already collect.
- **Feasibility:** Needs a Supabase aggregate (a `view` or `RPC`/`count` +
  `avg`, read-only, cached; watch RLS so it exposes only aggregates, not
  per-user rows). Small backend task, no curation. Show a graceful "be the first
  to try this" empty state at low counts to avoid lonely "1 person" numbers.
- **Value High / Effort Med.**

### 3. Similar dishes across countries  ⭐ ADD FIRST
- **What:** A "You might also like" row of dishes in the SAME category from
  OTHER countries (e.g. from Ramen → Pho, Laksa, Kalamen). Complements the
  existing same-country "More from {country}" grid.
- **Why interesting:** Cross-cultural discovery is the app's superpower — "what's
  the [dish] of other countries?" It surfaces the breadth of the atlas and drives
  exploration/tracking of new regions.
- **Curation:** ZERO in the derived form (filter by `category`, exclude same
  country, sort by popularity). Optionally add a hand-picked `similarTo: string[]`
  later for editorial quality, but not required to ship.
- **Feasibility:** Pure client-side, reuses `dishes` + existing `DishGrid`.
  Cheapest high-value win in this list.
- **Value High / Effort Low.**

### 4. How & where it's eaten (course + setting)
- **What:** Two short enum-ish facts: meal/course (breakfast / snack / main /
  street / dessert / drink) and setting/how (street stall, restaurant, home,
  eaten by hand, shared plate). Wikipedia's `course` + `served`.
- **Why interesting:** Travel-planning gold — tells you when/where you'd actually
  encounter and order it. High utility for the "eat my way around the world"
  user.
- **Curation:** `course` is partly derivable from `category` (dessert→dessert,
  beverage→drink, streetfood→street) with overrides; `setting` needs a short
  curated enum/tag per dish. Medium.
- **Feasibility:** Easy render (badges/line). Fits the existing badge row.
- **Value Med-High / Effort Med.**

### 5. "What to expect" taste profile
- **What:** A one-line taste sentence and/or a few flavor tags (savory, tangy,
  sweet, rich, herby, funky) — layered on top of the spice level we already show.
- **Why interesting:** The decision-maker for adventurous eaters: "will I like
  this?" Flavor profile (sweet/sour/salty/bitter/umami + texture) is the standard
  way food guides set expectations.
- **Curation:** New field. Either a short prose line (473× writing, Med-High) or
  a small tag enum (cheaper, more consistent, filterable — preferred).
- **Feasibility:** Trivial render; tags reuse the badge pattern.
- **Value High / Effort Med.**

### 6. Pronunciation of the local name
- **What:** Phonetic respelling of `localName`/name (e.g. Pho → "fuh", Gyros →
  "yee-ro", Paella → "pie-AY-ya").
- **Why interesting:** Distinctive, delightful, genuinely useful for ordering
  abroad and avoiding the classic mispronunciations food media loves to cover.
  Reinforces the localName the page already shows.
- **Curation:** New optional field. ~473 careful respellings — non-trivial and
  easy to get wrong, so Med-High. Best done only where the name is non-obvious.
  Audio is effectively out (no external TTS/CDN under CSP; self-hosting 473 clips
  is heavy) — ship text respelling only.
- **Value Med / Effort Med-High.** Nice-to-have with high charm.

### 7. "Also known as" / alternative names
- **What:** Optional `aka: string[]` — regional spellings and alternate names
  (e.g. Cilbir / Turkish eggs; Bánh mì / Vietnamese sandwich).
- **Why interesting:** Recognition ("oh, THAT dish") and disambiguation; standard
  Wikipedia `alternative_name` field.
- **Curation:** Optional, sparse — many dishes have none, so low total cost.
- **Feasibility:** Trivial render.
- **Value Med / Effort Low.** Cheap polish; bundle with pronunciation.

### 8. Richer cultural/historical note (extend `origin`)
- **What:** A longer, story-style note beyond the current one-line `origin`
  (the TasteAtlas "experiential" tone), as an optional `story`/expanded field.
- **Why interesting:** Storytelling is what makes food memorable and shareable;
  deepens the atlas from database to guide.
- **Curation:** Free prose × up to 473 = expensive if universal. Make it OPTIONAL,
  written first for the ~124 world-famous tier, and let the page fall back to the
  existing `origin` line.
- **Value Med / Effort Med-High (scales with how many you write).**

---

## Nice-to-have (defer)
- **Collection context** — "You've tried 3 of 12 dishes from Japan" on the detail
  page. Derived (progress + `dishesForCountry`), zero curation, reinforces the
  tracking loop. Cheap; small motivational win. (My addition.)
- **Best time / season** — only meaningful for a minority of dishes (seasonal
  produce, festival foods). Sparse optional tag; low coverage.
- **Vegetarian-variant availability** — a `vegVariant: boolean/note` flag. Useful
  given the app's strong dietary theme, but narrow; could fold into taste/how-eaten.
- **Common pairings / what to order with it** — TasteAtlas-style drink/side
  pairing. Good value but overlaps with #4; another curated field. Second wave.

## Skip (low value or infeasible here)
- **Price range / typical cost** — varies wildly by country and street-vs-
  restaurant; low-trust, high-maintenance, and dates fast. Skip (at most a rough
  $/$$/$$$ tier if ever).
- **Map pin** — we only have country + emoji flag (no coordinates); a
  country-centroid pin adds ~nothing over the flag already shown. Needs geo data +
  a self-hosted/offline map to satisfy CSP. Not worth it.
- **Dish photos** — blocked by CSP unless self-hosted; sourcing + licensing +
  hosting ~473 images is a project of its own. Sprites already cover the visual
  slot. Skip for now.
- **Full recipe / nutrition & calories** — off-brand for a discovery/tracking app,
  huge curation, low trust on nutrition. Skip.

---

## Recommended "add these first" set
The four best value-for-effort, front-loading the two zero-curation wins:

1. **Similar dishes across countries** (derived, ~zero curation, pure code).
2. **Community stats** (derived from Supabase progress; the tracking-app payoff).
3. **Key ingredients** (highest-value curated field; bounded, extractable from
   existing descriptions).
4. **How & where it's eaten** (course partly derivable + short setting tag;
   strong travel utility).

Second wave: taste-profile tags (#5), then pronunciation + AKA (#6/#7) as a
charm bundle, then optional cultural stories (#8) for the world-famous tier.

---

## Sources
- [TasteAtlas — World Food Atlas](https://www.tasteatlas.com/)
- [Wine & More — what TasteAtlas dish pages offer (ingredients, restaurants, pairings)](https://www.wineandmore.com/stories/tasteatlas-the-best-local-food-options-for-travellers-around-the-world/)
- [ChatterSource — What Is TasteAtlas?](https://www.chattersource.com/tasteatlas/)
- [Wikipedia — Template:Infobox food (main_ingredient, course, type, place_of_origin, variations, alternative_name, similar_dish, served)](https://en.wikipedia.org/wiki/Template:Infobox_food)
- [Vivino app — ratings, region, price, tasting notes, food pairings on one page](https://www.vivino.com/en/app)
- [AmassCook / Drinkist — Untappd & Vivino check-in and community-rating features](https://drinkist.app/blog/untappd-alternative)
- [The Girl on Bloor — Guide to Flavour Profiles (taste-profile framework)](https://thegirlonbloor.com/guide-to-flavor-profiles/)
- [Tasting Table — Popular foods pronounced incorrectly](https://www.tastingtable.com/2026205/popular-foods-pronounced-incorrectly/)
- [Real Food Traveler — Dining Dictionary (pronunciation as travel info)](https://www.realfoodtraveler.com/dining-dictionary-to-the-rescue/)
