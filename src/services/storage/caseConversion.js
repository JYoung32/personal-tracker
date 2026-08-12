// camelCase <-> snake_case key conversion, split out from supabaseAdapter.js
// so it can be unit tested without pulling in the real Supabase client (which
// throws at import time if env vars aren't set).
export function toSnakeCase(key) {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function toCamelCase(key) {
  return key.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}
