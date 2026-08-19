# P1-02 / P1-03 — Standards Data Model Trace

## Pipeline: finding → citation → stored content → API → frontend

1. **Citation decision** — pure rule matching, no DB text lookup at match time: `backend/src/safescope-v2/inspection-intelligence/standard-applicability.rules.ts` (regex/evidence rules) → `standard-applicability.service.ts` (evaluates rules against evidence, produces `matchedRules`/`evaluationResults`) → `inspection-citation-ranking.service.ts` / `inspection-citation-recovery.service.ts` (rank/recover citation *strings* only). Confirmed via source inspection: none of these three files perform a `Repository`/`.query(` call — they only manipulate citation/title strings already known to the rules.
2. **Content storage** — `standards_master` table (`backend/src/standards/entities/standard.entity.ts`), columns `citation`, `title`, `standard_text`, `plain_language_summary`. Populated by two paths, both non-verbatim:
   - `backend/src/safescope-v2/standards/safescope-standards.seed.ts` — hand-typed condensed paraphrases.
   - `backend/src/standards/seed/sync-standards-intelligence-to-master.ts:75-81` — `standardText(record) { return record.plainLanguageSummary || record.title || 'Standard intelligence metadata for ' + record.citation; }` — by its own name and fallback chain, explicitly derived from a summary field, never CFR/MSHA source text.
3. **API response** — `POST /safescope-v2/classify` returns `standardDecisions[]` (citation/title/standardText/status/rationale) and `standardApplicability.matchedRules[]` (citation/standardTitle only, no text). Live-verified: for a real machine-guarding observation, `standardDecisions[0]` came back with `title: null, standardText: null` for this request (`finalStandardRankingHydrated: false` in the same response) — the DB-hydration step that would attach `standards_master` content did not run for this call. Separately, `GET /standards/match` (`backend/src/standards/standards.controller.ts`) returns `standards_master` rows directly including `standardText`/`plainLanguageSummary`, confirmed present and populated for both example citations below.
4. **Frontend render** — `frontend-next/lib/inspection/standardDisplay.ts:getStandardDisplayText()` (pre-fix) unconditionally labeled any non-empty `standard.standardText`/`regulatoryText`/`regulationText`/`fullText` as `"Official standard text"`. Render site: `frontend-next/components/inspection/SafeScopeStandardsSection.tsx` — citation was a static, non-interactive `<p>` (confirmed live: no href, no click handler, no navigation on click, matching the prior audit's accessibility-tree finding of a `generic` role).

## Genuine verbatim-text infrastructure — present in code, not reachable in the live data path

- `backend/src/regulatory/entities/regulatory-section.entity.ts` (`RegulatorySection`, field `textPlain`) is fed by `regulatory-sync.service.ts`. **Live-verified in this phase's disposable database** (`test_p1_20260816`, all 35 migrations applied): `SELECT count(*) FROM regulatory_section` → `ERROR: relation "regulatory_section" does not exist`. No migration in the repository creates this table — it is registered as a TypeORM entity but has never been provisioned. This pipeline is not merely "disconnected," it is schema-absent.
- `backend/src/safescope-knowledge/` ingestion connectors (`msha-30-cfr.connector.ts`, `osha-ecfr.connector.ts`) can fetch real government XML when run, but the **seeded** `safescope_knowledge_documents`/`chunks` (8 rows, live-queried) contain HazLenz-authored "Starter Reference" guidance text, not verbatim regulatory text — confirmed by reading a live row: `rawText` for "Machine Guarding Hazard Recognition Starter Reference" begins *"Machine guarding hazards are indicated when moving machine parts such as conveyor pulleys, belts, chains..."* — authored guidance, not CFR/MSHA copy. `GET /regulatory/*` is called by zero frontend code paths (repo-wide grep, excluding `.next` build output).

**Conclusion: no verbatim regulatory text is reachable anywhere in this application's current live data path**, for either OSHA or MSHA content. `standardText` (however labeled) is a paraphrase everywhere it is populated.

## Concrete examples (live database query, `test_p1_20260816`)

**OSHA** — `1910.219`:
- `title`: "Mechanical power-transmission apparatus"
- `standard_text` / `plain_language_summary`: *"Mechanical power-transmission equipment such as belts, pulleys, shafts, gears, and sprockets must be guarded where employee exposure exists."*
- Classification: **CURATED_SUMMARY / GENERATED_PARAPHRASE** — a single condensing sentence, not the multi-subpart CFR guarding specifications (belt widths, height thresholds, specific pulley/gear guard requirements) in the actual 29 CFR 1910.219.

**MSHA** — `30 CFR 56.14107(a)`:
- `title`: "Moving machine parts"
- `standard_text` / `plain_language_summary`: *"Moving machine parts must be guarded when they can contact miners or create contact, pinch-point, entanglement, or caught-in exposure."*
- Classification: **CURATED_SUMMARY / GENERATED_PARAPHRASE** — reworded relative to the actual 30 CFR 56.14107(a) regulatory sentence structure and omits regulatory qualifiers.

Both were live-verified end to end in this phase: seeded into the disposable DB by `seed:safescope-standards`, retrieved via direct `psql` query, and rendered through the actual (fixed) `SafeScopeStandardsSection` component in a live browser session — see `P1_STANDARDS_BROWSER_VERIFICATION.md`.
