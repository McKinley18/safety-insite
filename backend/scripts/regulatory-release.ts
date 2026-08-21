import 'dotenv/config';
import { dataSource } from '../src/database/data-source';
import {
  ReleaseConstructionRefused,
  prepareGovernedRelease,
} from '../src/standards/releases/governed-release-builder';
import {
  ReleaseDefinitionInvalid,
  listReleaseDefinitions,
  loadReleaseDefinition,
} from '../src/standards/releases/release-definition';
import {
  ReleaseActivationRefused,
  ReleasePointerConflict,
  RegulatoryReleaseLifecycleService,
} from '../src/standards/releases/regulatory-release-lifecycle.service';
import { listGovernedSourceCitations } from '../src/standards/releases/governed-source-set';

/**
 * KG-5B -- THE REGULATORY RELEASE OPERATOR COMMAND (KG5A-DISC-03).
 *
 * =====================================================================================
 * THE DEFECT THIS ANSWERS
 * =====================================================================================
 *
 * `activate()` and `rollbackTo()` existed only as service methods. KG-5A drove them from an
 * ad-hoc rehearsal script it wrote for the occasion. A production activation therefore had no
 * reviewed command: the operator would have had to write, or paste, a Node snippet against the
 * production database -- and the one thing an ad-hoc snippet cannot be is reviewed in advance.
 *
 * =====================================================================================
 * THE SAFETY MODEL: STATE WHAT YOU BELIEVE, AND BE REFUSED IF YOU ARE WRONG
 * =====================================================================================
 *
 * Every mutating subcommand requires the operator to name the state they believe they are acting
 * on, and refuses if reality disagrees:
 *
 *   activate   --release-id             the EXACT release. No prefix, no fuzzy match, no "latest".
 *              --expected-manifest      the manifest the operator reviewed.
 *              --expected-current       the active pointer they believe they are replacing,
 *                                       or the literal `none`.
 *              --actor                  a named human.
 *
 *   rollback   --release-id             the EXACT release to return to.
 *              --expected-current       the active release they believe they are rolling off.
 *              --actor
 *
 * `--expected-current` is what makes a stale operator safe. Two people acting on a status output
 * from ten minutes ago cannot both succeed: the second one's belief about the pointer is no
 * longer true, and the command refuses instead of silently winning.
 *
 * WHAT IS DELIBERATELY ABSENT. There is no `activate --latest`, no prefix matching, no fuzzy
 * lookup, no "create it if it does not exist", and no `publish` that runs prepare, approve,
 * finalize and activate together. Each of those is a convenience whose entire value is skipping a
 * step someone is supposed to perform, and the steps here are: PREPARE -> REVIEW -> APPROVE ->
 * FINALIZE -> ACTIVATE. Approval is not even in this command -- it lives in
 * `review:release-record`, one record at a time, by a named reviewer, against an exact checksum.
 *
 * DRY RUN. `--dry-run` is available on `prepare`, `activate` and `rollback`. It performs ZERO
 * writes: the preview runs inside a transaction that is always rolled back, and it emits no
 * lifecycle event -- an audit log that records rehearsals as though they were pointer moves is
 * worse than no audit log.
 *
 * Usage:
 *   npm run release -- status [--release-id <id>]
 *   npm run release -- sources
 *   npm run release -- prepare  --release-id <id> [--dry-run]
 *   npm run release -- activate --release-id <id> --expected-manifest <sha256>
 *                               --expected-current <id|none> --actor <name> [--reason <text>] [--dry-run]
 *   npm run release -- rollback --release-id <id> --expected-current <id>
 *                               --actor <name> [--reason <text>] [--dry-run]
 */

const EXIT_REFUSED = 2;

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  // `--expected-manifest --actor bob` would otherwise silently take "--actor" as the manifest.
  if (value === undefined || value.startsWith('--')) return undefined;
  return value;
}

function required(name: string): string {
  const value = arg(name);
  if (!value) {
    throw new UsageError(`--${name} is required and must be given an explicit value.`);
  }
  return value;
}

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

class UsageError extends Error {
  constructor(message: string) { super(message); this.name = 'UsageError'; }
}

function print(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

/**
 * Resolves `--expected-current` to a pointer belief.
 *
 * `none` is spelled explicitly rather than inferred from an absent flag: "I believe nothing is
 * active" and "I did not think about what is active" are different statements, and only the first
 * one may authorize a pointer move.
 */
function expectedCurrent(name = 'expected-current'): string | null {
  const value = required(name);
  return value.toLowerCase() === 'none' ? null : value;
}

function comparePointer(expected: string | null, actual: string | null) {
  return {
    expectedCurrentRelease: expected,
    actualCurrentRelease: actual,
    matches: expected === actual,
  };
}

async function main() {
  const command = process.argv[2];
  if (!command || command.startsWith('--')) {
    throw new UsageError('A subcommand is required (status|sources|prepare|activate|rollback).');
  }

  await dataSource.initialize();
  const lifecycle = new RegulatoryReleaseLifecycleService(dataSource);

  try {
    switch (command) {
      // ---------------------------------------------------------------- status
      case 'status': {
        const active = await lifecycle.getActiveRelease();
        const releaseId = arg('release-id');
        const rows = await dataSource.query(
          `SELECT "releaseId", "releaseVersion", status, "manifestChecksum", "recordCount",
                  "parentReleaseId", "activatedAt", "deactivatedAt", "createdAt"
           FROM regulatory_releases ${releaseId ? 'WHERE "releaseId" = $1' : ''}
           ORDER BY "createdAt"`,
          releaseId ? [releaseId] : [],
        );

        const detail = [] as unknown[];
        for (const row of rows) {
          const scope = await lifecycle.describeReleaseScope(row.releaseId);
          const integrity = await lifecycle.verifyIntegrity(row.releaseId);
          detail.push({
            ...row,
            approvedRecords: scope.governedRecords,
            totalRecords: scope.totalRecords,
            mechanicallyValidatedRecords: scope.mechanicallyValidatedRecords,
            unreviewedRecords: scope.unreviewedRecords,
            manifestVerifies: integrity.matches,
          });
        }

        print({
          activeRelease: active?.releaseId ?? null,
          activeManifest: active?.manifestChecksum ?? null,
          releasesInDatabase: detail,
          definitionsInRepository: listReleaseDefinitions().map(definition => ({
            releaseId: definition.releaseId,
            releaseVersion: definition.releaseVersion,
            declaredMembers: definition.members.length,
            pinnedManifest: definition.expectedManifestChecksum ?? null,
          })),
        });
        break;
      }

      // ---------------------------------------------------------------- sources
      case 'sources': {
        const citations = listGovernedSourceCitations();
        print({
          governedSourceRecords: citations.length,
          note: 'The authoritative governed candidate set, derived from version-controlled source '
            + 'artifacts with zero database access. Presence here does NOT put a record in a '
            + 'release; only a release definition does.',
          citations,
        });
        break;
      }

      // ---------------------------------------------------------------- prepare
      case 'prepare': {
        const definition = loadReleaseDefinition(required('release-id'));
        const dryRun = flag('dry-run');
        const result = await prepareGovernedRelease(dataSource, definition, { dryRun });
        print({
          command: 'prepare',
          dryRun,
          releaseId: result.releaseId,
          outcome: result.outcome,
          status: result.status,
          recordCount: result.recordCount,
          manifestChecksum: result.manifestChecksum,
          pinnedManifest: definition.expectedManifestChecksum ?? null,
          reproducedPinnedManifest: definition.expectedManifestChecksum
            ? definition.expectedManifestChecksum === result.manifestChecksum : null,
          reviewState: result.reviewStateCounts,
          placeholderSourceRecords: result.placeholderSourceRecords,
          legacyCorpusRowsRead: result.legacyCorpusRowsRead,
          verifiedInOnePass: result.verifiedInOnePass,
          nextStep: dryRun
            ? 'Nothing was written. Re-run without --dry-run to persist the provisional release.'
            : 'Review and approve records one at a time with: npm run review:release-record -- '
              + 'approve --release <id> --citation <c> --expected-checksum <sha256> --reviewer <id>',
        });
        break;
      }

      // ---------------------------------------------------------------- activate
      case 'activate': {
        const releaseId = required('release-id');
        const expectedManifest = required('expected-manifest');
        const expected = expectedCurrent();
        const actor = required('actor');
        const reason = arg('reason');
        const dryRun = flag('dry-run');

        const release = await lifecycle.getRelease(releaseId);
        const active = await lifecycle.getActiveRelease();
        const pointer = comparePointer(expected, active?.releaseId ?? null);

        // Identity checks run BEFORE the gates, and before any transaction. An operator who named
        // the wrong release must be told that, not handed a gate report about a release they did
        // not mean to touch.
        const refusals: string[] = [];
        if (!release) refusals.push(`UNKNOWN_RELEASE: no release '${releaseId}' exists.`);
        if (release && release.manifestChecksum !== expectedManifest) {
          refusals.push(
            `MANIFEST_MISMATCH: release holds ${release.manifestChecksum}, ` +
            `--expected-manifest says ${expectedManifest}.`,
          );
        }
        if (!pointer.matches) {
          refusals.push(
            `STALE_EXPECTED_CURRENT: active release is ${pointer.actualCurrentRelease ?? 'none'}, ` +
            `--expected-current says ${pointer.expectedCurrentRelease ?? 'none'}.`,
          );
        }

        const eligibility = release
          ? await lifecycle.evaluateActivation(releaseId, ['provisional'])
          : null;

        if (refusals.length) {
          print({
            command: 'activate', dryRun, refused: true, releaseId, refusals,
            pointer, gates: eligibility?.gates ?? [],
          });
          process.exitCode = EXIT_REFUSED;
          break;
        }

        if (dryRun) {
          print({
            command: 'activate', dryRun: true, releaseId,
            targetManifest: release!.manifestChecksum,
            targetStatus: release!.status,
            pointer,
            gates: eligibility!.gates,
            failedGates: eligibility!.failedGates,
            wouldSucceed: eligibility!.eligible || eligibility!.alreadyActive,
            refusalReason: eligibility!.eligible || eligibility!.alreadyActive ? null
              : `Activation gates would fail: ${eligibility!.failedGates.join(', ')}.`,
            writesPerformed: 0,
            note: 'Dry run. No pointer was moved and no lifecycle event was recorded.',
          });
          break;
        }

        // The pre-flight comparison above gives a fast, informative refusal. CORRECTNESS comes
        // from passing the belief into the transaction, where it is re-checked under the advisory
        // lock: without that, two operators acting on the same stale reading both pass the
        // pre-flight check and both commit.
        const result = await lifecycle.activate(releaseId, actor, reason, {
          expectedCurrentReleaseId: expected,
        });
        const nowActive = await lifecycle.getActiveRelease();
        print({
          command: 'activate', dryRun: false, ...result,
          activeReleaseAfter: nowActive?.releaseId ?? null,
          activeManifestAfter: nowActive?.manifestChecksum ?? null,
          actor,
        });
        break;
      }

      // ---------------------------------------------------------------- rollback
      case 'rollback': {
        const releaseId = required('release-id');
        const expected = expectedCurrent();
        const actor = required('actor');
        const reason = arg('reason');
        const dryRun = flag('dry-run');

        const release = await lifecycle.getRelease(releaseId);
        const active = await lifecycle.getActiveRelease();
        const pointer = comparePointer(expected, active?.releaseId ?? null);

        const refusals: string[] = [];
        if (!release) refusals.push(`UNKNOWN_RELEASE: no release '${releaseId}' exists.`);
        if (!pointer.matches) {
          refusals.push(
            `STALE_EXPECTED_CURRENT: active release is ${pointer.actualCurrentRelease ?? 'none'}, ` +
            `--expected-current says ${pointer.expectedCurrentRelease ?? 'none'}.`,
          );
        }
        // Rolling back to the release that is already active is a no-op the operator did not mean
        // to ask for; it almost always indicates they named the wrong target.
        if (release && active && release.releaseId === active.releaseId) {
          refusals.push(
            `ALREADY_ACTIVE: ${releaseId} is the current active release; there is nothing to roll back to.`,
          );
        }

        const eligibility = release
          ? await lifecycle.evaluateActivation(releaseId, ['superseded', 'rolled_back'])
          : null;

        if (refusals.length) {
          print({
            command: 'rollback', dryRun, refused: true, releaseId, refusals,
            pointer, gates: eligibility?.gates ?? [],
          });
          process.exitCode = EXIT_REFUSED;
          break;
        }

        if (dryRun) {
          print({
            command: 'rollback', dryRun: true, releaseId,
            targetManifest: release!.manifestChecksum,
            targetStatus: release!.status,
            pointer,
            gates: eligibility!.gates,
            failedGates: eligibility!.failedGates,
            wouldSucceed: eligibility!.eligible,
            refusalReason: eligibility!.eligible ? null
              : `Rollback gates would fail: ${eligibility!.failedGates.join(', ')}.`,
            writesPerformed: 0,
            note: 'Dry run. No pointer was moved and no lifecycle event was recorded.',
          });
          break;
        }

        const result = await lifecycle.rollbackTo(releaseId, actor, reason, {
          expectedCurrentReleaseId: expected,
        });
        const nowActive = await lifecycle.getActiveRelease();
        print({
          command: 'rollback', dryRun: false, ...result,
          activeReleaseAfter: nowActive?.releaseId ?? null,
          activeManifestAfter: nowActive?.manifestChecksum ?? null,
          actor,
        });
        break;
      }

      default:
        throw new UsageError(`Unknown subcommand '${command}'.`);
    }
  } finally {
    await dataSource.destroy();
  }
}

main().catch(error => {
  // A refusal is a governance outcome, not a crash. It exits 2 and prints structured detail so an
  // operator (or a runbook step) can tell "I was stopped" from "it broke".
  if (error instanceof ReleaseConstructionRefused) {
    console.error(JSON.stringify({
      refused: true, code: error.code, message: error.message, detail: error.detail ?? null,
    }, null, 2));
    process.exitCode = EXIT_REFUSED;
    return;
  }
  if (error instanceof ReleasePointerConflict) {
    console.error(JSON.stringify({
      refused: true, code: 'STALE_EXPECTED_CURRENT', message: error.message,
      refusals: [
        `STALE_EXPECTED_CURRENT: active release is ${error.actualCurrentReleaseId ?? 'none'}, ` +
        `--expected-current says ${error.expectedCurrentReleaseId ?? 'none'}.`,
      ],
      pointer: {
        expectedCurrentRelease: error.expectedCurrentReleaseId,
        actualCurrentRelease: error.actualCurrentReleaseId,
        matches: false,
      },
    }, null, 2));
    process.exitCode = EXIT_REFUSED;
    return;
  }
  if (error instanceof ReleaseActivationRefused) {
    console.error(JSON.stringify({
      refused: true, code: 'ACTIVATION_GATES_FAILED', message: error.message,
      failedGates: error.eligibility.failedGates, gates: error.eligibility.gates,
    }, null, 2));
    process.exitCode = EXIT_REFUSED;
    return;
  }
  if (error instanceof ReleaseDefinitionInvalid) {
    console.error(JSON.stringify({
      refused: true, code: 'RELEASE_DEFINITION_INVALID', problems: error.problems,
    }, null, 2));
    process.exitCode = EXIT_REFUSED;
    return;
  }
  if (error instanceof UsageError) {
    console.error(JSON.stringify({ refused: true, code: 'USAGE', message: error.message }, null, 2));
    process.exitCode = EXIT_REFUSED;
    return;
  }
  console.error(error);
  process.exitCode = 1;
});
