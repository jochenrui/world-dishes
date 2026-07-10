import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Accessibility: on each client-side navigation, move keyboard focus to the main
 * region (which must have tabIndex={-1}) and reset scroll to the top, so screen-reader
 * and keyboard users aren't stranded at the previous scroll position / focus point.
 *
 * The initial render is skipped so we don't steal focus on first page load.
 *
 * @param mainRef ref to the <main id="main-content" tabIndex={-1}> element.
 */
export function useRouteFocus(mainRef: React.RefObject<HTMLElement>) {
  const { pathname } = useLocation();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    // Only move focus on a genuine pathname CHANGE, never on the initial load.
    // Comparing against the previous pathname (rather than a one-shot "isInitial"
    // flag) is also safe under React 18 StrictMode, whose double-invoked mount
    // effect sees prevPath === pathname on the second run and so won't steal focus.
    if (prevPath.current !== null && prevPath.current !== pathname) {
      window.scrollTo(0, 0);
      mainRef.current?.focus();
    }
    prevPath.current = pathname;
  }, [pathname, mainRef]);
}
