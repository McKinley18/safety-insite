/**
 * L3-2 -- customer-behaviour invariance oracle (Phase 13).
 *
 * THE ORACLE IS EMPIRICAL, NEVER DECLARED. Two captures from IDENTICAL code establish which paths
 * differ between two runs; only those are excluded from the before/after comparison. This is a
 * DO_NOT_REDISCOVER rule: L3-1 recorded that its first attempt used a hand-written volatility list,
 * reported all 66 scenarios as differing while every customer-decisive field was identical, and the
 * declared list -- not the engine -- was the thing that was wrong.
 *
 * Env: VOL_A, VOL_B (two same-code captures), BEFORE, AFTER, OUT.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { deriveVolatilePaths, compareCustomerOutput, customerOutputHash } from '../src/standards/cutover/customer-output-invariance';

interface Row { id: string; payload: unknown; error: string | null }

const readJsonl = (p: string): Map<string, Row> => new Map(
  readFileSync(p, 'utf8').split('\n').filter(Boolean)
    .map(l => JSON.parse(l) as Row).map(r => [r.id, r]));

function main(): void {
  const volA = readJsonl(process.env.VOL_A || '');
  const volB = readJsonl(process.env.VOL_B || '');
  const before = readJsonl(process.env.BEFORE || '');
  const after = readJsonl(process.env.AFTER || '');
  const outPath = process.env.OUT || '';

  const allVolatile = new Set<string>();
  const differences: Record<string, unknown> = {};
  let invariant = 0;
  let differing = 0;
  const errors: string[] = [];

  for (const id of before.keys()) {
    const b = before.get(id)!;
    const a = after.get(id);
    if (!a) { errors.push(`${id}: missing from AFTER`); continue; }
    if (b.error || a.error) { errors.push(`${id}: capture carried an error`); continue; }

    const volatilePaths = deriveVolatilePaths(volA.get(id)?.payload, volB.get(id)?.payload);
    volatilePaths.forEach(p => allVolatile.add(p));

    const comparison = compareCustomerOutput({
      legacyPayload: b.payload, shadowPayload: a.payload, volatilePaths,
    });
    // INDETERMINATE is not a pass -- the helper's own contract. Count it as a difference.
    if (comparison.verdict === 'INVARIANT') invariant += 1;
    else {
      differing += 1;
      differences[id] = {
        verdict: comparison.verdict,
        differingPathCount: comparison.differingPathCount,
        differingPaths: comparison.differingPaths,
      };
    }
  }

  const report = {
    method: 'volatility derived empirically from two runs of identical post-L3-2 code, then '
      + 'pristine-HEAD vs post-L3-2 compared excluding only those paths (KG-4B / KG-4E / L3-1 precedent)',
    before: 'git archive of 1feda622 -- carries neither the L3-1 nor the L3-2 uncommitted work',
    after: 'the same archive plus every uncommitted L3-1 and L3-2 file',
    scenariosCompared: invariant + differing,
    empiricallyVolatilePaths: [...allVolatile].sort(),
    volatileFieldRoles: [...new Set([...allVolatile].map(p => p.split('.').pop()!.replace(/\[\d+\]/g, '')))].sort(),
    scenariosWithNonVolatileDifference: differing,
    differences,
    captureErrors: errors,
    beforeHash: customerOutputHash([...before.values()].map(r => r.payload), new Set(allVolatile)),
    afterHash: customerOutputHash([...after.values()].map(r => r.payload), new Set(allVolatile)),
    verdict: differing === 0 && errors.length === 0
      ? 'CUSTOMER_AUTHORITY_UNCHANGED' : 'CUSTOMER_BEHAVIOUR_DIFFERENCE_DETECTED',
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  process.stdout.write(JSON.stringify({
    scenariosCompared: report.scenariosCompared,
    empiricallyVolatilePaths: report.empiricallyVolatilePaths,
    scenariosWithNonVolatileDifference: report.scenariosWithNonVolatileDifference,
    captureErrors: report.captureErrors,
    verdict: report.verdict,
  }, null, 2) + '\n');
  process.exit(report.verdict === 'CUSTOMER_AUTHORITY_UNCHANGED' ? 0 : 1);
}

main();
