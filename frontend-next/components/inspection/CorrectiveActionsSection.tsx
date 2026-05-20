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

function getActionKey(action: any) {
  return action.title || action.description || JSON.stringify(action);
}

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
      <div className="mb-4 border-b border-slate-200 pb-3">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Corrective Actions
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Select a SafeScope recommendation or enter the action your team will
          assign.
        </p>
      </div>

      <section className="border-b border-slate-200 pb-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900">
              SafeScope Recommendations
            </h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {safeScopeResult?.generatedActions?.length
                ? `${safeScopeResult.generatedActions.length} suggested action(s)`
                : "No recommendations yet"}
            </p>
          </div>
        </div>

        {safeScopeResult?.generatedActions?.length ? (
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {safeScopeResult.generatedActions.map(
              (action: any, index: number) => {
                const actionKey = getActionKey(action);
                const selected = selectedGeneratedActions.some(
                  (selectedAction) =>
                    getActionKey(selectedAction) === actionKey,
                );

                return (
                  <div key={index} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900">
                          {action.title || "SafeScope corrective action"}
                        </p>

                        {!!action.suggestedFixes?.length && (
                          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">
                            {action.suggestedFixes.slice(0, 2).join(" ")}
                          </p>
                        )}

                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {action.priority
                            ? `Priority: ${action.priority}`
                            : "Priority not set"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleGeneratedAction(action)}
                        className={`shrink-0 rounded-lg px-3 py-2 text-xs font-black transition ${
                          selected
                            ? "bg-[#1D72B8] text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {selected ? "Included" : "Include"}
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => useGeneratedAction(action)}
                        className="rounded-lg bg-[#102A43] px-3 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                      >
                        Use as Manual Action
                      </button>

                      {!!action.suggestedFixes?.length && (
                        <details className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                          <summary className="cursor-pointer font-black text-slate-700">
                            Details
                          </summary>
                          <ul className="mt-2 list-disc space-y-1 pl-4">
                            {action.suggestedFixes.map(
                              (fix: string, i: number) => (
                                <li key={i}>{fix}</li>
                              ),
                            )}
                          </ul>
                        </details>
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
            Run SafeScope Review in Step 3 to generate recommended corrective
            actions.
          </p>
        )}
      </section>

      <section className="border-b border-slate-200 py-4">
        <h3 className="text-base font-black text-slate-900">Manual Action</h3>

        <div className="mt-3 grid gap-3">
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
      </section>

      <section className="pt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-base font-black text-slate-900">Added Actions</h3>
          <span className="text-xs font-black text-slate-400">
            {manualActions.length}
          </span>
        </div>

        {!!manualActions.length ? (
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {manualActions.map((action, index) => (
              <div
                key={`${action.title}-${index}`}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900">
                    {action.title}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {action.priority} · Due: {action.due || "Not set"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeManualAction(index)}
                  className="shrink-0 rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
            No manual corrective actions added yet.
          </p>
        )}
      </section>
    </>
  );
}
