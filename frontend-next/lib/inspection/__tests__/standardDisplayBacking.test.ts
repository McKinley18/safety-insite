/**
 * KG-3C -- presentation contract for the three backing states.
 *
 * Runs with `npx tsx lib/inspection/__tests__/standardDisplayBacking.test.ts` (no test runner is
 * configured in this workspace, so this is a self-checking script rather than a framework suite).
 *
 * Covers what a reviewer would otherwise have to confirm by eye:
 *   - which state earns the "Verified standard text" marker (only the approved one);
 *   - that no customer-facing string leaks governance vocabulary;
 *   - that the citation-only state states unavailability instead of fabricating text;
 *   - that backing is never inferred from a source key.
 */
import {
  getStandardBackingPresentation,
  getStandardDisplayText,
} from "../standardDisplay";

const failures: string[] = [];
function check(condition: unknown, message: string) {
  if (condition) {
    console.log(`ok  ${message}`);
  } else {
    failures.push(message);
    console.error(`FAILED  ${message}`);
  }
}

// The vocabulary that must never reach a customer-facing string.
const INTERNAL_TERMS =
  /reviewer_approved|releaseId|release id|checksum|starter-unverified|corpus|governed|UNAPPROVED|CITATION_ONLY|APPROVED_GOVERNED/i;

// ---------------------------------------------------------------- approved
const approved = getStandardBackingPresentation({
  citation: "29 CFR 1910.212(a)(1)",
  backingStatus: "APPROVED_GOVERNED_CONTENT",
  standardText: "Machines shall be guarded.",
  sourceKey: "osha-ecfr-1910",
});
check(approved.verifiedBadge === "Verified standard text",
  "Approved governed content earns the positive verification marker.");
check(approved.notice === null, "Approved content shows no caution notice.");
check(approved.isApproved === true, "Approved content is flagged approved.");
check(!INTERNAL_TERMS.test(approved.verifiedBadge || ""),
  "The marker text contains no internal governance vocabulary.");

// ---------------------------------------------------------------- unapproved
const unapproved = getStandardBackingPresentation({
  citation: "29 CFR 1910.147",
  backingStatus: "UNAPPROVED_CONTENT",
  plainLanguageSummary: "Energy sources shall be isolated.",
  sourceKey: "osha-ecfr-1910",
});
check(unapproved.verifiedBadge === null,
  "Unapproved content does NOT earn the verification marker -- it is distinguishable from approved.");
check(unapproved.notice === null,
  "Unapproved content carries no blanket warning (it would today appear on every standard: 0 of 26 approved).");
check(unapproved.isApproved === false, "Unapproved content is not flagged approved.");

// Its text is still shown, under an honest label rather than as official regulation.
const unapprovedText = getStandardDisplayText({
  plainLanguageSummary: "Energy sources shall be isolated.",
});
check(unapprovedText.label === "Summary" && unapprovedText.text.length > 0,
  "Unapproved text is still shown, under an honest non-authoritative label.");
// Widened to `string` deliberately. TypeScript can already prove the label union excludes
// "Official standard text" and flags the comparison as impossible (TS2367), but the assertion is
// the runtime guard that would catch someone re-adding that tier to the union, so it is kept and
// the comparison is widened rather than deleted.
check((unapprovedText.label as string) !== "Official standard text",
  "No display tier claims official/authoritative regulatory language (P1 label-integrity contract).");

// ---------------------------------------------------------------- citation only
const citationOnly = getStandardBackingPresentation({
  citation: "29 CFR 1926.1153",
  backingStatus: "CITATION_ONLY",
});
check(citationOnly.verifiedBadge === null, "Citation-only earns no verification marker.");
check(citationOnly.notice === "Verified standard text is not currently available for this citation.",
  "Citation-only states unavailability in product voice.");
check(!INTERNAL_TERMS.test(citationOnly.notice || ""),
  "The citation-only notice contains no internal governance vocabulary.");

// KG-3C closure: real-browser verification showed the Standard Detail panel rendering the
// observation primary's `simplifiedRequirement` under the "HazLenz standard summary" label for a
// CITATION_ONLY citation -- i.e. the match rationale presented as a description of the standard,
// directly above the notice saying no verified text is available. The unit tests missed it because
// they exercised the presentation helpers in isolation, while the offending text arrived from a
// different source than the backing status. The state now says explicitly whether any body-text
// tier may be rendered at all, so a caller cannot decide it from the presence of its own text.
check(citationOnly.allowsContentText === false,
  "Citation-only renders NO body-text tier -- any text a caller still holds describes something other than the standard.");
check(approved.allowsContentText === true,
  "Approved governed content may render its body text.");
check(unapproved.allowsContentText === true,
  "Unapproved content still renders its text under the honest non-authoritative label.");

const emptyText = getStandardDisplayText({});
check(emptyText.label === "Unavailable" &&
  emptyText.text === "Verified standard text is not currently available for this citation.",
  "With no text at all, the display states unavailability rather than fabricating standard text.");
check(!INTERNAL_TERMS.test(emptyText.text),
  "The unavailable-text copy contains no internal governance vocabulary.");

// ---------------------------------------------------------------- the hard gate
const placeholder = getStandardBackingPresentation({
  citation: "1910.36",
  sourceKey: "starter-unverified:osha:1910.36",
  plainLanguageSummary: "Exit routes shall be permanent.",
  backingStatus: "UNAPPROVED_CONTENT",
});
check(placeholder.verifiedBadge === null && placeholder.isApproved === false,
  "HARD GATE: a placeholder-source record is never presented as verified.");

// A payload with a source key but NO backingStatus (a client predating the contract, or any
// caller tempted to infer authority) must not be presented as verified.
const inferredFromSourceKey = getStandardBackingPresentation({
  citation: "1910.36",
  sourceKey: "osha-ecfr-1910",
  standardText: "Some text.",
});
check(inferredFromSourceKey.verifiedBadge === null && inferredFromSourceKey.isApproved === false,
  "Backing is NEVER inferred from the presence of a source key or of text -- only from backingStatus.");

console.log(failures.length
  ? `\nFAILED ${failures.length} check(s).`
  : `\nPASSED all checks.`);
process.exitCode = failures.length ? 1 : 0;
