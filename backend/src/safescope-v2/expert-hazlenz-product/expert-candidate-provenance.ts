/**
 * §262 — THE FROZEN §259 CANDIDATE IDENTITY, AND HOW AN EXECUTION BINDS ITSELF TO IT.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY A CONSTANT AND NOT A RUNTIME RECOMPUTATION.
 *
 * The §259 successor identity is a digest over twenty-two elements, nineteen of which are SHA-256
 * digests of TypeScript source files. A deployed server runs compiled JavaScript and has no access
 * to those files, so recomputing the composite at runtime is not possible and any attempt would be
 * computing something else and calling it the candidate identity.
 *
 * So the composite is recorded here as data, and its truth is established OUTSIDE the running
 * process: `scripts/verify-262-candidate-identity.ts` recomputes all twenty-two elements from the
 * live sources and fails if the value below is not what they produce. The constant is therefore a
 * checked fact rather than an assertion, in exactly the way `PROTECTED-IDENTITIES.json` is.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE SYSTEM-PROMPT DIGEST IS CHECKED AT EXECUTION TIME AS WELL.
 *
 * A constant states which candidate the server BELIEVES it ran. That belief is worth nothing unless
 * something confirms that the request actually transmitted was that candidate's request. §248 paid
 * for this lesson: a binding repair existed at contract level while the executable path went on
 * assembling the predecessor, and only a pre-spend gate over the assembled request caught it.
 *
 * `EXPERT_259_SYSTEM_PROMPT_SHA` is element 2 of the frozen identity — the digest of
 * `build259SystemPrompt(0)`, the system prompt for a request carrying no governed records. Every
 * §262 execution transmits exactly that prompt (governed evidence is empty; see
 * `expert-analysis-context.ts`), so the digest of the bytes the transport ACTUALLY received must
 * equal it. `assertTransmittedCandidateIsFrozen259` is called with the recorded transmission, not
 * with a rebuild, so it cannot agree with itself.
 *
 * WHAT IT DOES NOT CLAIM. The wire schema digest is input-dependent — the transmitted schema embeds
 * this observation's allowed hazard-family enum — so the transmitted value is NOT expected to equal
 * element 3, which was computed over the frozen matrix input. It is recorded as provenance of what
 * this execution sent, and never compared to the frozen element.
 */

/** §259 successor candidate identity. Recomputed and checked by verify-262-candidate-identity. */
export const EXPERT_CANDIDATE_IDENTITY_259 =
  '0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee' as const;

/** Element 2 of that identity: sha256 of the §259 system prompt with zero governed records. */
export const EXPERT_259_SYSTEM_PROMPT_SHA =
  '680f5127776427963d89244eafa32ce57973575ffbfae2f3326ed92fc17be34a' as const;

export class TransmittedCandidateMismatchError extends Error {}

/**
 * Refuse to attribute a result to the frozen candidate unless the transmitted first-pass system
 * prompt was that candidate's.
 *
 * FAIL CLOSED BY THROWING, NOT BY DOWNGRADING A LABEL. The alternative — persisting the analysis
 * with a null candidate identity — would keep a semantically unattributable Expert conclusion in
 * the product as though it were ordinary output. A result whose provenance cannot be established is
 * not a weaker result; it is one no one can review, and the honest disposition is a failed
 * execution.
 */
export function assertTransmittedCandidateIsFrozen259(
  transmittedSystemPromptSha: string | null,
): void {
  if (transmittedSystemPromptSha !== EXPERT_259_SYSTEM_PROMPT_SHA) {
    throw new TransmittedCandidateMismatchError(
      'EXPERT_CANDIDATE_262_ABORT: the first-pass system prompt actually transmitted digests to '
      + `${String(transmittedSystemPromptSha)}, which is not the frozen §259 candidate's `
      + `${EXPERT_259_SYSTEM_PROMPT_SHA}. The executable path is assembling a request this server `
      + 'may not attribute to the validated candidate.');
  }
}
