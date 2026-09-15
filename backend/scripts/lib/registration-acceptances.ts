/**
 * §299 (IT-1) — THE REGISTRATION ACCEPTANCES AN INTEGRATION HARNESS MUST SUPPLY.
 *
 * ---------------------------------------------------------------------------------------------
 * THE DEFECT THIS CLOSES, WHICH IS A HARNESS DEFECT AND NOT A PRODUCT ONE.
 *
 * §291 (SU-1) made acceptance of the internal pre-beta acknowledgement REQUIRED at registration.
 * That is deliberate and correct product behaviour. Five integration harnesses — §262, §264, §265,
 * §267 and §268 — build their `/auth/register` body by hand and were never updated, so every one of
 * them now receives:
 *
 *     400  Acceptance of "Safety InSite — Internal / Pre-Beta Use Acknowledgement"
 *          (internal-pre-beta-acknowledgement v2026-09-14.1) is required.
 *
 * and then 401s on the login that follows. `npm run hazlenz:integration:test` therefore aborts in
 * §262 before it reaches any assertion. The failure is PRE-EXISTING: it reproduces unchanged at
 * d78150ed, the commit §299 started from, and nothing in the §299 repairs touches auth,
 * registration or agreements.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE ACCEPTANCE IS DERIVED AND NOT SPELLED OUT.
 *
 * Writing `{ agreementId: 'internal-pre-beta-acknowledgement', agreementVersion: '2026-09-14.1' }`
 * into five harnesses would fix today and break again on the next version bump — and raising the
 * version is, by §291's own design, a deliberate act that makes every prior acceptance outstanding.
 * A hardcoded copy in a test is the same failure mode as HZ-5: a second copy of a vocabulary that
 * nothing holds to the first.
 *
 * So this reads `agreementsRequiredAtRegistration()` — the registry the SERVICE validates against —
 * and accepts exactly what it names, at exactly the version it names. A version bump then flows
 * through the harnesses with no edit, and an agreement ADDED as required at registration is picked
 * up automatically too.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT THIS IS NOT.
 *
 * It is NOT a bypass. The harness now does what a real client does: it sends an acceptance, and the
 * service validates it, records it, and would still reject a wrong or missing version. Nothing here
 * weakens, mocks or disables the §291 requirement — a harness that omitted this and was "fixed" by
 * relaxing the service would be the disallowed repair.
 */
import { agreementsRequiredAtRegistration } from '../../src/agreements/agreement-registry';

export interface RegistrationAcceptance {
  readonly agreementId: string;
  readonly agreementVersion: string;
}

/**
 * Every acceptance `/auth/register` currently requires, at the version it currently requires.
 * Spread into a registration body as `acceptedAgreements`.
 */
export function requiredRegistrationAcceptances(): RegistrationAcceptance[] {
  return agreementsRequiredAtRegistration().map(agreement => ({
    agreementId: agreement.agreementId,
    agreementVersion: agreement.version,
  }));
}
