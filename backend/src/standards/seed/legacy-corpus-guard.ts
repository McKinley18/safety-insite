import { buildGovernedSourceSet } from '../releases/governed-source-set';
import { releaseCitationKey } from '../releases/citation-identity';

/**
 * KG-5B -- the guard that makes KG5A-DISC-01 unreachable rather than merely documented.
 *
 * =====================================================================================
 * WHY THIS EXISTS EVEN THOUGH THE SAFE PATH NOW EXISTS
 * =====================================================================================
 *
 * KG-5B replaces governed release construction with `release -- prepare`, which never writes to
 * `standards_master`. But `seed:safescope-standards` -- the pipeline KG-5A measured destroying a
 * production-shaped corpus -- is still wired, still callable, and still NEEDED: something has to
 * populate a clean disposable database, and roughly a dozen KG verification suites depend on it
 * doing exactly what it does today.
 *
 * So the script cannot be removed, and a runbook line saying "do not run this in production" is
 * the weakest possible control over the single most damaging command in the repository. This
 * guard converts it into a refusal.
 *
 * =====================================================================================
 * THE TEST, AND WHY THIS ONE
 * =====================================================================================
 *
 * A corpus is SAFE for the seed pipeline when every row in it is a regulation the governed source
 * set already names. That is precisely the population the seed is entitled to rewrite -- rows it
 * authored, in the format it authors them.
 *
 * A corpus is REFUSED when it holds rows the governed source set does not name, because those are
 * somebody else's regulations. That is what production is: 2,390 legacy eCFR rows of which the
 * governed set names 35. Rewriting the other 2,355 rows' neighbours, renaming their citations and
 * stamping provenance across all of them is the exact damage KG-5A measured.
 *
 * Alternatives considered and rejected:
 *
 *   row-count threshold      arbitrary, and wrong in both directions: a 40-row corpus of
 *                            unrelated regulations is unsafe, and a governed corpus is safe at any
 *                            size the source set grows to.
 *   environment allowlist    the KG-4C lesson: a claim by the caller, and the caller is the thing
 *                            being guarded. It is what a copy-pasted command line carries forward.
 *   database-name pattern    `test_*` catches `safescope` and misses every disposable database
 *                            that was restored from a production dump -- which is the realistic
 *                            accident.
 *   THIS TEST                asks a question about the DATA the command is about to damage, which
 *                            is the only thing that actually determines whether damage occurs.
 *
 * DELIBERATELY NO OVERRIDE. There is no environment variable that turns this off. The safe way to
 * build a governed release against a corpus like production's is `npm run release -- prepare`,
 * which needs no corpus at all -- so an escape hatch here would exist only to re-enable the defect.
 *
 * =====================================================================================
 * THE ONE EXEMPTION, AND WHY IT IS NOT AN OVERRIDE
 * =====================================================================================
 *
 * A database that carries a KG-4C ownership marker (`kg_test_database_ownership`) is exempt.
 *
 * That marker is not a claim made on the command line -- it is written INTO the database by a
 * verification suite that claimed it, and claiming requires all of: a `test_*` name, absence from
 * `PROTECTED_DATABASE_NAMES`, and `KG_TEST_DB_INITIALIZE_OWNERSHIP` naming that database exactly.
 * Production can never carry one. So this composes the two guards rather than weakening either:
 * "this corpus is not yours" yields to "this entire database is a disposable one that a named
 * suite owns", which is a strictly stronger statement about the same question.
 *
 * The exemption exists because it is needed and legitimate. `test:governed-corpus-matrix` installs
 * a deliberate fixture row (`99 CFR 9999.1(a)`, a citation outside any real CFR numbering) to
 * prove that placeholder provenance never confers backing, and then finalizes -- an owned
 * database, an owned fixture, and a contract worth keeping. Refusing that would be the guard
 * disabling a test that protects a different invariant, which is how guards get deleted.
 */

export class LegacyCorpusGuardRefused extends Error {
  constructor(
    readonly totalRows: number,
    readonly foreignRows: number,
    readonly examples: string[],
  ) {
    super(
      `REFUSED BEFORE MUTATION: standards_master holds ${totalRows} rows, of which ${foreignRows} ` +
      'are regulations the governed source set does not name. This command rewrites, renames and ' +
      're-stamps rows it matches, which on a corpus like this one rewrites live customer-facing ' +
      'regulatory text and can collide with the (agency_code, citation) unique index ' +
      '(KG5A-DISC-01).\n' +
      `Examples: ${examples.join(', ')}\n` +
      'To build a governed release against a corpus like this, use:\n' +
      '  npm run release -- prepare --release-id <id>\n' +
      'which constructs the release from version-controlled governed sources and writes nothing ' +
      'to standards_master.',
    );
    this.name = 'LegacyCorpusGuardRefused';
  }
}

export interface CorpusRow { citation: string }

/**
 * Classifies a corpus. Pure, so it can be asserted directly in verification without a database.
 */
export function classifyCorpus(rows: CorpusRow[]): {
  totalRows: number; governedRows: number; foreignRows: number; examples: string[];
} {
  const governedKeys = buildGovernedSourceSet().byCitationKey;
  const foreign = rows.filter(row => !governedKeys.has(releaseCitationKey(row.citation)));
  return {
    totalRows: rows.length,
    governedRows: rows.length - foreign.length,
    foreignRows: foreign.length,
    examples: foreign.slice(0, 5).map(row => row.citation),
  };
}

/**
 * Refuses before the first mutation if the corpus is not one this pipeline authored.
 *
 * An EMPTY corpus passes: there is nothing to damage, and that is the normal case for the
 * disposable databases every KG verification suite builds.
 */
export async function assertSeedableCorpus(
  query: (sql: string) => Promise<Array<Record<string, any>>>,
): Promise<{ totalRows: number; governedRows: number; foreignRows: number; ownedDisposable: boolean }> {
  // The KG-4C marker, probed read-only. Its presence means a named verification suite has claimed
  // this entire database as disposable, which production can never do.
  let ownedDisposable = false;
  try {
    const marker = await query(
      "SELECT 1 AS present FROM information_schema.tables WHERE table_name = 'kg_test_database_ownership'");
    ownedDisposable = marker.length > 0;
  } catch {
    ownedDisposable = false;
  }

  let rows: Array<Record<string, any>>;
  try {
    rows = await query('SELECT citation FROM standards_master');
  } catch {
    // No corpus table yet -- a brand new database. Nothing to protect.
    return { totalRows: 0, governedRows: 0, foreignRows: 0, ownedDisposable };
  }
  const classification = classifyCorpus(rows as CorpusRow[]);
  if (classification.foreignRows > 0 && !ownedDisposable) {
    throw new LegacyCorpusGuardRefused(
      classification.totalRows, classification.foreignRows, classification.examples,
    );
  }
  return { ...classification, ownedDisposable };
}
