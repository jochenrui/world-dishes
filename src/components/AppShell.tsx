import { useEffect, useRef } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useSession } from '../state/SessionContext';
import { useRouteFocus } from '../hooks/useRouteFocus';
import styles from './AppShell.module.css';

const NAV = [
  { to: '/', label: 'Popular', end: true },
  { to: '/collection', label: 'Collection', end: false },
  { to: '/passport', label: 'Passport', end: false },
  { to: '/stats', label: 'Stats', end: false },
  { to: '/about', label: 'About', end: false },
];

function GoogleG() {
  return (
    <svg className={styles.gLogo} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7C43.6 38 46.5 31.8 46.5 24.5Z" />
      <path fill="#FBBC05" d="M10.3 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.8-6.1Z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.6l-7.3-5.7c-2 1.4-4.7 2.3-8 2.3-6.4 0-11.8-3.7-13.7-9.1l-7.8 6.1C6.4 42.6 14.6 48 24 48Z" />
    </svg>
  );
}

export function AppShell() {
  const { user, mode, initializing, signIn, signOut } = useSession();
  const mainRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useRouteFocus(mainRef);

  // Publish the header's measured height to --header-h so everything anchored to
  // it (the sticky filter bar's `top`, scroll-padding-top) tracks the real header
  // instead of hand-tuned magic numbers. A ResizeObserver keeps it in sync when the
  // header reflows (viewport resize, nav wrapping to a taller row, font changes).
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const root = document.documentElement;
    const publish = () => {
      const h = header.getBoundingClientRect().height;
      // Guard against a transient 0 (never overwrite the CSS fallback with 0px).
      if (h > 0) root.style.setProperty('--header-h', `${h}px`);
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header ref={headerRef} className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <span className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <circle cx="12" cy="12" r="9.3" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.8" />
                <path d="M2.9 12h18.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <ellipse cx="12" cy="12" rx="4.1" ry="9.3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4.4 7.6c4.6 2 10.6 2 15.2 0M4.4 16.4c4.6-2 10.6-2 15.2 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            World Dishes
          </span>
          <nav className={styles.nav} aria-label="Primary">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className={styles.spacer} />
          {initializing ? (
            <span className={styles.userName} aria-live="polite">
              …
            </span>
          ) : user ? (
            <div className={styles.user}>
              {user.avatarUrl && <img className={styles.avatar} src={user.avatarUrl} alt="" />}
              <span className={styles.userName}>{user.name}</span>
              {mode === 'mock' && <span className={styles.mockTag}>mock</span>}
              <button type="button" className={styles.signOut} onClick={signOut}>
                Sign out
              </button>
            </div>
          ) : (
            <button type="button" className={styles.signIn} onClick={signIn}>
              <GoogleG />
              Sign in with Google
              {mode === 'mock' && <span className={styles.mockTag}>mock</span>}
            </button>
          )}
        </div>
      </header>

      <main className={styles.main} id="main-content" tabIndex={-1} ref={mainRef}>
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className={styles.footer}>
        <div className="container">
          World Dishes · a curated taste of the planet · data is illustrative, see{' '}
          <NavLink to="/about" style={{ textDecoration: 'underline' }}>
            About the Data
          </NavLink>
        </div>
      </footer>
    </>
  );
}
