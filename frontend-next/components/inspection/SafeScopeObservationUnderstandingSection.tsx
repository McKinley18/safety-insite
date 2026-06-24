"use client";

import React from "react";
import SafeScopeDrawer from "@/components/safescope/SafeScopeDrawer";

type SafeScopeObservationUnderstandingSectionProps = {
  safeScopeResult: any;
};

function formatValue(value: any) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (value === null || value === undefined || value === "") return "Not provided";
  const str = String(value).replaceAll("_", " ");
  return str.replace(/safescope/gi, "HazLenz AI");
}

export default function SafeScopeObservationUnderstandingSection({
  safeScopeResult,
}: SafeScopeObservationUnderstandingSectionProps) {
  const understanding = safeScopeResult?.observationUnderstanding;

  if (!understanding) return null;

  const equipment = understanding.equipment;
  const task = understanding.task;
  const exposure = understanding.exposure;
  const energy = understanding.energy;
  const controls = understanding.controls;
  const jurisdiction = understanding.jurisdiction;
  const mechanismCandidates = understanding.mechanismCandidates || [];
  const evidenceGaps = understanding.evidenceGaps || [];
  const scenario = understanding.scenarioUnderstanding?.topScenario;

  return (
    <SafeScopeDrawer
      title="Observation Understanding"
      summary="How HazLenz AI interpreted the observation before matching hazards, standards, and actions."
      badge="HazLenz AI"
    >
      <div className="space-y-3">
        {/* 1. Equipment & Components */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Equipment Involved
          </p>
          <div className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100 capitalize">
            {formatValue(equipment?.specificEquipment || equipment?.category || "Unknown")}
          </div>
          {(equipment?.component || equipment?.motion || equipment?.operationalState) && (
            <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-700 dark:text-white">
              Component: <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{formatValue(equipment?.component)}</span>{" • "}
              Motion: <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{formatValue(equipment?.motion)}</span>{" • "}
              State: <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{formatValue(equipment?.operationalState)}</span>
            </p>
          )}
        </div>

        {/* 2. Task Context & Affected Persons */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Task Activity & Worker Role
          </p>
          <div className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100 capitalize">
            {formatValue(task?.activity || "Unknown")}
          </div>
          <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-700 dark:text-white">
            Task Type: <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{formatValue(task?.taskType)}</span>{" • "}
            Affected Person: <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{formatValue(task?.workerRole || "Worker")}</span>
          </p>
        </div>

        {/* 3. Hazard Scenario & Injury Mechanisms */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Scenario & Injury Mechanisms
          </p>
          {scenario?.scenarioId && (
            <div className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100 capitalize">
              {formatValue(scenario.scenarioId)}
            </div>
          )}
          {scenario?.hazardFamily && (
            <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-white">
              Hazard Family: <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{formatValue(scenario.hazardFamily)}</span>
            </p>
          )}
          {mechanismCandidates.length > 0 && (
            <div className="mt-2.5 space-y-1.5 border-t border-slate-200/50 dark:border-slate-800/50 pt-2.5">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Plausible Mechanisms (Confidence)
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {mechanismCandidates.slice(0, 3).map((cand: any, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded bg-blue-50 dark:bg-blue-950/40 px-2 py-1 text-xs font-bold text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 capitalize"
                  >
                    {formatValue(cand.mechanism)} ({Math.round((cand.confidence || 0) * 100)}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Energy Sources & Exposure Pathways */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
              Energy Sources
            </p>
            <div className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200 capitalize leading-relaxed">
              Primary: <span className="font-black text-slate-900 dark:text-slate-100">{formatValue(energy?.primaryEnergySource || "Unknown")}</span>
              {energy?.sources?.length > 1 && (
                <div className="mt-1 text-[11px] text-slate-700 font-semibold leading-normal">
                  All sources: {energy.sources.map(formatValue).join(", ")}
                </div>
              )}
              {energy?.energyTransferPath && (
                <div className="mt-1 text-[10px] text-slate-600 dark:text-slate-300 font-semibold leading-normal">
                  Path: {energy.energyTransferPath}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
              Exposure Pathways
            </p>
            <div className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200 capitalize leading-relaxed">
              Proximity: <span className="font-black text-slate-900 dark:text-slate-100">{formatValue(exposure?.proximity || "Unknown")}</span>
              {exposure?.exposurePathway && (
                <div className="mt-1 text-[11px] text-slate-700 font-semibold leading-normal">
                  Pathway: {exposure.exposurePathway}
                </div>
              )}
              {exposure?.frequency && (
                <div className="mt-1 text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                  Frequency: {formatValue(exposure.frequency)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. Control Status & Failures */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Control Failures & Status
          </p>
          <div className="mt-1 text-xs font-semibold leading-relaxed">
            {controls?.failedControls?.length > 0 && (
              <div className="text-red-700 dark:text-red-400 font-bold">
                Failed: <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">{controls.failedControls.map(formatValue).join(", ")}</span>
              </div>
            )}
            {controls?.missingControls?.length > 0 && (
              <div className="mt-1 text-amber-700 dark:text-amber-400 font-bold">
                Missing: <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">{controls.missingControls.map(formatValue).join(", ")}</span>
              </div>
            )}
            {controls?.existingControls?.length > 0 && (
              <div className="mt-1 text-green-700 dark:text-green-400 font-bold">
                Existing: <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">{controls.existingControls.map(formatValue).join(", ")}</span>
              </div>
            )}
            {controls?.strongestControlLevel && (
              <p className="mt-1 text-[11px] font-black uppercase tracking-wide text-slate-700">
                Strongest Control Level: <span className="text-slate-800 dark:text-slate-200">{formatValue(controls.strongestControlLevel)}</span>
              </p>
            )}
            {(!controls?.failedControls?.length && !controls?.missingControls?.length && !controls?.existingControls?.length) && (
              <span className="text-slate-700 font-semibold">No control information provided or detected</span>
            )}
          </div>
        </div>

        {/* 6. Jurisdiction & Environment */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Jurisdiction & Environmental Signals
          </p>
          <div className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200 capitalize leading-relaxed">
            Detected: <span className="font-black text-slate-900 dark:text-slate-100">{formatValue(jurisdiction?.detected || "Unclear")}</span>
            {jurisdiction?.evidence?.length > 0 && (
              <div className="mt-1 text-[11px] text-slate-700 font-semibold leading-normal">
                Evidence: {jurisdiction.evidence.join(" • ")}
              </div>
            )}
            {jurisdiction?.confidence && (
              <div className="mt-1 text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                Confidence: {Math.round((jurisdiction.confidence.score || 0) * 100)}% ({jurisdiction.confidence.reasons?.join(", ")})
              </div>
            )}
          </div>
        </div>

        {/* 7. Uncertainty & Evidence Gaps */}
        {evidenceGaps.length > 0 && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 px-3 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-amber-800 dark:text-amber-400">
              Uncertainty & Evidence Gaps
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs font-semibold leading-relaxed text-amber-900 dark:text-amber-300">
              {evidenceGaps.map((gap: string) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Advisory Guardrails disclaimer */}
        <p className="text-[10px] font-semibold leading-normal text-slate-600 dark:text-slate-300 border-t border-slate-200/50 dark:border-slate-800/50 pt-2.5">
          ℹ️ HazLenz AI understanding is advisory and requires qualified review. This analysis is generated from field observation text and does not declare regulatory violations or citations.
        </p>
      </div>
    </SafeScopeDrawer>
  );
}
