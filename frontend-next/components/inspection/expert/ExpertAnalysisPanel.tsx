"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EXPERT_ANALYSIS_ERROR,
  ExpertApiError,
  expertIdempotencyKey,
  expertSettlementKey,
  readExpertAnalysis,
  requestExpertAnalysis,
  settleExpertAnalysis,
} from "@/lib/expert/expertApi";
import {
  historyEntryLabel,
  presentExpertAnalysis,
  readFromExecution,
  type ExpertPresentation,
  type ExpertTone,
} from "@/lib/expert/expertPresentation";
import type { ExpertAnalysisRead } from "@/lib/expert/expertTypes";
import {
  expertKnownNotEntitled,
  recordExpertEntitled,
  recordExpertNotEntitled,
} from "@/lib/expert/expertEntitlement";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import ExpertConfirmationCard from "./ExpertConfirmationCard";

/**
 * §265 — THE EXPERT WORKFLOW, AS ONE PANEL INSIDE THE EXISTING HAZLENZ STEP.
 *
 * ---------------------------------------------------------------------------------------------
 * IT IS ADDITIVE. THE DETERMINISTIC PATH IS UNTOUCHED.
 *
 * Deterministic HazLenz remains the customer-authoritative analysis, and nothing on this panel
 * replaces, hides or reinterprets it. Expert is a second opinion the inspector may ask for on the
 * observation they have already recorded, presented alongside. `saveAnalysisSnapshot` is not used
 * here and must not be: that is the legacy client-supplied path, and routing a server-authored
 * Expert result through it would hand the client authorship of the thing that makes Expert
 * trustworthy.
 *
 * ---------------------------------------------------------------------------------------------
 * IT HOLDS NO OPINION ABOUT AUTHORITY.
 *
 * Everything it renders comes from `presentExpertAnalysis`, which copies the server's own
 * `settledForUse`, `confirmationRequired` and `confirmationSubject` rather than deriving them. The
 * one thing this component decides for itself is when to ask the server again.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE PREVIOUS RESULT IS DROPPED THE MOMENT A NEW RUN STARTS.
 *
 * §265 forbids showing a fabricated partial result merely because the client still holds an older
 * analysis. So `analysis` is set to null before the request goes out, and the running state renders
 * nothing but its own message. A stale result shown during a re-run is the most plausible way this
 * interface could tell an inspector something that is no longer true.
 */

const TONE_CLASS: Record<ExpertTone, string> = {
  neutral: "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60",
  info: "border-sky-200 bg-sky-50 dark:border-sky-900/50 dark:bg-sky-950/30",
  attention: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
  settled: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30",
  problem: "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30",
};

export type ExpertAnalysisPanelProps = {
  observationId: string;
  /** The inspector's own task/area note, carried as a source. Never as a conclusion. */
  taskContext?: string;
};

export default function ExpertAnalysisPanel({
  observationId, taskContext,
}: ExpertAnalysisPanelProps) {
  const [read, setRead] = useState<ExpertAnalysisRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [settling, setSettling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settlementError, setSettlementError] = useState<string | null>(null);
  // §284 (S-15). Seeded from the refusal the SERVER has already given this session, so walking a
  // dozen observations does not re-ask a settled question on every one. It can only ever start
  // true from a real refusal inside its window -- never from a plan claim, and never towards
  // availability. See `lib/expert/expertEntitlement.ts`.
  const [notEntitled, setNotEntitled] = useState(() => expertKnownNotEntitled());
  const [showTrace, setShowTrace] = useState(false);
  // Incremented ONLY when the inspector deliberately asks again after a failure, so an accidental
  // second click reuses the key and resolves to the execution that already ran.
  const attempt = useRef(0);
  const settlementAttempt = useRef(0);

  const refresh = useCallback(async () => {
    // §284 (S-15). The server has refused this session and the refusal has not expired. Asking
    // again would produce the same 402, the same denial audit row and the same screen.
    if (expertKnownNotEntitled()) {
      setNotEntitled(true);
      return;
    }
    try {
      setRead(await readExpertAnalysis(observationId));
      // A SUCCESS clears any held refusal. This is the shape an upgrade takes when it reaches
      // this surface, and it is the only thing that may clear the memo early.
      recordExpertEntitled();
      setError(null);
    } catch (caught) {
      if (caught instanceof ExpertApiError
        && caught.code === EXPERT_ANALYSIS_ERROR.NOT_ENTITLED) {
        recordExpertNotEntitled();
        setNotEntitled(true);
        return;
      }
      // A failed READ is a failure to learn the state, and it is reported as exactly that. It is
      // never allowed to render as "no analysis" -- the panel would then be asserting an absence
      // it does not know about.
      setError(caught instanceof Error ? caught.message : "The analysis state could not be read.");
    }
  }, [observationId]);

  // `loading` starts true and is only ever cleared in the fetch's continuation, so nothing is set
  // synchronously inside the effect. The panel is mounted with `key={observationId}`, so moving to
  // a different observation remounts it rather than needing a second "start loading again"
  // transition, and the `active` flag drops a response that arrives after unmount.
  //
  // The React Compiler rule fires on ANY state write reached from an effect, including one in an
  // async continuation. Reading the current Expert state on mount is exactly what the effect is
  // for -- §265 requires the interface to recover authority from the server rather than from a
  // cached copy -- so the write is deliberate and is disabled here with its reason rather than
  // restructured into something less direct.
  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh().finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh]);

  const runAnalysis = useCallback(async () => {
    setRunning(true);
    setError(null);
    // DROP THE PREVIOUS RESULT FIRST. See the header: a result from an earlier run must not be on
    // screen while a new one is in flight.
    setRead(null);
    try {
      // §267. NO `requestVersion`. This call previously hardcoded 1, which collided with the
      // deterministic analysis that must already exist for this panel to be rendered at all --
      // after a provider leg had been spent. The server allocates the execution version.
      const executed = await requestExpertAnalysis(observationId, {
        idempotencyKey: expertIdempotencyKey(observationId, attempt.current),
        taskContext,
      });
      // Render what the execution returned immediately -- it is the only surface on which
      // ANALYSIS_FAILED exists -- then reconcile with the read, which is the durable state.
      setRead(readFromExecution(executed));
      recordExpertEntitled();
      if (executed.analysisId !== null) await refresh();
    } catch (caught) {
      if (caught instanceof ExpertApiError
        && caught.code === EXPERT_ANALYSIS_ERROR.NOT_ENTITLED) {
        recordExpertNotEntitled();
        setNotEntitled(true);
      } else {
        attempt.current += 1;
        setError(caught instanceof Error
          ? caught.message
          : "The Expert analysis could not be started.");
      }
      await refresh();
    } finally {
      setRunning(false);
    }
  }, [observationId, refresh, taskContext]);

  const settle = useCallback(async (input: {
    decision: "classification_confirmed" | "classification_changed";
    rationale: string;
    replacements: Array<{ refKind: string; ref: string; classification: string }>;
  }) => {
    if (!read?.analysisId) return;
    setSettling(true);
    setSettlementError(null);
    try {
      await settleExpertAnalysis(observationId, read.analysisId, {
        idempotencyKey: expertSettlementKey(read.analysisId, settlementAttempt.current),
        decision: input.decision,
        rationale: input.rationale,
        replacements: input.replacements,
      });
      // THE AUTHORITATIVE STATE IS RE-READ RATHER THAN PATCHED LOCALLY. Editing the held response
      // into a confirmed shape would be the browser asserting a settlement it did not perform.
      await refresh();
    } catch (caught) {
      settlementAttempt.current += 1;
      setSettlementError(caught instanceof Error
        ? caught.message
        : "Your decision could not be recorded.");
      await refresh();
    } finally {
      setSettling(false);
    }
  }, [observationId, read, refresh]);

  /**
   * §284 (S-15) — HAZLENZ EXPERT, PRESENTED AS A PAID CAPABILITY THIS ACCOUNT DOES NOT HAVE.
   *
   * THE DECISION IT IMPLEMENTS: a non-entitled account must never be shown an ENABLED Expert
   * action, and the capability is not hidden either. §281 measured the previous state — the
   * server's billing sentence in a red `role="alert"`, beside a live "Run Expert review" button
   * that could only ever be refused. That is the shape this replaces.
   *
   * THE THREE THINGS IT DELIBERATELY DOES NOT DO.
   *
   *   It does not fake availability. There is no disabled-looking control that might be pressed,
   *   no "try it", and no preview of an analysis that was never produced.
   *
   *   It does not present the refusal as a fault. `role="alert"` and error colour are for
   *   something going wrong. A plan boundary is the product working, and it is written as one.
   *
   *   It does not overstate what the inspector loses. The sentence that matters most on this
   *   screen is that the deterministic HazLenz analysis above is unaffected — because it is, it is
   *   the customer-authoritative one, and an inspector must not be left thinking their analysis is
   *   degraded because a second opinion is not included.
   *
   * The destination is `/upgrade`, which already exists and is where the workspace's own
   * "HazLenz AI analysis is available on the Pro plan" card sends people. No new route, and no new
   * pricing copy that could drift from `components/pricing/planData.ts`.
   */
  if (notEntitled) {
    return (
      <section
        aria-label="Expert analysis"
        data-testid="expert-not-entitled"
        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#1D72B8]">
          HazLenz Expert review
        </p>
        <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100">
          Available with Pro
        </h3>
        <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
          Expert review is a second opinion on an observation you have already recorded: it reasons
          over the whole observation and returns its own hazards, controls and operational posture
          for a person to confirm or change.
        </p>
        {/* THE LINE THAT MATTERS MOST ON THIS SCREEN. See the header. */}
        <p className="mt-2 text-sm font-black text-slate-800 dark:text-slate-200">
          Your HazLenz analysis above is unaffected and is the analysis this inspection uses.
        </p>
        <AppLinkButton
          href="/upgrade"
          variant="accent"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-center !text-white"
        >
          See Pro
        </AppLinkButton>
      </section>
    );
  }

  const presentation: ExpertPresentation = presentExpertAnalysis(running ? null : read);
  const showRunButton = !running && (presentation.view === "ABSENT" || presentation.view === "FAILED");

  return (
    <section
      aria-label="Expert analysis"
      data-testid="expert-analysis-panel"
      className={`rounded-2xl border p-4 ${TONE_CLASS[presentation.tone]}`}
    >
      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#1D72B8]">
        HazLenz Expert review
      </p>

      {loading && !running ? (
        <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Checking whether an Expert review has been run…
        </p>
      ) : running ? (
        /* THE RUNNING STATE RENDERS NOTHING ELSE. No hazards, no posture, no previous result. */
        <div className="mt-2" role="status" aria-live="polite">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
            HazLenz Expert is analysing this observation
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            This takes longer than the standard analysis because it reasons over the whole
            observation. Nothing is shown until it finishes.
          </p>
        </div>
      ) : (
        <>
          <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100">
            {presentation.headline}
          </h3>
          {/* The server's sentence about authority, verbatim. */}
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-800 dark:text-slate-200">
            {presentation.statement}
          </p>

          {error && (
            <p role="alert" className="mt-3 rounded-lg border border-red-300 bg-red-50 p-2 text-xs font-black text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100">
              {error}
            </p>
          )}

          {presentation.posture && (
            <div className="mt-4 rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400">
                Operational posture
                {/* THE QUALIFIER IS NOT OPTIONAL. An unsettled posture is never shown bare. */}
                {!presentation.mayPresentAsSettled && " — not yet settled"}
              </p>
              <p className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
                {presentation.posture.label}
              </p>
              {presentation.posture.whatHappensNow && (
                <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {presentation.posture.whatHappensNow}
                </p>
              )}
              {!presentation.mayPresentAsSettled && (
                <p className="mt-2 text-xs font-black text-amber-800 dark:text-amber-300">
                  This is what HazLenz proposed. It is not a settled conclusion and should not be
                  acted on as one until the decision below is recorded.
                </p>
              )}
            </div>
          )}

          {presentation.offerSettlementControls && read && (
            <div className="mt-4">
              <ExpertConfirmationCard
                read={read}
                busy={settling}
                error={settlementError}
                onSettle={settle}
              />
            </div>
          )}

          {presentation.reviewerChanges.length > 0 && (
            <div className="mt-4 rounded-xl border border-emerald-300 bg-white p-3 dark:border-emerald-800 dark:bg-slate-900">
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-800 dark:text-emerald-300">
                Your decision replaced HazLenz&rsquo;s
              </p>
              {presentation.reviewerChanges.map((change) => (
                <div key={change.subject} className="mt-2">
                  <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {change.subject}
                  </p>
                  {/* BOTH SIDES, ALWAYS, so the human value is never attributed to HazLenz. */}
                  <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    HazLenz proposed: {change.hazLenzProposed}
                  </p>
                  <p className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                    Your decision: {change.reviewerDecided}
                  </p>
                </div>
              ))}
            </div>
          )}

          {presentation.hazards.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                What Expert identified
              </h4>
              <ul className="mt-2 space-y-2">
                {presentation.hazards.map((hazard) => (
                  <li key={hazard.title + hazard.reasoning} className="rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {hazard.title}
                    </p>
                    {hazard.reasoning && (
                      <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {hazard.reasoning}
                      </p>
                    )}
                    {hazard.quotes.map((quote) => (
                      <p key={quote} className="mt-1 border-l-2 border-slate-300 pl-2 text-xs font-semibold italic text-slate-600 dark:border-slate-600 dark:text-slate-400">
                        “{quote}”
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {presentation.controls.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Controls Expert says are required
              </h4>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {presentation.controls.map((control) => (
                  <li key={control.control} className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {control.control}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {presentation.unresolved.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-white p-3 dark:border-amber-800 dark:bg-slate-900">
              <h4 className="text-sm font-black text-amber-900 dark:text-amber-200">
                Still unresolved
              </h4>
              <ul className="mt-2 space-y-2">
                {presentation.unresolved.map((item) => (
                  <li key={item.id || item.missingFact}>
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {item.missingFact}
                    </p>
                    {item.whyItMattersNow && (
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Why it matters now: {item.whyItMattersNow}
                      </p>
                    )}
                    {item.whatToDoMeanwhile && (
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Until it is resolved: {item.whatToDoMeanwhile}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {presentation.uncertainty.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Expert noted uncertainty about
              </h4>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {presentation.uncertainty.map((statement) => (
                  <li key={statement} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {statement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {presentation.containedRefusalCount > 0 && (
            <p className="mt-4 text-xs font-bold text-slate-700 dark:text-slate-300">
              {presentation.containedRefusalCount === 1
                ? "One stated fact could not be used, so it is not shown as a finding."
                : `${presentation.containedRefusalCount} stated facts could not be used, so they are `
                  + "not shown as findings."}
            </p>
          )}

          {(presentation.view === "REFUSED" || presentation.view === "FAILED"
            || presentation.view === "UNRESOLVED") && (
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Your deterministic HazLenz analysis above is unaffected. You can review what you
              recorded, add anything that is missing, and run the Expert review again.
            </p>
          )}

          {showRunButton && (
            <button
              type="button"
              className="mt-4 min-h-11 rounded-lg bg-[#1D72B8] px-5 text-sm font-black text-white"
              onClick={() => void runAnalysis()}
            >
              {presentation.view === "FAILED" ? "Try the Expert review again" : "Run Expert review"}
            </button>
          )}

          {!showRunButton && presentation.view !== "RUNNING" && (
            <button
              type="button"
              className="mt-4 min-h-11 rounded-lg border border-slate-400 px-5 text-sm font-black text-slate-800 dark:text-slate-200"
              onClick={() => { attempt.current += 1; void runAnalysis(); }}
            >
              Run Expert review again
            </button>
          )}

          {/* PROVENANCE IS A DETAILS SURFACE, NEVER THE HEADLINE. §265 forbids the candidate hash
              as primary UX; it belongs where someone auditing a decision can find it. */}
          {(read?.provenance || read?.history?.length) && (
            <div className="mt-4 border-t border-slate-300 pt-3 dark:border-slate-700">
              <button
                type="button"
                aria-expanded={showTrace}
                className="text-xs font-black text-slate-700 underline dark:text-slate-300"
                onClick={() => setShowTrace((open) => !open)}
              >
                {showTrace ? "Hide analysis record" : "Show analysis record"}
              </button>
              {showTrace && (
                <div className="mt-2 space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {read?.provenance?.completedAt && (
                    <p>Completed {new Date(read.provenance.completedAt).toLocaleString()}</p>
                  )}
                  {read?.provenance?.candidateIdentity && (
                    <p className="break-all">
                      Analysis engine build {read.provenance.candidateIdentity.slice(0, 12)}
                    </p>
                  )}
                  {read?.settlement && (
                    <p>
                      Decision recorded {new Date(read.settlement.reviewedAt).toLocaleString()} —
                      &ldquo;{read.settlement.rationale}&rdquo;
                    </p>
                  )}
                  {(read?.history ?? []).length > 0 && (
                    <ul className="list-disc space-y-1 pl-5">
                      {read!.history.map((entry) => (
                        <li key={entry.analysisId}>
                          {historyEntryLabel(entry)} — {new Date(entry.createdAt).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
