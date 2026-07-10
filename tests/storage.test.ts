import { beforeEach, describe, expect, it } from 'vitest';
import {
  isWelcomed,
  loadProgress,
  saveProgress,
  setWelcomed,
  PROGRESS_VERSION,
} from '../src/state/storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('tracks the first-run welcome flag', () => {
    expect(isWelcomed()).toBe(false);
    setWelcomed();
    expect(isWelcomed()).toBe(true);
    expect(localStorage.getItem('world-dishes:welcomed')).toBe('1');
  });

  it('returns empty progress for an unknown user', () => {
    expect(loadProgress('nobody')).toEqual({ version: PROGRESS_VERSION, entries: {} });
  });

  it('round-trips saved progress', () => {
    const progress = { version: PROGRESS_VERSION, entries: { 'jp-sushi': { tried: true } } };
    saveProgress('u1', progress);
    expect(loadProgress('u1')).toEqual(progress);
  });

  it('recovers from corrupt JSON', () => {
    localStorage.setItem('world-dishes:progress:u2', '{not json');
    expect(loadProgress('u2').entries).toEqual({});
  });

  it('recovers from a valid-JSON-but-wrong-shape blob', () => {
    localStorage.setItem('world-dishes:progress:u3', JSON.stringify({ version: 1 }));
    expect(loadProgress('u3').entries).toEqual({});
  });
});
