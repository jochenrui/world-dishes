import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DishSprite } from './DishSprites';
import { Flag } from './Flag';
import { hitId, searchCommands, type CommandHit } from '../lib/commandSearch';
import styles from './CommandPalette.module.css';

/** Custom event the header button (or anything else) dispatches to open the palette. */
const OPEN_EVENT = 'worlddishes:open-command-palette';

const IS_MAC =
  typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);

/** Unobtrusive header affordance that opens the palette + shows the shortcut. */
export function CommandPaletteButton() {
  return (
    <button
      type="button"
      className={styles.trigger}
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_EVENT))}
      aria-haspopup="dialog"
      aria-keyshortcuts={IS_MAC ? 'Meta+K' : 'Control+K'}
    >
      <span aria-hidden="true">Search</span>
      <kbd className={styles.kbd} aria-hidden="true">
        {IS_MAC ? '⌘' : 'Ctrl'} K
      </kbd>
      <span className="sr-only">Open quick-jump search</span>
    </button>
  );
}

function SearchIcon() {
  return (
    <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const listboxId = useId();

  const results = useMemo(() => searchCommands(query), [query]);

  const close = useCallback(() => setOpen(false), []);

  // Open on Cmd/Ctrl+K from anywhere, and on the custom event (header button).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  // Close automatically after a navigation.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // On open: reset query, remember + move focus, lock body scroll. Restore on close.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  // Keep the highlighted row in view.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open, results]);

  const onQueryChange = (value: string) => {
    setQuery(value);
    setActive(0);
  };

  const choose = useCallback(
    (hit: CommandHit | undefined) => {
      if (!hit) return;
      close();
      navigate(hit.to);
    },
    [close, navigate],
  );

  const onDialogKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => (results.length ? (i + 1) % results.length : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(Math.max(0, results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        choose(results[active]);
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        // Only the input is focusable inside the dialog; keep focus trapped on it.
        e.preventDefault();
        inputRef.current?.focus();
        break;
      default:
        break;
    }
  };

  if (!open) return null;

  const activeHit = results[active];

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(e) => {
        // Backdrop click (outside the dialog) closes.
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick jump to a dish or country"
        className={styles.dialog}
        onKeyDown={onDialogKeyDown}
      >
        <div className={styles.searchRow}>
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Jump to a dish or country…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            role="combobox"
            aria-expanded
            aria-controls={listboxId}
            aria-activedescendant={activeHit ? hitId(activeHit) : undefined}
            aria-autocomplete="list"
            aria-label="Search dishes and countries"
            autoComplete="off"
            spellCheck={false}
          />
          <span className={styles.escHint} aria-hidden="true">
            Esc
          </span>
        </div>

        {results.length === 0 ? (
          <div className={styles.empty}>No matches for “{query.trim()}”.</div>
        ) : (
          <ul ref={listRef} id={listboxId} role="listbox" className={styles.list} aria-label="Results">
            {results.map((hit, i) => {
              const selected = i === active;
              const id = hitId(hit);
              const isDish = hit.kind === 'dish';
              return (
                <li
                  key={id}
                  id={id}
                  role="option"
                  aria-selected={selected}
                  className={`${styles.option} ${selected ? styles.optionActive : ''}`}
                  onMouseMove={() => setActive(i)}
                  onClick={() => choose(hit)}
                >
                  {isDish ? (
                    <span className={styles.icon}>
                      <DishSprite category={hit.dish.category} size={26} />
                    </span>
                  ) : (
                    <span className={styles.flagWrap}>
                      <Flag countryId={hit.country.id} width={26} decorative />
                    </span>
                  )}
                  <span className={styles.text}>
                    <span className={styles.label}>{isDish ? hit.dish.name : hit.country.name}</span>
                    <span className={styles.sublabel}>
                      {isDish
                        ? [hit.dish.localName, hit.countryName].filter(Boolean).join(' · ')
                        : hit.country.continent}
                    </span>
                  </span>
                  <span className={styles.tag}>{isDish ? 'Dish' : 'Country'}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
