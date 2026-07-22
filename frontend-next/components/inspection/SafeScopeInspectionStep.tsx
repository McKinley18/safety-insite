"use client";

import { hazardCategoryOptions } from "@/lib/inspection/inspectionConstants";

import { Skeleton } from "@/components/ui/Skeleton";
import SafeScopeControlsSection from "@/components/inspection/SafeScopeControlsSection";
import SafeScopeReasoningPanel from "@/components/inspection/SafeScopeReasoningPanel";
import SafeScopeResultHeaderSection from "@/components/inspection/SafeScopeResultHeaderSection";
import SafeScopePrimaryDecisionSection from "@/components/inspection/SafeScopePrimaryDecisionSection";
import SafeScopeStandardsSection from "@/components/inspection/SafeScopeStandardsSection";
import SafeScopeSupportingIntelligenceSection from "@/components/inspection/SafeScopeSupportingIntelligenceSection";
import SafeScopeKnowledgeBrainSection from "@/components/inspection/SafeScopeKnowledgeBrainSection";
import SafeScopeEquipmentReasoningSection from "@/components/inspection/SafeScopeEquipmentReasoningSection";
import type {
  HazLenzClarificationAnswerInput,
  StructuredObservationInput,
} from "@/lib/safescope";

type ToggleSetter = (updater: (open: boolean) => boolean) => void;

type SafeScopeInspectionStepProps = {
  safeScopeHelpOpen: boolean;
  setSafeScopeHelpOpen: ToggleSetter;
  agencyMode: string;
  riskProfileId: "standard_5x5" | "simple_4x4" | "advanced_6x6";
  handleRunSafeScope: (
    forceOffline?: boolean,
    structuredObservation?: StructuredObservationInput,
    clarificationAnswers?: HazLenzClarificationAnswerInput[],
  ) => void;
  safeScopeStatus: string;
  safeScopeResult: any;
  hazLenzClarificationAnswers: HazLenzClarificationAnswerInput[];
  setHazLenzClarificationAnswers: (answers: HazLenzClarificationAnswerInput[]) => void;
  setIsOfflineMode?: (value: boolean) => void;
  hazardCategory: string;
  setHazardCategory: (value: string) => void;
  submitSafeScopeValidation: (
    decision:
      | "accepted"
      | "modified"
      | "rejected"
      | "escalated"
      | "insufficient_evidence",
  ) => Promise<void>;
  safeScopeCompactDetailsOpen: boolean;
  setSafeScopeCompactDetailsOpen: ToggleSetter;
  safeScopeAdvancedOpen: boolean;
  setSafeScopeAdvancedOpen: ToggleSetter;
  feedbackNotes: string;
  setFeedbackNotes: any;
  selectedStandards: string[];
  getStandardKey: (standard: any) => string;
  toggleSelectedStandard: (standard: any) => void;
  handleFeedback: (
    standard: any,
    action: "accepted" | "rejected" | "flagged",
  ) => Promise<void>;
  safeScopeDetailsOpen: boolean;
  setSafeScopeDetailsOpen: ToggleSetter;
  safeScopeStandardsOpen: boolean;
  setSafeScopeStandardsOpen: ToggleSetter;
};

export default function SafeScopeInspectionStep({
  safeScopeHelpOpen,
  setSafeScopeHelpOpen,
  agencyMode,
  riskProfileId,
  handleRunSafeScope,
  safeScopeStatus,
  safeScopeResult,
  hazLenzClarificationAnswers,
  setHazLenzClarificationAnswers,
  setIsOfflineMode,
  hazardCategory,
  setHazardCategory,
  submitSafeScopeValidation,
  safeScopeCompactDetailsOpen,
  setSafeScopeCompactDetailsOpen,
  safeScopeAdvancedOpen,
  setSafeScopeAdvancedOpen,
  feedbackNotes,
  setFeedbackNotes,
  selectedStandards,
  getStandardKey,
  toggleSelectedStandard,
  handleFeedback,
  safeScopeDetailsOpen,
  setSafeScopeDetailsOpen,
  safeScopeStandardsOpen,
  setSafeScopeStandardsOpen,
}: SafeScopeInspectionStepProps) {
  const answerFor = (questionId: string) =>
    hazLenzClarificationAnswers.find((answer) => answer.questionId === questionId);

  const updateAnswer = (
    question: any,
    patch: Partial<HazLenzClarificationAnswerInput>,
  ) => {
    const questionId = String(question?.id || question?.question || "").trim();
    if (!questionId) return;
    const nextAnswer: HazLenzClarificationAnswerInput = {
      questionId,
      answeredAt: new Date().toISOString(),
      ...patch,
    };
    const existingIndex = hazLenzClarificationAnswers.findIndex(
      (answer) => answer.questionId === questionId,
    );
    const nextAnswers =
      existingIndex >= 0
        ? hazLenzClarificationAnswers.map((answer, index) =>
            index === existingIndex ? { ...answer, ...nextAnswer } : answer,
          )
        : [...hazLenzClarificationAnswers, nextAnswer];
    setHazLenzClarificationAnswers(nextAnswers);
  };

  const toggleMultiOption = (question: any, option: string) => {
    const current = answerFor(String(question?.id || question?.question || ""));
    const selected = new Set(current?.selectedOptions || []);
    if (selected.has(option)) selected.delete(option);
    else selected.add(option);
    updateAnswer(question, { selectedOptions: Array.from(selected), value: undefined, answer: undefined });
  };

  const renderClarificationAnswerControl = (question: any) => {
    const questionId = String(question?.id || question?.question || "");
    const answer = answerFor(questionId);
    const options = Array.isArray(question?.options) && question.options.length
      ? question.options
      : question?.answerType === "yes-no"
        ? ["Yes", "No", "Not sure"]
        : [];
    const chipClass = (selected: boolean) =>
      [
        "rounded-xl border px-3 py-2 text-[11px] font-black transition active:scale-95",
        selected
          ? "border-amber-700 bg-amber-700 text-white dark:border-amber-300 dark:bg-amber-300 dark:text-slate-950"
          : "border-amber-300 bg-white text-amber-900 dark:border-amber-800 dark:bg-slate-950 dark:text-amber-100",
      ].join(" ");

    if (question?.answerType === "multi-select") {
      return (
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((option: string) => {
            const selected = Boolean(answer?.selectedOptions?.includes(option));
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleMultiOption(question, option)}
                className={chipClass(selected)}
              >
                {option}
              </button>
            );
          })}
        </div>
      );
    }

    if (question?.answerType === "number") {
      return (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="decimal"
            value={typeof answer?.value === "number" || typeof answer?.value === "string" ? answer.value : ""}
            onChange={(event) => updateAnswer(question, { value: event.target.value, unit: answer?.unit || "ft" })}
            className="min-h-11 w-28 rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 dark:border-amber-800 dark:bg-slate-950 dark:text-slate-100"
            aria-label={question.question}
          />
          <select
            value={answer?.unit || "ft"}
            onChange={(event) => updateAnswer(question, { value: answer?.value || "", unit: event.target.value })}
            className="min-h-11 rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 dark:border-amber-800 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="ft">ft</option>
            <option value="in">in</option>
            <option value="m">m</option>
          </select>
          <button
            type="button"
            onClick={() => updateAnswer(question, { value: "Not sure", answer: "Not sure" })}
            className={chipClass(answer?.value === "Not sure" || answer?.answer === "Not sure")}
          >
            Not sure
          </button>
        </div>
      );
    }

    if (options.length) {
      return (
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((option: string) => {
            const selected = answer?.value === option || answer?.answer === option || answer?.selectedOptions?.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => updateAnswer(question, { value: option, answer: option, selectedOptions: [option] })}
                className={chipClass(Boolean(selected))}
              >
                {option}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={String(answer?.value || answer?.answer || "")}
          onChange={(event) => updateAnswer(question, { value: event.target.value, answer: event.target.value })}
          className="min-h-11 flex-1 rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 dark:border-amber-800 dark:bg-slate-950 dark:text-slate-100"
          aria-label={question.question}
        />
        <button
          type="button"
          onClick={() => updateAnswer(question, { value: "Not sure", answer: "Not sure" })}
          className={chipClass(answer?.value === "Not sure" || answer?.answer === "Not sure")}
        >
          Not sure
        </button>
      </div>
    );
  };

  return (
    <>

      <SafeScopeControlsSection
        safeScopeHelpOpen={safeScopeHelpOpen}
        setSafeScopeHelpOpen={setSafeScopeHelpOpen}
        agencyMode={agencyMode}
        riskProfileId={riskProfileId}
        handleRunSafeScope={handleRunSafeScope}
        safeScopeStatus={safeScopeStatus}
        safeScopeResult={safeScopeResult}
      />

      {safeScopeStatus && !safeScopeResult && safeScopeStatus.includes("Running") && (
        <div className="mb-2 border-y border-slate-200 dark:border-slate-800 py-3 space-y-2">
           <Skeleton className="h-8 w-1/3" />
           <Skeleton className="h-24 w-full" />
           <Skeleton className="h-32 w-full" />
        </div>
      )}

      {safeScopeStatus && !safeScopeResult && !safeScopeStatus.includes("Running") && (
        <div className="mb-2 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 p-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-wide text-red-800 dark:text-red-400">
                HazLenz AI Review Unavailable
              </p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-red-700 dark:text-red-300">
                HazLenz AI intelligence is unavailable. Continue documenting the finding and review before relying on automated guidance.
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-700 dark:text-white">
                Details: {safeScopeStatus}
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (setIsOfflineMode) {
                      setIsOfflineMode(true);
                    }
                    handleRunSafeScope(true);
                  }}
                  className="rounded-xl bg-slate-900 text-white dark:bg-slate-900 dark:text-slate-100 px-3 py-1.5 text-xs font-black shadow transition active:scale-95 cursor-pointer"
                >
                  Use Offline Review
                </button>
                
                <button
                  type="button"
                  onClick={() => handleRunSafeScope(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-xs font-black shadow transition active:scale-95 cursor-pointer"
                >
                  Retry HazLenz AI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {safeScopeResult && (
        <div className="mb-2 border-y border-slate-200 dark:border-slate-800 py-2">
          <SafeScopeResultHeaderSection
            safeScopeResult={safeScopeResult}
            submitSafeScopeValidation={submitSafeScopeValidation}
          />

          <SafeScopePrimaryDecisionSection safeScopeResult={safeScopeResult} />

          <SafeScopeEquipmentReasoningSection safeScopeResult={safeScopeResult} />

          {Array.isArray(safeScopeResult?.clarifyingQuestions) && safeScopeResult.clarifyingQuestions.length > 0 && (
            <div className="mb-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-800 dark:text-amber-300">
                Follow-up questions
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-amber-900 dark:text-amber-100">
                HazLenz needs these facts before treating the result as final.
              </p>
              <ul className="mt-2 space-y-2">
                {safeScopeResult.clarifyingQuestions.slice(0, 4).map((question: any) => (
                  <li key={question.id || question.question} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold leading-5 text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100">
                    <span className="font-black">{question.question}</span>
                    {question.priority && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-800 dark:bg-amber-900/50 dark:text-amber-100">
                        {question.priority}
                      </span>
                    )}
                    {question.reason && (
                      <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        {question.reason}
                      </span>
                    )}
                    {renderClarificationAnswerControl(question)}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRunSafeScope(
                    false,
                    safeScopeResult?.structuredObservation,
                    hazLenzClarificationAnswers,
                  )}
                  disabled={!hazLenzClarificationAnswers.length || safeScopeStatus.includes("Running")}
                  className="rounded-xl bg-amber-700 px-3 py-2 text-xs font-black text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:bg-amber-300 disabled:text-amber-900 dark:bg-amber-300 dark:text-slate-950 dark:disabled:bg-amber-900/40 dark:disabled:text-amber-200"
                >
                  Update HazLenz Review
                </button>
                <p className="text-[11px] font-semibold text-amber-900 dark:text-amber-100">
                  Answers are saved with this finding and used as structured evidence.
                </p>
              </div>
            </div>
          )}

          {Array.isArray(safeScopeResult?.evidenceUsed) && safeScopeResult.evidenceUsed.length > 0 && (
            <details className="mb-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
                Evidence used
              </summary>
              <ul className="mt-2 space-y-2">
                {safeScopeResult.evidenceUsed.slice(0, 8).map((item: any) => (
                  <li key={`${item.source}-${item.fact}`} className="text-xs font-semibold leading-5 text-slate-700 dark:text-slate-200">
                    <span className="font-black">{item.fact}</span>{" "}
                    <span className="text-slate-500 dark:text-slate-400">({item.source})</span>
                    {item.effect && <span className="block">{item.effect}</span>}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="mb-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
                  Hazard Category
                </p>
                <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">
                  {hazardCategory || safeScopeResult?.classification || "Let HazLenz AI suggest"}
                </p>
              </div>

              {safeScopeResult?.classification && !hazardCategory && (
                <button
                  type="button"
                  onClick={() => setHazardCategory(safeScopeResult.classification || "")}
                  className="shrink-0 rounded-xl bg-[#E8F4FF] px-3 py-2 text-[11px] font-black text-[#1D72B8]"
                >
                  Use Suggestion
                </button>
              )}
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Change category
              </summary>

              <select
                value={hazardCategory}
                onChange={(event) => setHazardCategory(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none transition focus:border-[#1D72B8]"
              >
                <option value="">Use HazLenz AI suggestion</option>
                {hazardCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <input
                value={hazardCategory}
                onChange={(event) => setHazardCategory(event.target.value)}
                placeholder="Or enter custom category"
                className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none transition focus:border-[#1D72B8] focus:bg-white dark:focus:bg-slate-900"
              />
            </details>
          </div>

          <SafeScopeReasoningPanel
            safeScopeResult={safeScopeResult}
            safeScopeCompactDetailsOpen={safeScopeCompactDetailsOpen}
            setSafeScopeCompactDetailsOpen={setSafeScopeCompactDetailsOpen}
            safeScopeAdvancedOpen={safeScopeAdvancedOpen}
            setSafeScopeAdvancedOpen={setSafeScopeAdvancedOpen}
          />

        </div>
      )}

      <SafeScopeStandardsSection
        safeScopeResult={safeScopeResult}
        feedbackNotes={feedbackNotes}
        setFeedbackNotes={setFeedbackNotes}
        selectedStandards={selectedStandards}
        getStandardKey={getStandardKey}
        toggleSelectedStandard={toggleSelectedStandard}
        handleFeedback={handleFeedback}
        safeScopeStandardsOpen={safeScopeStandardsOpen}
        setSafeScopeStandardsOpen={setSafeScopeStandardsOpen}
      />

      <SafeScopeSupportingIntelligenceSection
        safeScopeResult={safeScopeResult}
        safeScopeDetailsOpen={safeScopeDetailsOpen}
        setSafeScopeDetailsOpen={setSafeScopeDetailsOpen}
      />
    </>
  );
}
