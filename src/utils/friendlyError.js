// Postgres SQLSTATE codes Supabase/PostgREST surfaces on `error.code`.
// https://www.postgresql.org/docs/current/errcodes-appendix.html
const UNIQUE_VIOLATION = '23505';
const INSUFFICIENT_PRIVILEGE = '42501';
const FOREIGN_KEY_VIOLATION = '23503';
const NOT_NULL_VIOLATION = '23502';

/**
 * Maps a thrown error (network failure, Supabase/Postgres error, or
 * anything else) to a short message safe to show a user directly. Used
 * anywhere a storage operation can fail — see useCollection.js, which
 * calls this once so every feature gets consistent wording for free.
 */
export function getFriendlyErrorMessage(error) {
  if (!error) return 'Something went wrong. Please try again.';

  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return "Can't reach the server — check your connection and try again.";
  }

  switch (error.code) {
    case UNIQUE_VIOLATION:
      return 'That already exists — try a different value.';
    case INSUFFICIENT_PRIVILEGE:
      return "You don't have permission to do that.";
    case FOREIGN_KEY_VIOLATION:
      return "That's still linked to something else and can't be changed.";
    case NOT_NULL_VIOLATION:
      return 'A required field is missing.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
}
