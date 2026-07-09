import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import styles from './ExpandableText.module.css';

interface Props {
  text: string;
  /** Max lines shown before clamping. */
  lines?: number;
  className?: string;
}

/**
 * Clamps text to `lines` with an automatic ellipsis (CSS line-clamp) and shows a
 * "Show more"/"Show less" toggle ONLY when the text actually overflows. The full
 * text always stays in the DOM (screen-reader + find-in-page friendly); we only
 * clamp visually. Overflow is measured while collapsed and re-checked on resize.
 */
export function ExpandableText({ text, lines = 3, className }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const id = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      // Only meaningful while clamped; keep the toggle once expanded.
      if (!expanded) setOverflowing(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, lines, expanded]);

  return (
    <>
      <p
        ref={ref}
        id={id}
        className={`${styles.text} ${expanded ? '' : styles.clamped} ${className ?? ''}`}
        style={{ '--clamp-lines': lines } as CSSProperties}
      >
        {text}
      </p>
      {(overflowing || expanded) && (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </>
  );
}
