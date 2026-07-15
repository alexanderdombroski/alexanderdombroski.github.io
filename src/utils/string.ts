export function pluralify(text: string, amount: number) {
  return `${amount} ${text}${amount > 1 ? 's' : ''}`;
}
