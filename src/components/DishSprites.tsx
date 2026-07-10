import type { Category } from '../data/types';

/**
 * One inline SVG symbol sheet, mounted once at app root. Each dish category maps
 * to a <symbol id="dish-{category}">. Icons use currentColor so they inherit the
 * card's text color and stay theme-aware.
 *
 * Style system (one cohesive family):
 *  - 32x32 viewBox, ~4-5px optical padding, content roughly centered.
 *  - Two-tone: a soft base shape filled with currentColor at low opacity
 *    (0.16) reads as "mass", crisp currentColor strokes read as "line".
 *  - Uniform strokeWidth 2, round caps + joins, gentle corner radii.
 *  - Everything inherits color via currentColor, so both fill and stroke
 *    track the card's text color and stay correct in light and dark themes.
 *
 * Bowl-family separation (the danger zone):
 *  - noodles = deep round BOWL + chopsticks (pair) + wavy noodle loops
 *  - soup    = deep round BOWL + one spoon + flat broth line
 *  - rice    = round BOWL + heaped grainy dome above rim, NO utensil
 *  - stew    = two-handled POT with lid + knob (not a bowl)
 *  - curry   = divided PLATE (rice dome beside a chunky sauce pool)
 *  - dip     = shallow wide bowl + swirl + a triangular chip poking out
 */
export function DishSpriteSheet() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      focusable="false"
    >
      {/* NOODLES — deep bowl + a PAIR of chopsticks lifting up-right + wavy noodle loops */}
      <symbol id="dish-noodles" viewBox="0 0 32 32">
        <path d="M4 15h24a12 12 0 0 1-24 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 15c2-1.4 3 1 5-.2s3 1 5-.2 3 1 5-.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 6l7 8M21 4.5l6.5 8.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* CURRY — oval PLATE (rim for depth): light grainy rice dome beside one chunky sauce pool */}
      <symbol id="dish-curry" viewBox="0 0 32 32">
        <ellipse cx="16" cy="19.5" rx="13" ry="4.6" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M4.5 20.9a12 3.4 0 0 0 23 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 19.5a6 5.4 0 0 1 12 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="7.2" cy="17.5" r="0.75" fill="currentColor" />
        <circle cx="10" cy="16.1" r="0.75" fill="currentColor" />
        <circle cx="12.6" cy="17.5" r="0.75" fill="currentColor" />
        <circle cx="9.6" cy="18.5" r="0.75" fill="currentColor" />
        <path d="M16 19.5C16 17.3 18 16.3 20 16.5C21 15.4 23.2 15.7 23.6 17.1C25.6 17.1 26.4 18.9 25 19.9C23.6 20.8 18 20.8 16 19.5Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="20" cy="18.7" r="1.05" fill="currentColor" />
        <circle cx="22.8" cy="19.1" r="1.05" fill="currentColor" />
      </symbol>

      {/* GRILLED — horizontal skewer threaded with 3 chunks (kebab) over grill flame ticks */}
      <symbol id="dish-grilled" viewBox="0 0 32 32">
        <path d="M3.5 14.5h25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="6.4" y="11.5" width="5.6" height="6" rx="1.6" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <rect x="13.2" y="11.5" width="5.6" height="6" rx="1.6" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <rect x="20" y="11.5" width="5.6" height="6" rx="1.6" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 27v-3M16 27.5v-3M23 27v-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* DUMPLING — pleated half-moon gyoza: plump crescent with a scalloped pinch-pleat seam on top */}
      <symbol id="dish-dumpling" viewBox="0 0 32 32">
        <path d="M5 15q2.5-3 5 0t5 0t5 0t5 0Q27 23 16 23Q5 23 5 15Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </symbol>

      {/* SOUP — deep bowl + ONE spoon dipped out to the right + calm flat broth surface */}
      <symbol id="dish-soup" viewBox="0 0 32 32">
        <path d="M4 16h24a12 12 0 0 1-24 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M19 17.5l6-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M23 6.5a2.6 2.6 0 0 1 3 3l-2.6 1.6Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </symbol>

      {/* RICE — bowl with a heaped grainy dome cresting above the rim, NO utensil */}
      <symbol id="dish-rice" viewBox="0 0 32 32">
        <path d="M6 19h20a10 9 0 0 1-20 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M7 19a9 9 0 0 1 18 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 15.5l1.4-1.4M15 13l1.4-1.4M19 15.5l1.4-1.4M13 17.6l1.4-1.4M17 17.6l1.4-1.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* BREAD — rounded loaf with diagonal score slashes */}
      <symbol id="dish-bread" viewBox="0 0 32 32">
        <path d="M6 16a10 6 0 0 1 20 0v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 13l-1.4 3M16 12l-1.4 3M21 13l-1.4 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* STEW — two-handled POT with an overhanging lid + knob (not a bowl) */}
      <symbol id="dish-stew" viewBox="0 0 32 32">
        <path d="M6 16h20v2a7 6 0 0 1-7 6h-6a7 6 0 0 1-7-6Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M6 20c-2.5 0-2.5-3.5 0-3.5M26 20c2.5 0 2.5-3.5 0-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 16a6 3 0 0 1 12 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M4 16h24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 13v-1.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="10.4" r="1.2" fill="currentColor" />
      </symbol>

      {/* SALAD — wide shallow bowl with pointed leaves + a cherry tomato */}
      <symbol id="dish-salad" viewBox="0 0 32 32">
        <path d="M5 17h22a11 8 0 0 1-22 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 17c-2-3-1-6 1-8M16 17c0-4 1-6 3-8M21 17c2-2 2-5 1-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="13.5" r="2.2" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" />
      </symbol>

      {/* SEAFOOD — side-view fish with tail fin, eye and gill line */}
      <symbol id="dish-seafood" viewBox="0 0 32 32">
        <path d="M4 16c4-6 13-6 18 0-5 6-14 6-18 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M22 16l6-4.5v9Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M13 11.5c-2 2.6-2 6.4 0 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="15" r="1.2" fill="currentColor" />
      </symbol>

      {/* DESSERT — cupcake: fluted wrapper + swirled frosting dome + cherry on top */}
      <symbol id="dish-dessert" viewBox="0 0 32 32">
        <path d="M9 15h14l-1.6 8a1.5 1.5 0 0 1-1.5 1.2h-7.8a1.5 1.5 0 0 1-1.5-1.2Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M13 15.5l-1 8M16.5 15.5v8M20 15.5l1 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 15c-0.5-4 3-6 5-5 1 .4 1.6 1 3 1s2-.6 3-1c2-1 5.5 1 5 5Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 6.4c.3-1.4 1.4-1.7 2.4-1.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="8.2" r="1.7" fill="currentColor" />
      </symbol>

      {/* STREETFOOD — a paper food TRAY/boat: open trapezoid container with 2 food bites cresting + a flag pick */}
      <symbol id="dish-streetfood" viewBox="0 0 32 32">
        <path d="M6 13h20l-2 9a2 2 0 0 1-2 1.6h-12a2 2 0 0 1-2-1.6Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 13a4 4 0 0 1 8 0" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 13a4 4 0 0 1 8 0" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 11.5v-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 5.5l5 1.4-5 1.6Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </symbol>

      {/* TACO — a folded taco: crescent shell wall (double arc) + fillings cresting over the top */}
      <symbol id="dish-taco" viewBox="0 0 32 32">
        <path d="M4 13A12 12 0 0 0 28 13L25 13A9 9 0 0 1 7 13Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 13a3.2 3.2 0 0 1 6.4 0" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M17.6 13a3.2 3.2 0 0 1 6.4 0" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 12c-.6-3 1.2-6 1.2-6s1.8 3 1.2 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </symbol>

      {/* SANDWICH — stacked burger: domed top bun, wavy filling, flat bottom bun */}
      <symbol id="dish-sandwich" viewBox="0 0 32 32">
        <path d="M7 13a9 3 0 0 1 18 0v1H7Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M7 20h18v.5a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M6 16.5c2-1.4 3.5 1 5.5-.2s3.5 1 5.5-.2 3.5 1 5.5-.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </symbol>

      {/* BEVERAGE — tall tumbler with a straw, liquid fill line and bubbles */}
      <symbol id="dish-beverage" viewBox="0 0 32 32">
        <path d="M9 9h14l-1.8 15a2 2 0 0 1-2 1.8h-6.4a2 2 0 0 1-2-1.8Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 14h12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 6l-3 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="18" r="1" fill="currentColor" />
        <circle cx="17" cy="21" r="1" fill="currentColor" />
      </symbol>

      {/* PASTRY — croissant: solid closed crescent with diagonal rolled-layer ridges */}
      <symbol id="dish-pastry" viewBox="0 0 32 32">
        <path d="M4 18C6 11 12 9 16 11C20 9 26 11 28 18C24 15 20 16 16 15C12 16 8 15 4 18Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 13l-1.5 3M13 11.5l-1 4M17 11.5l1 4M21 13l1.5 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* PIZZA — a slice: triangular wedge point-down, wider curved crust across the top, pepperoni dots */}
      <symbol id="dish-pizza" viewBox="0 0 32 32">
        <path d="M6 9.5C10 7 22 7 26 9.5L16 27Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M6 9.5C10 7 22 7 26 9.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12.5" cy="13" r="1.6" fill="currentColor" />
        <circle cx="19" cy="14" r="1.6" fill="currentColor" />
        <circle cx="16" cy="20" r="1.6" fill="currentColor" />
      </symbol>

      {/* PASTA — spaghetti twirled on a FORK: vertical handle + tines + wavy strands wound around */}
      <symbol id="dish-pasta" viewBox="0 0 32 32">
        <path d="M16 26v-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 18v-4M14.7 18v-4M17.3 18v-4M20 18v-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 13a8 5 0 0 1 16 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 12c2-2 4 1.6 6-.2s4 1.6 6-.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 9c2-2 4 1.6 6-.2s4 1.6 6-.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </symbol>

      {/* ROAST — oval platter (rim like curry) holding a domed roast/ham with a bone nub + carving slits */}
      <symbol id="dish-roast" viewBox="0 0 32 32">
        <ellipse cx="16" cy="21.5" rx="13" ry="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M4.5 22.7a12 3.2 0 0 0 23 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 20.5a8 6.5 0 0 1 16 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M24 18.5c2-1 3.5 0 3.5 1.2s-1.5 1.6-3.5 1.2" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M13 15l1.6 2M17 14.5l1.6 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* FRIED — fried chicken drumstick: meaty rounded top, bone handle down-left, crumb specks */}
      <symbol id="dish-fried" viewBox="0 0 32 32">
        <path d="M22 8a7 7 0 0 1 0 10c-2.5 2.5-6 2.2-8 .6l-1.8 1.8a2.4 2.4 0 1 1-1.6-1.6L12.4 17c-1.6-2-1.9-5.5.6-8a7 7 0 0 1 9 -1Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9.6 22.4l-1.4 1.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="17" cy="11.5" r="0.8" fill="currentColor" />
        <circle cx="20.5" cy="14.5" r="0.8" fill="currentColor" />
        <circle cx="16" cy="16" r="0.8" fill="currentColor" />
      </symbol>

      {/* DIP — shallow wide bowl with a surface swirl + a triangular chip dipped in, leaning out top-right */}
      <symbol id="dish-dip" viewBox="0 0 32 32">
        <path d="M4 17h24a12 7 0 0 1-24 0Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 15.5c1.2-1.2 2.8 0 4-.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 17l7-11 3 2Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </symbol>

      {/* WRAP — rolled burrito on a diagonal: one end folded closed, angled cut end with filling spiral */}
      <symbol id="dish-wrap" viewBox="0 0 32 32">
        <path d="M7 22l13-13a5 5 0 0 1 4 8L11 26a5 5 0 0 1-4-4Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M7 22l4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M22.5 8.5a2.6 2.6 0 0 0-1.6 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      {/* PIE — round pie top view: crimped scalloped rim + a lattice of crossing strips over soft filling */}
      <symbol id="dish-pie" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="11" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" />
        <path d="M9 9l14 14M23 9L9 23" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 5v3M27 16h-3M16 27v-3M5 16h3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
