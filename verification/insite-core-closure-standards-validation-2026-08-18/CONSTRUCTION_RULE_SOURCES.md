# Construction (29 CFR 1926) rules added to `evaluate()` on 2026-08-18 — authoritative sources

Each rule below was added to `backend/src/safescope-v2/evidence/evidence-foundation.ts` only after the
regulatory text was fetched from osha.gov (primary source) during this session and read verbatim. The
predicate shapes mirror the existing General Industry / MSHA rules for the same condition. None of these
citations yet has a `standards_master` corpus row (see KNOWLEDGE_FRESHNESS.md item 4); the UI therefore
shows the rule family as the title and states that verbatim text is not locally available.

| Citation | Verified text (osha.gov, 2026-08-18) | Predicates in `evaluate()` |
|---|---|---|
| **29 CFR 1926.59** — Hazard Communication | "The requirements applicable to construction work under this section are identical to those set forth at § 1910.1200 of this chapter." | construction jurisdiction; workplace chemical container; identity or hazard label missing (NOT_APPLICABLE when label compliant). Mirrors the 1910.1200 rule. |
| **29 CFR 1926.52** — Occupational noise exposure | (a) "Protection against the effects of noise exposure shall be provided when the sound levels exceed those shown in Table D-2 of this section when measured on the A-scale of a standard sound level meter at slow response." (b) feasible administrative or engineering controls when exceeded. (d)(1) continuing, effective hearing conservation program where levels exceed the values. Table D-2: 8 hours — 90 dBA. | construction jurisdiction; occupational employee exposure; measured full-shift TWA; **exceeds Table D-2 (90 dBA, 8 h)** (NOT_APPLICABLE at ≤ 90 — construction has no 85 dBA action level; the 1910.95 rule with its 85 dBA threshold stays General Industry only). |
| **29 CFR 1926.416(a)(1)** — Electrical, general requirements | "No employer shall permit an employee to work in such proximity to any part of an electric power circuit that the employee could contact the electric power circuit in the course of work, unless the employee is protected against electric shock by deenergizing the circuit and grounding it or by guarding it effectively by insulation or other means." | construction jurisdiction; employee could contact part of an electric power circuit (exposed conductor/live part fact); circuit not deenergized/grounded or effectively guarded. Mirrors the 1910.303 rule. |
| **29 CFR 1926.300(b)(2)** — Tools, general requirements | "Belts, gears, shafts, pulleys, sprockets, spindles, drums, fly wheels, chains, or other reciprocating, rotating or moving parts of equipment shall be guarded if such parts are exposed to contact by employees or otherwise create a hazard." ((b)(1): power-operated tools designed to accommodate guards shall be equipped with such guards when in use.) | construction jurisdiction; moving part exposed to employee contact; guard absent or ineffective; current condition (NOT_APPLICABLE when guard present and effective). Mirrors the MSHA 56.14107(a) / GI 1910.212 shape. |

Deliberately **not** added (would require further verification / different predicate design, documented as
gaps): construction hazardous-energy control (1926.417 lockout and tagging of circuits; 1926.702(j)),
construction means of egress (1926.34), construction powered industrial trucks/earthmoving (1926.602),
General Industry scaffolds (1910.27 → 1926 subpart L), MSHA noise (30 CFR part 62), MSHA hazcom (part 47),
General Industry powered industrial trucks (1910.178 — the one remaining gold-set miss).

Gold-set cases added for these rules (`standards-gold-set/gold-set-script.ts`, ids CON-HAZCOM-01,
CON-NOISE-01, CON-NOISE-02-NEG, CON-ELEC-01, CON-GUARD-01) use the same sources above as their expected
answers, with the General Industry sibling citation listed as `mustNotReturn`.
