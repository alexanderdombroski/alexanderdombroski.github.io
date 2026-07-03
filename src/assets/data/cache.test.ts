import { describe, it, expect } from 'vitest';
import cache from './cache.json';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

describe('cache.json freshness', () => {
  const entries = Object.entries(cache);

  it('should have at least one cached entry', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)(
    '%s should be no more than a week old',
    (_key, timestamp) => {
      const cachedAt = new Date(timestamp).getTime();
      const age = Date.now() - cachedAt;

      expect(cachedAt).not.toBeNaN(); // valid ISO timestamp
      expect(age).toBeLessThanOrEqual(ONE_WEEK_MS);
    },
  );
});
