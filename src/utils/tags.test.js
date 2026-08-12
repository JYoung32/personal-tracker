import { describe, it, expect } from 'vitest';
import { normalizeTags } from './tags';

describe('normalizeTags', () => {
  it('trims whitespace from each tag', () => {
    expect(normalizeTags(['  home  ', 'work '])).toEqual(['home', 'work']);
  });

  it('drops empty/whitespace-only entries', () => {
    expect(normalizeTags(['home', '  ', '', 'work'])).toEqual(['home', 'work']);
  });

  it('dedupes case-insensitively, keeping the first casing seen', () => {
    expect(normalizeTags(['Home', 'home', 'HOME'])).toEqual(['Home']);
  });

  it('preserves input order', () => {
    expect(normalizeTags(['work', 'home', 'urgent'])).toEqual(['work', 'home', 'urgent']);
  });

  it('returns an empty array for no tags', () => {
    expect(normalizeTags([])).toEqual([]);
  });
});
