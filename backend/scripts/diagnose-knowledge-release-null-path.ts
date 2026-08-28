/**
 * WHY THE CUSTOMER PATH RECORDS `knowledgeReleaseId = NULL`, measured rather than asserted.
 *
 *   DATABASE_URL=postgresql://…/test_* npm run diagnose:knowledge-release-null-path
 *
 * Read-only. Prints the three INDEPENDENT reasons a shipped server records NULL provenance -- the
 * cutover mode is unset, no allowlist enables any principal, and (before activation) no release is
 * active -- each of which is sufficient on its own. Kept because "NULL because retrieval is
 * unscoped" is a claim that should be re-checkable in any environment, not a paragraph in a status
 * document.
 */
import 'dotenv/config';
import { dataSource } from '../src/database/data-source';
import { resolveCutoverMode, resolveCutoverEnablement } from '../src/standards/cutover/cutover-mode';
import { pinGovernedRelease } from '../src/standards/cutover/governed-resolution';
import { describeLiveKnowledgeRetrievalScoping, resolveKnowledgeReleaseProvenance }
  from '../src/inspection/knowledge-release-provenance';

async function main() {
  const ds = await dataSource.initialize();
  const shipped = {};                                   // a server with no cutover configuration
  const configuredShipped = resolveCutoverMode(shipped as any);
  const enabledShipped = resolveCutoverEnablement({ userId: 'u1', organizationId: 'o1' }, shipped as any);
  const modeOnly = { GOVERNED_CUTOVER_MODE: 'GOVERNED_WITH_FALLBACK' };
  const enabledModeOnly = resolveCutoverEnablement({ userId: 'u1', organizationId: 'o1' }, modeOnly as any);
  const active = await ds.query(`SELECT "releaseId" FROM regulatory_releases WHERE status='active'`);
  const pinLegacy = await pinGovernedRelease(ds, 'LEGACY');
  const pinGoverned = await pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK');
  const scoping = describeLiveKnowledgeRetrievalScoping();
  const provenance = resolveKnowledgeReleaseProvenance();
  console.log(JSON.stringify({
    reason1_modeUnset: { mode: configuredShipped.mode, reason: configuredShipped.reason },
    reason2_allowlistUnset: { effectiveMode: enabledModeOnly.effectiveMode, reason: enabledModeOnly.reason },
    shippedEnablement: { effectiveMode: enabledShipped.effectiveMode, reason: enabledShipped.reason },
    activeReleaseInThisDatabase: active?.[0]?.releaseId ?? null,
    pinUnderLegacy: pinLegacy,
    pinUnderGovernedMode: { releaseId: pinGoverned.releaseId, reason: pinGoverned.reason },
    kg1LiveScoping: scoping,
    kg1PersistedValue: provenance,
  }, null, 2));
  await ds.destroy();
}
main().catch(e => { console.error(e); process.exit(1); });
