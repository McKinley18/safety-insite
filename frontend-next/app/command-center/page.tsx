"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clearActiveInspectionDraft } from "@/lib/inspectionDraft";
import { getReports } from "@/lib/reportStorage";
import { getStoredActions, type StoredAction } from "@/lib/actionStorage";
import { getActivityEvents, type ActivityEvent } from "@/lib/activityStorage";
import EmptyState from "@/components/ui/EmptyState";
import { getStoredPlanCode } from "@/lib/planEntitlements";

type DashboardReport = {
  id?: string;
  createdAt?: string;
  findings?: any[];
};

function formatDate(value?: string) {
  if (!value) return "Saved";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved";
  return date.toLocaleDateString();
}

function priorityTone(priority: any) {
  const value = String(priority || "").toLowerCase();

  if (value === "critical") return "bg-red-100 text-red-700 border-red-200";
  if (value === "high") return "bg-orange-100 text-orange-700 border-orange-200";
  if (value === "medium") return "bg-amber-100 text-amber-700 border-amber-200";

  return "bg-slate-100 text-slate-700 border-slate-200";
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

  const priorityActions = useMemo(() => {
    const priorityRank: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return storedActions
      .filter(
        (action) => String(action.status || "").toLowerCase() !== "completed",
      )
      .sort(
        (a, b) =>
          (priorityRank[String(b.priority || "").toLowerCase()] || 0) -
          (priorityRank[String(a.priority || "").toLowerCase()] || 0),
      )
      .slice(0, 5);
  }, [storedActions]);

  const activityItems = useMemo(() => {
    if (activityEvents.length) {
      return activityEvents.slice(0, 5).map((event) => ({
        type: event.type,
        title: event.title,
        detail: event.detail || "",
        time: formatDate(event.createdAt),
      }));
    }

    return reports
      .map((report) => ({
        type: "Report",
        title: report.id ? `Inspection report ${report.id}` : "Inspection report saved",
        detail: `${report.findings?.length || 0} finding(s)`,
        time: formatDate(report.createdAt),
      }))
      .slice(0, 5);
  }, [activityEvents, reports]);

  const dashboardMetrics = useMemo(() => {
    const findings = reports.flatMap((report) => report.findings || []);

    const openFindings = findings.length;
    const criticalFindings = findings.filter((finding) => {
      const riskScore = Number(
        finding.riskScore || finding.safeScopeResult?.risk?.riskScore || 0,
      );
      const riskBand = String(
        finding.safeScopeResult?.risk?.riskBand || "",
      ).toLowerCase();

      return riskScore >= 20 || riskBand === "critical";
    }).length;

    const overdueActions = storedActions.filter((action) => {
      if (!action?.due) return false;
      return (
        new Date(action.due).getTime() < Date.now() &&
        String(action.status || "").toLowerCase() !== "completed"
      );
    }).length;

    const confidenceValues = findings
      .map((finding) =>
        Number(
          finding.safeScopeResult?.confidenceIntelligence?.overallConfidence ??
            finding.safeScopeResult?.confidence ??
            NaN,
        ),
      )
      .filter((value) => Number.isFinite(value));

    const averageConfidence = confidenceValues.length
      ? Math.round(
          (confidenceValues.reduce((sum, value) => sum + value, 0) /
            confidenceValues.length) *
            100,
        )
      : null;

    const standardsReviewed = findings.filter((finding) =>
      Boolean(
        finding.standards?.length ||
          finding.safeScopeResult?.suggestedStandards?.length ||
          finding.safeScopeResult?.standards?.length,
      ),
    ).length;

    const correctiveActionsGenerated = findings.reduce((count, finding) => {
      return (
        count +
        (finding.correctiveActions?.length ||
          finding.safeScopeResult?.generatedActions?.length ||
          0)
      );
    }, 0);

    const reviewRecommended = findings.filter((finding) =>
      Boolean(
        finding.safeScopeResult?.requiresHumanReview ||
          finding.safeScopeResult?.confidenceIntelligence
            ?.supervisorReviewRecommended,
      ),
    ).length;

    const locations = new Set(
      findings.map((finding) => finding.location).filter(Boolean),
    ).size;

    const repeatHazardSignals = Object.values(
      findings.reduce((acc: Record<string, number>, finding) => {
        const key = String(
          finding.hazardCategory ||
            finding.category ||
            finding.safeScopeResult?.classification ||
            "uncategorized",
        ).toLowerCase();

        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    ).filter((count) => Number(count) > 1).length;

    return {
      inspections: reports.length,
      openFindings,
      criticalFindings,
      overdueActions,
      averageConfidence,
      standardsReviewed,
      correctiveActionsGenerated,
      reviewRecommended,
      locations,
      repeatHazardSignals,
    };
  }, [reports, storedActions]);

  const insightMetrics =
    planCode === "basic"
      ? [
          [String(dashboardMetrics.inspections), "Reports saved"],
          [String(dashboardMetrics.openFindings), "Findings captured"],
          [String(dashboardMetrics.criticalFindings), "Critical signals"],
        ]
      : planCode === "plus"
        ? [
            [
              dashboardMetrics.averageConfidence === null
                ? "—"
                : `${dashboardMetrics.averageConfidence}%`,
              "Avg. SafeScope confidence",
            ],
            [String(dashboardMetrics.standardsReviewed), "Findings with standards"],
            [String(dashboardMetrics.correctiveActionsGenerated), "Actions generated"],
          ]
        : [
            [String(dashboardMetrics.locations), "Locations represented"],
            [String(dashboardMetrics.repeatHazardSignals), "Repeat hazard signals"],
            [String(dashboardMetrics.reviewRecommended), "Reviews recommended"],
          ];

  return (
    <section className="space-y-5">
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
              Sentinel Command Center
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
              Operational risk intelligence.
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
              Active inspections, risk signals, corrective work, and SafeScope
              activity in one workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/inspection-cover"
              onClick={() => clearActiveInspectionDraft()}
              className="rounded-xl bg-[#1D72B8] px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-[#5DB7FF]"
            >
              Start Inspection
            </Link>
            <Link
              href="/reports"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/20"
            >
              Reports
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [String(dashboardMetrics.inspections), "Inspections"],
            [String(dashboardMetrics.openFindings), "Open Findings"],
            [String(dashboardMetrics.criticalFindings), "Critical Findings"],
            [String(dashboardMetrics.overdueActions), "Overdue Actions"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center"
            >
              <p className="text-2xl font-black tracking-tight text-white">
                {value}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-300">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Insight Level
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              {planCode === "company"
                ? "Company operational intelligence"
                : planCode === "plus"
                  ? "Professional SafeScope insights"
                  : "Basic inspection overview"}
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              {planCode === "company"
                ? "Workspace-level visibility for locations, repeat signals, team actions, and operational trends."
                : planCode === "plus"
                  ? "Advanced SafeScope confidence, standards review, and corrective action insight."
                  : "Core inspection counts and finding status for free local use."}
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-600">
            {planCode}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {insightMetrics.map(([value, label]) => (
            <div key={label} className="rounded-xl bg-slate-50 px-3 py-3">
              <p className="text-xl font-black text-slate-900">{value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                Priority Work
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                Needs attention
              </h2>
            </div>
            <Link href="/actions" className="text-sm font-black text-[#1D72B8]">
              View All
            </Link>
          </div>

          {priorityActions.length ? (
            <div className="space-y-2">
              {priorityActions.map((action, index) => (
                <div
                  key={`${action.id || action.title || index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${priorityTone(
                            action.priority,
                          )}`}
                        >
                          {action.priority || "Priority"}
                        </span>
                        <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                          {action.location || "No location"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-black text-slate-900">
                        {action.title || action.findingTitle || "Corrective action"}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                        {action.findingTitle || "Corrective action"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No active priority work available yet." />
          )}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Activity
          </p>

          <div className="mt-3">
            {activityItems.length ? (
              <div className="space-y-2">
                {activityItems.map((item, index) => (
                  <div
                    key={`${item.type}-${item.title}-${item.time}-${index}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          {item.type}
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {item.detail}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-slate-400">
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No recent workspace activity available yet." />
            )}
          </div>
        </aside>
      </section>
    </section>
  );
}
