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
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const headerH =
        parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) ||
        64;
      setStuck(el.getBoundingClientRect().top <= headerH + 0.5);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    // Publish the pinned bar's height so scrolled/anchored content can offset for
    // it (see `scroll-padding-top` in theme.css). A ResizeObserver updates it only
    // when the bar's height actually changes (e.g. condensing on stick, wrapping).
    const root = document.documentElement;
    const publishHeight = () => root.style.setProperty('--filterbar-h', `${el.offsetHeight}px`);
    publishHeight();
    const ro = new ResizeObserver(publishHeight);
    ro.observe(el);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      ro.disconnect();
      root.style.setProperty('--filterbar-h', '0px');
    };
  }, []);

  return (
    <div ref={ref} className={`${styles.sticky} ${stuck ? styles.stuck : ''}`}>
      {children}
    </div>
  );
}
