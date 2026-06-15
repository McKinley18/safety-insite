"use client";

import { useState } from "react";

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
  manualActionClosureEvidence: string;
  setManualActionClosureEvidence: (value: string) => void;
  manualActions: any[];
  addManualAction: () => void;
  removeManualAction: (index: number) => void;
};

function getActionKey(action: any) {
  return action.id || action.title || action.description || JSON.stringify(action);
}

function normalizeFieldOutputActions(safeScopeResult: any) {
  const fieldActions = safeScopeResult?.fieldOutput?.correctiveActions;
  if (!Array.isArray(fieldActions) || !fieldActions.length) {
    return safeScopeResult?.generatedActions || [];
  }

  return fieldActions.map((action: any, index: number) => {
    if (typeof action === "string") {
      return {
        id: `field-output-action-${index}`,
        title: action,
        description: action,
        priority: safeScopeResult?.fieldOutput?.priority || "Medium",
        source: "HazLenz AI field output",
      };
    }

    return {
      ...action,
      id: action.id || `field-output-action-${index}`,
      title: action.title || action.description || action.action || "Corrective action",
      description: action.description || action.title || action.action,
      priority:
        action.priority ||
        safeScopeResult?.fieldOutput?.priority ||
        "Medium",
      source: action.source || "HazLenz AI field output",
    };
  });
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
  manualActionClosureEvidence,
  setManualActionClosureEvidence,
  manualActions,
  addManualAction,
  removeManualAction,
}: Props) {
  const [addActionOpen, setAddActionOpen] = useState(false);
  const generatedActions = normalizeFieldOutputActions(safeScopeResult);

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Corrective Actions
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100">
            Actions for this finding
          </h3>
          <p className="mt-1 text-sm font-semibold leading-5 text-slate-500 dark:text-slate-400">
            Include generated actions or add your own.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddActionOpen((open) => !open)}
          className="shrink-0 rounded-xl bg-[#102A43] px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#1D72B8]"
        >
          {addActionOpen ? "Close" : "+ Add Action"}
        </button>
      </div>

      {!!generatedActions.length && (
        <div className="mt-4 space-y-2">
          {generatedActions.map((action: any, index: number) => {
            const actionKey = getActionKey(action);
            const selected = selectedGeneratedActions.some(
              (selectedAction) => getActionKey(selectedAction) === actionKey,
            );

            return (
              <button
                key={actionKey || index}
                type="button"
                onClick={() => toggleGeneratedAction(action)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                  selected
                    ? "border-[#1D72B8] bg-[#E8F4FF]"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {action.title ||
                        action.description ||
                        action.suggestedFixes?.[0] ||
                        "Corrective action"}
                    </p>

                    {!!action.suggestedFixes?.length && (
                      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                        {action.suggestedFixes.slice(0, 2).join(" • ")}
                      </p>
                    )}

                    {(action.priority || action.assignedRole || action.dueDate) && (
                      <p className="mt-1 text-[11px] font-bold leading-5 text-slate-500 dark:text-slate-400">
                        {[
                          action.priority ? `Priority: ${action.priority}` : "",
                          action.assignedRole ? `Owner: ${action.assignedRole}` : "",
                          action.dueDate ? `Due: ${action.dueDate}` : "",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
                      selected
                        ? "bg-[#1D72B8] text-white"
                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {selected ? "Included" : "Add"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!generatedActions.length && (
        <p className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-3 text-sm font-semibold leading-5 text-slate-500 dark:text-slate-400">
          No generated actions are available yet. Run HazLenz AI or add a custom
          action.
        </p>
      )}

      {!!manualActions.length && (
        <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Added Actions
          </p>

          <div className="mt-2 space-y-2">
            {manualActions.map((action: any, index: number) => (
              <div
                key={`${action.title || "manual-action"}-${index}`}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {action.title || action.description || "Manual action"}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {[
                        action.priority ? `Priority: ${action.priority}` : "",
                        action.due ? `Due: ${action.due}` : "",
                        action.closureEvidence
                          ? `Verify: ${action.closureEvidence}`
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeManualAction(index)}
                    className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {addActionOpen && (
        <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Add Custom Action
          </p>

          <div className="mt-3 space-y-3">
            <input
              value={manualActionTitle}
              onChange={(event) => setManualActionTitle(event.target.value)}
              placeholder="Example: Install fixed guard and verify before restart"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none transition focus:border-[#1D72B8]"
            />

            <div className="grid gap-2 sm:grid-cols-3">
              <select
                value={manualActionPriority}
                onChange={(event) => setManualActionPriority(event.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none transition focus:border-[#1D72B8]"
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
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none transition focus:border-[#1D72B8]"
              />

              <select
                value={manualActionClosureEvidence}
                onChange={(event) =>
                  setManualActionClosureEvidence(event.target.value)
                }
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none transition focus:border-[#1D72B8]"
              >
                <option>Photo</option>
                <option>Work order</option>
                <option>Supervisor verification</option>
                <option>Training record</option>
                <option>Other</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                addManualAction();
                setAddActionOpen(false);
              }}
              className="w-full rounded-xl bg-[#F97316] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#EA580C] active:scale-[0.98]"
            >
              Add Action
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
