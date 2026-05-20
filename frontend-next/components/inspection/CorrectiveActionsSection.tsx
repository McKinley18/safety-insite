type Props = {
  safeScopeResult: any;
  selectedGeneratedActions: any[];
  toggleGeneratedAction: (action: any) => void;

  manualActionTitle: string;
  setManualActionTitle: (value: string) => void;
  manualActionPriority: string;
  setManualActionPriority: (value: string) => void;
  manualActionDue: string;
  setManualActionDue: (value: string) => void;
  manualActions: any[];
  addManualAction: () => void;
  removeManualAction: (index: number) => void;
};

export default function CorrectiveActionsSection({
  safeScopeResult,
  selectedGeneratedActions,
  toggleGeneratedAction,
  manualActionTitle,
  setManualActionTitle,
  manualActionPriority,
  setManualActionPriority,
  manualActionDue,
  setManualActionDue,
  manualActions,
  addManualAction,
  removeManualAction,
}: Props) {
  function useGeneratedAction(action: any) {
    const title =
      action.title ||
      action.description ||
      action.suggestedFixes?.[0] ||
      "Corrective action from SafeScope";

    setManualActionTitle(title);

    if (action.priority) {
      setManualActionPriority(action.priority);
    }
  }

  return (
    <>
      <p className="mb-4 text-sm font-semibold leading-6 text-slate-500">
        Select recommended actions when useful, then add the actual action your
        team will assign and verify.
      </p>

      {safeScopeResult?.generatedActions?.length ? (
        <div className="space-y-3">
          <div>
            <h3 className="font-black text-slate-900">
              SafeScope Recommended Actions
            </h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
              Select any SafeScope action you want included in the final
              finding.
            </p>
          </div>

          {safeScopeResult.generatedActions.map(
            (action: any, index: number) => {
              const actionKey =
                action.title || action.description || JSON.stringify(action);
              const selected = selectedGeneratedActions.some(
                (selectedAction) =>
                  (selectedAction.title ||
                    selectedAction.description ||
                    JSON.stringify(selectedAction)) === actionKey,
              );

              return (
                <div
                  key={index}
                  className={`w-full rounded-2xl border border-slate-200 border-l-4 px-3 py-4 transition ${
                    selected
                      ? "border-l-[#1D72B8] bg-[#E8F4FF]"
                      : "border-l-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleGeneratedAction(action)}
                      className="flex min-w-0 flex-1 gap-3 text-left"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${
                          selected ? "bg-[#1D72B8]" : "bg-white"
                        }`}
                      >
                        {selected ? "✓" : ""}
                      </span>

                      <span className="min-w-0">
                        <span className="block font-black text-slate-900">
                          {action.title || "SafeScope corrective action"}
                        </span>
                        <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
                          Tap the checkbox to include this SafeScope
                          recommendation in the final finding.
                        </span>
                      </span>
                    </button>

                    {action.priority && (
                      <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                        {action.priority}
                      </span>
                    )}
                  </div>

                  {!!action.suggestedFixes?.length && (
                    <ul className="mt-3 list-disc space-y-1 pl-8 text-sm text-slate-700">
                      {action.suggestedFixes.map((fix: string, i: number) => (
                        <li key={i}>{fix}</li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2 pl-8">
                    <button
                      type="button"
                      onClick={() => useGeneratedAction(action)}
                      className="rounded-xl bg-[#102A43] px-3 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                    >
                      Use as manual action
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleGeneratedAction(action)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                    >
                      {selected ? "Remove from report" : "Include in report"}
                    </button>
                  </div>
                </div>
              );
            },
          )}
        </div>
      ) : (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
          Run SafeScope in Step 3 to generate recommended corrective actions.
        </p>
      )}

      <div className="mt-7 border-t border-slate-200 pt-6">
        <h3 className="font-black text-slate-900">
          User-Entered Corrective Action
        </h3>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
          Add the actual corrective action your team will assign, track, and
          verify.
        </p>

        <div className="mt-4 grid gap-3">
          <input
            value={manualActionTitle}
            onChange={(event) => setManualActionTitle(event.target.value)}
            placeholder="Example: Install fixed guard and verify before restart"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={manualActionPriority}
              onChange={(event) => setManualActionPriority(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>

            <input
              type="date"
              value={manualActionDue}
              onChange={(event) => setManualActionDue(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
            />
          </div>

          <button
            type="button"
            onClick={addManualAction}
            className="rounded-xl bg-[#102A43] px-5 py-3 text-sm font-black text-white"
          >
            Add Corrective Action
          </button>
        </div>

        {!!manualActions.length && (
          <div className="mt-4 divide-y divide-slate-200 border-t border-slate-200">
            {manualActions.map((action, index) => (
              <div
                key={`${action.title}-${index}`}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-black text-slate-900">{action.title}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Priority: {action.priority} • Due: {action.due}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeManualAction(index)}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
