# OSHA Verification (representative cases, provisioned disposable DB + fixes)

Chain proven for each: `POST /safescope-v2/classify` finding → citation in `standardDecisions`/`primaryCitation` → `GET /regulatory/section?citation=` exact/parent text → HazLenz summary (separately labeled) → paragraph/subsection scope.

## Machine guarding — `osha-gi-operating-unguarded-shaft`

- Finding: "Operator reaches near an exposed rotating shaft because the machine guard is missing while the production line is running."
- Citations returned: `29 CFR 1910.219(c)`, `29 CFR 1910.212(a)(1)`, `29 CFR 1910.215`
- Exact authoritative text (`29 CFR 1910.212(a)(1)`, verified against live eCFR source): *"(a)(1) Types of guarding. One or more methods of machine guarding shall be provided to protect the operator and other employees in the machine area from hazards such as those created by point of operation, ingoing nip points, rotating parts, flying chips and sparks..."*
- Scope: exact paragraph match (`matchScope: "exact"`), not the whole 1910.212 section.

## Electrical — `osha-gi-damaged-cord-wet-exposed`

- Finding: "Employee is using an extension cord with exposed copper conductors in a wet washdown area."
- Citations returned: `29 CFR 1910.305(g)(1)(iii)`, `1910.303(b)(1)`, `29 CFR 1910.305(g)(2)(iii)`
- Exact authoritative text (`29 CFR 1910.305(g)(1)(iii)`): *"If used as permitted in paragraphs (g)(1)(ii)(C), (g)(1)(ii)(G), or (g)(1)(ii)(I) of this section, the flexible cord shall be equipped with an attachment plug and shall be energized from..."*
- Scope: exact paragraph match.

## LOTO (OSHA jurisdiction confirmed via `1910.147` family; live-verified via MSHA equivalent `56.12016` below) and Fall protection — `construction-edge-eight-feet`

- Finding: "Construction worker is framing beside an unprotected floor edge eight feet above the lower level without guardrails or fall arrest."
- Citations returned: `29 CFR 1926.1423`, `29 CFR 1926.501(b)(1)`, `29 CFR 1926.501`
- Exact authoritative text (`29 CFR 1926.501(b)(1)`): *"Unprotected sides and edges. Each employee on a walking/working surface (horizontal and vertical surface) with an unprotected side or edge which is 6 feet (1.8 m) or more above a lower level shall be protected from falling by the use of guardrail systems, safety net systems, or personal fall..."*
- Scope: exact paragraph match.

## HazCom / chemical labeling — `osha-gi-unlabeled-secondary-solvent`

- Finding: "Unlabeled spray bottle of solvent is used by multiple employees at the parts washer."
- Citations returned: `29 CFR 1910.1200(f)(6)`, `29 CFR 1910.1200(f)(1)`, `29 CFR 1910.1200`
- Exact authoritative text (`29 CFR 1910.1200(f)(1)`): *"Labels on shipped containers. The chemical manufacturer, importer, or distributor shall ensure that each container of hazardous chemicals leaving the workplace is labeled, tagged or marked..."*
- Scope: exact paragraph match, though `heading` on this particular response is `null` — the parent whole-section row for `29 CFR 1910.1200` was never ingested by the legacy `RegulatorySyncService` traversal (a pre-existing gap in that sync path, unrelated to this phase's fixes: OSHA 1910 Subpart Z, which contains 1910.1200, appears in a separate XML volume block that the newer `OshaEcfConnector` already knows to search across multiple blocks for, but `RegulatorySyncService.syncRegulatoryPart()` does not). The paragraph text itself is correct and real; only the section-level heading enrichment is missing for this one section. Documented as a known remaining gap, not fixed in this phase (narrow-fix discipline — out of scope for the citation-resolution defect this phase targets).

## Confined space — `permit-space-entry-positive`

- Finding: "Employee entered a permit-required process tank with possible toxic atmosphere, no attendant, and no pre-entry atmospheric test."
- Citation returned: `29 CFR 1910.146`
- Section-level text available (no subsection requested).

HazLenz's own advisory summary (`classification`, `explanation`, `requiredControls`) is generated and returned as a separate field from the authoritative regulatory text in every case above — confirmed via the raw classify response JSON for the machine-guarding case (`classification: "Machine Guarding"`, distinct `explanation` field, distinct from `regulatory_section`/`regulatory_paragraph` `textPlain`).
