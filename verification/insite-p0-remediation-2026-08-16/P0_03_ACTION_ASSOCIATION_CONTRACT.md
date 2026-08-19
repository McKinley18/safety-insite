# P0-03 — Corrective Action Association Contract

## Contract

For every generated corrective action: action → one explicit finding → one hazard context → evidence attributable to that finding. Sibling-finding context must not be used unless the action is intentionally cross-cutting and explicitly represented as such (no such case exists in the current generators).

## Implementation (backend/src/safescope-v2/safescope-v2.service.ts)

Three narrow, targeted changes, all confined to `buildEnhancedGeneratedActions()` and its single call site (~line 1815). No classification, risk, or recognition logic was touched.

1. **Call-site evidence scoping**: the call site now passes the raw, single-request `text` (with two synthetic-template artifacts stripped — see #3) instead of the cross-turn-fused `fusedText`, for this function only. Classification (`this.classifier.classify(fusedText)`) and risk evaluation continue to use `fusedText` unchanged, above and unaffected by this edit.
2. **Machine-guarding priority branch added**: a new branch in both the title ternary (`domainActionTitle`) and the body-pattern function (`domainCorrectiveActionPatterns`), gated on the already-computed `hasMachineGuardingContext` plus explicit missing/unguarded-guard language, positioned ahead of the hazardous-energy (LOTO) branches so an observation mentioning both a missing guard and a LOTO defect correctly produces guarding-specific content for a machine-guarding finding.
3. **Synthetic-template stripping**: the composed `"Hazard category: <label>\n..."` preamble line (a pre-classification hint, not evidence) and unfilled `"Location: No location provided"` / `"Evidence notes: No evidence notes provided"` placeholder lines are stripped from the text before Generator C's keyword matching, so its regexes see only the reviewer's actual observed-condition text.

## Explicitly preserved

- `CorrectiveActionBrainService` (Generator B / P1-02) — untouched, byte-identical.
- `ActionEngineService` (Generator A) — untouched.
- The generator-priority order itself (`domainActionTitle || dca... || correctiveActionReasoning... || primary.title`) — unchanged; Generator C still wins when its *own* correctly-scoped matches fire (e.g. a genuine electrical or LOTO finding), it simply no longer matches on contamination.
- No new parsing architecture was introduced — the fix works entirely within the existing regex-branch structure.

## Verified against 4 live scenarios (see `P0_REGRESSION.md` and `P0_BROWSER_VERIFICATION.md` for full detail)

| Scenario | Pre-fix | Post-fix |
|---|---|---|
| Machine Guarding, full contaminated text | "Verify hazardous-energy isolation before servicing" (wrong) | "Install or restore a fixed guard over the moving part" (correct) |
| Walking/Working Surfaces, isolated fragment | "Provide edge fall protection" (wrong) | "Control walking-surface exposure" (correct) |
| Electrical (regression check) | "Control electrical exposure" | "Control electrical exposure" — unchanged |
| Genuine LOTO-only (regression check) | "Verify hazardous-energy isolation before servicing" | "Verify hazardous-energy isolation before servicing" — unchanged |
| Genuine Fall Protection (regression check) | "Provide edge fall protection" | "Provide edge fall protection" — unchanged |
