import { describe, expect, it } from 'vitest';
import { topNWithOther } from '../src/lib/deriveStats';
import type { CountBucket } from '../src/lib/deriveStats';

const b = (key: string, count: number): CountBucket => ({ key, count });

describe('topNWithOther', () => {
  it('returns the list unchanged when there are fewer than n items', () => {
    const input = [b('curry', 5), b('soup', 3)];
    expect(topNWithOther(input, 10)).toEqual(input);
  });

  it('returns the list unchanged when there are exactly n items', () => {
    const input = [b('curry', 5), b('soup', 3)];
    expect(topNWithOther(input, 2)).toEqual(input);
  });

  it('keeps the top n in order and sums the remainder into a single "other" bucket', () => {
    const input = [b('curry', 10), b('soup', 8), b('rice', 5), b('taco', 2), b('pie', 1)];
    expect(topNWithOther(input, 3)).toEqual([
      b('curry', 10),
      b('soup', 8),
      b('rice', 5),
      { key: 'other', count: 3 },
    ]);
  });

  it('omits the "other" bucket when the remainder sums to zero', () => {
    const input = [b('curry', 10), b('soup', 8), b('rice', 0), b('taco', 0)];
    expect(topNWithOther(input, 2)).toEqual([b('curry', 10), b('soup', 8)]);
  });

  it('does not mutate the input array', () => {
    const input = [b('a', 3), b('b', 2), b('c', 1)];
    const copy = input.map((x) => ({ ...x }));
    topNWithOther(input, 1);
    expect(input).toEqual(copy);
  });

  it('passes through when n <= 0', () => {
    const input = [b('a', 3), b('b', 2)];
    expect(topNWithOther(input, 0)).toEqual(input);
  });
});
