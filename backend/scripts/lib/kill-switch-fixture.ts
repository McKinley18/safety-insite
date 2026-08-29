// GOVERNED KILL-SWITCH AUTHORITY -- shared deterministic fixture.
//
// Used by BOTH `reproduce-governed-kill-switch-defect.ts` (which measures the pre-repair defect)
// and `test-governed-kill-switch-authority.ts` (which asserts the repaired contract), so the two
// can never disagree about what "an otherwise fully governed configuration" means.
//
// NO DATABASE. Every query the release-binding and pinning paths issue is served by an in-memory
// table simulator that RECORDS what was asked. That is the point: the defect is a durable WRITE
// that should not happen, and a simulator that records writes proves the write did or did not
// occur without connecting to any database -- production, development or disposable.

import type { DataSource } from 'typeorm';
import {
  CUTOVER_MODE_ENV, CUTOVER_ALLOWLIST_ENV, CUTOVER_ORG_ALLOWLIST_ENV,
  CUTOVER_PRODUCTION_ACK_ENV,
} from '../../src/standards/cutover/cutover-mode';
import { SHADOW_KILL_SWITCH_ENV } from '../../src/standards/cutover/production-shadow-authorization';
import { releaseCitationKey } from '../../src/standards/releases/citation-identity';

export type Env = Record<string, string | undefined>;

/** The release the production control plane actually has active (§90 of the blueprint). */
export const ACTIVE_RELEASE = 'federal-core-2026-08-28.1';
/** A DIFFERENT release, used to prove an already-bound inspection is not re-bound or rewritten. */
export const HISTORICAL_RELEASE = 'federal-core-2026-07-30.1';
/** The bounded acceptance identity recorded in the 2026-08-29 cutover preparation. */
export const ALLOWLISTED_USER = 'e9a25131-dfa4-40ce-90ff-8ab3d884d8ef';
export const OTHER_USER = '00000000-0000-4000-8000-000000000001';
export const ALLOWLISTED_ORG = 'org-allowlisted';

export const ALLOWLISTED_PRINCIPAL = { userId: ALLOWLISTED_USER, organizationId: null };
export const NON_ALLOWLISTED_PRINCIPAL = { userId: OTHER_USER, organizationId: null };

/**
 * The exact configuration the cutover preparation derived, in PRODUCTION runtime semantics:
 * governed delivery mode + the production acknowledgement + one named account.
 *
 * This is the configuration under which the emergency stop must be provable. Measuring the kill
 * switch against a configuration that was not governed in the first place would prove nothing.
 */
export function governedProductionEnv(over: Env = {}): Env {
  return {
    NODE_ENV: 'production',
    [CUTOVER_MODE_ENV]: 'GOVERNED_WITH_FALLBACK',
    [CUTOVER_PRODUCTION_ACK_ENV]: 'I_ACKNOWLEDGE_GOVERNED_CUTOVER',
    [CUTOVER_ALLOWLIST_ENV]: ALLOWLISTED_USER,
    ...over,
  };
}

/** The same configuration with the emergency stop engaged. */
export function killedEnv(over: Env = {}): Env {
  return governedProductionEnv({ [SHADOW_KILL_SWITCH_ENV]: 'engaged', ...over });
}

export { CUTOVER_MODE_ENV, CUTOVER_ALLOWLIST_ENV, CUTOVER_ORG_ALLOWLIST_ENV, CUTOVER_PRODUCTION_ACK_ENV, SHADOW_KILL_SWITCH_ENV };

export interface RecordedQuery {
  sql: string;
  parameters: unknown[];
}

export interface InspectionTable {
  /** inspection id -> its persisted `knowledgeReleaseId` (null when unbound). */
  rows: Map<string, string | null>;
  /** Every statement the code under test issued, in order. */
  queries: RecordedQuery[];
  /** Only the statements that would MUTATE durable state. */
  writes: RecordedQuery[];
  dataSource: DataSource;
}

export interface GovernedRecordFixture {
  /** The citation as the release holds it. */
  citation: string;
  /** `reviewer_approved` for an approved member; anything else models a disposed record. */
  effectiveState: string;
  frozenState?: string;
  canonicalText?: string | null;
  sourceKey?: string;
}

/**
 * A faithful in-memory stand-in for the three tables the governed customer path touches.
 *
 * Faithful in the ways that matter here: the binding write is the same conditional
 * `WHERE "knowledgeReleaseId" IS NULL` update the implementation issues, so write-once is simulated
 * rather than assumed; and the release-scoped corpus row carries a real `effectiveState`, so a
 * reviewer-disposed record is refused by the production rule rather than by the fixture.
 */
export function inspectionFixture(input: {
  inspections?: Record<string, string | null>;
  activeRelease?: string | null;
  /** Release members, keyed by the citation the caller will ask for. */
  records?: GovernedRecordFixture[];
}): InspectionTable {
  const rows = new Map<string, string | null>(Object.entries(input.inspections ?? {}));
  const activeRelease = input.activeRelease === undefined ? ACTIVE_RELEASE : input.activeRelease;
  const queries: RecordedQuery[] = [];
  const writes: RecordedQuery[] = [];

  const dataSource = {
    query: async (sql: string, parameters: unknown[] = []) => {
      const record = { sql: sql.replace(/\s+/g, ' ').trim(), parameters };
      queries.push(record);

      if (/^UPDATE inspection/i.test(record.sql)) {
        writes.push(record);
        const [id, value] = parameters as [string, string];
        if (rows.has(id) && rows.get(id) === null) {
          rows.set(id, value);
          return [{ knowledgeReleaseId: value }];
        }
        return [];
      }
      if (/FROM inspection/i.test(record.sql)) {
        const id = String(parameters[0]);
        return rows.has(id) ? [{ knowledgeReleaseId: rows.get(id) }] : [];
      }
      if (/regulatory_release_records/i.test(record.sql)) {
        // The release-scoped governed corpus lookup. Serving it from a fixture keeps the Phase 5
        // authority proof deterministic and database-free; the row shape is the one
        // `governed-corpus-lookup.ts` destructures.
        const citationKey = releaseCitationKey(String(parameters[1] ?? ''));
        const match = (input.records ?? []).find(
          (candidate) => releaseCitationKey(candidate.citation) === citationKey,
        );
        if (!match) return [];
        return [{
          citation: match.citation,
          citationKey,
          recordChecksum: `checksum-${citationKey}`,
          frozenState: match.frozenState ?? match.effectiveState,
          effectiveState: match.effectiveState,
          payload: {
            canonicalText: match.canonicalText === undefined
              ? `Governed regulatory text for ${match.citation}.`
              : match.canonicalText,
            title: `Title for ${match.citation}`,
            sourceKey: match.sourceKey ?? 'ecfr-govinfo',
            sourceName: 'eCFR',
            agency: 'OSHA',
            authorityTier: 'federal',
          },
        }];
      }
      if (/FROM regulatory_releases/i.test(record.sql)) {
        if (/"releaseId" = \$1/.test(record.sql)) {
          return [{ manifestChecksum: 'fixture-manifest-checksum' }];
        }
        return activeRelease
          ? [{ releaseId: activeRelease, manifestChecksum: 'fixture-manifest-checksum' }]
          : [];
      }
      return [];
    },
  } as unknown as DataSource;

  return { rows, queries, writes, dataSource };
}

/** A recorder in the shape the existing cutover suites already use. */
export function recorder() {
  const state = { failures: [] as string[], count: 0 };
  return {
    get failures() { return state.failures; },
    get count() { return state.count; },
    check(ok: boolean, name: string, detail = '') {
      state.count += 1;
      console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
      if (!ok) state.failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    },
    eq(actual: unknown, expected: unknown, name: string) {
      this.check(actual === expected, name, `expected ${String(expected)}, got ${String(actual)}`);
    },
  };
}

/**
 * Runs `body` with `process.env` temporarily replaced by `env`, then restores it exactly.
 *
 * Needed because the two call sites that decide durable state --
 * `safescope-v2.controller.ts` and `inspection.service.ts:537` -- call
 * `resolveCutoverEnablement(principal)` with NO env argument, so they read `process.env`. Proving
 * the repair only through the injectable-env overload would not prove it for the real call shape.
 */
export async function withProcessEnv<T>(env: Env, body: () => Promise<T> | T): Promise<T> {
  const saved = process.env;
  process.env = { ...env } as NodeJS.ProcessEnv;
  try {
    return await body();
  } finally {
    process.env = saved;
  }
}
