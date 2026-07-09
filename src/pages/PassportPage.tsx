import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { computePassport } from '../lib/passport';
import { Flag } from '../components/Flag';
import { useProgress } from '../state/ProgressContext';
import { useSession } from '../state/SessionContext';
import pageStyles from './pages.module.css';
import styles from './PassportPage.module.css';

export function PassportPage() {
  const { user, signIn } = useSession();
  const { entries } = useProgress();
  const data = useMemo(() => computePassport(entries), [entries]);

  const earned = data.achievements.filter((a) => a.earned).length;

  return (
    <>
      <div className={pageStyles.hero}>
        <h1 className={pageStyles.title}>Your Culinary Passport</h1>
        <p className={pageStyles.subtitle}>
          Collect a stamp for every country you taste your way through, and earn badges as your
          palate travels the globe.
        </p>
      </div>

      {!user ? (
        <div className={styles.gate}>
          <svg
            className={styles.gateMark}
            viewBox="0 0 32 32"
            aria-hidden="true"
            width={52}
            height={52}
          >
            <rect x="6" y="3" width="20" height="26" rx="3" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="2" />
            <circle cx="16" cy="13" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M11 22c1-2.6 3-4 5-4s4 1.4 5 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p>Sign in to start stamping your passport and unlocking achievements.</p>
          <button type="button" className={styles.gateBtn} onClick={signIn}>
            Sign in with Google
          </button>
        </div>
      ) : (
        <>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNum}>{data.triedTotal}</div>
              <div className={styles.statSub}>of {data.dishTotal} dishes tried</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>{data.countriesVisited}</div>
              <div className={styles.statSub}>of {data.countriesTotal} countries visited</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>
                {data.continentsVisited}/{data.continentsTotal}
              </div>
              <div className={styles.statSub}>continents tasted</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>
                {earned}/{data.achievements.length}
              </div>
              <div className={styles.statSub}>achievements earned</div>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Achievements</h2>
          <div className={styles.achievements}>
            {data.achievements.map((a) => (
              <div
                key={a.id}
                className={`${styles.badge} ${a.earned ? styles.badgeEarned : ''}`}
              >
                <span className={styles.badgeIcon} aria-hidden="true">
                  {a.icon}
                </span>
                <div className={styles.badgeBody}>
                  <div className={styles.badgeTitle}>{a.title}</div>
                  <div className={styles.badgeDesc}>{a.description}</div>
                  {a.earned ? (
                    <span className={styles.earnedTag}>✓ Earned</span>
                  ) : (
                    <>
                      <span className={styles.progressTrack}>
                        <span
                          className={styles.progressFill}
                          style={{ width: `${(a.current / a.target) * 100}%` }}
                        />
                      </span>
                      <div className={styles.progressText}>
                        {a.current} / {a.target}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <h2 className={styles.sectionTitle}>
            Country stamps {data.countriesVisited > 0 && `(${data.countriesVisited})`}
          </h2>
          {data.stamps.length === 0 ? (
            <p className={styles.locked}>
              No stamps yet — <Link to="/">mark a dish as tried</Link> to earn your first.
            </p>
          ) : (
            <>
              <div className={styles.stamps}>
                {data.stamps.map((s) => (
                  <Link
                    key={s.countryId}
                    to={`/collection/${s.countryId}`}
                    className={`${styles.stamp} ${s.complete ? styles.stampComplete : ''}`}
                  >
                    <Flag countryId={s.flagId} width={40} title={s.name} />
                    <span className={styles.stampName}>{s.name}</span>
                    <span className={styles.stampCount}>
                      {s.tried}/{s.total} tried
                    </span>
                    {s.complete && <span className={styles.stampRibbon}>★ Complete</span>}
                  </Link>
                ))}
              </div>
              {data.countriesVisited < data.countriesTotal && (
                <p className={styles.locked}>
                  {data.countriesTotal - data.countriesVisited} more countries waiting to be stamped.
                </p>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
