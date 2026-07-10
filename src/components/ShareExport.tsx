import { useEffect, useRef, useState } from 'react';
import { dishes } from '../data/dishes';
import { countries } from '../data/countries';
import type { PassportData } from '../lib/passport';
import type { UserProgress } from '../data/types';
import { toCsv, toExportRows, toJson } from '../lib/exportProgress';
import { drawShareCard } from '../lib/shareCard';
import type { ShareCardData } from '../lib/shareCard';
import styles from './ShareExport.module.css';

interface Props {
  data: PassportData;
  entries: UserProgress['entries'];
  userName: string | null;
}

/** Trigger a client-side download of a Blob under `filename`, revoking the URL after. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the download has grabbed the URL.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function canCopyImage(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.clipboard &&
    typeof navigator.clipboard.write === 'function' &&
    typeof window !== 'undefined' &&
    typeof window.ClipboardItem === 'function'
  );
}

export function ShareExport({ data, entries, userName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const copyable = canCopyImage();

  const cardData: ShareCardData = {
    name: userName,
    dishesTried: data.triedTotal,
    countriesVisited: data.countriesVisited,
    continentsTasted: data.continentsVisited,
    earnedAchievements: data.achievements.filter((a) => a.earned).map((a) => a.icon),
  };

  // Redraw the live preview on mount and whenever the underlying numbers change.
  const drawKey = JSON.stringify(cardData);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) drawShareCard(canvas, cardData);
    // cardData is fully captured by drawKey; redraw only when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawKey]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, 'world-dishes-passport.png');
    }, 'image/png');
  };

  const copyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !copyable) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png'),
      );
      if (!blob) throw new Error('no blob');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
    setTimeout(() => setCopyState('idle'), 2200);
  };

  const exportJson = () => {
    const rows = toExportRows(entries, dishes, countries);
    const json = toJson(rows, new Date().toISOString());
    downloadBlob(new Blob([json], { type: 'application/json' }), 'world-dishes-progress.json');
  };

  const exportCsv = () => {
    const rows = toExportRows(entries, dishes, countries);
    const csv = toCsv(rows);
    downloadBlob(new Blob([csv], { type: 'text/csv' }), 'world-dishes-progress.csv');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.previewCol}>
        <canvas
          ref={canvasRef}
          className={styles.preview}
          role="img"
          aria-label="Shareable passport card preview showing your dishes, countries and continents tasted"
        />
      </div>
      <div className={styles.actionsCol}>
        <p className={styles.blurb}>
          Save a shareable card of your food journey, or export your full progress as data.
        </p>
        <div className={styles.group}>
          <span className={styles.groupLabel}>Passport card</span>
          <div className={styles.buttons}>
            <button type="button" className={styles.btnPrimary} onClick={downloadPng}>
              Download PNG
            </button>
            {copyable && (
              <button type="button" className={styles.btn} onClick={copyImage}>
                {copyState === 'copied'
                  ? '✓ Copied'
                  : copyState === 'error'
                    ? 'Copy failed'
                    : 'Copy image'}
              </button>
            )}
          </div>
        </div>
        <div className={styles.group}>
          <span className={styles.groupLabel}>Raw data</span>
          <div className={styles.buttons}>
            <button type="button" className={styles.btn} onClick={exportJson}>
              Export JSON
            </button>
            <button type="button" className={styles.btn} onClick={exportCsv}>
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
