import type { ComponentType, CSSProperties } from 'react';
import {
  JP, CN, IN, TH, VN, KR, ID, MY, TR, LB, IR,
  IT, FR, ES, GR, DE, GB, PT, PL, RU,
  MA, ET, NG, EG, ZA,
  US, MX, CA, CU, JM,
  BR, AR, PE, CO,
  AU,
} from 'country-flag-icons/react/3x2';
import styles from './Flag.module.css';

type FlagComponent = ComponentType<{ className?: string; style?: CSSProperties; title?: string }>;

// Explicit map (not a namespace import) so only the 35 flags we use are bundled.
const FLAG_BY_ID: Record<string, FlagComponent> = {
  jp: JP, cn: CN, in: IN, th: TH, vn: VN, kr: KR, id: ID, my: MY, tr: TR, lb: LB, ir: IR,
  it: IT, fr: FR, es: ES, gr: GR, de: DE, gb: GB, pt: PT, pl: PL, ru: RU,
  ma: MA, et: ET, ng: NG, eg: EG, za: ZA,
  us: US, mx: MX, ca: CA, cu: CU, jm: JM,
  br: BR, ar: AR, pe: PE, co: CO,
  au: AU,
};

interface Props {
  countryId: string;
  /** Rendered width in px; height follows the 3:2 aspect ratio. */
  width?: number;
  title?: string;
}

/**
 * Real SVG country flag (self-hosted, inline). Replaces emoji flags, which render
 * as bare ISO letters on Windows/Chrome. Falls back to nothing if a code is unknown.
 */
export function Flag({ countryId, width = 22, title }: Props) {
  const F = FLAG_BY_ID[countryId];
  if (!F) return null;
  return <F className={styles.flag} style={{ width }} title={title} />;
}
