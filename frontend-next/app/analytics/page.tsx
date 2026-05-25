"use client";

import { useEffect, useMemo, useState } from "react";
import { getReports } from "@/lib/reportStorage";
import { getStoredActions, type StoredAction } from "@/lib/actionStorage";
import { getStoredPlanCode, hasPlanEntitlement, type PlanCode } from "@/lib/planEntitlements";

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
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
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
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
              Insights
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
              Safety intelligence trends.
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
              Track inspection output, finding quality, risk concentration,
              corrective action performance, and SafeScope confidence.
            </p>
          </div>

          <span className="mx-auto rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white">
            {planCode === "company" ? "Company Insights" : planCode === "plus" ? "Pro Insights" : "Basic Snapshot"}
          </span>
        </div>

        <div className="mx-auto mt-5 grid max-w-4xl grid-cols-2 justify-center gap-3 lg:grid-cols-4">
          {[
            [String(analytics.totalReports), "Reports"],
            [String(analytics.totalFindings), "Findings"],
            [
              analytics.findingsPerInspection === null
                ? "—"
                : String(analytics.findingsPerInspection),
              "Findings / Inspection",
            ],
            [
              analytics.closureRate === null ? "—" : `${analytics.closureRate}%`,
              "Closure Rate",
            ],
          ].map(([value, label]) => (
            <div
              key={label}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center"
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

      {!hasData && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-slate-900">
            Insights will populate as records are created.
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Complete inspections, generate reports, and track corrective actions
            to build safety-program intelligence.
          </p>
        </section>
      )}

      {!canViewProInsights && hasData && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-800">
            Pro Insights Locked
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Unlock safety-program trends.
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-amber-900">
            Your Basic snapshot shows activity counts. Upgrade to Pro for risk
            rates, standards coverage, evidence quality, corrective action health,
            SafeScope confidence, and repeat hazard themes.
          </p>
          <a
            href="/pricing"
            className="mt-3 inline-flex rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-black text-black shadow-sm transition hover:bg-[#EA580C]"
          >
            Unlock Pro Insights
          </a>
        </section>
      )}

      {canViewCompanyInsights && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                Company Filters
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                Workspace analytics view
              </h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                Company plan insights can be filtered by facility, user,
                inspection status, risk, date, agency, and corrective action status.
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-700">
              Company
            </span>
          </div>

          {canUseWorkspaceFilters ? (
            <div className="mt-4 grid gap-2 md:grid-cols-4">
              {["Facility", "Assigned User", "Risk", "Action Status"].map((label) => (
                <select
                  key={label}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-[#1D72B8] focus:bg-white"
                  defaultValue=""
                >
                  <option value="">{label}: All</option>
                </select>
              ))}
            </div>
          ) : null}
        </section>
      )}

      {canViewProInsights && (
        <>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          value={
            analytics.highRiskRate === null ? "—" : `${analytics.highRiskRate}%`
          }
          label="High-Risk Finding Rate"
          description="Percentage of findings rated High or Critical."
          tone={
            analytics.highRiskRate !== null && analytics.highRiskRate >= 30
              ? "danger"
              : analytics.highRiskRate !== null && analytics.highRiskRate >= 15
                ? "warning"
                : "default"
          }
        />

        <MetricCard
          value={
            analytics.overdueRate === null ? "—" : `${analytics.overdueRate}%`
          }
          label="Overdue Action Rate"
          description="Percentage of open actions past the due date."
          tone={
            analytics.overdueRate !== null && analytics.overdueRate >= 25
              ? "danger"
              : analytics.overdueRate !== null && analytics.overdueRate > 0
                ? "warning"
                : "good"
          }
        />

        <MetricCard
          value={
            analytics.standardsCoverage === null
              ? "—"
              : `${analytics.standardsCoverage}%`
          }
          label="Standards Coverage"
          description="Findings with at least one selected or suggested standard."
          tone={
            analytics.standardsCoverage !== null &&
            analytics.standardsCoverage >= 80
              ? "good"
              : "default"
          }
        />

        <MetricCard
          value={
            analytics.evidenceCoverage === null
              ? "—"
              : `${analytics.evidenceCoverage}%`
          }
          label="Evidence Coverage"
          description="Findings supported by at least one photo or evidence item."
          tone={
            analytics.evidenceCoverage !== null && analytics.evidenceCoverage >= 80
              ? "good"
              : "default"
          }
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Program Health
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Efficacy signals
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            These indicators help show whether inspections are producing useful,
            traceable, and closed-loop safety work.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              [
                analytics.averageRiskScore === null
                  ? "—"
                  : String(analytics.averageRiskScore),
                "Avg. Risk Score",
              ],
              [
                analytics.actionCoverage === null
                  ? "—"
                  : `${analytics.actionCoverage}%`,
                "Findings With Actions",
              ],
              [
                analytics.safeScopeCoverage === null
                  ? "—"
                  : `${analytics.safeScopeCoverage}%`,
                "SafeScope Reviewed",
              ],
              [
                analytics.averageConfidence === null
                  ? "—"
                  : `${analytics.averageConfidence}%`,
                "Avg. SafeScope Confidence",
              ],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-xl font-black text-slate-900">{value}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Interpretation
            </p>
            {programHealthNotes.length ? (
              <ul className="mt-2 space-y-1 text-sm font-semibold leading-6 text-slate-600">
                {programHealthNotes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                No major concern signals detected from the currently saved data.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Corrective Action Health
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Closure and workload
          </h2>

          <div className="mt-4 grid gap-2">
            {[
              [String(analytics.totalActions), "Total Actions"],
              [String(analytics.openActions), "Open Actions"],
              [String(analytics.completedActions), "Completed Actions"],
              [String(analytics.overdueActions), "Overdue Actions"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"
              >
                <p className="text-sm font-black text-slate-900">{label}</p>
                <p className="text-sm font-black text-slate-700">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Repeat Hazard Themes
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Control weakness indicators
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Repeated finding categories may point to training gaps, failed
            controls, or supervision drift.
          </p>

          <div className="mt-4 space-y-2">
            {analytics.allHazardThemes.length ? (
              analytics.allHazardThemes.map(([label, value]) => (
                <InsightBar
                  key={label}
                  label={label}
                  value={value}
                  maxValue={analytics.maxHazardThemeCount}
                />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
                No hazard themes available yet.
              </p>
            )}
          </div>

          {!!analytics.repeatHazardThemes.length && (
            <p className="mt-3 text-xs font-bold leading-5 text-orange-700">
              Repeat signal: {analytics.repeatHazardThemes.length} hazard
              theme(s) appeared more than once.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Repeat Locations
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Exposure concentration
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Locations with repeated findings may need focused inspections,
            engineering controls, or accountability review.
          </p>

          <div className="mt-4 space-y-2">
            {analytics.allLocations.length ? (
              analytics.allLocations.map(([label, value]) => (
                <InsightBar
                  key={label}
                  label={label}
                  value={value}
                  maxValue={analytics.maxLocationCount}
                />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
                No location trends available yet.
              </p>
            )}
          </div>

          {!!analytics.repeatLocations.length && (
            <p className="mt-3 text-xs font-bold leading-5 text-orange-700">
              Repeat signal: {analytics.repeatLocations.length} location(s)
              appeared more than once.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Recent Inspection Output
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Latest records
          </h2>

          <div className="mt-4 space-y-2">
            {analytics.recentReports.length ? (
              analytics.recentReports.map((report) => (
                <div
                  key={report.id || `${report.title}-${report.createdAt}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <p className="text-sm font-black text-slate-900">
                    {report.title || "Inspection Report"}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    {report.siteLocation ||
                      report.location ||
                      report.findings?.[0]?.location ||
                      "Field Inspection"}{" "}
                    · {report.findings?.length || 0} finding(s) ·{" "}
                    {formatDate(report.createdAt || report.inspectionDate)}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
                No recent inspection records available yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Calculations & Why It Matters
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            How Sentinel interprets program performance
          </h2>

          <div className="mt-4 space-y-2">
            {[
              [
                "High-Risk Finding Rate",
                "High and Critical findings divided by total findings.",
                "Shows whether inspections are revealing serious exposure patterns.",
              ],
              [
                "Overdue Action Rate",
                "Overdue open actions divided by total open actions.",
                "Shows whether corrective actions are being completed on time.",
              ],
              [
                "Standards Coverage",
                "Findings with standards divided by total findings.",
                "Supports defensibility and helps verify regulatory alignment.",
              ],
              [
                "Evidence Coverage",
                "Findings with photos or evidence divided by total findings.",
                "Shows whether inspection records have enough proof for review and closure.",
              ],
              [
                "SafeScope Confidence",
                "Average confidence from findings reviewed by SafeScope.",
                "Flags whether the system has enough information to support reliable review.",
              ],
            ].map(([label, calc, why]) => (
              <details
                key={label}
                className="rounded-xl border border-slate-200 bg-slate-50"
              >
                <summary className="cursor-pointer px-3 py-2.5 text-sm font-black text-slate-900">
                  {label}
                </summary>
                <div className="border-t border-slate-200 px-3 py-3">
                  <p className="text-sm font-semibold leading-6 text-slate-600">
                    <span className="font-black text-slate-700">
                      Calculation:
                    </span>{" "}
                    {calc}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    <span className="font-black text-slate-700">Why:</span>{" "}
                    {why}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
        </>
      )}
    </section>
  );
}
