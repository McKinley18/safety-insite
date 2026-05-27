"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clearActiveInspectionDraft } from "@/lib/inspectionDraft";
import { getReports } from "@/lib/reportStorage";
import { getStoredActions, type StoredAction } from "@/lib/actionStorage";
import { getActivityEvents, type ActivityEvent } from "@/lib/activityStorage";
import { getStoredPlanCode } from "@/lib/planEntitlements";

type DashboardReport = {
  id?: string;
  title?: string;
  createdAt?: string;
  location?: string;
  siteLocation?: string;
  findings?: any[];
};

function getRiskScore(finding: any) {
  return Number(
    finding.riskScore ||
      finding.safeScopeResult?.risk?.riskScore ||
      finding.safeScopeResult?.risk?.operationalRisk?.matrixScore ||
      0,
  );
}

function getRiskBand(finding: any) {
  return String(
    finding.safeScopeResult?.risk?.riskBand ||
      finding.safeScopeResult?.risk?.operationalRisk?.matrixBand ||
      "",
  ).toLowerCase();
}


function isActionOverdue(action: StoredAction) {
  if (String(action.status || "").toLowerCase() === "completed") return false;
  if (!action.due) return false;

  const dueDate = new Date(action.due);
  if (Number.isNaN(dueDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate.getTime() < today.getTime();
}

function getActionPriorityRank(priority?: string) {
  if (String(priority || "").toLowerCase() === "critical") return 0;
  if (String(priority || "").toLowerCase() === "high") return 1;
  if (String(priority || "").toLowerCase() === "medium") return 2;
  if (String(priority || "").toLowerCase() === "low") return 3;
  return 4;
}

function getActionStatusClass(action: StoredAction) {
  if (String(action.status || "").toLowerCase() === "completed") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (String(action.status || "").toLowerCase() === "blocked") {
    return "bg-red-50 text-red-700";
  }

  if (isActionOverdue(action)) {
    return "bg-red-50 text-red-700";
  }

  if (String(action.status || "").toLowerCase() === "in progress") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-orange-50 text-orange-700";
}

function formatDate(value?: string) {
  if (!value) return "Saved";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved";
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const [reports, setReports] = useState<DashboardReport[]>([]);
  const [storedActions, setStoredActions] = useState<StoredAction[]>([]);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [planCode, setPlanCode] = useState("basic");

  useEffect(() => {
    async function loadDashboardReports() {
      const savedReports = await getReports<DashboardReport>();
      const savedActions = await getStoredActions();
      const savedActivity = await getActivityEvents();

      setPlanCode(getStoredPlanCode());
      setReports(Array.isArray(savedReports) ? savedReports : []);
      setStoredActions(Array.isArray(savedActions) ? savedActions : []);
      setActivityEvents(Array.isArray(savedActivity) ? savedActivity : []);
    }

    loadDashboardReports();
  }, []);

  const dashboard = useMemo(() => {
    const findings = reports.flatMap((report) =>
      (report.findings || []).map((finding: any) => ({
        ...finding,
        reportTitle: report.title || "Inspection Report",
        reportDate: report.createdAt,
        reportLocation: report.location || report.siteLocation,
      })),
    );

    const openActions = storedActions.filter(
      (action) => String(action.status || "").toLowerCase() !== "completed",
    );

    const overdueActions = openActions.filter(isActionOverdue);

    const blockedActions = openActions.filter(
      (action) => String(action.status || "").toLowerCase() === "blocked",
    );

    const inProgressActions = openActions.filter(
      (action) => String(action.status || "").toLowerCase() === "in progress",
    );

    const criticalFindings = findings.filter((finding) => {
      const riskScore = getRiskScore(finding);
      const riskBand = getRiskBand(finding);
      return riskScore >= 20 || riskBand.includes("critical");
    });

    const highPriorityActions = [...openActions]
      .sort((a, b) => {
        const overdueDelta =
          (isActionOverdue(b) ? 1 : 0) - (isActionOverdue(a) ? 1 : 0);

        if (overdueDelta !== 0) return overdueDelta;

        const priorityDelta =
          getActionPriorityRank(a.priority) - getActionPriorityRank(b.priority);

        if (priorityDelta !== 0) return priorityDelta;

        const aDue = a.due ? new Date(a.due).getTime() : Number.MAX_SAFE_INTEGER;
        const bDue = b.due ? new Date(b.due).getTime() : Number.MAX_SAFE_INTEGER;

        return aDue - bDue;
      })
      .slice(0, 5);

    const latestReports = [...reports]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 3);

    const recentActivity = activityEvents.slice(0, 3);

    const safeScopeReviewed = findings.filter((finding) =>
      Boolean(finding.safeScopeResult),
    ).length;

    return {
      reportCount: reports.length,
      findingCount: findings.length,
      openActions: openActions.length,
      overdueActions: overdueActions.length,
      blockedActions: blockedActions.length,
      inProgressActions: inProgressActions.length,
      criticalFindings: criticalFindings.length,
      safeScopeReviewed,
      highPriorityActions,
      latestReports,
      recentActivity,
    };
  }, [activityEvents, reports, storedActions]);

  const attentionItems = [
    dashboard.criticalFindings
      ? `${dashboard.criticalFindings} critical finding(s) need review`
      : null,
    dashboard.overdueActions
      ? `${dashboard.overdueActions} overdue corrective action(s)`
      : null,
    dashboard.openActions
      ? `${dashboard.openActions} open corrective action(s)`
      : null,
  ].filter(Boolean);

  return (
    <section className="space-y-5">
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-center text-white shadow-sm sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Sentinel Command Center
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          Safety work snapshot.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          A quick view of inspections, findings, corrective actions, and items
          that need attention.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/inspection-cover"
            onClick={() => clearActiveInspectionDraft()}
            className="rounded-xl bg-[#1D72B8] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#155A93]"
          >
            Start Inspection
          </Link>

          <Link
            href="/reports"
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/20"
          >
            Records
          </Link>
        </div>

        <div className="mx-auto mt-4 grid max-w-3xl grid-cols-4 justify-center gap-1.5 sm:gap-2">
          {[
            [String(dashboard.reportCount), "Reports"],
            [String(dashboard.findingCount), "Findings"],
            [String(dashboard.openActions), "Open Actions"],
            [String(dashboard.overdueActions), "Overdue"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-2 py-2 text-center"
            >
              <p className="text-lg font-black tracking-tight text-white sm:text-xl">
                {value}
              </p>
              <p className="mt-0.5 truncate text-[8px] font-black uppercase tracking-wide text-slate-300 sm:text-[9px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Needs Attention
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Today’s priority
          </h2>

          {attentionItems.length ? (
            <div className="mt-4 space-y-2">
              {attentionItems.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-3 text-sm font-black text-orange-800"
                >
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm font-black text-emerald-700">
              No urgent signals in the current local workspace.
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              [String(dashboard.criticalFindings), "Critical Findings"],
              [String(dashboard.safeScopeReviewed), "SafeScope Reviewed"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 px-3 py-3 text-center"
              >
                <p className="text-xl font-black text-slate-900">{value}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                Action Snapshot
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                Corrective work queue
              </h2>
            </div>

            <Link
              href="/actions"
              className="rounded-xl border border-[#1D72B8] bg-white px-3 py-2 text-xs font-black text-[#102A43] transition hover:bg-[#E8F4FF]"
            >
              View Actions
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              [String(dashboard.inProgressActions), "In Progress"],
              [String(dashboard.overdueActions), "Overdue"],
              [String(dashboard.blockedActions), "Blocked"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 px-3 py-3 text-center"
              >
                <p className="text-xl font-black text-slate-900">{value}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {dashboard.highPriorityActions.length ? (
            <div className="mt-4 space-y-2">
              {dashboard.highPriorityActions.map((action, index) => (
                <div
                  key={`${action.id || action.title || index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">
                        {action.title || action.findingTitle || "Corrective action"}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                        {action.location || "No location"} · Due:{" "}
                        {action.due || "Not set"}
                        {action.findingTitle ? ` · Finding: ${action.findingTitle}` : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                        {action.priority || "Priority"}
                      </span>

                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${getActionStatusClass(action)}`}
                      >
                        {isActionOverdue(action) ? "Overdue" : action.status || "Open"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
              No open corrective actions yet.
            </p>
          )}
        </section>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Recent Records
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Latest inspection output
          </h2>

          {dashboard.latestReports.length ? (
            <div className="mt-4 space-y-2">
              {dashboard.latestReports.map((report) => (
                <div
                  key={report.id || `${report.title}-${report.createdAt}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <p className="text-sm font-black text-slate-900">
                    {report.title || "Inspection Report"}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    {report.location ||
                      report.siteLocation ||
                      report.findings?.[0]?.location ||
                      "Field Inspection"}{" "}
                    · {report.findings?.length || 0} finding(s) ·{" "}
                    {formatDate(report.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
              No reports saved yet.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                Workspace Mode
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                {planCode === "company"
                  ? "Company workspace"
                  : planCode === "plus"
                    ? "Pro workspace"
                    : "Basic workspace"}
              </h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                {planCode === "company"
                  ? "Team assignments, shared records, and company filters are available."
                  : planCode === "plus"
                    ? "Guided inspections, full SafeScope, and individual analytics are available."
                    : "Quick Capture and local records are available. Upgrade to unlock guided inspections and deeper SafeScope intelligence."}
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-600">
              {planCode}
            </span>
          </div>

          {dashboard.recentActivity.length ? (
            <div className="mt-4 space-y-2">
              {dashboard.recentActivity.map((item, index) => (
                <div
                  key={`${item.type}-${item.title}-${index}`}
                  className="rounded-xl bg-slate-50 px-3 py-3"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    {item.type}
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {item.title}
                  </p>
                  {item.detail && (
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {item.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </section>
  );
}
