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
  const rawScore =
    finding.riskScore ??
    finding.safeScopeResult?.risk?.riskScore ??
    finding.safeScopeResult?.risk?.operationalRisk?.matrixScore;

  const score = Number(rawScore);
  return Number.isFinite(score) ? score : null;
}

function getRiskBand(finding: any): RiskBand {
  const rawBand = String(
    finding.safeScopeResult?.risk?.riskBand ||
      finding.safeScopeResult?.risk?.operationalRisk?.matrixBand ||
      "",
  ).toLowerCase();

  const score = getRiskScore(finding);

  if (rawBand.includes("critical") || (score !== null && score >= 20)) return "Critical";
  if (rawBand.includes("high") || (score !== null && score >= 12)) return "High";
  if (rawBand.includes("medium") || rawBand.includes("moderate") || (score !== null && score >= 6)) {
    return "Moderate";
  }
  if (score !== null && score > 0) return "Low";

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
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black text-slate-700">
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
          : "border-slate-200/80 bg-white";

  return (
    <div className={`rounded-xl border px-3 py-2.5 shadow-none ${toneClass}`}>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-wide text-[#1D72B8]">
        {label}
      </p>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
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

    const riskScores = findings
      .map(getRiskScore)
      .filter((score): score is number => score !== null && score > 0);

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
    <section className="sentinel-mobile-page space-y-4 pb-28 sm:space-y-4 sm:pb-12">
      <HeroPanel align="center">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
              Insights
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.045em] sm:text-4xl">
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
              className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-center shadow-none backdrop-blur"
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
        <AppPanel as="section" variant="dashed" padding="md" className="p-4 sm:p-5 sm:p-4 sm:p-5">
          <p className="text-xs font-black text-slate-900">
            Insights will populate as records are created.
          </p>
          <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500">
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
              <h2 className="mt-0.5 text-base font-black text-slate-900">
                Workspace analytics view
              </h2>
              <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500">
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
                  className="bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 focus:bg-white dark:focus:bg-slate-900"
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
          <AppPanel as="section" padding="md" className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Pro Insights
            </p>
            <h2 className="mt-1 text-base font-black tracking-[-0.03em] text-slate-950">
              Executive safety brief
            </h2>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              A cleaner summary of program health, risk, corrective actions, and recurring patterns.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {[
                [String(analytics.totalReports), "Reports"],
                [String(analytics.totalFindings), "Findings"],
                [String(analytics.openActions), "Open Actions"],
                [analytics.closureRate === null ? "—" : `${analytics.closureRate}%`, "Closure"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-2xl font-black tracking-[-0.045em] text-slate-950">
                    {value}
                  </p>
                  <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </AppPanel>

          <AppPanel as="section" padding="md" className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">
                  Attention Needed
                </p>
                <h3 className="mt-1 text-base font-black tracking-[-0.03em] text-slate-950">
                  Priority review list
                </h3>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  Program-health signals that may need leadership review or follow-up.
                </p>
              </div>
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-orange-700">
                {programHealthNotes.length || 0} item(s)
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {programHealthNotes.length ? (
                programHealthNotes.slice(0, 3).map((note) => (
                  <p key={note} className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold leading-5 text-orange-800">
                    {note}
                  </p>
                ))
              ) : (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-700">
                  No major concern signals detected.
                </p>
              )}
            </div>
          </AppPanel>

          <div className="grid gap-4 lg:grid-cols-2">
            <AppPanel as="section" padding="md" className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-red-700">
                Risk Distribution
              </p>
              <h3 className="mt-1 text-base font-black tracking-[-0.03em] text-slate-950">
                Finding severity mix
              </h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                Current spread of critical, high, moderate, low, and unrated findings.
              </p>

              <div className="mt-4 space-y-2">
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
                    <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <p className="text-[11px] font-black text-slate-900">{label}</p>
                        <p className="text-[11px] font-black text-slate-500">{value}</p>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div className={`h-full ${barClass}`} style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </AppPanel>

            <AppPanel as="section" padding="md" className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
                Corrective Actions
              </p>
              <h3 className="mt-1 text-base font-black tracking-[-0.03em] text-slate-950">
                Closure performance
              </h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                Action volume, closure rate, and overdue burden.
              </p>

              <div className="mt-4 grid grid-cols-4 divide-x divide-slate-200/80 rounded-xl border border-slate-200/80 bg-slate-50">
                {[
                  [String(analytics.totalActions), "Total"],
                  [String(analytics.openActions), "Open"],
                  [String(analytics.completedActions), "Done"],
                  [String(analytics.overdueActions), "Late"],
                ].map(([value, label]) => (
                  <div key={label} className="px-2 py-3 text-center">
                    <p className="text-lg font-black tracking-[-0.045em] text-slate-950">{value}</p>
                    <p className="mt-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-700">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <InsightBar label="Closure" value={analytics.closureRate || 0} maxValue={100} />
                <InsightBar label="Overdue" value={analytics.overdueRate || 0} maxValue={100} />
              </div>
            </AppPanel>

            <AppPanel as="section" padding="md" className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                Recurring Hazards
              </p>
              <h3 className="mt-1 text-base font-black tracking-[-0.03em] text-slate-950">
                Repeat hazard themes
              </h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                Most common hazard categories across the current data set.
              </p>

              <div className="mt-4 space-y-2">
                {analytics.allHazardThemes.length ? (
                  analytics.allHazardThemes.slice(0, 5).map(([label, value]) => (
                    <InsightBar
                      key={label}
                      label={label}
                      value={value}
                      maxValue={analytics.maxHazardThemeCount}
                    />
                  ))
                ) : (
                  <p className="rounded-xl bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-500">
                    No hazard themes available yet.
                  </p>
                )}
              </div>
            </AppPanel>

            <AppPanel as="section" padding="md" className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-700">
                Recurring Locations
              </p>
              <h3 className="mt-1 text-base font-black tracking-[-0.03em] text-slate-950">
                Repeat exposure areas
              </h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                Areas where findings appear most often.
              </p>

              <div className="mt-4 space-y-2">
                {analytics.allLocations.length ? (
                  analytics.allLocations.slice(0, 5).map(([label, value]) => (
                    <InsightBar
                      key={label}
                      label={label}
                      value={value}
                      maxValue={analytics.maxLocationCount}
                    />
                  ))
                ) : (
                  <p className="rounded-xl bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-500">
                    No location trends available yet.
                  </p>
                )}
              </div>
            </AppPanel>
          </div>
        </>
      )}
    </section>
  );
}
