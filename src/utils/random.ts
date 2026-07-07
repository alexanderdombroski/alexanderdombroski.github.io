/**
 * Returns a random integer between min and max, inclusive.
 * @param min - minimum integer (inclusive)
 * @param max - maximum integer (inclusive)
 */
export function randomInt(min: number, max: number): number {
  if (min > max) throw new Error('min must be <= max');
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random element from an array.
 * @param arr - array of items
 */
export function randomChoice<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error('Array cannot be empty');
  const index = randomInt(0, arr.length - 1);
  return arr[index] as T;
}

/**
 * Returns a new array with its elements shuffled in random order.
 * @param arr - array of items to shuffle
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
