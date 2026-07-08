import type { Category } from '../data/types';

/**
 * One inline SVG symbol sheet, mounted once at app root. Each dish category maps
 * to a <symbol id="dish-{category}">. Icons use currentColor so they inherit the
 * card's text color and stay theme-aware.
 *
 * Style system (one cohesive family):
 *  - 32x32 viewBox, ~5px optical padding, content roughly centered.
 *  - Two-tone: a soft base shape filled with currentColor at low opacity
 *    (0.16) reads as "mass", crisp currentColor strokes read as "line".
 *  - Uniform strokeWidth 2, round caps + joins, gentle corner radii.
 *  - Everything inherits color via currentColor, so both fill and stroke
 *    track the card's text color and stay correct in light and dark themes.
 */
export function DishSpriteSheet() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      focusable="false"
    >
      {/* Shared presentation defaults are set per-path; grouped by g where useful. */}

      {/* NOODLES — ramen bowl, chopsticks lifting a strand, noodles at the surface */}
      <symbol id="dish-noodles" viewBox="0 0 32 32">
        <path d="M4 15h24a12 12 0 0 1-24 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 15c2-1.4 3 1 5-.2s3 1 5-.2 3 1 5-.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 6l7 8M21 4.5l6.5 8.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M25 13c-.6 1.6-.4 3-2 3.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* CURRY — plate with rice mound + curry sauce, spice dot, steam */}
      <symbol id="dish-curry" viewBox="0 0 32 32">
        <path d="M4 19a12 4 0 0 0 24 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M6 19a8 5 0 0 1 8-4c1-2 4-2 5 0a5 4 0 0 1 3 4Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="16" cy="16" r="1.1" fill="currentColor" />
        <circle cx="20" cy="17" r="1.1" fill="currentColor" />
        <path d="M13 10c-1-1.2-1-2.4 0-3.6M19 10c-1-1.2-1-2.4 0-3.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* GRILLED — steak with grill marks */}
      <symbol id="dish-grilled" viewBox="0 0 32 32">
        <path d="M9 12c3-4 11-4 14 0s2 9-3 11-11 1-13-3 1-6 2-8Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M13 12l-3 4M17 12.5l-3.5 5M21 14l-3 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* DUMPLING — pleated gyoza in front, a second behind, steam */}
      <symbol id="dish-dumpling" viewBox="0 0 32 32">
        <path d="M15 10c5 0 9 4 9 11H6c0-6 3-10 8-11Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 16c1.2 1.6 3 1.6 4.2 0s3-1.6 4.2 0 3 1.6 4.2 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 21c3 0 4-3 3-6" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 7c-1-1.2-1-2.4 0-3.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* SOUP — bowl with a spoon dipped in and rising steam */}
      <symbol id="dish-soup" viewBox="0 0 32 32">
        <path d="M4 16h24a12 12 0 0 1-24 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M19 17.5l6-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M23 6.5a2.6 2.6 0 0 1 3 3l-2.6 1.6Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 11c-1-1.2-1-2.6 0-3.8M15 11c-1-1.2-1-2.6 0-3.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* RICE — bowl with a domed heap of rice, grain speckles, steam */}
      <symbol id="dish-rice" viewBox="0 0 32 32">
        <path d="M6 18h20a10 10 0 0 1-20 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 18a8 6 0 0 1 16 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 15.5l1.2-1.2M16 14.2l1.2-1.2M20 15.5l1.2-1.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M13 9c-1-1.2-1-2.4 0-3.6M19 9c-1-1.2-1-2.4 0-3.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* BREAD — rounded loaf with score slashes */}
      <symbol id="dish-bread" viewBox="0 0 32 32">
        <path d="M6 16a10 6 0 0 1 20 0v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 13l-1.4 3M16 12l-1.4 3M21 13l-1.4 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* STEW — pot with side handles, a lid, and steam */}
      <symbol id="dish-stew" viewBox="0 0 32 32">
        <path d="M7 15h18v4a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M5 15h22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 16.5a2 2 0 0 1 2 0M25 16.5a2 2 0 0 0 2 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M13 11c-1-1.2-1-2.6 0-3.8M19 11c-1-1.2-1-2.6 0-3.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* SALAD — wide bowl with leaf sprigs and a cherry tomato */}
      <symbol id="dish-salad" viewBox="0 0 32 32">
        <path d="M5 17h22a11 8 0 0 1-22 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 17c-2-3-1-6 1-8M16 17c0-4 1-6 3-8M21 17c2-2 2-5 1-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="13.5" r="2.2" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" />
      </symbol>

      {/* SEAFOOD — fish in side profile with tail, eye and gill */}
      <symbol id="dish-seafood" viewBox="0 0 32 32">
        <path d="M4 16c4-6 13-6 18 0-5 6-14 6-18 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M22 16l6-4.5v9Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M13 11.5c-2 2.6-2 6.4 0 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="15" r="1.2" fill="currentColor" />
      </symbol>

      {/* DESSERT — slice of layered cake with a cherry */}
      <symbol id="dish-dessert" viewBox="0 0 32 32">
        <path d="M10 12v11a1 1 0 0 0 1 1h13a1 1 0 0 0 .8-1.6L12 11a1.4 1.4 0 0 0-2 1Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 17.5l11.5 3.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 12a3 3 0 1 1 3-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="10" cy="10.5" r="1.4" fill="currentColor" />
      </symbol>

      {/* STREETFOOD — food cart with a striped awning and wheels */}
      <symbol id="dish-streetfood" viewBox="0 0 32 32">
        <path d="M7 15h18v6H7Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M5 15l3-5h16l3 5Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M13 10.5l-1.6 4.5M19 10.5l1.6 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="11" cy="24" r="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="21" cy="24" r="2" fill="none" stroke="currentColor" strokeWidth="2" />
      </symbol>

      {/* SANDWICH — stacked deli sandwich: bread, lettuce, filling, bread */}
      <symbol id="dish-sandwich" viewBox="0 0 32 32">
        <path d="M7 13a9 3 0 0 1 18 0v1H7Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M7 20h18v.5a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M6 16.5c2-1.4 3.5 1 5.5-.2s3.5 1 5.5-.2 3.5 1 5.5-.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </symbol>

      {/* BEVERAGE — tumbler with a straw, liquid line and bubbles */}
      <symbol id="dish-beverage" viewBox="0 0 32 32">
        <path d="M9 9h14l-1.8 15a2 2 0 0 1-2 1.8h-6.4a2 2 0 0 1-2-1.8Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 14h12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 6l-3 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="18" r="1" fill="currentColor" />
        <circle cx="17" cy="21" r="1" fill="currentColor" />
      </symbol>

      {/* PASTRY — croissant with segment lines */}
      <symbol id="dish-pastry" viewBox="0 0 32 32">
        <path d="M6 22c-1-6 3-12 10-12s11 5 10 11c-.2 1.4-2 1.6-3 .8-2-1.6-4-2-6-1.6-1.8.4-3 2-3 4 0 1.2-1.4 1.8-2.4 1.2-1.6-1-4.2-2.4-5.6-3.6Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 17l-1 3M15 15l-.6 3.4M19 15l.6 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>
    </svg>
  );
}

export function DishSprite({ category, size = 40 }: { category: Category; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-hidden="true" focusable="false">
      <use href={`#dish-${category}`} />
    </svg>
  );
}
