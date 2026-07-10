import { useId } from 'react';
import styles from './BarChart.module.css';

export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  title: string;
  data: BarDatum[];
}

// Logical SVG coordinate space. width:100% + a uniform viewBox keeps every chart's
// text at the same scale regardless of how many rows it has.
const W = 360;
const ROW_H = 26;
const BAR_H = 12;
const PAD_TOP = 6;
const PAD_BOTTOM = 6;
const LABEL_W = 112; // left gutter for the dimension label
const GAP = 8; // gap between label gutter and baseline
const VALUE_PAD = 30; // right gutter for the value label at each bar's end
const BASELINE_X = LABEL_W + GAP;
const TRACK_END = W - VALUE_PAD;
const MAX_BAR = TRACK_END - BASELINE_X;
const CORNER = 4; // rounded data-end radius

/** A bar with only its right (data-end) corners rounded, anchored at the baseline. */
function barPath(x1: number, yTop: number): string {
  const r = Math.min(CORNER, Math.max(0, x1 - BASELINE_X));
  const yBot = yTop + BAR_H;
  return [
    `M${BASELINE_X},${yTop}`,
    `H${x1 - r}`,
    `Q${x1},${yTop} ${x1},${yTop + r}`,
    `V${yBot - r}`,
    `Q${x1},${yBot} ${x1 - r},${yBot}`,
    `H${BASELINE_X}`,
    'Z',
  ].join(' ');
}

/**
 * A single-series horizontal bar chart, rendered as self-contained inline SVG (no
 * external fonts / libraries — strict-CSP safe). All bars share the app's terracotta
 * hue; identity is carried by real text labels + direct value labels, never color.
 */
export function BarChart({ title, data }: BarChartProps) {
  const titleId = useId();
  const max = Math.max(0, ...data.map((d) => d.value));
  const hasData = data.length > 0 && max > 0;

  const summary = hasData
    ? `${title}: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`
    : `${title}: no data yet`;

  const height = hasData
    ? PAD_TOP + data.length * ROW_H + PAD_BOTTOM
    : PAD_TOP + ROW_H + PAD_BOTTOM;

  return (
    <figure className={styles.chart}>
      <figcaption id={titleId} className={styles.title}>
        {title}
      </figcaption>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={summary}
        preserveAspectRatio="xMinYMin meet"
      >
        {!hasData ? (
          <text
            className={styles.empty}
            x={W / 2}
            y={PAD_TOP + ROW_H / 2 + BAR_H / 2}
            textAnchor="middle"
          >
            No data yet
          </text>
        ) : (
          <>
            {/* recessive baseline / axis line */}
            <line
              className={styles.axis}
              x1={BASELINE_X}
              y1={PAD_TOP}
              x2={BASELINE_X}
              y2={PAD_TOP + data.length * ROW_H}
            />
            {data.map((d, i) => {
              const yTop = PAD_TOP + i * ROW_H + (ROW_H - BAR_H) / 2;
              const yMid = yTop + BAR_H / 2;
              const len = d.value > 0 ? Math.max(3, (d.value / max) * MAX_BAR) : 0;
              const x1 = BASELINE_X + len;
              return (
                <g key={`${d.label}-${i}`}>
                  {/* faint full-length track so the common baseline reads clearly */}
                  <rect
                    className={styles.track}
                    x={BASELINE_X}
                    y={yTop}
                    width={MAX_BAR}
                    height={BAR_H}
                    rx={CORNER}
                  />
                  {d.value > 0 && <path className={styles.bar} d={barPath(x1, yTop)} />}
                  <text
                    className={styles.label}
                    x={LABEL_W}
                    y={yMid}
                    textAnchor="end"
                    dominantBaseline="central"
                  >
                    {d.label}
                  </text>
                  <text
                    className={styles.value}
                    x={x1 + 5}
                    y={yMid}
                    textAnchor="start"
                    dominantBaseline="central"
                  >
                    {d.value}
                  </text>
                </g>
              );
            })}
          </>
        )}
      </svg>
    </figure>
  );
}
