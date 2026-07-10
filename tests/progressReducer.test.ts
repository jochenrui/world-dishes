import { describe, expect, it } from 'vitest';
import { progressReducer } from '../src/state/progressReducer';
import { emptyProgress } from '../src/state/storage';

const NOW = '2026-07-08T00:00:00.000Z';
const LATER = '2026-07-09T00:00:00.000Z';

describe('progressReducer', () => {
  it('marks a dish tried with a timestamp', () => {
    const s = progressReducer(emptyProgress(), { type: 'toggleTried', dishId: 'jp-sushi', now: NOW });
    expect(s.entries['jp-sushi']).toEqual({ tried: true, triedAt: NOW });
  });

  it('un-trying with NO wishlist deletes the entry (note, rating, timestamp all gone)', () => {
    let s = progressReducer(emptyProgress(), { type: 'toggleTried', dishId: 'jp-sushi', now: NOW });
    s = progressReducer(s, { type: 'setNote', dishId: 'jp-sushi', note: 'loved it' });
    s = progressReducer(s, { type: 'setRating', dishId: 'jp-sushi', rating: 5 });
    expect(s.entries['jp-sushi']).toMatchObject({ tried: true, note: 'loved it', rating: 5 });
    s = progressReducer(s, { type: 'toggleTried', dishId: 'jp-sushi', now: NOW });
    expect(s.entries['jp-sushi']).toBeUndefined();
    expect('jp-sushi' in s.entries).toBe(false);
  });

  it('un-trying a WISHLISTED dish keeps a {tried:false, wishlistedAt} row (not a tombstone)', () => {
    let s = progressReducer(emptyProgress(), { type: 'toggleTried', dishId: 'jp-sushi', now: NOW });
    s = progressReducer(s, { type: 'setRating', dishId: 'jp-sushi', rating: 5 });
    s = progressReducer(s, { type: 'toggleWishlist', dishId: 'jp-sushi', now: LATER });
    expect(s.entries['jp-sushi']).toEqual({ tried: true, triedAt: NOW, rating: 5, wishlistedAt: LATER });
    s = progressReducer(s, { type: 'toggleTried', dishId: 'jp-sushi', now: NOW });
    expect(s.entries['jp-sushi']).toEqual({ tried: false, wishlistedAt: LATER });
  });

  it('toggleWishlist turns on, then off deletes the key when nothing else remains', () => {
    let s = progressReducer(emptyProgress(), { type: 'toggleWishlist', dishId: 'th-padthai', now: LATER });
    expect(s.entries['th-padthai']).toEqual({ tried: false, wishlistedAt: LATER });
    s = progressReducer(s, { type: 'toggleWishlist', dishId: 'th-padthai', now: LATER });
    expect(s.entries['th-padthai']).toBeUndefined();
    expect('th-padthai' in s.entries).toBe(false);
  });

  it('un-wishlisting a tried dish keeps the tried entry (only wishlistedAt removed)', () => {
    let s = progressReducer(emptyProgress(), { type: 'toggleTried', dishId: 'jp-sushi', now: NOW });
    s = progressReducer(s, { type: 'setRating', dishId: 'jp-sushi', rating: 5 });
    s = progressReducer(s, { type: 'toggleWishlist', dishId: 'jp-sushi', now: LATER });
    expect(s.entries['jp-sushi']).toEqual({ tried: true, triedAt: NOW, rating: 5, wishlistedAt: LATER });
    s = progressReducer(s, { type: 'toggleWishlist', dishId: 'jp-sushi', now: LATER });
    expect(s.entries['jp-sushi']).toEqual({ tried: true, triedAt: NOW, rating: 5 });
  });

  it('marking a wishlisted dish tried consumes (clears) the wishlist intention', () => {
    let s = progressReducer(emptyProgress(), { type: 'toggleWishlist', dishId: 'it-pizza', now: LATER });
    expect(s.entries['it-pizza']).toEqual({ tried: false, wishlistedAt: LATER });
    s = progressReducer(s, { type: 'toggleTried', dishId: 'it-pizza', now: NOW });
    expect(s.entries['it-pizza']).toEqual({ tried: true, triedAt: NOW });
  });

  it('setNote/setRating preserve an existing wishlist timestamp', () => {
    let s = progressReducer(emptyProgress(), { type: 'toggleWishlist', dishId: 'it-pizza', now: LATER });
    s = progressReducer(s, { type: 'setNote', dishId: 'it-pizza', note: 'soon' });
    expect(s.entries['it-pizza']).toEqual({ tried: true, note: 'soon', wishlistedAt: LATER });
  });

  it('setting a note implies tried', () => {
    const s = progressReducer(emptyProgress(), { type: 'setNote', dishId: 'it-pizza', note: 'Napoli!' });
    expect(s.entries['it-pizza']).toMatchObject({ tried: true, note: 'Napoli!' });
  });

  it('clearRating removes the rating but keeps tried + note + triedAt', () => {
    let s = progressReducer(emptyProgress(), { type: 'toggleTried', dishId: 'jp-sushi', now: NOW });
    s = progressReducer(s, { type: 'setNote', dishId: 'jp-sushi', note: 'loved it' });
    s = progressReducer(s, { type: 'setRating', dishId: 'jp-sushi', rating: 5 });
    expect(s.entries['jp-sushi']).toEqual({ tried: true, triedAt: NOW, note: 'loved it', rating: 5 });
    s = progressReducer(s, { type: 'clearRating', dishId: 'jp-sushi' });
    // Rating gone; key survives with tried:true and every other field intact.
    expect(s.entries['jp-sushi']).toEqual({ tried: true, triedAt: NOW, note: 'loved it' });
    expect('rating' in s.entries['jp-sushi']).toBe(false);
    expect('jp-sushi' in s.entries).toBe(true);
  });

  it('clearRating preserves a wishlist timestamp', () => {
    let s = progressReducer(emptyProgress(), { type: 'toggleWishlist', dishId: 'it-pizza', now: LATER });
    s = progressReducer(s, { type: 'setRating', dishId: 'it-pizza', rating: 4 });
    expect(s.entries['it-pizza']).toEqual({ tried: true, rating: 4, wishlistedAt: LATER });
    s = progressReducer(s, { type: 'clearRating', dishId: 'it-pizza' });
    expect(s.entries['it-pizza']).toEqual({ tried: true, wishlistedAt: LATER });
  });

  it('clearRating is a no-op when there is no rating (or no entry)', () => {
    const empty = emptyProgress();
    // No entry at all → unchanged reference.
    expect(progressReducer(empty, { type: 'clearRating', dishId: 'jp-sushi' })).toBe(empty);
    // Entry exists but has no rating → unchanged reference, entry untouched.
    const tried = progressReducer(empty, { type: 'toggleTried', dishId: 'jp-sushi', now: NOW });
    const after = progressReducer(tried, { type: 'clearRating', dishId: 'jp-sushi' });
    expect(after).toBe(tried);
    expect(after.entries['jp-sushi']).toEqual({ tried: true, triedAt: NOW });
  });

  it('reset clears all entries', () => {
    let s = progressReducer(emptyProgress(), { type: 'toggleTried', dishId: 'jp-sushi', now: NOW });
    s = progressReducer(s, { type: 'reset' });
    expect(Object.keys(s.entries)).toHaveLength(0);
  });
});
