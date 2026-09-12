/**
 * EXPERT HAZLENZ -- WRITE-ONCE PRE-SPEND IDENTITY. §141 Phase 7.
 *
 * ==================== THE DEFECT THIS CLOSES ====================
 *
 * `PRE-SPEND-IDENTITY.json` is a statement about the state of the tree AT THE MOMENT OF SPEND. It is
 * the only record of what code produced a set of paid model answers, and its whole value is that it
 * cannot be restated afterwards.
 *
 * §140's probe wrote it with a plain `writeFileSync`. A later re-measurement pass re-ran the same
 * code path and overwrote it, so that file's recorded probe-script hash names the CORRECTED script
 * rather than the one that issued the sixteen requests. **That value is unrecoverable for that run**
 * and is disclosed as a limitation in its own report. Every other hash in it names a file that was
 * not edited after the spend, so the identity of the model-facing surfaces survived -- but that was
 * luck about which file changed, not a property of the artifact.
 *
 * A file whose contents can be silently replaced by a later, cheaper, more convenient run is not
 * evidence. So writing is now a REFUSAL by default.
 *
 * ==================== WHAT IS NOT DONE HERE ====================
 *
 * The §140 artifact is NOT retroactively repaired, reconstructed, back-dated or "corrected". Its
 * disclosed limitation stands exactly as written. Reconstructing a pre-spend hash after the fact
 * would manufacture the very evidence this module exists to protect.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, openSync, writeSync, fsyncSync,
  closeSync } from 'fs';
import { createHash } from 'crypto';
import { dirname } from 'path';

export const PROBE_IDENTITY_VERSION = 'hazlenz.expert.probe-identity.v1' as const;

/**
 * Everything a future reader needs to say what produced a set of paid answers.
 *
 * Every field is REQUIRED. An identity that may omit the schema hash is an identity that will omit
 * the schema hash on the run where it mattered.
 */
export interface PreSpendIdentity {
  operation: string;
  capturedAt: string;
  isFormalEvaluation: false;
  hashes: {
    probeScriptSha256: string;
    fixtureManifestSha256: string;
    systemPromptSha256: string;
    wireSchemaSha256: string;
    normalizationSha256: string;
    contractTypesSha256: string;
  };
  execution: {
    provider: string;
    model: string;
    promptVersion: string;
    analysisContractVersion: string;
  };
  budget: {
    targetLogicalCalls: number;
    hardProviderRequestCeiling: number;
    retryRequestBudget: number;
    enforcedSpendCeilingUsd: number;
    worstCaseRequestUsd: number;
  };
  /** Anything else the operation wants recorded. Never a substitute for the fields above. */
  extra?: Record<string, unknown>;
}

export class IdentityAlreadyWrittenError extends Error {
  constructor(readonly path: string, readonly existingSha256: string) {
    super(`${path} already exists (sha256 ${existingSha256}) -- refusing to restate a pre-spend `
      + 'identity. A pre-spend identity is a statement about the moment of spend and cannot be '
      + 'rewritten by a later pass.');
    this.name = 'IdentityAlreadyWrittenError';
  }
}

export const sha256 = (s: string | Buffer): string =>
  createHash('sha256').update(s).digest('hex');

export const sha256File = (path: string): string => sha256(readFileSync(path));

/**
 * Write the identity, or REFUSE.
 *
 * Refusal is the whole contract: if the file exists, this throws and **does not touch a single byte
 * of it**. There is deliberately no `force`, no `overwrite` and no environment escape, because every
 * one of those is the flag a future operation reaches for at 2am.
 *
 * The write is `fsync`ed for the same reason the run-record store is: an identity that is still in
 * the page cache when the first request goes out has not been recorded.
 */
export function writePreSpendIdentityOnce(path: string, identity: PreSpendIdentity): void {
  if (existsSync(path)) {
    throw new IdentityAlreadyWrittenError(path, sha256File(path));
  }
  mkdirSync(dirname(path), { recursive: true });
  // `wx` fails if the path exists, which closes the window between the check above and this line.
  // The existsSync check stays because it produces the explanatory error; this makes it atomic.
  const fd = openSync(path, 'wx');
  try {
    writeSync(fd, JSON.stringify(identity, null, 2) + '\n');
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

/** Read an identity back. No defaulting, no repair -- a malformed file is an error, not a warning. */
export function readPreSpendIdentity(path: string): PreSpendIdentity {
  return JSON.parse(readFileSync(path, 'utf8')) as PreSpendIdentity;
}

/**
 * A re-measurement pass records its own identity ALONGSIDE the original, never over it.
 *
 * This one is deliberately NOT write-once: re-measuring is repeatable and cheap, and nothing about
 * it is a claim about the moment of spend. Keeping the two on different rules is the point.
 */
export function writeRemeasureIdentity(path: string, identity: PreSpendIdentity): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(identity, null, 2) + '\n');
}
