// Protected gate for RELEASE IDENTITY IMMUTABILITY.
//
// THE DEFECT THIS ANSWERS.
//
// `finalize-regulatory-release.ts` already refuses to re-finalize a release id whose stored
// manifest differs — but only WITHIN ONE DATABASE, because the check reads
// `regulatory_releases.manifestChecksum` from the database it is connected to. In a fresh
// database `priorRecordCount` is 0, the guard does not engage, and the script mints the
// hard-coded default release id over whatever the table happens to hold.
//
// That is how `federal-core-2026-07-30.1` came to name three materially different artifacts
// across three disposable databases in the 2026-08-28 source-acquisition phase: 35 records
// (manifest `14a34fea…`), then 64 (`156a6c87…`), then 72 (`702339e5…`). No guard was bypassed and
// nothing was rewritten; the release identifier simply was not bound to a manifest anywhere that
// survives a database.
//
// The binding that does survive a database already exists: a version-controlled release
// definition in `standards/releases/definitions/`, whose `expectedManifestChecksum` the
// architecture defines as "a VERIFICATION, never an input — the builder REFUSES if a pin
// disagrees". This gate holds the finalizer to that same pin.
//
// THE INVARIANT: a release identifier refers to exactly one immutable manifest identity, in every
// environment, forever.
//
//   npm run test:release-identity-immutability

import { listReleaseDefinitions, loadReleaseDefinition } from '../releases/release-definition';
import { assertManifestMatchesDefinition, ReleaseIdentityRefused } from '../releases/release-identity';

/** Citation keys the 2026-08-28 reviewer ledger disposed REJECT_CORRECTION_REQUIRED. */
const REJECTED_CITATION_KEYS = [
  '30cfr57.14107(a)', '30cfr56.14105', '29cfr1910.219',
  '29cfr1910.132(a)', '29cfr1926.95(a)', '30cfr56.15006',
  '29cfr1926.602(a)(9)(ii)', '30cfr56.9100(a)',
].map(key => key);

interface Check { name: string; run: () => void }

const checks: Check[] = [
  {
    name: 'every version-controlled release definition pins a manifest checksum',
    run: () => {
      const definitions = listReleaseDefinitions();
      if (!definitions.length) throw new Error('no release definitions found');
      for (const definition of definitions) {
        if (!definition.expectedManifestChecksum) {
          throw new Error(`${definition.releaseId} does not pin expectedManifestChecksum, so its identity is not bound to any content`);
        }
      }
    },
  },
  {
    name: 'a matching manifest is accepted for its own release id',
    run: () => {
      const definition = loadReleaseDefinition('federal-core-2026-07-30.1');
      assertManifestMatchesDefinition(definition.releaseId, definition.expectedManifestChecksum!);
    },
  },
  {
    name: 'a DIFFERENT manifest under an EXISTING release id is refused',
    run: () => {
      const definition = loadReleaseDefinition('federal-core-2026-07-30.1');
      const different = 'f'.repeat(64);
      let refused = false;
      try {
        assertManifestMatchesDefinition(definition.releaseId, different);
      } catch (error) {
        refused = error instanceof ReleaseIdentityRefused;
        if (!refused) throw error;
      }
      if (!refused) {
        throw new Error(`finalizing manifest ${different} under ${definition.releaseId} was NOT refused`);
      }
    },
  },
  {
    name: 'the 35-record release identity still names the 35-record manifest',
    run: () => {
      const definition = loadReleaseDefinition('federal-core-2026-07-30.1');
      if (definition.expectedManifestChecksum !== '14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b') {
        throw new Error('the historical release identity was rewritten; historical artifacts must stay immutable');
      }
      if (definition.members.length !== 35) {
        throw new Error(`the historical release membership changed: ${definition.members.length} members, expected 35`);
      }
    },
  },
  {
    name: 'a release id with no version-controlled definition is refused rather than silently minted',
    run: () => {
      let refused = false;
      try {
        assertManifestMatchesDefinition('federal-core-9999-01-01.1', 'a'.repeat(64));
      } catch (error) {
        refused = error instanceof ReleaseIdentityRefused;
        if (!refused) throw error;
      }
      if (!refused) throw new Error('an unregistered release id was accepted');
    },
  },
  {
    // The KG-4C composition, gated so the exemption cannot quietly widen.
    name: 'an UNREGISTERED id is permitted in a KG-owned disposable database (governance fixtures)',
    run: () => {
      assertManifestMatchesDefinition('kg3a-release.A', 'a'.repeat(64), { ownedDisposable: true });
    },
  },
  {
    name: 'a REGISTERED id with a different manifest stays refused EVEN in an owned disposable database',
    run: () => {
      let refused = false;
      try {
        assertManifestMatchesDefinition('federal-core-2026-07-30.1', 'f'.repeat(64), { ownedDisposable: true });
      } catch (error) {
        refused = error instanceof ReleaseIdentityRefused;
        if (!refused) throw error;
      }
      if (!refused) {
        throw new Error('database ownership was allowed to excuse re-pointing a registered release identity');
      }
    },
  },
  {
    // Written before the review ran, when the expectation was "the expanded corpus gets its own
    // identity" at 72 records. The review then disposed 8 records REJECT_CORRECTION_REQUIRED, so
    // the reviewed release is the APPROVED SUBSET — 64 members — and the 8 stay in the source set
    // (which is what keeps the historical 35-record release reproducible) without being members
    // here. The assertion is corrected to what the review decided, not relaxed: it still requires
    // a distinct identity pinning a distinct manifest, and now also requires that the reviewed
    // release exclude every rejected record.
    name: 'the reviewed corpus has its OWN release identity, distinct from the 35-record one',
    run: () => {
      const historical = loadReleaseDefinition('federal-core-2026-07-30.1');
      const reviewed = listReleaseDefinitions().find(d => d.releaseId !== historical.releaseId);
      if (!reviewed) throw new Error('no release definition describes the reviewed governed corpus');
      if (reviewed.expectedManifestChecksum === historical.expectedManifestChecksum) {
        throw new Error('two release identities pin the same manifest');
      }
      if (reviewed.members.length !== 64) {
        throw new Error(`the reviewed release holds ${reviewed.members.length} members, expected the 64 approved records`);
      }
      for (const rejected of REJECTED_CITATION_KEYS) {
        if (reviewed.members.some(m => m.citationKey === rejected)) {
          throw new Error(`the reviewed release includes ${rejected}, which the reviewer ledger rejected`);
        }
      }
    },
  },
];

function main(): void {
  const failures: string[] = [];
  for (const check of checks) {
    try {
      check.run();
      console.log(`  [PASS] ${check.name}`);
    } catch (error: any) {
      console.log(`  [FAIL] ${check.name}\n         ${error?.message || error}`);
      failures.push(`${check.name}: ${error?.message || error}`);
    }
  }
  console.log('');
  if (failures.length) {
    for (const failure of failures) console.error(`FAIL ${failure}`);
    console.error(`\n${failures.length} failure(s) across ${checks.length} checks`);
    process.exit(1);
  }
  console.log(`PASS release identity immutability (${checks.length} checks)`);
}

main();
