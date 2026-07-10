import { useEffect, useRef, useState } from 'react';
import type { Rating } from '../data/types';
import { useProgress } from '../state/ProgressContext';
import styles from './NoteEditor.module.css';

const STAR_VALUES: Rating[] = [1, 2, 3, 4, 5];

export function NoteEditor({ dishId }: { dishId: string }) {
  const { get, setNote, setRating, clearRating } = useProgress();
  const entry = get(dishId);
  const [draft, setDraft] = useState(entry?.note ?? '');
  const [hover, setHover] = useState(0);
  const [savedFlash, setSavedFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();

  // Keep the textarea in sync if the underlying note changes (e.g. user switch).
  useEffect(() => {
    setDraft(entry?.note ?? '');
  }, [dishId]); // eslint-disable-line react-hooks/exhaustive-deps

  const flashSaved = () => {
    setSavedFlash(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setSavedFlash(false), 1600);
  };

  // Save as you type. setNote updates state immediately and the ProgressContext
  // write-through is per-dish debounced, so this never spams the server.
  const onNoteChange = (value: string) => {
    setDraft(value);
    if (value.trim() !== (entry?.note ?? '')) {
      setNote(dishId, value.trim());
      flashSaved();
    }
  };

  return (
    <div className={styles.editor}>
      <div className={styles.ratingRow}>
        <div
          className={styles.stars}
          role="radiogroup"
          aria-label="Your rating"
          onMouseLeave={() => setHover(0)}
        >
          {STAR_VALUES.map((v) => {
            const on = (hover || entry?.rating || 0) >= v;
            const selected = entry?.rating === v;
            return (
              <button
                key={v}
                type="button"
                className={`${styles.star} ${on ? styles.starOn : ''}`}
                role="radio"
                aria-checked={selected}
                aria-label={`${v} star${v > 1 ? 's' : ''}`}
                onMouseEnter={() => setHover(v)}
                onFocus={() => setHover(v)}
                onBlur={() => setHover(0)}
                // Clicking the currently-selected star clears the rating (common pattern).
                onClick={() => (selected ? clearRating(dishId) : setRating(dishId, v))}
              >
                {on ? '★' : '☆'}
              </button>
            );
          })}
        </div>
        {entry?.rating != null && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => clearRating(dishId)}
            aria-label="Clear rating"
          >
            ✕ Clear
          </button>
        )}
      </div>

      <textarea
        className={styles.textarea}
        placeholder="Add a note or review — where you had it, what you thought…"
        value={draft}
        onChange={(e) => onNoteChange(e.target.value)}
        aria-label="Note or review"
      />
      <div className={styles.row}>
        <span className={styles.hint}>Saved automatically</span>
        {savedFlash && <span className={styles.saved}>✓ Note saved</span>}
      </div>
    </div>
  );
}
