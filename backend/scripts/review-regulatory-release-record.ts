import 'dotenv/config';
import { dataSource } from '../src/database/data-source';
import {
  ReleaseRecordReviewRefused,
  ReleaseRecordReviewService,
} from '../src/standards/releases/release-record-review.service';

/**
 * KG-3B -- the reviewer approval admin command.
 *
 * This is the ONLY way to record a reviewer decision. There is no HTTP endpoint, deliberately:
 * KG-2 already treats activation as an operator action with no route, and approving a regulatory
 * record -- deciding what customers will be told is authoritative regulation -- is rarer and more
 * consequential than activation. A route would create an authorization surface the architecture
 * does not otherwise need.
 *
 * `--expected-checksum` is mandatory for approve/revoke. There is no "approve whatever is stored
 * now" mode, because that is exactly the stale approval the design forbids: the reviewer must
 * state the version they actually read, and the service refuses if the release holds anything
 * else. Use `show` to read the current version's checksum, review the content, then approve it.
 *
 * Usage:
 *   npm run review:release-record -- show     --release <id> --citation <c>
 *   npm run review:release-record -- list     --release <id> [--state <s>]
 *   npm run review:release-record -- approve  --release <id> --citation <c> \
 *                                             --expected-checksum <sha256> --reviewer <id> \
 *                                             [--role <r>] [--note <text>]
 *   npm run review:release-record -- revoke   --release <id> --citation <c> \
 *                                             --expected-checksum <sha256> --reviewer <id> \
 *                                             --note <text>
 *   npm run review:release-record -- carry-forward-candidates --release <id>
 *   npm run review:release-record -- approval-checksum        --release <id>
 */

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function required(name: string): string {
  const value = arg(name);
  if (!value) throw new Error(`--${name} is required.`);
  return value;
}

async function main() {
  const command = process.argv[2];
  if (!command) throw new Error('A command is required (show|list|approve|revoke|carry-forward-candidates|approval-checksum).');

  await dataSource.initialize();
  const service = new ReleaseRecordReviewService(dataSource);
  const releaseId = required('release');

  try {
    switch (command) {
      case 'show': {
        const status = await service.describeRecordReview(releaseId, required('citation'));
        console.log(JSON.stringify(status, null, 2));
        break;
      }
      case 'list': {
        const wanted = arg('state');
        const rows = await service.resolveEffectiveReviewStates(releaseId);
        const counts = await service.countEffectiveReviewStates(releaseId);
        const listed = Array.from(rows.entries())
          .filter(([, state]) => !wanted || state === wanted)
          .map(([citationKey, state]) => ({ citationKey, effectiveState: state }));
        console.log(JSON.stringify({ releaseId, counts, records: listed }, null, 2));
        break;
      }
      case 'approve':
      case 'revoke': {
        const input = {
          releaseId,
          citation: required('citation'),
          expectedChecksum: required('expected-checksum'),
          reviewerId: required('reviewer'),
          reviewerRole: arg('role'),
          note: arg('note'),
        };
        const result = command === 'approve'
          ? await service.approveRecord(input)
          : await service.revokeApproval(input);
        console.log(JSON.stringify(result, null, 2));
        break;
      }
      case 'carry-forward-candidates': {
        const candidates = await service.describeCarryForwardCandidates(releaseId);
        console.log(JSON.stringify({
          releaseId,
          // Surfaced, never applied: see CARRY_FORWARD_ON_IDENTICAL_CONTENT.
          note: 'Identical content already approved elsewhere. NOT auto-approved; re-review required.',
          candidates,
        }, null, 2));
        break;
      }
      case 'approval-checksum': {
        console.log(JSON.stringify(await service.computeApprovalStateChecksum(releaseId), null, 2));
        break;
      }
      default:
        throw new Error(`Unknown command '${command}'.`);
    }
  } catch (error) {
    if (error instanceof ReleaseRecordReviewRefused) {
      // A refusal is a governance outcome, not a crash: print the gates so the operator can see
      // exactly which prerequisite failed.
      console.error(JSON.stringify({
        refused: true, message: error.message,
        failedGates: error.failedGates, gates: error.gates,
      }, null, 2));
      process.exitCode = 2;
    } else {
      throw error;
    }
  } finally {
    await dataSource.destroy();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
