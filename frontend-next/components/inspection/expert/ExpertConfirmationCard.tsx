"use client";

import { useState } from "react";
import { classificationLabel, subjectDisplayText } from "@/lib/expert/expertPresentation";
import type { ExpertAnalysisRead } from "@/lib/expert/expertTypes";

/**
 * §265 — THE ONE DECISION A REVIEWER IS ASKED TO MAKE.
 *
 * ---------------------------------------------------------------------------------------------
 * THE QUESTION IS THE SERVER'S. THIS COMPONENT ONLY ASKS IT.
 *
 * Every element of the question comes from the response: which entries need settling
 * (`confirmationSubject.entries`), what HazLenz claimed about each (`expertClassification`), and
 * the two values an answer may take (`answerOptions`). Nothing here decides whether confirmation
 * is required, works out what is being confirmed, or knows the vocabulary in advance. If the
 * server stopped sending `answerOptions`, this card would offer no answers rather than fall back
 * on a hardcoded pair — which is the correct failure, because a client-held vocabulary that drifts
 * from the server's is a reviewer answering a question in words the server will reject or, worse,
 * misread.
 *
 * ---------------------------------------------------------------------------------------------
 * IT IS ONE CARD, NOT A WIZARD.
 *
 * §265 is explicit: the reviewer must not be walked through the inspection again. What HazLenz
 * concluded, why this needs them, the unresolved fact it turns on, and two buttons. A rationale is
 * required for both outcomes, because the server requires one for both — a confirmation is a
 * person putting their name to "work may continue on this basis", and the ten-character floor is
 * the existing material-risk precedent rather than a new rule invented here.
 *
 * ---------------------------------------------------------------------------------------------
 * THE OVERRIDE CANNOT REACH ANYTHING ELSE.
 *
 * The change control is a radio group over the server's two values, per subject entry. There is no
 * free-text classification, no JSON editor, no way to touch a hazard, a citation, a control, a
 * declaration or any provenance field — not because those are hidden, but because this component
 * has no input that produces them and the settlement body has no field to carry them.
 */

const RATIONALE_MINIMUM = 10;

export type ExpertConfirmationCardProps = {
  read: ExpertAnalysisRead;
  busy: boolean;
  error: string | null;
  onSettle: (input: {
    decision: "classification_confirmed" | "classification_changed";
    rationale: string;
    replacements: Array<{ refKind: string; ref: string; classification: string }>;
  }) => void;
};

export default function ExpertConfirmationCard({
  read, busy, error, onSettle,
}: ExpertConfirmationCardProps) {
  const subject = read.confirmationSubject;
  const [mode, setMode] = useState<"idle" | "confirm" | "change">("idle");
  const [rationale, setRationale] = useState("");
  // Keyed by `refKind:ref`, the server's own key. Seeded lazily from the server's claim so that a
  // reviewer who opens the change form and submits without touching a radio is refused by the
  // server's REPLACEMENT_CHANGES_NOTHING rule rather than silently recording a false disagreement.
  const [choices, setChoices] = useState<Record<string, string>>({});

  if (!subject) return null;

  if (!subject.resolvable) {
    return (
      <section
        aria-label="Confirmation unavailable"
        className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30"
      >
        <h3 className="text-base font-black text-amber-900 dark:text-amber-100">
          This analysis needs a decision that cannot be recorded right now
        </h3>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-amber-900 dark:text-amber-100">
          {subject.statement}
        </p>
      </section>
    );
  }

  const rationaleTooShort = rationale.trim().length < RATIONALE_MINIMUM;
  const replacements = subject.entries.map((entry) => ({
    refKind: entry.refKind,
    ref: entry.ref,
    classification: choices[`${entry.refKind}:${entry.ref}`] ?? entry.expertClassification,
  }));

  return (
    <section
      aria-label="Expert analysis confirmation"
      data-testid="expert-confirmation-card"
      className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30"
    >
      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-amber-800 dark:text-amber-300">
        Needs your decision
      </p>
      <h3 className="mt-1 text-lg font-black text-amber-950 dark:text-amber-50">
        One classification is not settled until you confirm it
      </h3>
      {/* The server's own sentence about what is being asked. Never paraphrased. */}
      <p className="mt-2 text-sm font-semibold leading-relaxed text-amber-950 dark:text-amber-50">
        {subject.statement}
      </p>

      <ul className="mt-3 space-y-3">
        {subject.entries.map((entry) => {
          const key = `${entry.refKind}:${entry.ref}`;
          return (
            <li key={key} className="rounded-xl border border-amber-300 bg-white p-3 dark:border-amber-800 dark:bg-slate-900">
              <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                {subjectDisplayText(read, entry)}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                HazLenz says: {classificationLabel(entry.expertClassification)}
              </p>

              {mode === "change" && (
                <fieldset className="mt-3 space-y-2">
                  <legend className="text-xs font-black text-slate-900 dark:text-slate-100">
                    Your decision for this item
                  </legend>
                  {/* The vocabulary is the SERVER'S. An empty options list offers no answer rather
                      than falling back to values this file invented. */}
                  {read.answerOptions.map((option) => (
                    <label key={option.value} className="flex items-start gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      <input
                        type="radio"
                        name={key}
                        className="mt-1"
                        checked={(choices[key] ?? entry.expertClassification) === option.value}
                        onChange={() => setChoices((current) => ({ ...current, [key]: option.value }))}
                      />
                      <span>
                        <span className="block font-black">{option.label}</span>
                        {option.detail && (
                          <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {option.detail}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </fieldset>
              )}
            </li>
          );
        })}
      </ul>

      {mode === "idle" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-11 rounded-lg bg-[#1D72B8] px-5 text-sm font-black text-white"
            onClick={() => setMode("confirm")}
          >
            Confirm HazLenz&rsquo;s classification
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg border-2 border-slate-700 px-5 text-sm font-black text-slate-900 dark:border-slate-400 dark:text-slate-100"
            onClick={() => setMode("change")}
          >
            Change it
          </button>
        </div>
      )}

      {mode !== "idle" && (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-black text-slate-900 dark:text-slate-100">
              Why? (required, at least {RATIONALE_MINIMUM} characters)
            </span>
            <textarea
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder={mode === "confirm"
                ? "What you saw that supports this classification"
                : "Why this decides whether work continues, or why it does not"}
            />
          </label>

          {error && (
            <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-2 text-xs font-black text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || rationaleTooShort}
              className="min-h-11 rounded-lg bg-[#1D72B8] px-5 text-sm font-black text-white disabled:opacity-50"
              onClick={() => onSettle({
                decision: mode === "confirm" ? "classification_confirmed" : "classification_changed",
                rationale: rationale.trim(),
                replacements: mode === "change" ? replacements : [],
              })}
            >
              {busy ? "Recording your decision…" : "Record my decision"}
            </button>
            <button
              type="button"
              disabled={busy}
              className="min-h-11 rounded-lg border border-slate-400 px-5 text-sm font-black text-slate-800 dark:text-slate-200"
              onClick={() => { setMode("idle"); setRationale(""); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
