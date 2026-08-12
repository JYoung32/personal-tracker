// Trims, drops empties, and dedupes case-insensitively (keeping the first
// casing seen) so near-duplicate tags like "Home" and "home" collapse into
// one — otherwise every typo/casing variant would become its own filter
// option in useTodoFilters' availableTags.
export function normalizeTags(tags) {
  const seen = new Set();
  const result = [];
  for (const raw of tags) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}
