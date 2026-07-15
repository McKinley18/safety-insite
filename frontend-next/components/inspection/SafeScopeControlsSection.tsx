"use client";

import { useState } from "react";
import type { StructuredObservationInput } from "@/lib/safescope";

type Props = {
  safeScopeHelpOpen: boolean;
  setSafeScopeHelpOpen: (updater: any) => void;
  agencyMode: string;
  riskProfileId: "simple_4x4" | "standard_5x5" | "advanced_6x6";
  handleRunSafeScope: (forceOffline?: boolean, structuredObservation?: StructuredObservationInput) => void;
  safeScopeStatus: string;
  safeScopeResult?: any;
};

function formatConfidence(value: any) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return "0%";
  if (number <= 1) return `${Math.round(number * 100)}%`;
  return `${Math.round(number)}%`;
}

function formatRisk(value: any) {
  return String(value || "Review").replaceAll("_", " ").toUpperCase();
}

export default function SafeScopeControlsSection({
  safeScopeHelpOpen,
  setSafeScopeHelpOpen,
  agencyMode,
  riskProfileId,
  handleRunSafeScope,
  safeScopeStatus,
  safeScopeResult,
}: Props) {
  const [contextOpen, setContextOpen] = useState(false);
  const [taskBeingPerformed, setTaskBeingPerformed] = useState("");
  const [equipmentOrArea, setEquipmentOrArea] = useState("");
  const [workerInteraction, setWorkerInteraction] = useState("");
  const [energyState, setEnergyState] = useState<StructuredObservationInput["energyState"]>("unknown");
  const [controlsPresent, setControlsPresent] = useState("");
  const [controlsMissing, setControlsMissing] = useState("");
  const [structuredJurisdiction, setStructuredJurisdiction] =
    useState<StructuredObservationInput["jurisdiction"]>("unknown");

  const buildStructuredObservation = (): StructuredObservationInput | undefined => {
    const structured: StructuredObservationInput = {
      taskBeingPerformed: taskBeingPerformed.trim() || undefined,
      equipmentInvolved: equipmentOrArea
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      workerInteraction: workerInteraction.trim() || undefined,
      energyState,
      controlsMissing: controlsMissing
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      controlsPresent: controlsPresent
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      jurisdiction: structuredJurisdiction,
    };

    const hasValue = Object.entries(structured).some(([key, value]) => {
      if (key === "energyState" || key === "jurisdiction") {
        return value && value !== "unknown";
      }
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    });

    return hasValue ? structured : undefined;
  };

  const confidence =
    safeScopeResult?.confidenceIntelligence?.overallConfidence ??
    safeScopeResult?.confidence ??
    0;

  const topStandard = safeScopeResult?.suggestedStandards?.[0];
  const riskBand =
    safeScopeResult?.risk?.riskBand ||
    safeScopeResult?.risk?.operationalRisk?.matrixBand ||
    "Review";

  const scopeLabel =
    agencyMode === "msha"
      ? "MSHA"
      : agencyMode === "osha_general"
        ? "OSHA General Industry"
        : agencyMode === "osha_construction"
          ? "OSHA Construction"
          : "Default";

  const riskMatrixLabel =
    riskProfileId === "simple_4x4"
      ? "Simple 4x4"
      : riskProfileId === "advanced_6x6"
        ? "Expanded 6x6"
        : "Standard 5x5";

  return (
    <section className="mb-4 rounded-2xl border border-[#102A43] bg-[#102A43] p-5 text-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
            Finding Review
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">
            Review this finding
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
            HazLenz AI will help organize the hazard, suggest standards,
            score risk, and identify corrective action focus.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSafeScopeHelpOpen((open: boolean) => !open)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-black text-white"
          aria-label="Explain HazLenz AI review mode"
        >
          ?
        </button>
      </div>

      {safeScopeHelpOpen && (
        <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold leading-5 text-blue-100 ring-1 ring-white/10">
          HazLenz AI helps prepare the finding for review. Final compliance
          decisions remain with qualified personnel. Agency scope and risk
          matrix are pulled from Settings.
        </p>
      )}

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            console.log("[HazLenz AI] Button clicked");
            handleRunSafeScope(false, buildStructuredObservation());
          }}
          className="insite-inspection-action insite-inspection-action-orange insite-inspection-action-sm mx-auto"
        >
          Review with HazLenz AI
        </button>

        {safeScopeStatus && (
          <p className="mt-2 text-center text-xs font-bold leading-5 text-slate-300">
            {safeScopeStatus}
          </p>
        )}

        <p className="mt-2 text-center text-[11px] font-bold leading-5 text-blue-100">
          Using {scopeLabel} · {riskMatrixLabel}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3">
        <button
          type="button"
          onClick={() => setContextOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 text-left text-xs font-black uppercase tracking-wide text-blue-100"
        >
          <span>Add context for better accuracy</span>
          <span>{contextOpen ? "Hide" : "Optional"}</span>
        </button>

        {contextOpen && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="block text-xs font-bold text-blue-100">
              What work was happening?
              <input
                value={taskBeingPerformed}
                onChange={(event) => setTaskBeingPerformed(event.target.value)}
                placeholder="Clearing jam, operating, maintenance"
                className="mt-1 w-full rounded-xl border border-white/15 bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-300"
              />
            </label>

            <label className="block text-xs font-bold text-blue-100">
              What equipment or area was involved?
              <input
                value={equipmentOrArea}
                onChange={(event) => setEquipmentOrArea(event.target.value)}
                placeholder="Conveyor, ladder, cord, platform"
                className="mt-1 w-full rounded-xl border border-white/15 bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-300"
              />
            </label>

            <label className="block text-xs font-bold text-blue-100">
              Was anyone exposed or interacting?
              <input
                value={workerInteraction}
                onChange={(event) => setWorkerInteraction(event.target.value)}
                placeholder="Worker reaching in, no exposure observed"
                className="mt-1 w-full rounded-xl border border-white/15 bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-300"
              />
            </label>

            <label className="block text-xs font-bold text-blue-100">
              Equipment state
              <select
                value={energyState}
                onChange={(event) => setEnergyState(event.target.value as StructuredObservationInput["energyState"])}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-300"
              >
                <option value="unknown">Unknown</option>
                <option value="energized">Energized</option>
                <option value="operating">Operating</option>
                <option value="stopped">Stopped</option>
                <option value="deenergized">Deenergized</option>
                <option value="locked-out">Locked out</option>
              </select>
            </label>

            <label className="block text-xs font-bold text-blue-100">
              What protection or control was present?
              <input
                value={controlsPresent}
                onChange={(event) => setControlsPresent(event.target.value)}
                placeholder="Guard installed, LOTO applied"
                className="mt-1 w-full rounded-xl border border-white/15 bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-300"
              />
            </label>

            <label className="block text-xs font-bold text-blue-100">
              What control was missing or ineffective?
              <input
                value={controlsMissing}
                onChange={(event) => setControlsMissing(event.target.value)}
                placeholder="Guard removed, no fall protection"
                className="mt-1 w-full rounded-xl border border-white/15 bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-300"
              />
            </label>

            <label className="block text-xs font-bold text-blue-100">
              Where did this occur?
              <select
                value={structuredJurisdiction}
                onChange={(event) => setStructuredJurisdiction(event.target.value as StructuredObservationInput["jurisdiction"])}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-300"
              >
                <option value="unknown">Unknown</option>
                <option value="msha">Mine, mill, quarry, or pit</option>
                <option value="osha-general-industry">General industry workplace</option>
                <option value="osha-construction">Construction site</option>
              </select>
            </label>
          </div>
        )}
      </div>

      {safeScopeResult && (
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="min-w-0 flex min-h-[72px] flex-col items-center justify-center rounded-xl bg-white/10 px-2 py-3 text-center ring-1 ring-white/15">
            <p className="text-[9px] font-black uppercase tracking-wide text-blue-100">
              Confidence
            </p>
            <p className="mt-1 max-w-full truncate text-sm font-black text-white sm:text-base lg:text-lg">
              {formatConfidence(confidence)}
            </p>
          </div>

          <div className="min-w-0 flex min-h-[72px] flex-col items-center justify-center rounded-xl bg-white/10 px-2 py-3 text-center ring-1 ring-white/15">
            <p className="text-[9px] font-black uppercase tracking-wide text-blue-100">
              Risk
            </p>
            <p className="mt-1 max-w-full truncate text-sm font-black text-white sm:text-base lg:text-lg">
              {formatRisk(riskBand)}
            </p>
          </div>

          <div className="min-w-0 flex min-h-[72px] flex-col items-center justify-center rounded-xl bg-white/10 px-2 py-3 text-center ring-1 ring-white/15">
            <p className="text-[9px] font-black uppercase tracking-wide text-blue-100">
              Standard
            </p>
            <p className="mt-1 max-w-full truncate text-[11px] font-black text-white sm:text-sm lg:text-base" title={topStandard?.citation || "Review"}>
              {topStandard?.citation || "Review"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
