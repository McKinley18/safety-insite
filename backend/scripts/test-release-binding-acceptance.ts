// RELEASE-SCOPED RETRIEVAL / INSPECTION RELEASE-BINDING ACCEPTANCE — 2026-08-28.
//
//   npm run test:release-binding-acceptance
//
// WRITTEN BEFORE THE IMPLEMENTATION IT DESCRIBES. The five scenarios below are the contract for
// release-scoped governed retrieval, and the reason they are a test rather than a design note is
// that Scenario 2 was already broken and nothing said so: `pinGovernedRelease()` read the ACTIVE
// pointer on every analysis, so re-analysing an inspection that had been governed by R1 would have
// silently re-governed it under R2 the moment R2 became active. A design note cannot fail.
//
// THE LIFECYCLE THIS ASSERTS, in one line:
//
//     new inspection -> resolve the governing release -> BIND the inspection to it ->
//     retrieval is scoped to the BOUND release -> findings inherit authority from that release.
//
// and its converse, which is the load-bearing half:
//
//     an inspection that already carries a release keeps it. The active pointer moves; the
//     inspection does not.
//
// EVERY SCENARIO CARRIES ITS OWN POSITIVE CONTROL, so the suite cannot pass by governed resolution
// being globally inert — which is exactly how it would have passed before the candidate release was
// activated.

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { dataSource } from '../src/database/data-source';
import {
  resolveInspectionReleaseBinding,
} from '../src/standards/releases/inspection-release-binding';
import { pinGovernedRelease, resolveGoverned } from '../src/standards/cutover/governed-resolution';
import { resolveFindingStandardAuthority } from '../src/standards/releases/finding-standards-authority';
import { annotateFindingStandardsAuthority } from '../src/inspection/finding-standards-authority-annotation';
import { runOwnedMutatingSuite } from './lib/test-database-ownership';

const CANDIDATE = 'federal-core-2026-08-28.1';
const HISTORICAL = 'federal-core-2026-07-30.1';

/** An approved member of the candidate release. */
const APPROVED = '29 CFR 1910.147';
/** One of the 8 records the reviewer ledger disposed REJECT_CORRECTION_REQUIRED. */
const REJECTED = '1910.219';

function recorder() {
  const state = { failures: [] as string[], count: 0 };
  return {
    get failures() { return state.failures; },
    get count() { return state.count; },
    check(ok: boolean, name: string, detail = '') {
      state.count += 1;
      console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
      if (!ok) state.failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    },
  };
}

/** A disposable inspection row. No FK depends on it, so no user or site fixture is needed. */
async function createInspection(
  ds: DataSource, boundReleaseId: string | null,
): Promise<string> {
  const id = randomUUID();
  await ds.query(
    `INSERT INTO inspection (id, "organizationId", "ownerUserId", "createdByUserId", "siteId",
                             title, status, "regulatoryContext", "knowledgeReleaseId")
     VALUES ($1, NULL, $2, $2, $3, 'release-binding acceptance fixture', 'draft',
             'osha_general_industry', $4)`,
    [id, randomUUID(), randomUUID(), boundReleaseId],
  );
  return id;
}

async function boundReleaseOf(ds: DataSource, inspectionId: string): Promise<string | null> {
  const rows = await ds.query(
    `SELECT "knowledgeReleaseId" FROM inspection WHERE id = $1`, [inspectionId],
  );
  return rows?.[0]?.knowledgeReleaseId ?? null;
}

async function setActiveRelease(ds: DataSource, releaseId: string | null) {
  await ds.query(`UPDATE regulatory_releases SET status = 'superseded' WHERE status = 'active'`);
  if (releaseId) {
    await ds.query(
      `UPDATE regulatory_releases SET status = 'active', "activatedAt" = now() WHERE "releaseId" = $1`,
      [releaseId],
    );
  }
}

async function main() {
  await runOwnedMutatingSuite({
    suite: 'release-binding-acceptance',
    body: async () => {
      const ds: DataSource = await dataSource.initialize();
      const r = recorder();
      const evidence: Record<string, unknown> = {};

      try {
        // ============================================================ SCENARIO 1 — NEW INSPECTION
        console.log('\n-- SCENARIO 1: a new inspection acquires the active release --');
        await setActiveRelease(ds, CANDIDATE);
        const fresh = await createInspection(ds, null);

        const binding1 = await resolveInspectionReleaseBinding({
          dataSource: ds, inspectionId: fresh, mode: 'GOVERNED_WITH_FALLBACK',
        });
        r.check(binding1.releaseId === CANDIDATE && binding1.reason === 'BOUND_TO_ACTIVE_RELEASE'
          && binding1.newlyBound === true,
          'an unbound inspection resolves the ACTIVE release and binds to it',
          `${binding1.releaseId} / ${binding1.reason} / newlyBound=${binding1.newlyBound}`);
        r.check(await boundReleaseOf(ds, fresh) === CANDIDATE,
          'the binding is PERSISTED on the inspection, not recomputed per analysis');

        const pin1 = await pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK', binding1.releaseId);
        r.check(pin1.releaseId === CANDIDATE && pin1.reason === 'PINNED_BOUND_RELEASE',
          'retrieval pins the BOUND release, not the pointer it re-reads',
          `${pin1.releaseId} / ${pin1.reason}`);
        r.check(Boolean(pin1.manifestChecksum),
          'the pin carries the bound release manifest identity', String(pin1.manifestChecksum));

        const resolved1 = await resolveGoverned(ds, pin1, APPROVED);
        r.check(resolved1.releaseId === CANDIDATE && resolved1.backing === 'APPROVED_EXACT'
          && resolved1.resolvedCitation === APPROVED,
          'governed retrieval is SCOPED to the bound release and resolves the approved member',
          `${resolved1.backing} under ${resolved1.releaseId}`);

        const authority1 = await resolveFindingStandardAuthority(ds, {
          citation: APPROVED, releaseId: binding1.releaseId,
        });
        r.check(authority1.state === 'APPROVED_GOVERNED_CONTENT' && authority1.corpusBacked === true
          && Boolean(authority1.recordChecksum) && Boolean(authority1.reviewerId),
          'the persisted finding records approved governed authority under the bound release',
          authority1.state);
        evidence.scenario1 = { binding: binding1, pin: pin1.reason, backing: resolved1.backing,
          authority: authority1.state };

        // ================================================= SCENARIO 2 — EXISTING INSPECTION
        console.log('\n-- SCENARIO 2: an inspection already bound to R1, with R2 now active --');
        const legacyBound = await createInspection(ds, HISTORICAL);
        await setActiveRelease(ds, CANDIDATE);

        const binding2 = await resolveInspectionReleaseBinding({
          dataSource: ds, inspectionId: legacyBound, mode: 'GOVERNED_WITH_FALLBACK',
        });
        r.check(binding2.releaseId === HISTORICAL && binding2.reason === 'BOUND_RELEASE_REUSED'
          && binding2.newlyBound === false,
          'an inspection bound to R1 keeps R1 even though R2 is the active release',
          `${binding2.releaseId} / ${binding2.reason}`);
        r.check(await boundReleaseOf(ds, legacyBound) === HISTORICAL,
          'the stored binding was NOT rewritten to the newly active release');

        const pin2 = await pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK', binding2.releaseId);
        r.check(pin2.releaseId === HISTORICAL,
          're-analysis pins R1, so retrieval reproduces what the inspection was governed by',
          String(pin2.releaseId));
        const resolved2 = await resolveGoverned(ds, pin2, REJECTED);
        r.check(resolved2.releaseId === HISTORICAL,
          'every governed lookup in that re-analysis is scoped to R1', String(resolved2.releaseId));
        // The same citation is an UNAPPROVED member of R1 and REJECTED under R2. If the pointer
        // had silently replaced the binding, this would read REJECTED instead.
        const authority2 = await resolveFindingStandardAuthority(ds, {
          citation: REJECTED, releaseId: binding2.releaseId,
        });
        r.check(authority2.state === 'UNAPPROVED_GOVERNED_CONTENT' && authority2.releaseMember === true,
          'a citation reads with R1 semantics, proving the release did not silently switch',
          authority2.state);
        const authorityUnderR2 = await resolveFindingStandardAuthority(ds, {
          citation: REJECTED, releaseId: CANDIDATE,
        });
        r.check(authorityUnderR2.state === 'REJECTED_GOVERNED_CONTENT',
          'positive control: the SAME citation is REJECTED under R2, so the two releases differ',
          authorityUnderR2.state);
        evidence.scenario2 = { binding: binding2, underBound: authority2.state,
          underActive: authorityUnderR2.state };

        // ============================================= SCENARIO 3 — NO ACTIVE GOVERNED RELEASE
        console.log('\n-- SCENARIO 3: no release can legitimately govern the analysis --');
        await setActiveRelease(ds, null);
        const unbound = await createInspection(ds, null);
        const binding3 = await resolveInspectionReleaseBinding({
          dataSource: ds, inspectionId: unbound, mode: 'GOVERNED_WITH_FALLBACK',
        });
        r.check(binding3.releaseId === null && binding3.reason === 'NO_ACTIVE_RELEASE'
          && binding3.newlyBound === false,
          'with no active release, no release id is invented', JSON.stringify(binding3));
        r.check(await boundReleaseOf(ds, unbound) === null,
          'and nothing is written to the inspection');
        const pin3 = await pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK', binding3.releaseId);
        r.check(pin3.releaseId === null && pin3.reason === 'NO_ACTIVE_RELEASE',
          'the pin reports the absence honestly rather than falling back to a release',
          pin3.reason);
        const hazard3 = {
          standardCandidates: [{ citation: APPROVED, family: 'evaluated', status: 'SUPPORTED' }],
        } as Record<string, unknown>;
        await annotateFindingStandardsAuthority(ds.manager, hazard3, binding3.releaseId);
        const candidate3 = (hazard3 as any).standardCandidates[0];
        r.check(candidate3.authorityState === 'LEGACY_CODE_RESIDENT_CONTENT'
          && candidate3.corpusBacked === false && candidate3.governedReleaseId === null,
          'the finding keeps its hazard and its citation, labelled honestly as non-governed',
          candidate3.authorityState);
        evidence.scenario3 = { binding: binding3, authority: candidate3.authorityState };

        // LEGACY and SHADOW must not consult or create a binding at all.
        await setActiveRelease(ds, CANDIDATE);
        const inertInspection = await createInspection(ds, null);
        for (const mode of ['LEGACY', 'SHADOW'] as const) {
          const inert = await resolveInspectionReleaseBinding({
            dataSource: ds, inspectionId: inertInspection, mode,
          });
          r.check(inert.releaseId === null && inert.reason === 'GOVERNED_MODE_INACTIVE',
            `${mode} resolves no binding`, `${inert.releaseId} / ${inert.reason}`);
        }
        r.check(await boundReleaseOf(ds, inertInspection) === null,
          'and neither mode wrote a binding onto the inspection — LEGACY stays a structural no-op');

        // ================================================== SCENARIO 4 — REJECTED RECORD
        console.log('\n-- SCENARIO 4: a rejected record under an ACTIVE release --');
        const rejectedInspection = await createInspection(ds, null);
        const binding4 = await resolveInspectionReleaseBinding({
          dataSource: ds, inspectionId: rejectedInspection, mode: 'GOVERNED_WITH_FALLBACK',
        });
        const pin4 = await pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK', binding4.releaseId);
        const resolved4 = await resolveGoverned(ds, pin4, REJECTED);
        r.check(resolved4.backing !== 'APPROVED_EXACT',
          'release-scoped retrieval does not resolve a rejected citation as approved',
          resolved4.backing);
        const authority4 = await resolveFindingStandardAuthority(ds, {
          citation: REJECTED, releaseId: binding4.releaseId,
        });
        r.check(authority4.state === 'REJECTED_GOVERNED_CONTENT' && authority4.releaseMember === false
          && authority4.reviewerId === null && authority4.recordChecksum === null,
          'the rejected record stays non-approved under the active, bound release',
          authority4.state);
        evidence.scenario4 = { backing: resolved4.backing, authority: authority4.state };

        // ==================================== SCENARIO 5 — MATCHING CITATION, DIFFERENT EVIDENCE
        console.log('\n-- SCENARIO 5: a code rule emitting an approved citation --');
        // A code-resident rule fires with the SAME string an approved governed member carries, but
        // governed retrieval never resolved that member for this candidate. Nothing may be
        // inherited from the reviewer.
        const hazard5 = {
          standardCandidates: [{ citation: APPROVED, family: 'evaluated', status: 'SUPPORTED' }],
        } as Record<string, unknown>;
        await annotateFindingStandardsAuthority(ds.manager, hazard5, null);
        const candidate5 = (hazard5 as any).standardCandidates[0];
        r.check(candidate5.authorityState === 'LEGACY_CODE_RESIDENT_CONTENT'
          && candidate5.reviewerId === null && candidate5.governedRecordChecksum === null
          && candidate5.corpusBacked === false,
          'citation-string equality confers nothing while that citation IS approved and active',
          candidate5.authorityState);
        const skipped = await resolveFindingStandardAuthority(ds, {
          citation: APPROVED, releaseId: CANDIDATE, skipGovernedResolution: true,
        });
        r.check(skipped.state === 'LEGACY_CODE_RESIDENT_CONTENT' && skipped.reviewerId === null,
          'naming the bound release without resolving the member confers nothing either',
          skipped.state);
        // Positive control in the same block.
        const genuine = await resolveFindingStandardAuthority(ds, {
          citation: APPROVED, releaseId: CANDIDATE,
        });
        r.check(genuine.state === 'APPROVED_GOVERNED_CONTENT' && Boolean(genuine.reviewerId),
          'positive control: genuinely resolving the member DOES confer approval', genuine.state);
        evidence.scenario5 = { launderedByString: candidate5.authorityState,
          launderedBySkip: skipped.state, genuine: genuine.state };

        // ============================================ pointer independence, stated as a property
        console.log('\n-- pointer independence --');
        const boundToCandidate = await createInspection(ds, CANDIDATE);
        await setActiveRelease(ds, HISTORICAL);
        const binding6 = await resolveInspectionReleaseBinding({
          dataSource: ds, inspectionId: boundToCandidate, mode: 'GOVERNED_WITH_FALLBACK',
        });
        r.check(binding6.releaseId === CANDIDATE,
          'moving the active pointer to a DIFFERENT release does not move an existing binding',
          String(binding6.releaseId));
        await setActiveRelease(ds, CANDIDATE);
      } finally {
        await ds.destroy().catch(() => undefined);
      }

      console.log('');
      console.log(`RELEASE BINDING ACCEPTANCE: ${r.count - r.failures.length}/${r.count} checks passed`);
      if (process.env.BINDING_EVIDENCE_OUT) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('fs').writeFileSync(
          process.env.BINDING_EVIDENCE_OUT,
          JSON.stringify({ checks: r.count, failures: r.failures, evidence }, null, 2),
        );
      }
      if (r.failures.length) {
        console.error('\nFAILURES:');
        for (const failure of r.failures) console.error(`  - ${failure}`);
        process.exit(1);
      }
    },
  });
}

main().catch(error => { console.error(error); process.exit(1); });
