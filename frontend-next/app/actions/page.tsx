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

const priorityOptions = ["Critical", "High", "Medium", "Low"] as const;

function getPriorityRank(priority?: string) {
  if (priority === "Critical") return 0;
  if (priority === "High") return 1;
  if (priority === "Medium") return 2;
  if (priority === "Low") return 3;
  return 4;
}

function parseLocalDate(value?: string) {
  if (!value) return null;

  const dateOnlyMatch = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isActionOverdue(action: ActionItem) {
  if (String(action.status || "").toLowerCase() === "completed") return false;
  if (!action.due) return false;

  const due = parseLocalDate(action.due);
  if (!due) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return due.getTime() < today.getTime();
}

function getStatusTone(action: ActionItem) {
  const status = String(action.status || "");

  if (status === "Completed") return "Completed";
  if (status === "Blocked") return "Blocked";
  if (isActionOverdue(action)) return "Overdue";
  if (status === "In Progress") return "In Progress";
  return "Open";
}

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
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);

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

  const actions = useMemo(() => {
    const combined = [...manualActions, ...reportActions];

    return combined
      .filter((action) => {
        const matchesStatus = !filterStatus || getStatusTone(action) === filterStatus || action.status === filterStatus;
        const matchesPriority = !filterPriority || action.priority === filterPriority;
        const matchesSource = !filterSource || action.source === filterSource;
        const matchesOverdue = !filterOverdueOnly || isActionOverdue(action);

        return matchesStatus && matchesPriority && matchesSource && matchesOverdue;
      })
      .sort((a, b) => {
        const statusDelta =
          (isActionOverdue(b) ? 1 : 0) - (isActionOverdue(a) ? 1 : 0);

        if (statusDelta !== 0) return statusDelta;

        const priorityDelta =
          getPriorityRank(a.priority) - getPriorityRank(b.priority);

        if (priorityDelta !== 0) return priorityDelta;

        const aDue = a.due ? parseLocalDate(a.due)?.getTime() || Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
        const bDue = b.due ? parseLocalDate(b.due)?.getTime() || Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;

        return aDue - bDue;
      });
  }, [
    manualActions,
    reportActions,
    filterStatus,
    filterPriority,
    filterSource,
    filterOverdueOnly,
  ]);

  const actionSummary = useMemo(() => {
    const combined = [...manualActions, ...reportActions];

    return {
      total: combined.length,
      open: combined.filter((action) => action.status !== "Completed").length,
      overdue: combined.filter(isActionOverdue).length,
      blocked: combined.filter((action) => action.status === "Blocked").length,
    };
  }, [manualActions, reportActions]);

  const sourceOptions = useMemo(() => {
    return Array.from(
      new Set([...manualActions, ...reportActions].map((action) => action.source).filter(Boolean)),
    );
  }, [manualActions, reportActions]);

  function clearFilters() {
    setFilterStatus("");
    setFilterPriority("");
    setFilterSource("");
    setFilterOverdueOnly(false);
  }

  async function updateStoredActionStatus(actionId: string, status: string) {
    const nextActions = manualActions.map((action) =>
      action.id === actionId ? { ...action, status } : action
    );

    setManualActions(nextActions);
    await saveStoredActions(nextActions);

    const updatedAction = nextActions.find((action) => action.id === actionId);

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
              {priorityOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
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

      <section className="grid gap-3 sm:grid-cols-4">
        {[
          [String(actionSummary.total), "Total"],
          [String(actionSummary.open), "Open"],
          [String(actionSummary.overdue), "Overdue"],
          [String(actionSummary.blocked), "Blocked"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
          >
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="mt-1 text-xs font-black uppercase tracking-wide text-[#1D72B8]">
              {label}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 outline-none"
          >
            <option value="">Status: All</option>
            {["Open", "In Progress", "Blocked", "Completed", "Overdue"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(event) => setFilterPriority(event.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 outline-none"
          >
            <option value="">Priority: All</option>
            {priorityOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={filterSource}
            onChange={(event) => setFilterSource(event.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 outline-none"
          >
            <option value="">Source: All</option>
            {sourceOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setFilterOverdueOnly((current) => !current)}
            className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
              filterOverdueOnly
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Overdue Only
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </section>

      <section className="border-y border-slate-200">
        {actions.length ? (
          actions.map((action, index) => {
            const storedAction = manualActions.some((manualAction) => manualAction.id === action.id);
            const statusTone = getStatusTone(action);

            return (
              <OperationalRow
                key={action.id || `${action.title}-${index}`}
                title={action.title}
                subtitle={action.findingTitle || action.location || "Workspace action"}
                metadata={[
                  action.location || "Workspace",
                  `Due: ${action.due || "Not set"}`,
                  `Status: ${statusTone}`,
                  `Source: ${action.source}`,
                  `Priority: ${action.priority}`,
                ]}
                actions={
                  storedAction ? (
                    <select
                      value={action.status}
                      onChange={(event) => updateStoredActionStatus(action.id, event.target.value)}
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
            title={manualActions.length || reportActions.length ? "No corrective actions match the current filters." : "No corrective actions available yet."}
            description={manualActions.length || reportActions.length ? "Clear filters to view all corrective actions." : "Actions created manually or generated from reports will appear here."}
          />
        )}
      </section>
    </section>
  );
}
