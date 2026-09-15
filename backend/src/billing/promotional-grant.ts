/**
 * §302 / EN-3 — A PROMOTION IS A BOUNDED GRANT, NOT A PERMANENT PLAN.
 *
 * ==================== WHAT THIS REPLACES ====================
 *
 * Before §302 a promo code wrote `planCode = 'pro'` and `subscriptionStatus = 'active'` directly
 * onto the user row. Three things were wrong with that, and only the first is obvious:
 *
 *   1. IT NEVER EXPIRED. There is no endsAt on a user row, so a promotion intended as a trial ran
 *      forever.
 *   2. IT COULD NOT BE REVOKED. Emptying the promo allowlist stops NEW promotions and downgrades
 *      nobody, and no product route lowers a planCode — §301's cleanup had to DELETE accounts to
 *      remove entitlement, which is not something you can do to a real pilot customer.
 *   3. IT LIED ABOUT BILLING. `subscriptionStatus = 'active'` on an account that has never paid
 *      anything makes the account row, and anything reading it, assert a purchase that did not
 *      happen.
 *
 * `entitlement_grants` already solves all three — bounded, revocable, attributed, audited — and
 * §300/§301 used it for exactly this purpose. §302 moves promotions onto it rather than inventing
 * a fourth representation of "what plan is this account on".
 *
 * ==================== THE CALLER DECIDES NOTHING ====================
 *
 * Every value below is derived on the server. A registering caller supplies a promo code and
 * nothing else: not the duration, not the tier, not the source, not the account it applies to, and
 * not whether a grant is created at all. That is the §302 authority requirement, and the shape of
 * this module is what enforces it — there is no parameter through which a request could reach any
 * of these decisions.
 */

/** The source recorded on a promotional grant. Deliberately one of the values the admin route already permits. */
export const PROMOTIONAL_GRANT_SOURCE = 'pilot' as const;

/**
 * The tier a promotion confers. The MINIMUM capability that makes the promotion meaningful, and no
 * more: `pro` is the only non-free tier the product defines, and nothing here confers
 * administrative authority of any kind.
 */
export const PROMOTIONAL_GRANT_TIER = 'pro' as const;

/**
 * THE DEFAULT, AND WHY IT IS SEVEN DAYS.
 *
 * §302 asked whether the product already defines an intended promotional duration. IT DOES NOT.
 * The only duration rule anywhere is the admin route's ceiling of 90 days for OPERATIONAL grants,
 * which is a maximum for a human-issued support action rather than an intended promotional term —
 * borrowing it would have been reading a limit as a recommendation.
 *
 * So this is a conservative default for controlled pilot access, as §302 directs, and it is short
 * on purpose: a promotion that has to be renewed deliberately is a promotion somebody is still
 * choosing to extend.
 */
export const PROMOTIONAL_GRANT_DEFAULT_DAYS = 7;

/**
 * THE CEILING, AND IT IS A REFUSAL RATHER THAN A CLAMP AT THE POLICY LEVEL.
 *
 * §302 forbids exceeding 30 days without a product-owner decision. A misconfigured environment
 * must therefore not silently become a 90-day promotion: the value is clamped here, and
 * `promotionalGrantDurationDiagnostic()` reports that it was, so the clamp is visible rather than
 * quiet.
 */
export const PROMOTIONAL_GRANT_MAX_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/** How the configured duration was resolved. Reported so a clamp is never silent. */
export interface PromotionalGrantDuration {
  readonly days: number;
  readonly source: 'DEFAULT' | 'CONFIGURED' | 'CONFIGURED_CLAMPED' | 'CONFIGURED_INVALID';
  readonly configuredRaw: string | null;
}

/**
 * Resolve the promotional grant duration from server configuration.
 *
 * Reads `PROMOTIONAL_GRANT_DAYS` from the environment — SERVER configuration, which a registering
 * caller cannot write to. Anything unparseable, zero or negative falls back to the default rather
 * than producing a grant that is already expired or infinite.
 */
export function promotionalGrantDuration(
  env: NodeJS.ProcessEnv = process.env,
): PromotionalGrantDuration {
  const raw = env.PROMOTIONAL_GRANT_DAYS;
  const configuredRaw = typeof raw === 'string' && raw.trim() ? raw.trim() : null;
  if (configuredRaw === null) {
    return { days: PROMOTIONAL_GRANT_DEFAULT_DAYS, source: 'DEFAULT', configuredRaw: null };
  }
  const parsed = Number(configuredRaw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { days: PROMOTIONAL_GRANT_DEFAULT_DAYS, source: 'CONFIGURED_INVALID', configuredRaw };
  }
  if (parsed > PROMOTIONAL_GRANT_MAX_DAYS) {
    return { days: PROMOTIONAL_GRANT_MAX_DAYS, source: 'CONFIGURED_CLAMPED', configuredRaw };
  }
  return { days: parsed, source: 'CONFIGURED', configuredRaw };
}

export interface PromotionalGrantFields {
  readonly userId: string;
  readonly source: typeof PROMOTIONAL_GRANT_SOURCE;
  readonly tier: typeof PROMOTIONAL_GRANT_TIER;
  readonly status: 'active';
  readonly startsAt: Date;
  readonly endsAt: Date;
  /**
   * NULL, and deliberately. `issuedByUserId` names the PERSON who issued a support or pilot grant
   * through the admin route. No person issues a promotional grant — the server does, on the
   * strength of a configured allowlist — and naming the recipient here would attribute the grant to
   * the very account it entitles. The `reason` carries the provenance instead.
   */
  readonly issuedByUserId: null;
  readonly reason: string;
}

/**
 * Build the grant a promotional registration creates.
 *
 * THE REASON STRING CARRIES PROVENANCE AND NO SECRET. It names the mechanism, the configured
 * duration and how that duration was resolved. It does NOT contain the promo code: the code is the
 * credential that authorised the grant, and writing a credential into a durable, queryable,
 * exportable row is how credentials leak into backups and support tooling.
 */
export function buildPromotionalGrant(
  userId: string,
  now: Date = new Date(),
  env: NodeJS.ProcessEnv = process.env,
): { fields: PromotionalGrantFields; duration: PromotionalGrantDuration } {
  const duration = promotionalGrantDuration(env);
  return {
    duration,
    fields: {
      userId,
      source: PROMOTIONAL_GRANT_SOURCE,
      tier: PROMOTIONAL_GRANT_TIER,
      status: 'active',
      startsAt: new Date(now.getTime()),
      endsAt: new Date(now.getTime() + duration.days * DAY_MS),
      issuedByUserId: null,
      reason: `Promotional pilot access granted at registration by server-configured allowlist. `
        + `${duration.days} day(s), resolved ${duration.source}. `
        + `Bounded and revocable; confers tier ${PROMOTIONAL_GRANT_TIER} and no administrative authority.`,
    },
  };
}
