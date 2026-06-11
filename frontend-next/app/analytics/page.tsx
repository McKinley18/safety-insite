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

function getConfidence(finding: any) {
  const raw =
    finding.safeScopeResult?.confidenceIntelligence?.overallConfidence ??
    finding.safeScopeResult?.confidence ??
    NaN;

  const value = Number(raw);

  if (!Number.isFinite(value)) return null;

  return value > 1 ? value / 100 : value;
}

function getFindingStandards(finding: any) {
  return (
    finding.selectedStandards ||
    finding.standards ||
    finding.safeScopeResult?.suggestedStandards ||
    finding.safeScopeResult?.standards ||
    []
  );
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
    maxValue > 0 ? Math.max(8, Math.min(100, (value / maxValue) * 100)) : 0;

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
          : "border-slate-200 bg-white";

  return (
    <div className={`rounded-xl border px-3 py-2.5 shadow-sm ${toneClass}`}>
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

    const findingsWithEvidence = findings.filter(
      (finding) => (finding.photos || []).length > 0,
    ).length;

    const findingsWithStandards = findings.filter(
      (finding) => getFindingStandards(finding).length > 0,
    ).length;

    const findingsWithActions = findings.filter(
      (finding) => getFindingActions(finding).length > 0,
    ).length;

    const safeScopeReviewed = findings.filter(
      (finding) => finding.safeScopeResult,
    ).length;

    const confidenceValues = findings
      .map((finding) => getConfidence(finding))
      .filter((value): value is number => value !== null);

    const averageConfidence = confidenceValues.length
      ? Math.round(
          (confidenceValues.reduce((sum, value) => sum + value, 0) /
            confidenceValues.length) *
            100,
        )
      : null;

    const lowConfidenceFindings = confidenceValues.filter(
      (confidence) => confidence < 0.7,
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

      evidenceCoverage: percent(findingsWithEvidence, findings.length),
      standardsCoverage: percent(findingsWithStandards, findings.length),
      actionCoverage: percent(findingsWithActions, findings.length),
      safeScopeCoverage: percent(safeScopeReviewed, findings.length),
      averageConfidence,
      lowConfidenceFindings,

      repeatHazardThemes,
      repeatLocations,
      allHazardThemes,
      allLocations,
      maxHazardThemeCount: Math.max(0, ...allHazardThemes.map(([, value]) => value)),
      maxLocationCount: Math.max(0, ...allLocations.map(([, value]) => value)),
      recentReports,
    };
  }, [reports, actions]);

  const hasData = Boolean(
    analytics.totalReports || analytics.totalFindings || actions.length,
  );

  const canViewProInsights = hasPlanEntitlement("analytics", planCode);
  const canViewCompanyInsights = hasPlanEntitlement("companyAnalytics", planCode);
  const canUseWorkspaceFilters = hasPlanEntitlement("workspaceFiltering", planCode);

  const programHealthNotes = [
    analytics.highRiskRate !== null && analytics.highRiskRate >= 30
      ? "High-risk finding rate is elevated. Consider targeted leadership review and verification of controls."
      : null,
    analytics.overdueRate !== null && analytics.overdueRate >= 25
      ? "Overdue corrective action burden is elevated. Review ownership and due-date follow-through."
      : null,
    analytics.standardsCoverage !== null && analytics.standardsCoverage < 70
      ? "Standards coverage is below target. Strengthen standards selection before finalizing reports."
      : null,
    analytics.evidenceCoverage !== null && analytics.evidenceCoverage < 70
      ? "Evidence coverage is below target. Encourage photo/document capture during inspections."
      : null,
    analytics.lowConfidenceFindings > 0
      ? "Some SafeScope results have lower confidence. These findings may need more evidence or supervisor review."
      : null,
  ].filter(Boolean);

  return (
    <section className="space-y-5">
      <HeroPanel align="center">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
              Insights
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
              Safety intelligence trends.
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
              Track whether your safety program is reducing repeat hazards,
              improving corrective action closure, strengthening evidence quality,
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
      </HeroPanel>

      

      {!hasData && (
        <AppPanel as="section" variant="dashed" padding="md" className="p-5 sm:p-5">
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
          description="Your Basic snapshot shows activity counts. Pro Insights helps show whether inspections are creating real improvement through repeat hazard trends, action closure, evidence quality, standards coverage, and SafeScope confidence."
          requiredPlan="Pro"
          bullets={[
            "Find recurring hazard themes and control failures.",
            "Track overdue corrective work and closure health.",
            "Review evidence quality, standards coverage, and SafeScope confidence.",
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
                  className="bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 focus:bg-white"
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
          <section className="rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-3 shadow-sm">
            <div className="border-b border-amber-200 pb-2">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-700">
                Safety Brief
              </p>
              <h2 className="mt-0.5 text-base font-black text-slate-900">
                What needs attention first
              </h2>
            </div>

            <div className="mt-3 grid gap-2">
              {programHealthNotes.length ? (
                programHealthNotes.slice(0, 4).map((note) => (
                  <div
                    key={note}
                    className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-black leading-5 text-orange-800"
                  >
                    {note}
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black leading-5 text-emerald-700">
                  No major concern signals detected from the currently saved data.
                </p>
              )}
            </div>

          </section>





      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-blue-300 bg-blue-100 dark:border-blue-900/30 dark:bg-blue-950/20 px-3 py-3 shadow-md">
          <div className="border-b border-blue-300 dark:border-blue-900/40 pb-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8] dark:text-sky-400">
              Risk Profile
            </p>
            <h2 className="mt-0.5 text-base font-black text-slate-900 dark:text-slate-100">
              Severity, action coverage, and review quality
            </h2>
          </div>

          <div className="mt-3 grid gap-2">
            {[
              [
                analytics.averageRiskScore === null
                  ? "—"
                  : String(analytics.averageRiskScore),
                "Average Risk",
                "Overall risk level across findings",
              ],
              [
                analytics.highRiskRate === null ? "—" : `${analytics.highRiskRate}%`,
                "High-Risk Rate",
                "High and Critical findings",
              ],
              [
                analytics.actionCoverage === null
                  ? "—"
                  : `${analytics.actionCoverage}%`,
                "Action Coverage",
                "Findings converted into corrective work",
              ],
              [
                analytics.averageConfidence === null
                  ? "—"
                  : `${analytics.averageConfidence}%`,
                "Confidence",
                "Average SafeScope confidence level",
              ],
            ].map(([value, label, detail]) => (
              <div
                key={label}
                className="rounded-lg border border-blue-200 bg-white dark:bg-slate-900 dark:border-slate-800 px-3 py-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black leading-tight text-slate-900 dark:text-slate-100">
                      {label}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold leading-4 text-slate-500 dark:text-slate-400">
                      {detail}
                    </p>
                  </div>

                  <p className="shrink-0 text-lg font-black leading-none tracking-tight text-slate-900 dark:text-slate-100">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-300 bg-emerald-100 dark:border-emerald-900/30 dark:bg-emerald-950/20 px-3 py-3 shadow-md">
          <div className="border-b border-emerald-300 dark:border-emerald-900/40 pb-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800 dark:text-emerald-400">
              Corrective Action Performance
            </p>
            <h2 className="mt-0.5 text-base font-black text-slate-900 dark:text-slate-100">
              Closure, overdue work, and workload
            </h2>
          </div>

          <div className="mt-3 grid gap-2">
            {[
              [String(analytics.totalActions), "Total Actions"],
              [String(analytics.openActions), "Open Actions"],
              [String(analytics.completedActions), "Completed Actions"],
              [String(analytics.overdueActions), "Overdue Actions"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white dark:bg-slate-900 dark:border-slate-800 px-3 py-2 shadow-sm"
              >
                <p className="text-xs font-black text-slate-900 dark:text-slate-100">{label}</p>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300">{value}</p>
              </div>
            ))}
          </div>
        </div>


      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-orange-300 bg-orange-100 dark:border-orange-900/30 dark:bg-orange-950/20 px-3 py-3 shadow-md">
          <div className="flex items-start justify-between gap-3 border-b border-orange-300 dark:border-orange-900/40 pb-2">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-700 dark:text-orange-400">
                Repeat Hazards
              </p>
              <h2 className="mt-0.5 text-base font-black text-slate-900 dark:text-slate-100">
                Recurring hazard themes
              </h2>
            </div>

            <span className="shrink-0 rounded-full bg-orange-50 dark:bg-orange-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-orange-700 dark:text-orange-300">
              {analytics.repeatHazardThemes.length} repeat
            </span>
          </div>

          <div className="mt-3 grid gap-2">
            {analytics.allHazardThemes.length ? (
              analytics.allHazardThemes.slice(0, 5).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 px-3 py-2 shadow-sm"
                >
                  <p className="min-w-0 truncate text-xs font-black text-slate-900 dark:text-slate-100">
                    {label}
                  </p>
                  <p className="shrink-0 text-sm font-black text-slate-700 dark:text-slate-300">
                    {value}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                No hazard themes available yet.
              </p>
            )}
          </div>

        </div>

        <div className="rounded-xl border border-sky-300 bg-sky-100 dark:border-sky-900/30 dark:bg-sky-950/20 px-3 py-3 shadow-md">
          <div className="flex items-start justify-between gap-3 border-b border-sky-300 dark:border-sky-900/40 pb-2">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700 dark:text-sky-400">
                Repeat Locations
              </p>
              <h2 className="mt-0.5 text-base font-black text-slate-900 dark:text-slate-100">
                Recurring locations and exposure areas
              </h2>
            </div>

            <span className="shrink-0 rounded-full bg-orange-50 dark:bg-orange-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-orange-700 dark:text-orange-300">
              {analytics.repeatLocations.length} repeat
            </span>
          </div>

          <div className="mt-3 grid gap-2">
            {analytics.allLocations.length ? (
              analytics.allLocations.slice(0, 5).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 px-3 py-2 shadow-sm"
                >
                  <p className="min-w-0 truncate text-xs font-black text-slate-900 dark:text-slate-100">
                    {label}
                  </p>
                  <p className="shrink-0 text-sm font-black text-slate-700 dark:text-slate-300">
                    {value}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
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
