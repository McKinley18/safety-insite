"use client";

type SafeScopeOperationalReasoningProps = {
  safeScopeResult: any;
};

export default function SafeScopeOperationalReasoning({
  safeScopeResult,
}: SafeScopeOperationalReasoningProps) {
  return (
    <>
      {safeScopeResult.operationalReasoning && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Operational Reasoning
          </p>
          <h4 className="mt-1 text-sm font-black text-slate-900">
            Causal chain
          </h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {safeScopeResult.operationalReasoning.reasoningSummary}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Exposure Pathway
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                {safeScopeResult.operationalReasoning.exposurePathways?.[0] ||
                  "Exposure pathway requires confirmation."}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Injury Mechanism
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                {safeScopeResult.operationalReasoning
                  .likelyInjuryMechanisms?.[0] ||
                  "Injury mechanism requires review."}
              </p>
            </div>
          </div>

          {!!safeScopeResult.operationalReasoning.supervisorQuestions?.length && (
            <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Supervisor questions
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600">
                {safeScopeResult.operationalReasoning.supervisorQuestions
                  .slice(0, 4)
                  .map((question: string) => (
                    <li key={question}>{question}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}
