# "Show more / Show less" truncation for the World Dishes dish detail page

Research + concrete recommendation for a short "history / significance" blurb inside the
detail-page card (`/dish/:id`). React + CSS Modules, theme-aware, existing tokens.

---

## TL;DR recommendation

Use a **hybrid** approach — the industry-standard pattern in 2025:

1. **CSS `-webkit-line-clamp` (via `display:-webkit-box`)** does the visual truncation +
   automatic ellipsis. It is now effectively universal (unprefixed `line-clamp` is also
   landing, but keep the `-webkit-` form for coverage).
2. **A tiny bit of JS** measures overflow (`scrollHeight > clientHeight`) to decide
   **whether to render the toggle at all** — so short blurbs (≤3 lines) get no button and
   no visual noise.
3. **A real `<button>` with `aria-expanded` + `aria-controls`** toggles a state class that
   removes the clamp. The full text is always in the DOM (good for SR + SEO); we only
   change how much is visually shown.
4. **Re-measure on resize** with a `ResizeObserver` on the text element (reflow changes how
   many lines the text occupies, which changes whether truncation is needed).

Inline expand is correct here — a modal or dedicated page would be overkill for a ~3-line blurb.

Do **not** animate height by default (clamp → auto is not cleanly animatable and causes
jank); an optional subtle fade is fine, gated behind `prefers-reduced-motion`.

---

## Why this approach (trade-offs)

### CSS `-webkit-line-clamp` alone — good but insufficient
- ✅ Automatic ellipsis, respects line-height/font, reflows correctly, zero measurement of
  character counts. Browser support is now universal (all evergreen engines).
- ❌ Cannot inline a clickable "more" inside the clamped box — the ellipsis is auto-generated
  text, not a real element, so you can't make it a button.
- ❌ By itself it can't tell you whether truncation actually happened, so a naive
  implementation shows a "Show more" button even on short text that isn't clamped.

Conclusion: clamp is the right rendering mechanism, but you need JS to (a) gate the button and
(b) toggle the clamp off.

### JS-only (measure text, slice string, append "… more") — avoid
- Fragile: requires measuring character widths, breaks with i18n, resize, fonts loading late,
  and doesn't give a real ellipsis. More code, worse results. Only needed if you must put the
  "more" link *inline right after the ellipsis* (a design we're not doing here).

### The hybrid (CSS clamp + JS overflow detection) — chosen
- Best of both: native ellipsis + correct reflow from CSS; button-gating + toggle from JS.
- The overflow check is a single `scrollHeight > clientHeight` comparison in
  `useLayoutEffect` (runs before paint → no flash of a wrongly-shown button).

---

## Accessibility (the important part)

- **Real `<button type="button">`**, never a clickable `<div>`/`<span>`. Buttons are
  focusable, keyboard-operable (Enter/Space), and announced as buttons by screen readers for free.
- **`aria-expanded={expanded}`** on the button — SR announces "collapsed"/"expanded" and its
  changes. This is the canonical WAI-ARIA pattern for show/hide regions.
- **`aria-controls={regionId}`** points the button at the text region's `id` — associates the
  control with what it toggles.
- **Never hide content from SR.** We keep the full text in the DOM at all times; clamping is
  purely visual (`overflow:hidden` on a `-webkit-box`). Do **not** use `display:none`,
  `visibility:hidden`, or conditional unmounting of the hidden portion — that would remove it
  from the accessibility tree and from in-page find.
  - Caveat worth knowing: browser find-in-page *can* match visually-clamped text the user
    can't see. Acceptable for a short blurb; the toggle lets them reveal it.
- **Button label describes the action**: `Show more` / `Show less`. These beat "Read more"
  because "less" has a natural pair ("Read less" reads awkwardly). Keep the visible label
  short; optionally add context via `aria-label` if the same page has multiple toggles
  (e.g. `aria-label="Show more of the history"`). Not needed here — single blurb.
- **Focus stays on the button** across toggle (we don't move focus), so keyboard users keep
  their place; the newly revealed text is right below.
- **Focus ring**: the app already has a global `:focus-visible` outline (theme.css) — inherits
  automatically.

---

## UX details

- **Placement**: button on its own line *below* the text (block), not inline. Inline-after-
  ellipsis requires the fragile JS-only approach and is easy to misclick. Below-text is the
  common, robust choice.
- **Layout jank**: gate the button with `useLayoutEffect` (pre-paint) so it never flashes in
  then disappears. Reserve nothing special — expansion just grows the card, which is expected.
- **Animation**: skip height animation by default. `-webkit-line-clamp` → unclamped isn't a
  clean animatable transition (you'd animate `max-height` with a guessed value → jank or
  clipped text). If you want polish, a 120ms opacity fade on the revealed overflow is enough,
  and must be disabled under `@media (prefers-reduced-motion: reduce)` (the app already
  neutralizes transitions globally there).
- **Inline vs modal/page**: inline expand-in-place is right for a short blurb. Reserve modals
  / dedicated pages for long-form content or when the surrounding context must be preserved
  while reading a lot. Not the case here.

---

## Concrete component sketch (fits this codebase)

Matches repo conventions: TypeScript, named function-component export, CSS Modules, theme tokens.

### `src/components/ExpandableText.tsx`

```tsx
import { useId, useLayoutEffect, useRef, useState } from 'react';
import styles from './ExpandableText.module.css';

interface ExpandableTextProps {
  text: string;
  /** Max lines shown when collapsed. Default 3. */
  lines?: number;
  className?: string;
}

export function ExpandableText({ text, lines = 3, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [canToggle, setCanToggle] = useState(false); // does the text actually overflow?
  const textRef = useRef<HTMLParagraphElement>(null);
  const regionId = useId();

  // Measure BEFORE paint so the button never flashes on short text.
  // Re-measure on resize because reflow changes the line count.
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const measure = () => {
      // Overflow is only meaningful while clamped; when expanded we assume it
      // can still collapse, so don't flip canToggle off.
      if (expanded) return;
      setCanToggle(el.scrollHeight > el.clientHeight + 1); // +1 = sub-pixel guard
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, lines, expanded]);

  return (
    <div className={className}>
      <p
        ref={textRef}
        id={regionId}
        className={styles.text}
        style={{ ['--clamp-lines' as string]: lines }}
        data-expanded={expanded ? 'true' : undefined}
      >
        {text}
      </p>

      {canToggle && (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={regionId}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
```

Notes:
- `useId()` (React 18, already available) gives a stable unique `id` for `aria-controls` —
  safe even if several blurbs appear on a page.
- The clamp line count is passed to CSS via a `--clamp-lines` custom property, so the same
  component handles `lines={2}` or `lines={4}` with no CSS change.
- `+1` sub-pixel guard avoids false positives from fractional `scrollHeight`/`clientHeight`.
- `ResizeObserver` on the element (not `window.resize`) also catches container-driven reflow
  (sidebar open, font swap) — more robust than a window listener.
- SSR: this app is client-rendered (Vite SPA), so no hydration mismatch concern. If it ever
  went SSR, the button would simply appear after the first client layout pass — content is
  always present, so it degrades gracefully.

### `src/components/ExpandableText.module.css`

```css
.text {
  margin: 0;
  /* Visual clamp — full text stays in the DOM for screen readers + find-in-page. */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--clamp-lines, 3);
  line-clamp: var(--clamp-lines, 3); /* unprefixed, for forward compat */
  overflow: hidden;
}

/* Expanded: drop the clamp, show everything. */
.text[data-expanded='true'] {
  display: block;
  -webkit-line-clamp: unset;
  line-clamp: unset;
  overflow: visible;
}

.toggle {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 0;
  background: none;
  border: none;
  color: var(--c-primary);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.toggle:hover {
  text-decoration: underline;
}
/* focus-visible outline is handled globally in theme.css */
```

- Uses `--c-primary` for the link-like affordance → correct in both light and dark themes
  automatically (the token flips in the dark media query). No hard-coded colors.
- No color/animation work needed for dark mode; everything is token-driven.

### Usage on the dish page

```tsx
// in DishPage, inside the .panel card
<ExpandableText text={dish.history} lines={3} className={styles.history} />
```

Optionally add a `.history` rule in `DishPage.module.css` to match the existing
`.originNote` muted style, or reuse the panel's body typography (17px / 1.6).

---

## Edge cases handled

| Case | Behavior |
|---|---|
| Text ≤ 3 lines | `scrollHeight ≈ clientHeight` → `canToggle=false` → **no button**, no ellipsis |
| Text > 3 lines | Clamped with auto ellipsis + "Show more" button |
| Window / container resize | `ResizeObserver` re-measures; button appears/disappears as needed |
| Expanded then resized narrower | Stays expanded (we don't re-clamp while open); collapsing re-measures |
| Empty / whitespace text | Renders nothing to clamp; no overflow → no button (guard upstream if `text` may be null) |
| Screen reader / find-in-page | Full text always in DOM; only visually clamped |
| `prefers-reduced-motion` | No transitions used by default; global reset covers any added fade |
| Multiple blurbs on one page | `useId()` keeps each `aria-controls`/`id` pair unique |
| SSR | N/A (Vite SPA); would degrade gracefully — content present, button after first layout |

---

## Sources

- [MDN — `-webkit-line-clamp` / `line-clamp`](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-line-clamp)
- [MDN — `line-clamp` property reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/line-clamp)
- [LogRocket — How to use CSS line-clamp to trim lines of text](https://blog.logrocket.com/css-line-clamp/)
- [Tim Santeford — How to Detect Clamped Text in React](https://www.timsanteford.com/posts/how-to-detect-clamped-text-in-react/)
- [Robin Wieruch — React Custom Hook: Check if Overflow](https://www.robinwieruch.de/react-custom-hook-check-if-overflow/)
- [GeeksforGeeks — Determine if element content overflows](https://www.geeksforgeeks.org/how-to-determine-the-content-of-html-elements-overflow-or-not/)
- [MDN — ARIA `aria-expanded` attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded)
- [W3C WAI — Using `aria-expanded` for collapsible regions](https://www.w3.org/WAI/GL/wiki/Using_aria-expanded_to_indicate_the_state_of_a_collapsible_element)
- [The A11Y Collective — Practical Guide on Implementing `aria-expanded`](https://www.a11y-collective.com/blog/aria-expanded/)
- [Accessibility Developer Guide — Marking elements expandable with `aria-expanded`](https://www.accessibility-developer-guide.com/examples/sensible-aria-usage/expanded/)
- [tutorialpedia — CSS Truncate and Reveal Text guide](https://www.tutorialpedia.org/blog/css-truncate-reveal-text/)
- [Jonas K (Medium) — Toggle read more/less with line-clamp](https://devjonas.medium.com/toggle-read-more-less-with-line-clamps-and-keyframes-20fdde9c9fa8)
