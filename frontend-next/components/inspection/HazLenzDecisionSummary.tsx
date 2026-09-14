/**
 * §281 (D-040) — THE HAZLENZ RESULT, READ AS A DECISION RATHER THAN AS A RECORD.
 *
 * ==================== THE ORDER, AND WHY IT IS THIS ORDER ====================
 *
 * A safety professional reading a result is answering questions in a fixed order, and the page is
 * laid out in that order rather than in the order the contract happens to declare its fields:
 *
 *   1  What did HazLenz find?            the heading and the flagged fragment (above this panel)
 *   2  Why does it matter?               the finding's conclusion and its risk rationale
 *   3  What information is still missing? IMPORTANT INFORMATION NEEDED  <- this panel leads here
 *   4  Is more than one hazard involved?  the multiple-hazard notice
 *   5  What limits the conclusion?        the confidence limitation
 *   6  What should I do next?             the settling question, or the honest absence of one
 *   7  What rule supports it?             the standards panel (below this one)
 *
 * Question 3 leads because it is the one the product was not answering at all, and because an
 * unknown that controls the decision is worth less at the bottom of a page than anywhere else.
 *
 * ==================== RESOLVED vs NEEDS INFORMATION ====================
 *
 * The distinction is carried by THREE independent signals, because the product owner's constraint
 * is that it must not rest on colour:
 *
 *   - A WORD.   "Important information needed" is a heading, in text, first.
 *   - A SHAPE.  The panel has a left rule and a tinted ground; a resolved result renders no panel
 *               at all, so there is nothing to compare it against and mistake for decoration.
 *   - A COLOUR. Amber, which under the §280 (D-036.3) rule means UNRESOLVED — not error, not
 *               danger. Red is the product's error colour and is deliberately not used here: this
 *               is a state of the analysis, not a fault and not an alarm.
 *
 * A resolved finding gets NO panel. That is the whole point of the distinction — an "Important
 * information needed: none" line on an ordinary finding would make every result look like a
 * problem, which is the failure the product owner named explicitly.
 *
 * ==================== WHAT THIS COMPONENT MUST NOT IMPLY ====================
 *
 * Unresolved does not mean safe. Unresolved does not mean hazardous. Every sentence here is about
 * what HAZLENZ COULD NOT ESTABLISH, never about what the workplace is. The copy says "HazLenz
 * cannot determine" and "has not been established", and never "may be unsafe", "possible hazard"
 * or anything else that would let a reader convert an epistemic gap into a physical claim.
 *
 * It also authors no safety content: every hazard-bearing sentence on screen is the engine's own
 * text, rendered verbatim.
 */
import type { HazLenzDecisionView } from "@/lib/inspection/hazlenzDecisionPresentation";

export function HazLenzDecisionSummary({
  view,
  onAnswer,
  busy,
}: {
  view: HazLenzDecisionView;
  /**
   * Answers the engine's own clarification and re-runs the analysis. The SAME call the confidence
   * disclosure makes — the question is offered in one place, not two. A decision-critical question
   * belongs beside the unknown it settles, so it is served here, and the confidence disclosure no
   * longer repeats it.
   */
  onAnswer?: (questionId: string, answer: string) => void;
  busy?: boolean;
}) {
  const needsInformation = view.resolution === "NEEDS_INFORMATION";
  const settling = view.settlingQuestions.filter((question) => question.decisionCritical);
  const offerable = settling.length > 0 ? settling : view.settlingQuestions;

  return (
    <div className="space-y-3" data-testid="hazlenz-decision-summary" data-resolution={view.resolution}>
      {/* ------------------------------------------------- NO HAZARD IDENTIFIED
          §281. This screen is the one most likely to be read as "all clear", so it is the one that
          has to be most careful. It says what HazLenz DID — it identified no hazard in what was
          recorded — and it says, in the open and not behind a disclosure, that this is not a
          finding that the area is free of hazards.

          Deliberately NOT green and NOT a tick. A confirming colour on an absence of findings is
          exactly the misreading this panel exists to prevent. */}
      {view.resolution === "NO_HAZARD_IDENTIFIED" && (
        <section
          data-testid="hazlenz-no-hazard"
          className="rounded-lg border border-slate-400 bg-white p-3 dark:border-slate-500 dark:bg-slate-900"
        >
          <h3 className="text-sm font-black uppercase tracking-wide">No hazard identified</h3>
          <p className="mt-1 text-sm font-semibold leading-6">
            HazLenz did not identify a hazard in what you recorded for this observation.
          </p>
          <p className="mt-2 text-sm leading-6">
            That is not a finding that the area is free of hazards. It is the limit of what this
            observation describes — if you saw something the words do not cover, add it below or
            revise what you wrote.
          </p>
        </section>
      )}

      {/* ------------------------------------------------- 3. IMPORTANT INFORMATION NEEDED
          Rendered whenever the analysis is short of information — which is EITHER a stated critical
          unknown OR a clarification the engine itself marked decision-critical.

          The first implementation keyed this panel on `criticalUnknowns` alone, and §281's own
          measurement caught the consequence on fixture B: a decision-critical question with no
          stated unknown set the status line to "HazLenz could not establish a fact this conclusion
          depends on" and then never said WHICH fact, or offered the question that would settle it.
          A status line naming a gap the page does not show is worse than showing neither. */}
      {needsInformation && (
        <section
          data-testid="hazlenz-critical-unknowns"
          aria-labelledby="hazlenz-unknowns-heading"
          className="rounded-lg border border-amber-300 border-l-4 border-l-amber-500 bg-amber-50 p-3 text-amber-950 dark:border-amber-500/60 dark:border-l-amber-400 dark:bg-amber-950/30 dark:text-amber-50"
        >
          <h3 id="hazlenz-unknowns-heading" className="text-sm font-black uppercase tracking-wide">
            Important information needed
          </h3>
          {/* States what the ENGINE could not do. Never what the workplace is. */}
          <p className="mt-1 text-sm font-semibold">
            {view.criticalUnknowns.length === 0
              // No stated unknown, but a decision-critical question. The QUESTION is the statement
              // of what is missing, so the panel introduces it rather than inventing a sentence
              // about a gap the engine did not describe.
              ? "HazLenz needs an answer to the following before this conclusion is settled:"
              : view.criticalUnknowns.length === 1
                ? "HazLenz could not establish the following, and it affects this conclusion:"
                : "HazLenz could not establish the following, and they affect this conclusion:"}
          </p>
          {view.criticalUnknowns.length > 0 && (
            <ul className="mt-2 space-y-1.5 text-sm">
              {view.criticalUnknowns.map((unknown) => (
                <li key={unknown} className="leading-6">
                  {unknown}
                </li>
              ))}
            </ul>
          )}

          {/* ------------------------------------------- 6. WHAT SHOULD I DO NEXT?
              The engine's question, with the engine's own options, answered in place. Answering
              re-runs the analysis; nothing here blocks saving the finding, and skipping is always
              allowed — an unknown is information the reviewer may already hold, not a gate. */}
          {offerable.length > 0 && onAnswer ? (
            <div className={view.criticalUnknowns.length > 0
              ? "mt-3 space-y-3 border-t border-amber-300/70 pt-3 dark:border-amber-500/40"
              // With no unknown listed above it, the question IS the content of the panel and a
              // divider would separate it from nothing.
              : "mt-3 space-y-3"}>
              {view.criticalUnknowns.length > 0 && (
                <p className="text-xs font-bold uppercase tracking-wide">What would settle it</p>
              )}
              {offerable.map((question) => (
                <fieldset key={question.id}>
                  <legend className="text-sm font-semibold">{question.question}</legend>
                  {question.reason && <p className="mt-1 text-xs opacity-90">{question.reason}</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(question.options.length ? question.options : ["Yes", "No", "Not sure"]).map((option) => (
                      <button
                        key={option}
                        type="button"
                        disabled={busy}
                        onClick={() => onAnswer(question.id, option)}
                        className="min-h-11 rounded-lg border border-amber-700 bg-white/70 px-4 text-sm font-bold text-amber-950 dark:border-amber-400 dark:bg-transparent dark:text-amber-50"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
              <p className="text-xs opacity-90">
                Answering is optional. Nothing here blocks saving the finding.
              </p>
            </div>
          ) : (
            /*
              No question can settle it. This is a real and different state, and saying so is more
              useful than silence: it tells the inspector that the way forward is a better
              observation rather than an answer they are failing to find on the screen.
            */
            <p className="mt-3 border-t border-amber-300/70 pt-3 text-sm dark:border-amber-500/40">
              There is no question HazLenz can ask that would settle this. Adding the missing detail
              to the observation and reanalyzing is the way to resolve it.
            </p>
          )}
        </section>
      )}

      {/* ------------------------------------------------- 4. MORE THAN ONE HAZARD */}
      {view.multiHazard && (
        <section
          data-testid="hazlenz-multi-hazard"
          className="rounded-lg border border-sky-300 bg-sky-50 p-3 text-sky-950 dark:border-sky-500/60 dark:bg-sky-950/30 dark:text-sky-50"
        >
          <h3 className="text-sm font-black uppercase tracking-wide">More than one safety issue</h3>
          {/* The engine's own instruction, verbatim. No decomposition vocabulary is exposed:
              "multiHazardReview", "requiresSplitReview" and "decomposition" are internal names for
              an idea the inspector already understands as "review them one at a time". */}
          <p className="mt-1 text-sm leading-6">{view.multiHazard.instruction}</p>
        </section>
      )}

      {/* ------------------------------------------------- 5. WHAT LIMITS THIS CONCLUSION */}
      {view.confidenceLimitReason && (
        <section
          data-testid="hazlenz-confidence-limit"
          className="rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900"
        >
          <h3 className="text-sm font-black">What limits this conclusion</h3>
          {/*
            An explanation, not a score. The numeric confidence already has a home on the standard
            itself; repeating a percentage here would turn the safety surface into an AI confidence
            dashboard, which is the thing the product owner asked not to build. This is the one
            sentence that says WHY.
          */}
          <p className="mt-1 text-sm leading-6">{view.confidenceLimitReason}</p>
        </section>
      )}

      {/* ------------------------------------------------- HUMAN CONFIRMATION */}
      {view.awaitingHumanConfirmation && (
        <section
          data-testid="hazlenz-awaiting-confirmation"
          role="status"
          className="rounded-lg border border-slate-400 bg-white p-3 dark:border-slate-500 dark:bg-slate-900"
        >
          <h3 className="text-sm font-black">Needs your confirmation</h3>
          <p className="mt-1 text-sm leading-6">
            HazLenz has reached a conclusion on this observation. It is not recorded as a finding
            until you confirm it.
          </p>
        </section>
      )}

      {/*
        Limitations the engine attached to THIS result. The standing advisory caveat is excluded by
        the projection: it is already at the top of the workspace, and a caveat printed three times
        on one screen is a caveat nobody reads.

        Behind a disclosure because these are qualifying sentences rather than the decision — but
        OPEN BY DEFAULT when the result needs information, because on exactly those results a
        limitation is likely to be the thing the reader most needs.
      */}
      {view.specificLimitations.length > 0 && (
        <details className="guided-subcard" open={needsInformation} data-testid="hazlenz-limitations">
          <summary className="cursor-pointer text-sm font-bold">
            What this assessment does not cover
          </summary>
          <ul className="mt-2 space-y-1.5 text-sm">
            {view.specificLimitations.map((limitation) => (
              <li key={limitation} className="leading-6">
                {limitation}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
