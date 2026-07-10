import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './StickyBar.module.css';

/**
 * A sticky container that sits flush beneath the app header with an opaque
 * backdrop (so scrolling content can't peek through a gap or around it) and
 * gains a drop shadow only once it's "stuck" — the standard elevation cue that
 * makes it read as attached to the top rather than floating over the cards.
 */
export function StickyBar({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const sentinel = sentinelRef.current;
    if (!el || !sentinel) return;
    const root = document.documentElement;

    // Publish the pinned bar's height so scrolled/anchored content can offset for
    // it (see `scroll-padding-top` in theme.css). A ResizeObserver updates it only
    // when the bar's height actually changes (e.g. condensing on stick, wrapping).
    const publishHeight = () => root.style.setProperty('--filterbar-h', `${el.offsetHeight}px`);
    publishHeight();
    const ro = new ResizeObserver(publishHeight);
    ro.observe(el);

    // Stuck-detection with no per-frame layout reads: a zero-height sentinel sits
    // in normal flow immediately above the sticky bar, so it marks where the bar's
    // top edge would be. Shrinking the observer's root by --header-h means the
    // sentinel leaves the (adjusted) viewport exactly when the bar reaches the
    // header — i.e. the instant it becomes stuck. The browser does the geometry
    // off the main thread; we only flip a class.
    let io: IntersectionObserver | null = null;
    const observeStuck = () => {
      io?.disconnect();
      const headerH =
        parseInt(getComputedStyle(root).getPropertyValue('--header-h'), 10) || 64;
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[entries.length - 1];
          if (entry) setStuck(!entry.isIntersecting);
        },
        { rootMargin: `-${headerH}px 0px 0px 0px`, threshold: 0 },
      );
      io.observe(sentinel);
    };
    observeStuck();
    // --header-h can change when the header reflows (viewport resize / nav wrap);
    // re-derive the rootMargin from it. Resize is coarse, not per-frame.
    window.addEventListener('resize', observeStuck);

    return () => {
      window.removeEventListener('resize', observeStuck);
      io?.disconnect();
      ro.disconnect();
      root.style.setProperty('--filterbar-h', '0px');
    };
  }, []);

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <div ref={ref} className={`${styles.sticky} ${stuck ? styles.stuck : ''}`}>
        {children}
      </div>
    </>
  );
}
