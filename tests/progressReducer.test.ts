import { describe, expect, it } from 'vitest';
import { progressReducer } from '../src/state/progressReducer';
import { emptyProgress } from '../src/state/storage';

const NOW = '2026-07-08T00:00:00.000Z';

describe('progressReducer', () => {
  it('marks a dish tried with a timestamp', () => {
    const s = progressReducer(emptyProgress(), { type: 'toggleTried', dishId: 'jp-sushi', now: NOW });
    expect(s.entries['jp-sushi']).toEqual({ tried: true, triedAt: NOW });
  });

  it('un-trying deletes the entry (note, rating, timestamp all gone)', () => {
    let s = progressReducer(emptyProgress(), { type: 'toggleTried', dishId: 'jp-sushi', now: NOW });
    s = progressReducer(s, { type: 'setNote', dishId: 'jp-sushi', note: 'loved it' });
    s = progressReducer(s, { type: 'setRating', dishId: 'jp-sushi', rating: 5 });
    expect(s.entries['jp-sushi']).toMatchObject({ tried: true, note: 'loved it', rating: 5 });
    s = progressReducer(s, { type: 'toggleTried', dishId: 'jp-sushi', now: NOW });
    expect(s.entries['jp-sushi']).toBeUndefined();
    expect('jp-sushi' in s.entries).toBe(false);
  });

  it('setting a note implies tried', () => {
    const s = progressReducer(emptyProgress(), { type: 'setNote', dishId: 'it-pizza', note: 'Napoli!' });
    expect(s.entries['it-pizza']).toMatchObject({ tried: true, note: 'Napoli!' });
  });

  it('reset clears all entries', () => {
    let s = progressReducer(emptyProgress(), { type: 'toggleTried', dishId: 'jp-sushi', now: NOW });
    s = progressReducer(s, { type: 'reset' });
    expect(Object.keys(s.entries)).toHaveLength(0);
  });
});
