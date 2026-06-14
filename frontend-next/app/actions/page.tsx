"use client";

import { useEffect, useMemo, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput, AppSelect } from "@/components/ui/AppInput";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import OperationalRow from "@/components/ui/OperationalRow";
import { getReports } from "@/lib/reportStorage";
import { createActionId, getStoredActions, saveStoredActions } from "@/lib/actionStorage";
import { addActivityEvent } from "@/lib/activityStorage";
import { fetchCloudActions, updateCloudActionStatus } from "@/lib/cloudActions";
import {
  getStoredPlanCode,
  hasPlanEntitlement,
  type PlanCode,
} from "@/lib/planEntitlements";

type ActionItem = {
  id: string;
  title: string;
  priority: string;
  status: string;
  due?: string;
  source: string;
  storageSource?: "local" | "report" | "cloud";
  backendActionId?: string;
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
  if (status === "In Progress") return "In Progress";
  if (isActionOverdue(action)) return "Overdue";
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
  const [cloudActions, setCloudActions] = useState<ActionItem[]>([]);
  const [cloudActionStatus, setCloudActionStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [cloudActionMessage, setCloudActionMessage] = useState("");
  const [planCode, setPlanCode] = useState<PlanCode>("basic");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [due, setDue] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);

  const canUseWorkspaceActions = hasPlanEntitlement("correctiveActionAssignments", planCode);

  useEffect(() => {
    async function loadActions() {
      const storedPlan = getStoredPlanCode();
      const workspaceActionsAllowed = hasPlanEntitlement(
        "correctiveActionAssignments",
        storedPlan,
      );

      setPlanCode(storedPlan);

      const savedReports = await getReports<Report>();
      setReports(Array.isArray(savedReports) ? savedReports : []);

      const savedManualActions = await getStoredActions();
      setManualActions(savedManualActions);

      if (!workspaceActionsAllowed) {
        setCloudActions([]);
        setCloudActionStatus("idle");
        setCloudActionMessage("");
        return;
      }

      try {
        setCloudActionStatus("loading");
        setCloudActionMessage("Loading workspace corrective actions...");
        const workspaceActions = await fetchCloudActions();
        setCloudActions(workspaceActions);
        setCloudActionStatus("loaded");
        setCloudActionMessage(
          workspaceActions.length
            ? `${workspaceActions.length} workspace action(s) synced.`
            : "No workspace actions found.",
        );
      } catch (error) {
        setCloudActionStatus("error");
        setCloudActionMessage(
          error instanceof Error
            ? error.message
            : "Workspace corrective actions could not be loaded.",
        );
      }
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
          backendActionId: action.backendActionId,
          displayId: action.displayId,
          reportId: action.reportId || report.id,
          findingId: action.findingId || finding.id,
          description: action.description,
          storageSource: "report" as const,
        }))
      )
    );
  }, [reports]);

  const actions = useMemo(() => {
    const combined = [...cloudActions, ...manualActions, ...reportActions];

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
    cloudActions,
    manualActions,
    reportActions,
    filterStatus,
    filterPriority,
    filterSource,
    filterOverdueOnly,
  ]);

  const actionSummary = useMemo(() => {
    const combined = [...cloudActions, ...manualActions, ...reportActions];

    return {
      total: combined.length,
      open: combined.filter((action) => action.status !== "Completed").length,
      overdue: combined.filter(isActionOverdue).length,
      blocked: combined.filter((action) => action.status === "Blocked").length,
    };
  }, [cloudActions, manualActions, reportActions]);

  const sourceOptions = useMemo(() => {
    return Array.from(
      new Set([...cloudActions, ...manualActions, ...reportActions].map((action) => action.source).filter(Boolean)),
    );
  }, [cloudActions, manualActions, reportActions]);

  function clearFilters() {
    setFilterStatus("");
    setFilterPriority("");
    setFilterSource("");
    setFilterOverdueOnly(false);
  }

  async function updateStoredActionStatus(actionId: string, status: string) {
    const cloudAction = cloudActions.find(
      (action) => action.id === actionId || action.backendActionId === actionId,
    );

    if (cloudAction?.backendActionId) {
      const optimistic = cloudActions.map((action) =>
        action.backendActionId === cloudAction.backendActionId
          ? { ...action, status }
          : action,
      );
      setCloudActions(optimistic);

      try {
        const updated = await updateCloudActionStatus(cloudAction.backendActionId, status);
        setCloudActions((current) =>
          current.map((action) =>
            action.backendActionId === cloudAction.backendActionId
              ? {
                  ...action,
                  ...updated,
                  storageSource: "cloud" as const,
                }
              : action,
          ),
        );
      } catch (error) {
        setCloudActions(cloudActions);
        setCloudActionStatus("error");
        setCloudActionMessage(
          error instanceof Error
            ? error.message
            : "Workspace action status could not be updated.",
        );
      }

      await addActivityEvent({
        type: "Action",
        title: status === "Completed" ? "Workspace corrective action completed" : "Workspace corrective action updated",
        detail: cloudAction.title || "Action status changed",
      });

      return;
    }

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
    <section className="sentinel-page-shell space-y-6">
      <HeroPanel align="center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Corrective Actions
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">
          Track corrective work.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Manage actions created from inspections, SafeScope recommendations, reports, and user-entered work.
        </p>

        <div className="mx-auto mt-4 grid max-w-3xl grid-cols-2 justify-center gap-2 sm:grid-cols-4">
          {[
            [String(actionSummary.total), "Total"],
            [String(actionSummary.open), "Open"],
            [String(actionSummary.overdue), "Overdue"],
            [String(actionSummary.blocked), "Blocked"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center shadow-sm backdrop-blur"
            >
              <p className="text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">
                {value}
              </p>
              <p className="mt-0.5 truncate text-[8px] font-black uppercase tracking-wide text-slate-300 sm:text-[9px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </HeroPanel>

      {canUseWorkspaceActions && cloudActionMessage && (
        <AppPanel
          padding="sm"
          className={
            cloudActionStatus === "error"
              ? "border-amber-200 bg-amber-50"
              : "border-blue-100 bg-blue-50"
          }
        >
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Workspace Action Sync
          </p>
          <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-300">
            {cloudActionMessage}
          </p>
        </AppPanel>
      )}

      {!canUseWorkspaceActions && (
        <AppPanel padding="sm" className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Personal Action Tracker
          </p>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-600 dark:text-slate-300">
            Basic and Pro plans can track local and report-generated corrective actions. Company workspaces add shared action sync, team assignment, and organization-wide accountability.
          </p>
        </AppPanel>
      )}

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Add Action"
          title="Create a corrective action"
          description="Add work that needs to be tracked outside of a finalized report."
        />

        <div className="grid gap-3">
          <AppInput
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Describe the corrective action"
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <AppSelect
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              {priorityOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </AppSelect>

            <AppInput
              type="date"
              value={due}
              onChange={(event) => setDue(event.target.value)}
            />

            <AppButton
              type="button"
              onClick={addAction}
              className="py-3 text-sm"
            >
              Add Action
            </AppButton>
          </div>
        </div>
      </AppPanel>

      <AppPanel padding="sm" className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <AppSelect
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            fieldSize="sm"
            className="bg-slate-50 dark:bg-slate-950 text-xs font-black text-slate-700 dark:text-slate-300"
          >
            <option value="">Status: All</option>
            {["Open", "In Progress", "Blocked", "Completed", "Overdue"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </AppSelect>

          <AppSelect
            value={filterPriority}
            onChange={(event) => setFilterPriority(event.target.value)}
            fieldSize="sm"
            className="bg-slate-50 dark:bg-slate-950 text-xs font-black text-slate-700 dark:text-slate-300"
          >
            <option value="">Priority: All</option>
            {priorityOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </AppSelect>

          <AppSelect
            value={filterSource}
            onChange={(event) => setFilterSource(event.target.value)}
            fieldSize="sm"
            className="bg-slate-50 dark:bg-slate-950 text-xs font-black text-slate-700 dark:text-slate-300"
          >
            <option value="">Source: All</option>
            {sourceOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </AppSelect>

          <button
            type="button"
            onClick={() => setFilterOverdueOnly((current) => !current)}
            className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
              filterOverdueOnly
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-slate-300 dark:border-slate-700 bg-white text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950"
            }`}
          >
            Overdue Only
          </button>

          <AppButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            Clear
          </AppButton>
        </div>
      </AppPanel>

      <AppPanel padding="sm" className="overflow-hidden p-0 sm:p-0">
        {actions.length ? (
          actions.map((action, index) => {
            const storedAction = manualActions.some((manualAction) => manualAction.id === action.id);
            const cloudAction = Boolean(action.backendActionId || action.storageSource === "cloud");
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
                  storedAction || cloudAction ? (
                    <AppSelect
                      value={action.status}
                      onChange={(event) =>
                        updateStoredActionStatus(
                          action.backendActionId || action.id,
                          event.target.value,
                        )
                      }
                      fieldSize="sm"
                      className="text-xs font-black text-slate-700 dark:text-slate-300"
                    >
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Blocked</option>
                      <option>Completed</option>
                    </AppSelect>
                  ) : (
                    <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Report package
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
      </AppPanel>
    </section>
  );
}
