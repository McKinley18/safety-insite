/**
 * DETERMINISTIC CONTRASTIVE CORPUS -- machine-guarding applicability precedence (§117).
 *
 * ==================== WHY THIS CORPUS EXISTS ====================
 *
 * §116/D-128 discovered a customer-authoritative defect while deriving the deterministic->Expert
 * projection: `evidence-foundation.ts` computes
 *
 *      notApplicable = guardPresent || energySafe
 *
 * and passes it to `decision()`, which resolves `status` from it BEFORE consulting the predicate
 * statuses. Once `energyIsolationState = isolated_and_verified` is extracted anywhere in the text,
 * OSHA General Industry machine guarding is excluded at confidence 0.96 regardless of every other
 * fact -- including a technician stated to have both hands in the point of operation.
 *
 * ==================== THE REPAIR IS TWO-SIDED AND THAT IS THE POINT ====================
 *
 * The obvious "fix" -- delete `energySafe` -- is FORBIDDEN. §115/D-127 confirmed the `R6` oracle
 * partly ON this predicate: a press under completed, verified, second-person-witnessed lockout with
 * the guard removed genuinely is NOT a current machine-guarding hazard, and the deterministic layer
 * is right to say so. Deleting `energySafe` would fix every recall case and break the one precision
 * case the whole programme has been defending.
 *
 * So every fixture below is scored on BOTH sides at once. `A` and `K`/`L` fail if the repair
 * over-promotes; `B`-`J` fail if it under-recalls. A repair that passes only one side is rejected.
 *
 * ==================== CROSS-FAMILY AND CROSS-JURISDICTION CONTROLS ====================
 *
 * `M`-`P` exist so a repair cannot pass by special-casing OSHA General Industry machine guarding.
 * The MSHA (`56.14107(a)`) and Construction (`1926.300(b)(2)`) guarding rules do NOT carry the
 * `energySafe` term at all, and the LOTO rule (`1910.147`) reads the same isolation fact from the
 * other direction -- all three must be unchanged by this repair.
 */

export type GuardingExpectation =
  /** The machine-guarding family must be excluded. */
  | 'NOT_APPLICABLE'
  /** The machine-guarding family must survive as a live decision (SUPPORTED or UNKNOWN). */
  | 'SURVIVES'
  /** No machine-guarding decision should be emitted at all (no guardState fact). */
  | 'NO_DECISION';

export interface GuardingCase {
  id: string;
  klass: string;
  title: string;
  text: string;
  scope: string;
  /** What the machine-guarding (or family-of-interest) decision must do. */
  expect: GuardingExpectation;
  /** Which regulatory family this case is scored on. */
  family: RegExp;
  /** Why this expectation is correct, in product terms. */
  rationale: string;
  /** True when a wrong answer here is a DANGEROUS false negative rather than mere noise. */
  dangerous: boolean;
  /** Traceability to the frozen Expert corpus, where one exists. */
  mirrors?: string;
}

const GI = 'osha_general_industry';
const MG = /machine guarding/i;

export const GUARDING_APPLICABILITY_CORPUS: readonly GuardingCase[] = [
  // ---------------------------------------------------------------- precision side
  {
    id: 'A', klass: 'VERIFIED_ISOLATION_NO_EXPOSURE', title: 'Exact R6',
    text: 'The press was locked out with the supervisor tag applied and stored energy bled down '
      + 'and verified at zero before the guard was removed, and a second worker verified the isolation.',
    scope: GI, expect: 'NOT_APPLICABLE', family: MG, dangerous: false, mirrors: 'R6',
    rationale: 'THE precision anchor. §115/D-127 confirmed this oracle on four independent surfaces. '
      + 'Verified zero-energy isolation forecloses hazardous motion, and no current exposure is stated. '
      + 'If this promotes, the repair is rejected outright (Terminal B).',
  },
  {
    id: 'K', klass: 'GUARD_PRESENT', title: 'Guard present and effective',
    text: 'The press point-of-operation guard was in place and effective, and the interlock was '
      + 'tested and functioning during the walkthrough.',
    scope: GI, expect: 'NOT_APPLICABLE', family: MG, dangerous: false,
    rationale: 'False-positive control on the OTHER disjunct. `guardPresent` must remain a valid '
      + 'route to non-applicability and must not be collateral damage of a precedence change.',
  },
  {
    id: 'L', klass: 'HISTORICAL_RESOLVED', title: 'Guard was removed, then reinstalled and tested',
    text: 'The conveyor drive guard had been removed for a bearing change last week but was '
      + 'replaced before this inspection, and the guard is now interlocked and tested normal.',
    scope: GI, expect: 'NOT_APPLICABLE', family: MG, dangerous: false,
    rationale: 'False-positive control on currency. A resolved historical removal is not a current '
      + 'hazard, and the repair must not make every mention of a removed guard applicable.',
  },

  // ---------------------------------------------------------------- recall side
  {
    id: 'B', klass: 'WORKER_IN_MACHINE_AREA', title: 'Verified isolation, worker inside the machine area',
    text: 'The press was locked out, tagged, and verified at zero energy, the guard was removed, and '
      + 'a technician is currently working inside the die area of the press.',
    scope: GI, expect: 'SURVIVES', family: MG, dangerous: true,
    rationale: 'The servicing activity itself places a person in the unguarded zone. A control that '
      + 'makes MOTION impossible does not make CONTACT impossible, and the decision must not be '
      + 'excluded merely because an isolation is present.',
  },
  {
    id: 'H', klass: 'POINT_OF_OPERATION_CONTACT', title: 'Hands in the point of operation',
    text: 'The press was locked out, tagged, and verified at zero energy, the guard was '
      + 'removed, and a technician is currently reaching into the point of operation with both hands '
      + 'to clear debris.',
    scope: GI, expect: 'SURVIVES', family: MG, dangerous: true, mirrors: 'V7',
    rationale: 'THE most serious observed false negative. §116 measured NOT_APPLICABLE @ 0.96 on this '
      + 'exact sentence. Explicit, stated, present point-of-operation contact.',
  },
  {
    id: 'C', klass: 'STORED_ENERGY_REMAINS', title: 'Accumulator left charged',
    text: 'The press was locked out with the supervisor tag applied and the guard was removed, but '
      + 'the hydraulic accumulator was left charged and was not bled down.',
    scope: GI, expect: 'SURVIVES', family: MG, dangerous: true, mirrors: 'V2',
    rationale: 'Stored energy remains, so hazardous motion remains possible. The isolation is stated '
      + 'but incomplete, and an incomplete control must not foreclose the family.',
  },
  {
    id: 'D', klass: 'SECOND_SOURCE_LIVE', title: 'Second energy source still connected',
    text: "The press's main electrical disconnect was locked out and tagged and verified at "
      + "zero, but the guard was removed while the press's separate pneumatic clamp circuit remained "
      + 'connected to live shop air.',
    scope: GI, expect: 'SURVIVES', family: MG, dangerous: true, mirrors: 'V4',
    rationale: 'The case where the decision was INTERNALLY CONTRADICTORY pre-repair: NOT_APPLICABLE '
      + 'at 0.96 while all four of its own required predicates read SUPPORTED.',
  },
  {
    id: 'E', klass: 'MERELY_STOPPED', title: 'Turned off at the operator station, no LOTO',
    text: 'The press was turned off at the operator station and the guard was removed to clear a '
      + 'jam, but no lockout or tagout was applied to the machine.',
    scope: GI, expect: 'SURVIVES', family: MG, dangerous: true, mirrors: 'V5',
    rationale: 'Merely stopped is not isolated. Unexpected startup remains possible.',
  },
  {
    id: 'F', klass: 'AUTO_RESTART_CAPABLE', title: 'Automatic power restoration configured',
    text: "The press was locked out and tagged, but the facility's automatic power-restoration "
      + 'system is configured to re-energize circuits without operator action after a momentary '
      + 'outage, and the guard was removed to inspect the ram.',
    scope: GI, expect: 'SURVIVES', family: MG, dangerous: true, mirrors: 'V6',
    rationale: 'A live pathway back to motion exists despite the lockout.',
  },
  {
    id: 'G', klass: 'ISOLATION_NOT_VERIFIED', title: 'Zero energy not yet verified',
    text: 'The press was locked out with the supervisor tag applied and the guard was removed; '
      + 'stored energy has not yet been bled down or verified at zero.',
    scope: GI, expect: 'SURVIVES', family: MG, dangerous: true, mirrors: 'V1',
    rationale: 'A lockout that is not verified is not a verified zero-energy state, and the '
      + 'precision anchor `A` depends on VERIFICATION, not on the word "locked out".',
  },
  {
    id: 'I', klass: 'RE_ENERGIZING_NOW', title: 'Removing the lock to restart, guard still off',
    text: 'The press was locked out with the supervisor tag applied and stored energy bled down and '
      + 'verified at zero before the guard was removed, and a second worker verified the isolation; '
      + 'the operator is now removing the lock and tag to restart the press for production, and the '
      + 'guard has not been reinstalled.',
    scope: GI, expect: 'SURVIVES', family: MG, dangerous: true, mirrors: 'R6-H',
    rationale: 'The transition is STATED as happening now. The isolation is being withdrawn, so the '
      + 'control that justified non-applicability in `A` no longer holds.',
  },
  {
    id: 'J', klass: 'OPERATING_UNGUARDED', title: 'Press running production with the guard off',
    text: 'The press had been locked out earlier for servicing and the guard was removed; the lock '
      + 'and tag have since been removed and the press is now running production parts with the '
      + 'guard still off and the point of operation exposed.',
    scope: GI, expect: 'SURVIVES', family: MG, dangerous: true, mirrors: 'R6-I',
    rationale: 'The textbook 1910.212 violation. A machine in operation with an exposed point of '
      + 'operation. If this is excluded, the engine reports a running unguarded press as safe.',
  },

  // ---------------------------------------------------------------- cross-family / cross-jurisdiction
  {
    id: 'M', klass: 'CROSS_JURISDICTION_MSHA', title: 'MSHA guarding, verified isolation present',
    text: 'The conveyor tail pulley guard was removed and the drive was locked out and verified at '
      + 'zero before the millwright began work at the pulley.',
    scope: 'msha', expect: 'NO_DECISION', family: MG, dangerous: false,
    rationale: 'Scored on the OSHA GI family, which must not be emitted under MSHA jurisdiction. '
      + 'The MSHA guarding rule (56.14107(a)) has no `energySafe` term and must be untouched.',
  },
  {
    id: 'N', klass: 'CROSS_FAMILY_LOTO', title: 'LOTO reads the same isolation fact',
    text: 'A technician is servicing the press and hazardous energy has not been isolated or locked out.',
    scope: GI, expect: 'SURVIVES', family: /hazardous energy control/i, dangerous: true,
    rationale: '1910.147 consumes `energyIsolationState` from the other direction. This repair must '
      + 'not disturb it -- the §2026-08-18 negation-aware extraction regression depends on it.',
  },
  {
    id: 'O', klass: 'CROSS_FAMILY_ELECTRICAL', title: 'Live parts with verified isolation stated',
    text: 'A live, exposed electrical conductor in the panel is reachable and has not been '
      + 'deenergized or isolated.',
    scope: GI, expect: 'SURVIVES', family: /live electrical parts/i, dangerous: true,
    rationale: 'The 1910.303 rule also reads `isolated_and_verified`. Collateral-damage control.',
  },
  {
    id: 'P', klass: 'NO_GUARD_FACT', title: 'No guarding fact in the observation at all',
    text: 'An extension cord ran through standing water to a sump pump while a worker reached into '
      + 'the pump housing to clear a blockage.',
    scope: GI, expect: 'NO_DECISION', family: MG, dangerous: false,
    rationale: 'The guarding rule is gated on a `guardState` fact existing. No fact, no decision -- '
      + 'the repair must not start manufacturing guarding decisions from nothing.',
  },
];
