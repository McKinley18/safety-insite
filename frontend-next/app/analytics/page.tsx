"use client";

import { useEffect, useMemo, useState } from "react";
import { getReports } from "@/lib/reportStorage";
import { getStoredActions, type StoredAction } from "@/lib/actionStorage";

type AnalyticsReport = {
  id?: string;
  createdAt?: string;
  findings?: any[];
};

function InsightBar({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const width = maxValue > 0 ? Math.max(8, Math.min(100, (value / maxValue) * 100)) : 0;

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

function getRiskScore(finding: any) {
  return Number(
    finding.riskScore ||
      finding.safeScopeResult?.risk?.riskScore ||
      finding.safeScopeResult?.risk?.operationalRisk?.matrixScore ||
      0,
  );
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

export default function AnalyticsPage() {
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [actions, setActions] = useState<StoredAction[]>([]);

  useEffect(() => {
    async function loadAnalyticsData() {
      const savedReports = await getReports<AnalyticsReport>();
      const savedActions = await getStoredActions();

      setReports(Array.isArray(savedReports) ? savedReports : []);
      setActions(Array.isArray(savedActions) ? savedActions : []);
    }

    loadAnalyticsData();
  }, []);

  const analytics = useMemo(() => {
    const findings = reports.flatMap((report) => report.findings || []);
    const completedActions = actions.filter(
      (action) => String(action.status).toLowerCase() === "completed",
    );
    const openActions = actions.filter(
      (action) => String(action.status).toLowerCase() !== "completed",
    );

    const criticalFindings = findings.filter((finding) => {
      const riskScore = getRiskScore(finding);
      const riskBand = String(
        finding.safeScopeResult?.risk?.riskBand ||
          finding.safeScopeResult?.risk?.operationalRisk?.matrixBand ||
          "",
      ).toLowerCase();

      return riskScore >= 20 || riskBand.includes("critical");
    });

    const closureRate = actions.length
      ? Math.round((completedActions.length / actions.length) * 100)
      : null;

    const locationThemes = findings.reduce<Record<string, number>>(
      (acc, finding) => {
        const key = finding.location || "Unspecified Location";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {},
    );

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

    const riskThemes = findings.reduce<Record<string, number>>((acc, finding) => {
      const key =
        finding.hazardCategory ||
        finding.safeScopeResult?.classification ||
        "Uncategorized";

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const riskScores = findings.map(getRiskScore).filter((score) => score > 0);
    const averageRiskScore = riskScores.length
      ? Math.round(
          riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length,
        )
      : null;

    const sortedRiskThemes = Object.entries(riskThemes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const sortedLocationThemes = Object.entries(locationThemes)
      .filter(([, value]) => value > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      totalReports: reports.length,
      totalFindings: findings.length,
      criticalFindings: criticalFindings.length,
      openActions: openActions.length,
      closureRate,
      averageConfidence,
      lowConfidenceFindings,
      averageRiskScore,
      locationThemes: sortedLocationThemes,
      riskThemes: sortedRiskThemes,
      maxRiskThemeCount: Math.max(0, ...sortedRiskThemes.map(([, value]) => value)),
      maxLocationThemeCount: Math.max(
        0,
        ...sortedLocationThemes.map(([, value]) => value),
      ),
    };
  }, [reports, actions]);

  const hasData = Boolean(
    analytics.totalReports || analytics.totalFindings || actions.length,
  );

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
              Review inspection patterns, corrective action signals, risk
              concentration, and SafeScope activity.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-5 grid max-w-4xl grid-cols-2 justify-center gap-3 lg:grid-cols-4">
          {[
            [String(analytics.totalReports), "Reports"],
            [String(analytics.totalFindings), "Findings"],
            [String(analytics.criticalFindings), "Critical Findings"],
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
            to build trend intelligence.
          </p>
        </section>
      )}

      <section className="grid gap-3 md:grid-cols-3">
        {[
          [
            analytics.averageConfidence === null
              ? "—"
              : `${analytics.averageConfidence}%`,
            "Avg. SafeScope Confidence",
            "Measures how complete and reliable SafeScope classification support is across findings.",
          ],
          [
            String(analytics.lowConfidenceFindings),
            "Low Confidence Reviews",
            "Flags findings that may need clearer evidence, stronger descriptions, or supervisor review.",
          ],
          [
            analytics.averageRiskScore === null
              ? "—"
              : String(analytics.averageRiskScore),
            "Avg. Risk Score",
            "Shows the average severity × likelihood signal across saved findings.",
          ],
        ].map(([value, label, description]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="mt-1 text-xs font-black uppercase tracking-wide text-[#1D72B8]">
              {label}
            </p>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
              {description}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Risk Themes
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Finding concentration
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Repeated finding categories can reveal control weakness, training
            gaps, or supervision drift.
          </p>

          <div className="mt-4 space-y-2">
            {analytics.riskThemes.length ? (
              analytics.riskThemes.map(([label, value]) => (
                <InsightBar
                  key={label}
                  label={label}
                  value={value}
                  maxValue={analytics.maxRiskThemeCount}
                />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
                No finding themes available yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Recurring Locations
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Repeat exposure areas
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Locations with repeated findings may need focused inspection,
            engineering controls, or accountability review.
          </p>

          <div className="mt-4 space-y-2">
            {analytics.locationThemes.length ? (
              analytics.locationThemes.map(([label, value]) => (
                <InsightBar
                  key={label}
                  label={label}
                  value={value}
                  maxValue={analytics.maxLocationThemeCount}
                />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
                No recurring locations detected yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Corrective Action Health
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Closure and workload
          </h2>

          <div className="mt-4 grid gap-2">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
              <p className="text-sm font-black text-slate-900">Open Actions</p>
              <p className="text-sm font-black text-slate-700">
                {analytics.openActions}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
              <p className="text-sm font-black text-slate-900">Closure Rate</p>
              <p className="text-sm font-black text-slate-700">
                {analytics.closureRate === null
                  ? "No actions yet"
                  : `${analytics.closureRate}%`}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Calculations & Why It Matters
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            How Sentinel interprets workspace risk
          </h2>

          <div className="mt-4 space-y-2">
            {[
              [
                "Critical Findings",
                "Findings with a risk score of 20 or greater, or a SafeScope critical risk band.",
                "Highlights exposures that may require immediate control, leadership review, or verification before restart.",
              ],
              [
                "Closure Rate",
                "Completed corrective actions divided by total corrective actions.",
                "Shows whether identified hazards are being converted into verified controls.",
              ],
              [
                "Low Confidence",
                "SafeScope results below 70% confidence.",
                "Identifies findings that need stronger evidence, clearer descriptions, or supervisor review.",
              ],
              [
                "Recurring Themes",
                "Repeated hazard categories or repeated locations across saved findings.",
                "Flags possible control weakness, training gaps, or supervision drift.",
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
    </section>
  );
}
