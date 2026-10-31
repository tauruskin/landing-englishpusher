// "Interim copy makes no promises" (AC-10): nothing may state a price, that the trial lesson is
// free, its length, or a learning result. findPromises returns the banned phrases it finds, so a
// check over the built page can name what to rewrite. The list follows spec.md §5 AC-10.
const BANNED: { label: string; pattern: RegExp }[] = [
  { label: "free", pattern: /\bfree\b/i },
  { label: "price", pattern: /\bprices?\b|\bcosts?\b|\bdiscount/i },
  { label: "currency", pattern: /[₴$€£]|грн|\b(?:uah|usd|eur|hryvnias?)\b/i }, // \b does not work next to Cyrillic
  { label: "lesson length", pattern: /\b\d+\s*-?\s*(?:min|mins|minutes?|hours?|hrs?)\b|\b(?:one|half)[- ]hour\b/i },
  {
    label: "learning result",
    pattern: /\bconfidently\b|\bconfident\b|\bfluent(?:ly)?\b|\bfast\b|\bquickly\b|\bimprove\b|\bguarantee/i,
  },
  { label: "results claim", pattern: /\bresults?\b/i },
];

export function findPromises(text: string): string[] {
  const found: string[] = [];
  for (const { label, pattern } of BANNED) {
    const match = text.match(pattern);
    if (match) found.push(`${label}: "${match[0]}"`);
  }
  return found;
}
