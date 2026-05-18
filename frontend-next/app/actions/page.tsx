"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import OperationalRow from "@/components/ui/OperationalRow";
import { getReports } from "@/lib/reportStorage";
import { createActionId, getStoredActions, saveStoredActions } from "@/lib/actionStorage";
import { addActivityEvent } from "@/lib/activityStorage";

type ActionItem = {
  id: string;
  title: string;
  priority: string;
  status: string;
  due?: string;
  source: string;
  location?: string;
  findingTitle?: string;
  createdAt: string;
};

type Report = {
  id?: string;
  createdAt?: string;
  findings?: any[];
};

export default function ActionsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [manualActions, setManualActions] = useState<ActionItem[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [due, setDue] = useState("");

  useEffect(() => {
    async function loadActions() {
      const savedReports = await getReports<Report>();
      setReports(Array.isArray(savedReports) ? savedReports : []);

      const savedManualActions = await getStoredActions();
      setManualActions(savedManualActions);
    }

    loadActions();
  }, []);

  const reportActions = useMemo(() => {
    return reports.flatMap((report) =>
      (report.findings || []).flatMap((finding) =>
        [
          ...(finding.manualActions || []),
          ...(finding.correctiveActions || []),
          ...(finding.safeScopeResult?.generatedActions || []),
        ].map((action: any, actionIndex: number) => ({
          id: action.id || `${report.id || "report"}-${finding.id || finding.hazardCategory || "finding"}-${actionIndex}`,
          title: action.title || action.description || "Corrective action",
          priority: action.priority || "Medium",
          status: action.status || "Open",
          due: action.dueDate || action.due || "",
          source: action.source || (action.generatedBy === "SafeScope" ? "SafeScope" : "User"),
          location: finding.location || "Field Inspection",
          findingTitle:
            finding.hazardCategory ||
            finding.safeScopeResult?.classification ||
            finding.description ||
            "Inspection Finding",
          createdAt: report.createdAt || new Date().toISOString(),
        }))
      )
    );
  }, [reports]);

  const actions = [...manualActions, ...reportActions];

  async function updateManualActionStatus(index: number, status: string) {
    const nextActions = manualActions.map((action, actionIndex) =>
      actionIndex === index ? { ...action, status } : action
    );

    setManualActions(nextActions);
    await saveStoredActions(nextActions);

    const updatedAction = nextActions[index];

    await addActivityEvent({
      type: "Action",
      title: status === "Completed" ? "Corrective action completed" : "Corrective action updated",
      detail: updatedAction?.title || "Action status changed",
    });
  }

  async function addAction() {
    if (!title.trim()) return;

    const nextAction: ActionItem = {
      id: createActionId(),
      title: title.trim(),
      priority,
      status: "Open",
      due,
      source: "User",
      createdAt: new Date().toISOString(),
    } as any;

    const nextActions = [nextAction, ...manualActions];
    setManualActions(nextActions);
    await saveStoredActions(nextActions);

    await addActivityEvent({
      type: "Action",
      title: "Corrective action added",
      detail: nextAction.title,
    });

    setTitle("");
    setPriority("Medium");
    setDue("");
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Corrective Actions"
        description="Track corrective actions created from inspections, SafeScope recommendations, and user-entered work."
      />

      <section className="border-y border-slate-200 py-4">
        <SectionHeader
          eyebrow="Add Action"
          title="Create a corrective action"
          description="Add work that needs to be tracked outside of a finalized report."
        />

        <div className="grid gap-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Describe the corrective action"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#1D72B8]"
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#1D72B8]"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>

            <input
              type="date"
              value={due}
              onChange={(event) => setDue(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#1D72B8]"
            />

            <PrimaryButton
              type="button"
              onClick={addAction}
              className="py-3 text-sm"
            >
              Add Action
            </PrimaryButton>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200">
        {actions.length ? (
          actions.map((action, index) => {
            const isManualAction = index < manualActions.length;
            const isComplete = String(action.status).toLowerCase() === "completed";

            return (
              <OperationalRow
                key={`${action.title}-${index}`}
                title={action.title}
                subtitle={action.findingTitle || action.location || "Workspace action"}
                metadata={[
                  action.location || "Workspace",
                  `Due: ${action.due || "Not set"}`,
                  `Status: ${action.status}`,
                  `Source: ${action.source}`,
                  `Priority: ${action.priority}`,
                ]}
                actions={
                  isManualAction ? (
                    <select
                      value={action.status}
                      onChange={(event) => updateManualActionStatus(index, event.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 outline-none focus:border-[#1D72B8]"
                    >
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Blocked</option>
                      <option>Completed</option>
                    </select>
                  ) : (
                    <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Report-linked
                    </span>
                  )
                }
              />
            );
          })
        ) : (
          <EmptyState
            title="No corrective actions available yet."
            description="Actions created manually or generated from reports will appear here."
          />
        )}
      </section>
    </section>
  );
}
