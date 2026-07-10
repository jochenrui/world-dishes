interface Props {
  tried: number;
  total: number;
  size?: number;
}

/** SVG donut showing tried/total for a country. */
export function CountryProgressRing({ tried, total, size = 46 }: Props) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? tried / total : 0;
  const complete = total > 0 && tried === total;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${tried} of ${total} dishes tried`}
      focusable="false"
    >
      <g aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="color-mix(in srgb, var(--c-text-muted) 30%, var(--c-surface))"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={complete ? 'var(--c-success)' : 'var(--c-primary)'}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={size * 0.26}
        fontWeight={700}
        fill="var(--c-text)"
      >
        {complete ? '✓' : `${tried}/${total}`}
      </text>
      </g>
    </svg>
  );
}
