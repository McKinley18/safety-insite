#!/usr/bin/env python3
"""
§315 / BR-9 — WATCHED-TO-FAIL MUTATIONS.

Each mutation removes one control §315 added. A suite that still passes with the control gone is not
testing that control. Sources are restored from pristine copies and the restoration is verified BY
DIGEST rather than by inspection.
"""
import sys

GATE = 'scripts/ops/verify-evidence-digest-integrity.js'
HEALTH = 'scripts/ops/check-backup-health.js'

MUTATIONS = {
    # 1. Stop hashing the bytes at all — compare the recorded size instead. This is precisely the
    #    BR-9 defect being reintroduced.
    'full-hash': (GATE,
        """    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const hash = createHash('sha256');
    let bytes = 0;
    for await (const chunk of response.Body) { hash.update(chunk); bytes += chunk.length; }
    return { sha256: hash.digest('hex'), bytes };""",
        """    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    let bytes = 0;
    for await (const chunk of response.Body) { bytes += chunk.length; }
    return { sha256: 'MUTATION_NOT_HASHED', bytes };"""),

    # 2. Compare on SIZE rather than digest — the classic "length is integrity" mistake.
    'size-only': (GATE,
        """  if (live === null) return 'MISSING';
  return live.sha256 === row.sha256 ? 'MATCHED' : 'MISMATCHED';""",
        """  if (live === null) return 'MISSING';
  return String(live.bytes) === String(row.sizeBytes) ? 'MATCHED' : 'MISMATCHED';"""),

    # 3. Verify only objects that recovery has already captured, which is what made BR-9 invisible.
    'never-captured-exclusion': (GATE,
        """  from storage_objects
  order by "objectKey"`;""",
        """  from storage_objects
  where "createdAt" < now() - interval '1 day'
  order by "objectKey"`;"""),

    # 4. Let UNKNOWN pass.
    'unknown-passes': (GATE,
        """  if (live === undefined || !row.sha256) return 'UNKNOWN';""",
        """  if (live === undefined || !row.sha256) return 'MATCHED';"""),

    # 5. Ignore an incomplete enumeration.
    'incomplete-scan': (GATE,
        """  if (malformed > 0 || rows.length !== populationExpected) {""",
        """  if (false && (malformed > 0 || rows.length !== populationExpected)) {"""),

    # 6. Swallow a hash/read failure instead of failing the gate.
    'hash-failure': (GATE,
        """    hashFailures > 0 ? 'HASH_FAILURE'""",
        """    false ? 'HASH_FAILURE'"""),

    # 7. Stop propagating integrity into aggregate health.
    'aggregate-propagation': (HEALTH,
        """  if (dbState === 'HEALTHY' && evState === 'PROTECTED' && integrityState === 'INTEGRITY_HOLDS') return 'HEALTHY';""",
        """  if (dbState === 'HEALTHY' && evState === 'PROTECTED') return 'HEALTHY';"""),

    # 8. Stop dispatching MO-1.
    'mo1-dispatch': (HEALTH,
        """  if (overall !== 'HEALTHY' && process.env.OPERATIONAL_ALERT_WEBHOOK_URL) {""",
        """  if (false && overall !== 'HEALTHY' && process.env.OPERATIONAL_ALERT_WEBHOOK_URL) {"""),
}


def apply(name):
    target, old, new = MUTATIONS[name]
    s = open(target, encoding='utf-8').read()
    if s.count(old) != 1:
        print(f'MUTATION {name}: anchor found {s.count(old)} times in {target}, expected exactly 1')
        sys.exit(2)
    open(target, 'w', encoding='utf-8').write(s.replace(old, new, 1))
    print(f'mutation applied: {name}  ({target})')


if __name__ == '__main__':
    apply(sys.argv[1])
