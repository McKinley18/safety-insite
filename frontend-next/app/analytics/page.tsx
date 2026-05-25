"use client";

import { useEffect, useMemo, useState } from "react";
import { getReports } from "@/lib/reportStorage";
import { getStoredActions, type StoredAction } from "@/lib/actionStorage";

type AnalyticsReport = {
  id?: string;
  createdAt?: string;
  findings?: any[];
};

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-black text-slate-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-[#1D72B8]" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
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
    const completedActions = actions.filter((action) => String(action.status).toLowerCase() === "completed");
    const openActions = actions.filter((action) => String(action.status).toLowerCase() !== "completed");

    const criticalFindings = findings.filter((finding) => {
      const riskScore = Number(finding.riskScore || finding.safeScopeResult?.risk?.riskScore || 0);
      const riskBand = String(finding.safeScopeResult?.risk?.riskBand || "").toLowerCase();
      return riskScore >= 20 || riskBand === "critical";
    });

    const closureRate = actions.length
      ? Math.round((completedActions.length / actions.length) * 100)
      : null;

    const locationThemes = findings.reduce<Record<string, number>>((acc, finding) => {
      const key = finding.location || "Unspecified Location";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const lowConfidenceFindings = findings.filter((finding) => {
      const confidence = Number(
        finding.safeScopeResult?.confidenceIntelligence?.overallConfidence ??
        finding.safeScopeResult?.confidence ??
        NaN
      );

      return Number.isFinite(confidence) && confidence < 0.7;
    }).length;

    const riskThemes = findings.reduce<Record<string, number>>((acc, finding) => {
      const key =
        finding.hazardCategory ||
        finding.safeScopeResult?.classification ||
        "Uncategorized";

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      totalReports: reports.length,
      totalFindings: findings.length,
      criticalFindings: criticalFindings.length,
      openActions: openActions.length,
      closureRate,
      lowConfidenceFindings,
      locationThemes: Object.entries(locationThemes)
        .filter(([, value]) => value > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
      riskThemes: Object.entries(riskThemes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
    };
  }, [reports, actions]);

  const hasData = analytics.totalReports || analytics.totalFindings || actions.length;

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-white shadow-sm sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Insights
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Safety intelligence trends.
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Review inspection patterns, corrective action signals, risk concentration, and SafeScope activity.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [String(analytics.totalReports), "Reports"],
          [String(analytics.totalFindings), "Findings"],
          [String(analytics.criticalFindings), "Critical Findings"],
          [analytics.closureRate === null ? "—" : `${analytics.closureRate}%`, "Closure Rate"],
          [String(analytics.lowConfidenceFindings), "Low Confidence"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
              {label}
            </p>
          </div>
        ))}
      </section>

      {!hasData && (
        <section className="border-y border-slate-200 py-6">
          <p className="text-sm font-semibold leading-6 text-slate-600">
            Analytics will populate after inspections, reports, and corrective actions are created.
          </p>
        </section>
      )}

      <section className="grid gap-8 border-t border-slate-200 pt-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Risk Themes
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-900">
            Finding concentration
          </h2>

          <div className="mt-5 space-y-4">
            {analytics.riskThemes.length ? (
              analytics.riskThemes.map(([label, value]) => (
                <ProgressRow key={label} label={label} value={value} />
              ))
            ) : (
              <p className="text-sm font-semibold text-slate-500">
                No finding themes available yet.
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Recurring Locations
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-900">
            Repeat exposure areas
          </h2>

          <div className="mt-5 space-y-4">
            {analytics.locationThemes.length ? (
              analytics.locationThemes.map(([label, value]) => (
                <ProgressRow key={label} label={label} value={value} />
              ))
            ) : (
              <p className="text-sm font-semibold text-slate-500">
                No recurring locations detected yet.
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Corrective Action Health
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-900">
            Closure and workload
          </h2>

          <div className="mt-5 border-y border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 py-3">
              <p className="text-sm font-black text-slate-900">Open Actions</p>
              <p className="text-sm font-black text-slate-700">{analytics.openActions}</p>
            </div>
            <div className="flex items-center justify-between py-3">
              <p className="text-sm font-black text-slate-900">Closure Rate</p>
              <p className="text-sm font-black text-slate-700">
                {analytics.closureRate === null ? "No actions yet" : `${analytics.closureRate}%`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
          Calculations & Why It Matters
        </p>
        <h2 className="mt-2 text-xl font-black text-slate-900">
          How Sentinel interprets workspace risk
        </h2>

        <div className="mt-4 border-y border-slate-200">
          {[
            ["Critical Findings", "Findings with a risk score of 20 or greater, or a SafeScope critical risk band.", "Highlights exposures that may require immediate control, leadership review, or verification before restart."],
            ["Closure Rate", "Completed corrective actions divided by total corrective actions.", "Shows whether identified hazards are being converted into verified controls."],
            ["Low Confidence", "SafeScope results below 70% confidence.", "Identifies findings that need stronger evidence, clearer descriptions, or supervisor review."],
            ["Recurring Themes", "Repeated hazard categories or repeated locations across saved findings.", "Flags possible control weakness, training gaps, or supervision drift."]
          ].map(([label, calc, why]) => (
            <div key={label} className="border-b border-slate-200 py-4 last:border-b-0">
              <p className="text-sm font-black text-slate-900">{label}</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                <span className="font-black text-slate-700">Calculation:</span> {calc}
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                <span className="font-black text-slate-700">Why:</span> {why}
              </p>
            </div>
          ))}
        </div>
      </section>

    </section>
  );
}
