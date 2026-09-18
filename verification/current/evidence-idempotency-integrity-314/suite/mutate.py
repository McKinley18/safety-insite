#!/usr/bin/env python3
"""
§314 / BR-8 — WATCHED-TO-FAIL MUTATIONS.

Each mutation REMOVES one control the repair added. A suite that still passes with the control gone
is not testing that control, so every mutation below must make the suite FAIL. The source is restored
from a pristine copy afterwards and the restoration is verified by digest, not by inspection.
"""
import subprocess
import sys

P = 'src/storage/storage.service.ts'

MUTATIONS = {
    # 1. Re-enable the PUT on a COMPLETED replay: the committed result is no longer returned early,
    #    so the replay writes the bytes again and audits the upload a second time.
    'replay-put': (
        """    if (existing.status === 'ready') {""",
        """    if (false && existing.status === 'ready') {""",
    ),
    # 2. Remove caller ownership from the idempotency lookup, so an identifier resolves across users.
    'ownership': (
        """    return this.objects.findOne({ where: { createdByUserId: user.userId, clientRequestId } });""",
        """    return this.objects.findOne({ where: { clientRequestId } });""",
    ),
    # 3. Allow same-identifier / different-payload to proceed, which is BR-8's original defect.
    'different-payload': (
        """    if (existing.sha256 !== digest) {
      refuse('PAYLOAD_MISMATCH', 'This upload identifier was already used for different file contents.');
    }""",
        """    // MUTATION: payload identity no longer gates the write.""",
    ),
    # 4. Let the loser of the unique-index race write its own bytes over the winner's object,
    #    restoring last-writer-wins.
    'concurrency': (
        """        if (winner) {
          return this.resolveReplay(user, winner, {
            category: input.category, parentType: input.parentType, parentId: input.parentId, body: input.body,
          }, digest);
        }""",
        """        if (winner) return this.putAndFinalize(user, winner, input.body, input.contentType, false);""",
    ),
    # 5. Accept divergence by REWRITING the digest to match whatever was just written. The object is
    #    self-consistent afterwards, which is exactly why §314 forbids this as a repair: it makes the
    #    metadata agree with an overwrite that should never have been permitted.
    'stale-digest': (
        """    if (existing.sha256 !== digest) {
      refuse('PAYLOAD_MISMATCH', 'This upload identifier was already used for different file contents.');
    }""",
        """    if (existing.sha256 !== digest) {
      await this.objects.update(existing.id, { sha256: digest, sizeBytes: String(input.body.length) });
      existing.sha256 = digest;
    }""",
    ),
}


def apply(name):
    old, new = MUTATIONS[name]
    s = open(P, encoding='utf-8').read()
    if s.count(old) != 1:
        print(f'MUTATION {name}: anchor found {s.count(old)} times, expected exactly 1')
        sys.exit(2)
    open(P, 'w', encoding='utf-8').write(s.replace(old, new, 1))
    print(f'mutation applied: {name}')


if __name__ == '__main__':
    apply(sys.argv[1])
