/**
 * True for a PostgreSQL unique-constraint violation (SQLSTATE 23505).
 *
 * Used by the offline-sync idempotency paths. A check-then-insert is not a lock: two concurrent
 * replays of the same client identifier can both miss the check and both insert, and the partial
 * unique index rejects the loser. For an idempotent create that rejection is the CORRECT outcome,
 * not an error — the database is the authority that one identifier means one row, so the loser
 * re-reads and returns what won.
 *
 * TypeORM surfaces the driver error as `QueryFailedError` with the pg error's `code` copied onto
 * it, but the shape differs between driver versions, so both the wrapper's own `code` and a
 * nested `driverError.code` are checked rather than assuming one.
 */
export function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: unknown; driverError?: { code?: unknown } };
  return candidate.code === '23505' || candidate.driverError?.code === '23505';
}
