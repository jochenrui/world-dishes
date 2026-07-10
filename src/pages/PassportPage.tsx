import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { computePassport } from '../lib/passport';
import { deriveStats } from '../lib/deriveStats';
import type { Dish } from '../data/types';
import { getCountry } from '../data/countries';
import { DishSprite } from '../components/DishSprites';
import { Flag } from '../components/Flag';
import { ShareExport } from '../components/ShareExport';
import { useProgress } from '../state/ProgressContext';
import { useSession } from '../state/SessionContext';
import pageStyles from './pages.module.css';
import styles from './PassportPage.module.css';

function JourneyChip({ dish }: { dish: Dish }) {
  const country = getCountry(dish.countryId);
  return (
    <Link to={`/dish/${dish.id}`} className={styles.chip}>
      <span className={styles.chipSprite} aria-hidden="true">
        <DishSprite category={dish.category} size={22} />
      </span>
      <span className={styles.chipName}>{dish.name}</span>
      {country && <Flag countryId={country.id} width={18} title={country.name} />}
    </Link>
  );
}

export function PassportPage() {
  const { user, signIn } = useSession();
  const { entries } = useProgress();
  const data = useMemo(() => computePassport(entries), [entries]);
  const stats = useMemo(() => deriveStats(entries), [entries]);

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

          {stats.totalTried > 0 && (
            <p className={styles.statsLink}>
              <Link to="/stats">See your stats →</Link>
            </p>
          )}

          {stats.totalTried > 0 && (
            <>
              <h2 className={styles.sectionTitle}>Share &amp; export</h2>
              <ShareExport data={data} entries={entries} userName={user.name ?? null} />
            </>
          )}

          {stats.totalTried > 0 && (
            <>
              <h2 className={styles.sectionTitle}>Your Journey</h2>
              <div className={styles.journey}>
                {stats.timeline.map((month) => (
                  <div key={month.key} className={styles.journeyMonth}>
                    <h3 className={styles.journeyHeading}>
                      {month.label} <span className={styles.journeyCount}>· {month.dishes.length} {month.dishes.length === 1 ? 'dish' : 'dishes'}</span>
                    </h3>
                    <div className={styles.chips}>
                      {month.dishes.map(({ dish }) => (
                        <JourneyChip key={dish.id} dish={dish} />
                      ))}
                    </div>
                  </div>
                ))}
                {stats.undated.length > 0 && (
                  <div className={styles.journeyMonth}>
                    <h3 className={styles.journeyHeading}>
                      Earlier / undated{' '}
                      <span className={styles.journeyCount}>· {stats.undated.length} {stats.undated.length === 1 ? 'dish' : 'dishes'}</span>
                    </h3>
                    <div className={styles.chips}>
                      {stats.undated.map((dish) => (
                        <JourneyChip key={dish.id} dish={dish} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

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
