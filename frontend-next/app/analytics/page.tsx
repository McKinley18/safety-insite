"use client";

import { useEffect, useMemo, useState } from "react";
import { getReports } from "@/lib/reportStorage";
import { getStoredActions, type StoredAction } from "@/lib/actionStorage";
import { getStoredPlanCode, hasPlanEntitlement, type PlanCode } from "@/lib/planEntitlements";
import { AppSelect } from "@/components/ui/AppInput";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import LockedFeatureCard from "@/components/ui/LockedFeatureCard";



type AnalyticsReport = {
  id?: string;
  title?: string;
  createdAt?: string;
  inspectionDate?: string;
  siteLocation?: string;
  location?: string;
  findings?: any[];
};

type RiskBand = "Critical" | "High" | "Moderate" | "Low" | "Unrated";

function formatDate(value?: string) {
  if (!value) return "Not dated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not dated";
  return date.toLocaleDateString();
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return null;
  return Math.round((numerator / denominator) * 100);
}

function getRiskScore(finding: any) {
  return Number(
    finding.riskScore ||
      finding.safeScopeResult?.risk?.riskScore ||
      finding.safeScopeResult?.risk?.operationalRisk?.matrixScore ||
      0,
  );
}

function getRiskBand(finding: any): RiskBand {
  const rawBand = String(
    finding.safeScopeResult?.risk?.riskBand ||
      finding.safeScopeResult?.risk?.operationalRisk?.matrixBand ||
      "",
  ).toLowerCase();

  const score = getRiskScore(finding);

  if (rawBand.includes("critical") || score >= 20) return "Critical";
  if (rawBand.includes("high") || score >= 12) return "High";
  if (rawBand.includes("medium") || rawBand.includes("moderate") || score >= 6) {
    return "Moderate";
  }
  if (score > 0) return "Low";

  return "Unrated";
}

function getFindingActions(finding: any) {
  return (
    finding.correctiveActions || [
      ...(finding.selectedGeneratedActions || []),
      ...(finding.manualActions || []),
      ...(finding.safeScopeResult?.generatedActions || []),
    ]
  );
}

function getFindingCategory(finding: any) {
  return (
    finding.hazardCategory ||
    finding.category ||
    finding.safeScopeResult?.classification ||
    "Uncategorized"
  );
}

function getFindingLocation(finding: any) {
  return finding.location || "Unspecified Location";
}

function trendEntries(map: Record<string, number>, minCount = 1) {
  return Object.entries(map)
    .filter(([, value]) => value >= minCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
}

function InsightBar({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const width =
    maxValue > 0 && value > 0
      ? Math.max(8, Math.min(100, (value / maxValue) * 100))
      : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black text-slate-700 dark:text-slate-300">
        <span className="truncate">{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[#1D72B8]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function MetricCard({
  value,
  label,
  description,
  tone = "default",
}: {
  value: string;
  label: string;
  description: string;
  tone?: "default" | "good" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "border-red-100 bg-red-50"
      : tone === "warning"
        ? "border-amber-100 bg-amber-50"
        : tone === "good"
          ? "border-emerald-100 bg-emerald-50"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";

  return (
    <div className={`rounded-xl border px-3 py-2.5 shadow-sm ${toneClass}`}>
      <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-wide text-[#1D72B8]">
        {label}
      </p>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [actions, setActions] = useState<StoredAction[]>([]);
  const [planCode, setPlanCode] = useState<PlanCode>("basic");

  useEffect(() => {
    async function loadAnalyticsData() {
      const savedReports = await getReports<AnalyticsReport>();
      const savedActions = await getStoredActions();

      setReports(Array.isArray(savedReports) ? savedReports : []);
      setActions(Array.isArray(savedActions) ? savedActions : []);
      setPlanCode(getStoredPlanCode());
    }

    loadAnalyticsData();
  }, []);

  const analytics = useMemo(() => {
    const findings = reports.flatMap((report) => report.findings || []);

    const completedActions = actions.filter(
      (action) => String(action.status || "").toLowerCase() === "completed",
    );

    const openActions = actions.filter(
      (action) => String(action.status || "").toLowerCase() !== "completed",
    );

    const overdueActions = openActions.filter((action) => {
      if (!action.due) return false;
      const dueDate = new Date(action.due);
      if (Number.isNaN(dueDate.getTime())) return false;
      return dueDate.getTime() < Date.now();
    });

    const riskBands = findings.reduce<Record<RiskBand, number>>(
      (acc, finding) => {
        const band = getRiskBand(finding);
        acc[band] = (acc[band] || 0) + 1;
        return acc;
      },
      {
        Critical: 0,
        High: 0,
        Moderate: 0,
        Low: 0,
        Unrated: 0,
      },
    );

    const riskScores = findings.map(getRiskScore).filter((score) => score > 0);

    const averageRiskScore = riskScores.length
      ? Math.round(
          riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length,
        )
      : null;

    const criticalOrHigh = riskBands.Critical + riskBands.High;
    const criticalRate = percent(riskBands.Critical, findings.length);
    const highRiskRate = percent(criticalOrHigh, findings.length);

    const closureRate = percent(completedActions.length, actions.length);
    const overdueRate = percent(overdueActions.length, openActions.length);

    const findingsWithActions = findings.filter(
      (finding) => getFindingActions(finding).length > 0,
    ).length;

    const categoryMap = findings.reduce<Record<string, number>>((acc, finding) => {
      const key = getFindingCategory(finding);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const locationMap = findings.reduce<Record<string, number>>((acc, finding) => {
      const key = getFindingLocation(finding);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const repeatHazardThemes = trendEntries(categoryMap, 2);
    const repeatLocations = trendEntries(locationMap, 2);

    const allHazardThemes = trendEntries(categoryMap, 1);
    const allLocations = trendEntries(locationMap, 1);

    const recentReports = [...reports]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.inspectionDate || 0).getTime() -
          new Date(a.createdAt || a.inspectionDate || 0).getTime(),
      )
      .slice(0, 5);

    return {
      totalReports: reports.length,
      totalFindings: findings.length,
      findingsPerInspection: reports.length
        ? Math.round((findings.length / reports.length) * 10) / 10
        : null,

      riskBands,
      averageRiskScore,
      criticalRate,
      highRiskRate,

      totalActions: actions.length,
      openActions: openActions.length,
      completedActions: completedActions.length,
      overdueActions: overdueActions.length,
      closureRate,
      overdueRate,

      actionCoverage: percent(findingsWithActions, findings.length),

      repeatHazardThemes,
      repeatLocations,
      allHazardThemes,
      allLocations,
      maxHazardThemeCount: Math.max(0, ...allHazardThemes.map(([, value]) => value)),
      maxLocationCount: Math.max(0, ...allLocations.map(([, value]) => value)),
      topHazardConcentration: percent(allHazardThemes[0]?.[1] || 0, findings.length),
      topLocationConcentration: percent(allLocations[0]?.[1] || 0, findings.length),
      riskLoad: riskScores.reduce((sum, score) => sum + score, 0),
      openActionsPerInspection: reports.length
        ? Math.round((openActions.length / reports.length) * 10) / 10
        : null,
      overdueActionsPerInspection: reports.length
        ? Math.round((overdueActions.length / reports.length) * 10) / 10
        : null,
      recentReports,
    };
  }, [reports, actions]);

  const hasData = Boolean(
    analytics.totalReports || analytics.totalFindings || actions.length,
  );

  const canViewProInsights = hasPlanEntitlement("analytics", planCode);
  const canViewCompanyInsights = hasPlanEntitlement("companyAnalytics", planCode);
  const canUseWorkspaceFilters = hasPlanEntitlement("workspaceFiltering", planCode);
  const canViewAssignedUserFilter = canViewCompanyInsights || hasPlanEntitlement("teamMembers", planCode);

  const programHealthNotes = [
    analytics.highRiskRate !== null && analytics.highRiskRate >= 30
      ? "High-risk finding rate is elevated. Consider targeted leadership review and verification of controls."
      : null,
    analytics.overdueRate !== null && analytics.overdueRate >= 25
      ? "Overdue corrective action burden is elevated. Review ownership and due-date follow-through."
      : null,
  ].filter(Boolean);

  return (
    <section className="sentinel-page-shell space-y-6">
      <HeroPanel align="center">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
              Insights
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">
              Safety intelligence trends.
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
              Track whether your safety program is reducing repeat hazards,
              improving corrective action closure, reducing repeat hazards,
              and supporting better standards-backed decisions.
            </p>
          </div>

        </div>

        <div className="mx-auto mt-4 grid max-w-3xl grid-cols-2 justify-center gap-2 sm:grid-cols-4">
          {[
            [String(analytics.totalReports), "Reports"],
            [String(analytics.totalFindings), "Findings"],
            [String(analytics.openActions), "Open Actions"],
            [
              analytics.closureRate === null ? "—" : `${analytics.closureRate}%`,
              "Closure Rate",
            ],
          ].map(([value, label]) => (
            <div
              key={label}
              className="w-full rounded-2xl border border-white/10 bg-white dark:bg-slate-900/10 px-3 py-3 text-center shadow-sm backdrop-blur"
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

      

      {!hasData && (
        <AppPanel as="section" variant="dashed" padding="md" className="p-5 sm:p-5">
          <p className="text-xs font-black text-slate-900 dark:text-slate-100">
            Insights will populate as records are created.
          </p>
          <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
            Complete inspections, generate reports, and track corrective actions
            to build safety-program intelligence.
          </p>
        </AppPanel>
      )}

      {!canViewProInsights && hasData && (
        <LockedFeatureCard
          eyebrow="Analytics Intelligence"
          title="Unlock safety-program trends."
          description="Your Basic snapshot shows activity counts. Pro Insights adds risk distribution, corrective action performance, recurring hazard trends, and recurring exposure areas."
          requiredPlan="Pro"
          bullets={[
            "Find recurring hazard themes and control failures.",
            "Track overdue corrective work and closure health.",
            "Track risk distribution, corrective action performance, and repeat hazard patterns.",
          ]}
          ctaLabel="Unlock Pro Insights"
        />
      )}

      {canViewCompanyInsights && (
        <AppPanel padding="sm" className="rounded-xl px-3 py-3 sm:px-3 sm:py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                Company Filters
              </p>
              <h2 className="mt-0.5 text-base font-black text-slate-900 dark:text-slate-100">
                Workspace analytics view
              </h2>
              <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
                Company plan insights can be filtered by facility, user,
                inspection status, risk, date, agency, and corrective action status.
              </p>
            </div>

          </div>

          {canUseWorkspaceFilters ? (
            <div className="mt-4 grid gap-2 md:grid-cols-4">
              {["Facility", "Assigned User", "Risk", "Action Status"].map((label) => (
                <AppSelect
                  key={label}
                  fieldSize="sm"
                  className="bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-slate-900"
                  defaultValue=""
                >
                  <option value="">{label}: All</option>
                </AppSelect>
              ))}
            </div>
          ) : null}
        </AppPanel>
      )}

      {canViewProInsights && (
        <>
          <section className="sentinel-card p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8] dark:text-sky-300">
                  Statistical Indicators
                </p>
                <h2 className="mt-1 text-base font-black tracking-[-0.03em] text-slate-950 dark:text-slate-100">
                  Program math summary
                </h2>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:bg-slate-800 dark:text-slate-300">
                Pro analytics
              </span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  analytics.findingsPerInspection === null
                    ? "—"
                    : String(analytics.findingsPerInspection),
                  "Findings / Inspection",
                ],
                [
                  analytics.criticalRate === null ? "—" : `${analytics.criticalRate}%`,
                  "Critical Rate",
                ],
                [
                  analytics.highRiskRate === null ? "—" : `${analytics.highRiskRate}%`,
                  "High-Risk Rate",
                ],
                [
                  analytics.actionCoverage === null
                    ? "—"
                    : `${analytics.actionCoverage}%`,
                  "Action Conversion",
                ],
                [
                  analytics.closureRate === null ? "—" : `${analytics.closureRate}%`,
                  "Closure Rate",
                ],
                [
                  analytics.overdueRate === null ? "—" : `${analytics.overdueRate}%`,
                  "Overdue Rate",
                ],
                [
                  String(analytics.riskLoad),
                  "Risk Load",
                ],

              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/85 px-3 py-2.5 shadow-sm"
                >
                  <p className="text-xl font-black tracking-[-0.055em] text-slate-950 dark:text-slate-100">
                    {value}
                  </p>
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#1D72B8] dark:text-sky-300">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-2 grid gap-2 lg:grid-cols-2">
              <div className="rounded-2xl border border-orange-100 bg-orange-50/70 px-3 py-2.5 shadow-sm dark:border-orange-900/50 dark:bg-orange-950/25">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-orange-700 dark:text-orange-300">
                      Top Hazard
                    </p>
                    <p className="truncate text-xs font-black text-slate-950 dark:text-slate-100">
                      {analytics.allHazardThemes[0]?.[0] || "No hazard theme yet"}
                    </p>
                  </div>
                  <p className="shrink-0 text-lg font-black tracking-[-0.055em] text-orange-700 dark:text-orange-200">
                    {analytics.topHazardConcentration === null
                      ? "—"
                      : `${analytics.topHazardConcentration}%`}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-3 py-2.5 shadow-sm dark:border-sky-900/50 dark:bg-sky-950/25">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-sky-700 dark:text-sky-300">
                      Top Exposure Area
                    </p>
                    <p className="truncate text-xs font-black text-slate-950 dark:text-slate-100">
                      {analytics.allLocations[0]?.[0] || "No location trend yet"}
                    </p>
                  </div>
                  <p className="shrink-0 text-lg font-black tracking-[-0.055em] text-sky-700 dark:text-sky-200">
                    {analytics.topLocationConcentration === null
                      ? "—"
                      : `${analytics.topLocationConcentration}%`}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="sentinel-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300">
                  Priority Signals
                </p>
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-orange-700 dark:bg-orange-950/40 dark:text-orange-200">
                  {programHealthNotes.length || 0}
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                {programHealthNotes.length ? (
                  programHealthNotes.slice(0, 2).map((note) => (
                    <div
                      key={note}
                      className="rounded-xl border border-orange-100 bg-orange-50/80 px-3 py-2 text-[11px] font-black leading-4 text-orange-800 shadow-sm dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-200"
                    >
                      {note}
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-[11px] font-black leading-4 text-emerald-700 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
                    No major concern signals detected.
                  </p>
                )}
              </div>
            </div>

            <div className="sentinel-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8] dark:text-sky-300">
                  Risk Distribution
                </p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:bg-slate-800 dark:text-slate-300">
                  Avg {analytics.averageRiskScore === null ? "—" : analytics.averageRiskScore}
                </span>
              </div>

              <div className="mt-2 grid gap-1.5">
                {[
                  ["Critical", analytics.riskBands.Critical, "bg-red-500"],
                  ["High", analytics.riskBands.High, "bg-orange-500"],
                  ["Moderate", analytics.riskBands.Moderate, "bg-amber-400"],
                  ["Low", analytics.riskBands.Low, "bg-emerald-500"],
                  ["Unrated", analytics.riskBands.Unrated, "bg-slate-400"],
                ].map(([label, value, barClass]) => {
                  const width =
                    analytics.totalFindings > 0 && Number(value) > 0
                      ? Math.max(4, Math.round((Number(value) / analytics.totalFindings) * 100))
                      : 0;

                  return (
                    <div
                      key={label}
                      className="grid grid-cols-[5rem_1fr_2rem] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 px-3 py-1.5"
                    >
                      <p className="text-[11px] font-black text-slate-900 dark:text-slate-100">
                        {label}
                      </p>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${barClass}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <p className="text-right text-[11px] font-black text-slate-500 dark:text-slate-400 dark:text-slate-300">
                        {value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="sentinel-card p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                Corrective Actions
              </p>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                Closure {analytics.closureRate === null ? "—" : `${analytics.closureRate}%`}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {[
                [String(analytics.totalActions), "Total"],
                [String(analytics.openActions), "Open"],
                [String(analytics.completedActions), "Done"],
                [String(analytics.overdueActions), "Late"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-2 py-2 text-center shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/25"
                >
                  <p className="text-lg font-black tracking-[-0.05em] text-slate-950 dark:text-slate-100">
                    {value}
                  </p>
                  <p className="mt-0.5 text-[8px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              <InsightBar
                label="Closure"
                value={analytics.closureRate || 0}
                maxValue={100}
              />
              <InsightBar
                label="Overdue"
                value={analytics.overdueRate || 0}
                maxValue={100}
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="sentinel-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300">
                  Recurring Hazards
                </p>
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-orange-700 dark:bg-orange-950/40 dark:text-orange-200">
                  {analytics.repeatHazardThemes.length}
                </span>
              </div>

              <div className="mt-2 grid gap-1.5">
                {analytics.allHazardThemes.length ? (
                  analytics.allHazardThemes.slice(0, 3).map(([label, value]) => (
                    <InsightBar
                      key={label}
                      label={label}
                      value={value}
                      maxValue={analytics.maxHazardThemeCount}
                    />
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No hazard themes available yet.
                  </p>
                )}
              </div>
            </div>

            <div className="sentinel-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
                  Recurring Locations
                </p>
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700 dark:bg-sky-950/40 dark:text-sky-200">
                  {analytics.repeatLocations.length}
                </span>
              </div>

              <div className="mt-2 grid gap-1.5">
                {analytics.allLocations.length ? (
                  analytics.allLocations.slice(0, 3).map(([label, value]) => (
                    <InsightBar
                      key={label}
                      label={label}
                      value={value}
                      maxValue={analytics.maxLocationCount}
                    />
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No location trends available yet.
                  </p>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </section>
  );
}