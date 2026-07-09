# Should more of a DishCard be clickable? — UX research + recommendation

**App:** World Dishes · **Component:** `src/components/DishCard.tsx` + `src/components/DishCard.module.css`
**Question:** Should MORE of the card be clickable to reach `/dish/:id`, and how should the card signal a detail page exists?

**Short answer: Yes.** Make everything above the footer (sprite + title + origin + description + badges) navigate to the detail page, using the accessible **stretched-link** pattern anchored on the existing title link, with the footer's Try/Review controls raised above it. Add two low-clutter affordances — a card-wide `cursor: pointer`, and a title underline/color change on card-hover (reusing the style the name already has) — plus one subtle "View →" cue. This is a CSS-first change with a small JSX tidy.

---

## 1. Current state (verified live at localhost:5183 via Playwright)

The card is almost silent about its clickability:

| Element | Clickable? | Affordance today |
|---|---|---|
| Card container `article` | No | `position: static`, `cursor: auto`, **no** whole-card click. Hover only lifts the card (`translateY(-2px)` + `shadow-hover`). |
| Sprite icon (top-left) | Yes — `<Link>` to `/dish/:id`, `aria-label="View <name>"` | No visible cue; looks like a decorative badge. |
| Dish **name** `<h3><a>` | Yes — `<Link>` to same `/dish/:id` | `cursor: pointer`, but text is the same color as body and **has no underline until you hover the text itself** (then → underline + primary red `rgb(194,61,41)`). |
| Origin / flag, description, badges | No | Nothing. |
| Footer | Interactive | "Sign in to track" / "Mark as tried" button; when tried, a "Write a review" toggle expanding a star + note editor. |

Two problems:
- **Almost no signifier** that a detail page exists. The only hint (title underline) appears solely when the pointer is already on the 16px title text — most of the card gives no feedback. A worldwide-rank line, a rich description, and badges all sit there inert and un-clickable, which is exactly where users' eyes and thumbs go.
- **Redundant links:** the sprite and the name are two separate `<a>` elements pointing at the same URL with overlapping intent. Screen readers announce both ("View Pizza Margherita, link" … "Pizza Margherita, link"), which is noise. Best practice is one primary link per card.

---

## 2. What the evidence says

### Whole-card vs partial clickability
The consensus across accessibility and UX practitioners is: **make a large region clickable for pointer/touch/tremor users, but keep the DOM to a single primary link** — do not wrap the whole card in an anchor.
- "The whole card should be clickable for the sake of UX, but ideally only the title (and maybe short description) should be *linked*." A big hit area helps mobile, touch, and motor-impaired users. (dev.to, Berkeley DAP)
- The HTML Living Standard forbids interactive elements (button, input, another `<a>`) as descendants of an `<a>`. Wrapping the card in an anchor around the Try/Review buttons is invalid and breaks AT. (Piccalilli, Kitty Giraudel, Adrian Roselli)
- Wrapping everything in `<a>` also makes the link's accessible name the card's entire text content, and makes tabbing unpredictable. (Adrian Roselli, Inclusive Components)

### The accessible technique: "stretched link" (`::after` overlay)
Anchor the navigation on one real link (the title), then stretch a pseudo-element over the clickable region:
```css
.card { position: relative; }
.card .nameLink::after {
  content: "";
  position: absolute;
  inset: 0;              /* top/right/bottom/left: 0 */
}
```
This is the Bootstrap `.stretched-link`, Inclusive Components, and Adrian Roselli pattern. It gives whole-region click **and the pointer cursor for free**, with zero JS and no invalid nesting. (Inclusive Components, Adrian Roselli, Bootstrap)

### Keeping the footer controls working (no nesting problem)
The `::after` overlay is a sibling layer, not a wrapper — the Try/Review buttons are never *inside* the anchor, so there is no illegal nesting. To keep them clickable, **raise them above the overlay**:
```css
.footer { position: relative; z-index: 2; }
```
Raised, positioned elements sit above the stretched link and stay fully interactive. (dev.to clickable-card patterns, Adrian Roselli — "priority for internal interactive elements: `position: relative; z-index`".)

### Keyboard / screen reader
- Keyboard/SR behavior is essentially unchanged because the real link stays a normal `<a>` around the title text — Tab still lands on "Pizza Margherita, link", then the footer button(s). Collapsing the two redundant links to one *improves* the SR experience. (Adrian Roselli, Inclusive Components)
- **Focus visibility caveat:** the focus ring follows the real link (the title text), not the whole card. Add `.card:focus-within` styling so keyboard users see the whole card is the active target.

### Known trade-off: text selection
The stretched `::after` sits over the description and blocks selecting/copying that text. Documented downside of the pattern. (Inclusive Components, Adrian Roselli — JS `mousedown`-distance workarounds exist.) For World Dishes the body is a 3-line clamped teaser, not content users need to copy, so this is an acceptable trade. If selection is ever wanted, the mitigation is to raise `.body` too (`position: relative; z-index: 1`) and drop the overlay behind it — but that then removes body-click, so I recommend accepting the selection loss.

### Mobile
- Large tap area is a plus for thumbs, **but** whole-row taps can interfere and cause mis-taps near real controls. Mitigation: keep the footer visually and physically separate (it already is — bordered, full-width, with padding), and raise it so its tap target wins. Adrian Roselli specifically recommends leaving dead space above secondary controls; the existing `10px` top padding on `.footer` plus the z-index raise covers this.

### How leading products signal "this card opens a detail view"
Convergent, minimal signals — none rely on a loud "button":
- **Hover elevation / shadow lift** (Airbnb property cards use a subtle shadow-tier lift on hover — World Dishes already does this).
- **Pointer cursor** over the whole card.
- **Title affordance** — color/underline change, often triggered by hovering *anywhere* on the card, not just the text (recipe sites, Letterboxd, e-commerce).
- **Image zoom** on the media (Airbnb, recipe sites) — not applicable here since the "media" is a small vector sprite, not a photo; zooming it would look odd. Skip.
- A light **"View details" / chevron** cue — optional, used sparingly to avoid clutter.
(Codecademy affordances/signifiers, Superdesign Airbnb breakdown.)

---

## 3. Recommendation (concrete)

### 3a. Which regions become clickable
**Everything except the footer.** Sprite + rank + title + local name + origin + description + badges all navigate to `/dish/:id`. The footer's Try / Review / editor controls stay independent.

Technique: **stretched link on the existing title `<Link>`**, footer raised. This needs no wrapper anchor and creates no nested-interactive violation.

### 3b. Exact changes

**`DishCard.tsx` (tidy the redundant link):**
- Keep the title `<Link className={styles.nameLink}>` as the single primary link (it already has good visible text — ideal accessible name).
- **Remove the separate sprite `<Link>`**; render the sprite in a plain `<div className={styles.sprite}>` (drop the `aria-label`, it's now decorative and covered by the stretched link). This eliminates the duplicate-link SR noise. The sprite region stays clickable because the overlay covers it.
- No other JSX changes; the footer buttons already are `<button>`s outside the title link.

**`DishCard.module.css`:**
```css
.card { position: relative; cursor: pointer; }          /* was: static / auto */

/* Stretched link: title anchors navigation over the whole card */
.nameLink::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--radius);   /* match card so focus/hover reads cleanly */
}

/* Footer controls sit ABOVE the overlay and stay interactive */
.footer { position: relative; z-index: 2; }

/* Title affordance now triggers from hovering ANYWHERE on the card */
.card:hover .nameLink { color: var(--c-primary); text-decoration: underline; }

/* Keyboard: make the whole card show it's the focus target */
.card:focus-within {
  outline: 2px solid var(--c-primary);
  outline-offset: 2px;
}
```
Note: the existing `.nameLink:hover` rule can stay or be folded into `.card:hover .nameLink`.

### 3c. Affordances — the minimal set (avoid clutter)
Ship exactly these; they compound without noise:
1. **Whole-card `cursor: pointer`** — free from the overlay; the single strongest "this is clickable" cue.
2. **Existing hover elevation** (`translateY(-2px)` + `shadow-hover`) — already present, keep it. This is the Airbnb-style signal.
3. **Title underline + primary color on `card:hover`** — promote the current title-only hover to fire from anywhere on the card. This makes the title read as the link (the recipe-site/Letterboxd convention).
4. **One subtle "details" cue (optional but recommended):** a small chevron `›` or "View" in muted color in the header (e.g. right-aligned in `.titleWrap`/`.header`) that gains `--c-primary` on `.card:hover`. Keep it to a single 12–13px glyph so it doesn't compete with the Try button. **Do not** add image zoom (sprite is a vector icon) and **do not** add a full CTA button (would fight the footer's Try button for attention).

### 3d. Accessibility + mobile checklist
- Single primary link (after removing the sprite anchor) → clean SR output: one "…, link".
- No nested interactive elements — footer buttons are siblings, raised via `z-index`, not descendants of the anchor. HTML-valid.
- Footer is physically separated (border + full-width + top padding) and raised, so tap targets don't overlap the navigation area — mitigates mobile mis-taps. Keep the current footer padding as the dead-space buffer.
- `:focus-within` outline gives keyboard users a visible whole-card focus indicator (the raw stretched link only rings the title text).
- Accepted trade-off: description text is no longer selectable (documented cost of the pattern; body is a short teaser so impact is low). Documented JS workaround exists if ever needed.

### Effort
Low. ~5 CSS rules + delete one `<Link>` wrapper in TSX (sprite → div). No new dependencies, no state changes, no routing changes.

---

## Sources
- [Inclusive Components — Cards (Heydon Pickering)](https://inclusive-components.design/cards/)
- [Adrian Roselli — Block Links, Cards, Clickable Regions, Rows, Etc.](https://adrianroselli.com/2020/02/block-links-cards-clickable-regions-etc.html)
- [Piccalilli — Accessible faux-nested interactive controls](https://piccalil.li/blog/accessible-faux-nested-interactive-controls/)
- [Kitty Giraudel — Accessible Cards](https://kittygiraudel.com/2022/04/02/accessible-cards/)
- [Livefront — Accessibility Dos and Don'ts for Interactive Cards](https://livefront.com/writing/accessibility-dos-and-donts-for-interactive-cards/)
- [dev.to — Clickable Card Patterns and Anti-Patterns](https://dev.to/micmath/clickable-card-patterns-and-anti-patterns-2hl2)
- [dev.to — Should the Whole Product Card Be a Link?](https://dev.to/jackharner/given-a-row-of-product-cards-should-the-whole-card-be-a-link-16m0)
- [Berkeley DAP — Accessible card UI component patterns](https://dap.berkeley.edu/websites/accessibility-guidance-developers/card-ui-component)
- [Medium — Nested Links in Cards: A Solution for Clickability Issues](https://medium.com/@pratva.bsta/nested-links-in-cards-a-solution-for-clickability-issues-98b063cb347c)
- [Codecademy — Affordances, Signifiers, and Clickability](https://www.codecademy.com/article/ui-design-affordances-signifiers-clickability)
- [Superdesign — How Airbnb Designs Their UI (2026)](https://superdesign.dev/blog/airbnb-design-system)
- HTML Living Standard — interactive content model (no interactive descendants of `<a>`).
