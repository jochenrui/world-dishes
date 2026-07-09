# World Dishes — Category Icon Spec

Visual specification for the 15 dish-category icons. Format constraints (all icons): inline SVG, 32×32 viewBox, two-tone — a soft `currentColor` fill at ~0.16 opacity for the primary mass plus crisp `currentColor` strokes on top, theme-aware. Keep every design achievable as a simple line icon at 32px: one dominant silhouette, a small number of strokes, readable at ~20px.

## Global design rules

- **One silhouette per icon.** The primary shape must be identifiable in a squint test before any detail is added.
- **Fill = mass, stroke = definition.** The 0.16 fill sits behind the main body (bowl interior, loaf body, cup liquid). Strokes carry the identifying detail.
- **Steam is not an identifier.** Steam wisps appear on noodles, curry, soup, rice, stew, dumpling in the current set — it distinguishes nothing. Treat steam as optional flavor, never as the distinguishing feature, and prefer to drop it where a real signal exists.
- **The bowl family must self-separate.** noodles, soup, rice, stew, curry are the danger zone. The plan below gives each a *structural* difference, not just a garnish difference: noodles = chopsticks + noodle loops, soup = spoon + flat broth, rice = dry heaped grainy dome (no utensil), stew = a two-handled POT with a lid (not a bowl), curry = a divided PLATE (rice + sauce). Two are bowls, one is a pot, one is a plate — the container itself is a cue.

---

## 1. noodles  — RATING: CLEAR (keep, minor polish)
Category: ramen, pasta, pho — noodle dishes.

**Current:** Deep bowl with a pair of chopsticks angled up out of the top-right, steam. Reads correctly; chopsticks are doing the work.

**Prescribe:** Keep the deep round bowl. Two chopsticks crossing diagonally up-right out of the bowl. Add 2–3 wavy horizontal noodle loops on the broth surface (a short "swirl" of noodle) so it reads as noodles even if chopsticks are misread as a spoon. Fill the bowl interior.

**Avoid:** A single utensil (that becomes soup). Keep chopsticks clearly a *pair* of parallel sticks, not one bar.

**Most important feature:** The pair of chopsticks (two thin parallel diagonals) + wavy noodle loops.

---

## 2. curry  — RATING: WRONG (fix)
Category: saucy curries (Thai, Indian, Japanese, etc.).

**Current:** A shallow oval plate/dish with a vague mound and steam. Reads as "generic plate of food." Nothing says curry; indistinguishable from a plated dish, could be mistaken for stew or a salad plate.

**Prescribe:** A wide oval **plate divided into two portions** (the near-universal "curry rice" layout): on one half a heaped **dome of rice** with a few grain dots; on the other half a **pool of thick sauce** holding 2 rounded chunks. The two-tone split (rice dome vs. sauce pool) is the whole idea. Optionally one small chili or a lifted spoon at the edge.

Alternative if a plate feels too busy: a small karahi/balti-style bowl with a **thick chunky sauce surface** (visible lumps, not smooth liquid) plus one chili — but the divided rice+sauce plate is stronger and reads faster.

**Avoid:** A plain smooth-surfaced bowl (that is soup/stew). Avoid a domed lump on an empty plate (current failure). The sauce must look *thick and chunky*, not like clear broth.

**Most important feature:** The rice-portion-beside-sauce-portion split on a single plate.

---

## 3. grilled  — RATING: WEAK / borderline WRONG (fix)
Category: steaks, skewers, BBQ, roasts, cured meats.

**Current:** A plain circle filled with diagonal hatch lines. Reads as a hatched disc — could be a cookie, a burger patty (collision risk with sandwich), or a coaster. "Grilled" is not legible.

**Prescribe:** A **skewer** — one diagonal stick running lower-left to upper-right with **3 chunks** (alternating cube/rounded shapes) threaded on it. This is the broadest possible grilled signal (kebab, yakitori, satay, shish, souvlaki). Add 2–3 short flame or grill-grate ticks along the bottom edge to lock in "grilled/charred." Fill the meat chunks.

Alternative: a thick steak/chop with a curved bone end and 2–3 short diagonal char stripes across it. Use the skewer as primary — it is more culturally broad and avoids any round-patty confusion.

**Avoid:** Any round hatched disc (reads as burger patty → collides with sandwich, or as a cookie). Avoid a whole roast bird (too specific / narrow).

**Most important feature:** Discrete chunks threaded on a diagonal skewer stick.

---

## 4. dumpling  — RATING: WEAK / WRONG (fix)
Category: gyoza, pierogi, wontons.

**Current:** A domed mound with a small top-knot on a wide base, with steam. Reads as a covered serving cloche or a bao bun on a dish — not a gyoza/pierogi. Wrong silhouette for the category.

**Prescribe:** A **pleated half-moon dumpling** (the gyoza/pierogi/potsticker shape): a crescent body sitting on a flat bottom, with a row of 3–4 **pleat ticks** along the top curved seam. Fill the body. Optionally a second smaller dumpling behind/beside it to reinforce "these are dumplings, plural small parcels."

**Avoid:** A round bun with a topknot (reads as bao/bread or a cloche — current failure). Avoid putting it under a dome/lid. Keep the pleats visible — they are what says "dumpling" rather than "pastry" or "bread roll."

**Most important feature:** The pleated seam along a half-moon parcel.

---

## 5. soup  — RATING: CLEAR (keep)
Category: brothy dishes.

**Current:** Round bowl with a spoon angled out to the right, steam. Reads correctly.

**Prescribe:** Keep. Deep round bowl, **one spoon** dipped in and angled out to the right (spoon bowl visible, distinct oval head). Show a **flat broth surface line** across the bowl interior (calm liquid, no loops, no chunks). Fill the bowl.

**Avoid:** Chunks or noodle loops (those are stew/noodles). Keep it a single spoon, never chopsticks. Broth surface stays smooth and flat.

**Most important feature:** Single spoon + smooth flat broth line (vs. noodles' chopsticks+loops).

---

## 6. rice  — RATING: WEAK (fix)
Category: rice bowls, fried rice, stir-fry-over-rice, biryani.

**Current:** Rounded bowl with a few dots and steam. The bowl is generic; the dots are faint, so it collides with soup/stew.

**Prescribe:** A bowl with a **heaped domed mound of rice rising above the rim** (the mound is the silhouette signal — rice is served piled, not level like liquid). Speckle the mound with 5–8 small **grain dots/short ticks**. **No utensil** (this is what separates it from soup and noodles). Fill the mound. Optionally lean a flat rice paddle against the bowl, but the heaped grainy dome alone is enough.

**Avoid:** A flat liquid surface (that is soup/stew). Avoid adding a spoon or chopsticks — the *absence* of a utensil plus the piled grainy dome is the differentiator.

**Most important feature:** A heaped dome of rice cresting above the rim, textured with grain dots, and no utensil.

---

## 7. bread  — RATING: CLEAR (keep)
Category: flatbreads, loaves, pizza, arepa.

**Current:** A rounded loaf/boule with score slashes on top. Reads clearly as bread.

**Prescribe:** Keep the domed loaf (boule/bâtard silhouette — rounded top, flat bottom). 2–3 diagonal **score slashes** across the top crust. Fill the loaf body. This reads as bread broadly (loaf covers flatbread/arepa/pizza well enough as the umbrella).

**Avoid:** Adding a plate under it (drifts toward the plated-dish look). Keep slashes diagonal and parallel so it doesn't look like a hamburger bun (dome + seed dots would collide with sandwich).

**Most important feature:** The scored top crust on a standalone loaf.

---

## 8. stew  — RATING: WRONG / WEAK (fix)
Category: thick braises, tagine, goulash, gumbo.

**Current:** A wide low bowl with steam and no distinct content. It is just "a bowl" — indistinguishable from soup, rice, curry. This is the worst bowl-family collision.

**Prescribe:** Change the container from a bowl to a **cooking pot / Dutch oven**: a deep rounded pot with **two small side handles** (ears) and a **domed lid with a knob** on top (lid can be set slightly ajar with steam escaping). This structural switch removes it from the bowl family entirely. If a lid hides the food, set the lid ajar to reveal a **thick chunky surface** (2–3 lumps) inside. Fill the pot body.

Alternative (tagine, for cultural breadth): a conical-lidded tagine pot silhouette — also a distinct, non-bowl shape. Either works; the two-handled lidded pot is the most broadly recognized "braise/stew."

**Avoid:** A plain open bowl of any kind (the current failure — collides with soup/rice/curry). The pot must have **handles and/or a lid** so its outline differs from every bowl in the set.

**Most important feature:** A lidded, two-handled pot silhouette (not a bowl).

---

## 9. salad  — RATING: CLEAR (keep)
Category: leafy/veg salads, dips like hummus.

**Current:** A bowl with leafy shapes rising out of the top. Reads as salad.

**Prescribe:** Keep. A wide shallow bowl with 3–4 **leaf shapes** (pointed, veined) mounding above the rim, plus 1–2 small round veg dots (tomato/olive) for color contrast. Fill the bowl. The leaves poking up are the signal.

**Avoid:** Making the bowl deep/round like the soup bowl. Keep it wide and shallow, with clearly *leafy* (pointed, irregular) shapes rather than rounded lumps.

**Most important feature:** Pointed leaves mounding above the bowl rim.

---

## 10. seafood  — RATING: CLEAR (keep)
Category: fish, shellfish, ceviche.

**Current:** A side-view fish with tail and eye. Reads clearly.

**Prescribe:** Keep the whole side-view fish (body + triangular tail fin + eye dot + a gill line or a couple of fin ticks). Fill the body. A fish is the broadest seafood signal.

**Avoid:** Over-detailing scales at 32px (they turn to mush). One or two fin/gill accents only. (A shrimp or shell would also work but the fish is more universally read as "seafood" — keep the fish.)

**Most important feature:** Recognizable fish profile with tail fin and eye.

---

## 11. dessert  — RATING: WEAK (fix)
Category: cakes, sweets, puddings.

**Current:** A plain triangular wedge with a line — reads ambiguously as a pie slice or a plain wedge; collides conceptually with pastry (which is also pie/tart). Doesn't clearly say "sweet cake."

**Prescribe:** A **layered cake slice** seen from the side: a triangular/trapezoidal wedge with 1–2 **horizontal layer lines** (sponge + filling) and a **cherry/dot on the pointed top or a swirl of frosting** on top. The cherry-on-top plus visible layers is the "celebration sweet" cue. Fill the cake body.

Alternative: a **cupcake** (fluted base + domed frosting swirl + cherry). The cupcake is even more unmistakably "dessert" and less confusable with a savory pie slice — recommend the cupcake if the layered slice risks looking like the pastry pie.

**Avoid:** A plain undecorated wedge (current — reads as pastry/pie). The topping (cherry/frosting swirl) is mandatory to separate dessert from pastry.

**Most important feature:** A frosting swirl and/or cherry topping on a layered sweet (cake slice or cupcake).

---

## 12. streetfood  — RATING: CLEAR conceptually, but off-theme (consider fix)
Category: tacos, samosas, fritters, snacks.

**Current:** A food cart with an awning/canopy and wheels. Reads as "street vendor / street food" and is visually distinct from every other icon. The concern: it depicts the *vendor*, not food, so it sits oddly in a set of food items — and if the awning/wheels render small it can look like a generic stall or truck.

**Prescribe (recommended):** Switch to a **taco** — a folded U-shaped shell with 2–3 filling bumps (and a couple of fill ticks) cresting over the top opening. The taco is the single most iconic street food, is a *food item* consistent with the rest of the set, and has a distinct silhouette. 

If keeping the cart: make the **awning scalloped/striped** and the two wheels crisp and round so it unmistakably reads as a street-food cart, not a truck or a table.

**Avoid (taco version):** Confusion with the sandwich (round stacked burger) — keep the taco a clear open **U/half-pipe shell**, filling on top only. Confusion with pastry's croissant crescent — the taco is an *open* shell with fillings, the croissant a *solid* ridged crescent.

**Most important feature:** (taco) the folded U-shell with fillings over the top; (cart) striped awning + two wheels.

---

## 13. sandwich  — RATING: CLEAR (keep)
Category: burgers, subs, bánh mì, gyros.

**Current:** A stacked burger — domed top bun, filling layers, bottom bun. Reads clearly.

**Prescribe:** Keep the stacked burger (domed top bun with optional 3 seed dots, a lettuce/patty middle layer with a wavy edge, flat bottom bun). The horizontal stacked layers are the signal. Fill the buns. The burger works as the umbrella for the whole sandwich category.

**Avoid:** Seed dots so prominent the top bun collides with the bread loaf — keep the layered stack (multiple horizontal bands) visible, which bread does not have. Don't flatten it into a single loaf.

**Most important feature:** Horizontally stacked bun/filling/bun layers.

---

## 14. beverage  — RATING: CLEAR (keep)
Category: drinks.

**Current:** A tumbler/cup with a straw and bubbles. Reads clearly as a drink.

**Prescribe:** Keep. A tapered glass/cup with a **straw** angled out of the top and a **liquid fill line** (fill the lower portion). Optional 2–3 bubble dots. The straw is the fastest "drink" signal.

**Avoid:** A handled mug that could read as soup/tea served in a bowl — the straw keeps it unambiguously a cold drink. Keep the vessel a tall tumbler, not a wide bowl.

**Most important feature:** Straw poking out of a tall glass with a fill line.

---

## 15. pastry  — RATING: WEAK / WRONG (fix)
Category: croissants, pies, empanadas, tarts.

**Current:** A ridged dome / scalloped half-circle. Reads ambiguously — could be a shell, a hand fan, a sliced melon, or an empanada, but not clearly "pastry." Weak.

**Prescribe:** A **croissant** — a plump **crescent** curving downward at both ends, with 3–4 **diagonal segment ridges** across the body marking the rolled layers. The croissant is the most universally recognized pastry silhouette and is instantly distinct from everything else in the set. Fill the crescent body.

Alternative (if the crescent reads too close to the taco shell): a **pie slice with a latticed/crimped crust** or a fluted tart — but the croissant is the strongest single pastry signal; use it and differentiate the taco as an open shell.

**Avoid:** A smooth ridged dome (current failure). Avoid an open U-shell (that is the taco). The croissant must be a *solid, closed* crescent with rolled-layer ridges.

**Most important feature:** A ridged crescent (croissant) — solid, closed, with diagonal roll lines.

---

## Bowl-family separation matrix (verify after build)

| Icon | Container | Utensil | Surface / content | One-glance tell |
|------|-----------|---------|-------------------|-----------------|
| noodles | deep round bowl | **chopsticks (pair)** | wavy noodle loops | two diagonal sticks |
| soup | deep round bowl | **spoon (one)** | flat smooth broth | single spoon, calm surface |
| rice | round bowl | **none** | heaped grainy dome above rim | piled dome + grain dots, no utensil |
| stew | **pot w/ handles + lid** | none | chunky (if lid ajar) | it's a POT, not a bowl |
| curry | **oval plate** | optional | rice dome BESIDE thick sauce pool | divided rice+sauce plate |

If any two of these five share both container type and utensil, the build has failed the primary requirement.

## Priority order for the builder
1. **stew** (wrong — plain bowl, worst collision) → lidded two-handled pot.
2. **curry** (wrong — generic plate) → divided rice + sauce plate.
3. **grilled** (weak/wrong — hatched disc, burger-collision risk) → skewer with chunks.
4. **dumpling** (weak/wrong — reads as cloche/bao) → pleated half-moon gyoza.
5. **pastry** (weak — ambiguous ridged dome) → croissant crescent.
6. **rice** (weak — generic bowl) → heaped grainy dome, no utensil.
7. **dessert** (weak — plain wedge) → cupcake or layered slice + cherry.
8. **streetfood** (off-theme cart) → taco (recommended) or crisp-up the cart.
9. Keep with minor polish: noodles, soup, bread, salad, seafood, sandwich, beverage.
