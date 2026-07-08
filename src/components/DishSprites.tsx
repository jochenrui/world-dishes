import type { Category } from '../data/types';

/**
 * One inline SVG symbol sheet, mounted once at app root. Each dish category maps
 * to a <symbol id="dish-{category}">. Icons use currentColor so they inherit the
 * card's text color and stay theme-aware. Stroke-based, 32x32 viewBox.
 */
export function DishSpriteSheet() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      focusable="false"
    >
      <defs>
        {/* stroke defaults applied per-<use> via CSS */}
      </defs>

      <symbol id="dish-noodles" viewBox="0 0 32 32">
        <path d="M5 15h22a11 11 0 0 1-22 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 15c1-6 2-8 3-9M16 15c0-6 0-8 1-10M21 15c1-6 2-7 3-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 8l7-3M21 11l7-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      <symbol id="dish-curry" viewBox="0 0 32 32">
        <path d="M6 16h20a10 10 0 0 1-20 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="13" cy="12" r="2" fill="currentColor" />
        <circle cx="19" cy="11" r="1.6" fill="currentColor" />
        <path d="M26 16h3M3 16h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      <symbol id="dish-grilled" viewBox="0 0 32 32">
        <path d="M6 6l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="14" cy="14" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="19" cy="19" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M22 22l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      <symbol id="dish-dumpling" viewBox="0 0 32 32">
        <path d="M5 19a11 6 0 0 1 22 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 15c1 2 3 2 3 0M14 14c1 2 3 2 3 0M19 15c1 2 3 2 3 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      <symbol id="dish-soup" viewBox="0 0 32 32">
        <path d="M5 15h22a11 11 0 0 1-22 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 9c-1-1-1-2 0-3M16 9c-1-1-1-2 0-3M20 9c-1-1-1-2 0-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      <symbol id="dish-rice" viewBox="0 0 32 32">
        <path d="M6 17a10 5 0 0 1 20 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 13.5l1-1M14 12.5l1-1M18 12.5l1-1M22 13.5l1-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 20h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      <symbol id="dish-bread" viewBox="0 0 32 32">
        <path d="M6 14a10 6 0 0 1 20 0v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 12v10M20 12v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      <symbol id="dish-stew" viewBox="0 0 32 32">
        <path d="M7 14h18v5a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M5 14h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M13 10c-1-1-1-2 0-3M19 10c-1-1-1-2 0-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      <symbol id="dish-salad" viewBox="0 0 32 32">
        <path d="M5 15h22a11 9 0 0 1-22 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
        <circle cx="18" cy="11" r="1.8" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="21" cy="14" r="1.4" fill="currentColor" />
      </symbol>

      <symbol id="dish-seafood" viewBox="0 0 32 32">
        <path d="M6 16c4-6 12-6 16 0-4 6-12 6-16 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M22 16l5-4v8Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="11" cy="15" r="1.3" fill="currentColor" />
      </symbol>

      <symbol id="dish-dessert" viewBox="0 0 32 32">
        <path d="M9 16h14l-2 8a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 16a5 5 0 1 0-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="7" r="1.6" fill="currentColor" />
      </symbol>

      <symbol id="dish-streetfood" viewBox="0 0 32 32">
        <path d="M6 20l10-12 10 12Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 20c2 4 12 4 14 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      <symbol id="dish-sandwich" viewBox="0 0 32 32">
        <path d="M6 12a10 4 0 0 1 20 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M6 12h20M7 16h18M6 20a10 4 0 0 0 20 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </symbol>

      <symbol id="dish-beverage" viewBox="0 0 32 32">
        <path d="M10 8h12l-2 16a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 14h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 8V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </symbol>

      <symbol id="dish-pastry" viewBox="0 0 32 32">
        <path d="M6 20c3-8 17-8 20 0Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 18c1-3 2-4 2-4M16 17c0-3 0-5 0-5M21 18c-1-3-2-4-2-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
