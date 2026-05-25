"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { clearActiveInspectionDraft } from "@/lib/inspectionDraft";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  InspectionProgramRecord,
  getInspectionProgram,
  seedInspectionProgramIfEmpty,
} from "@/lib/inspectionProgramStorage";

const inspectionTypes = [
  {
    id: "quick_hazard_capture",
    title: "Quick Hazard Capture",
    description:
      "Fast capture for a single hazard, photo, location, brief condition, and action.",
    defaultDepth: "quick",
    badge: "Fast",
  },
  {
    id: "general_safety",
    title: "General Safety Inspection",
    description:
      "Structured field workflow for multiple findings, SafeScope review, risk validation, and reporting.",
    defaultDepth: "standard",
    badge: "Full",
  },
];

const workflowDepths = [
  ["quick", "Quick", "Fastest capture. Minimal required fields."],
  ["standard", "Standard", "Adds risk scoring and structured report detail."],
  [
    "intelligent",
    "Intelligent",
    "Adds SafeScope reasoning, confidence, and standards support.",
  ],
] as const;

const regulatoryFocusOptions = [
  ["general", "General", "Let SafeScope evaluate the likely scope."],
  ["msha", "MSHA", "Mining operations and 30 CFR context."],
  ["osha", "OSHA", "General Industry or Construction context."],
] as const;

function getProgramStatus(programs: InspectionProgramRecord[]) {
  return {
    scheduled: programs.length || 0,
    inProgress: programs.filter((program: any) =>
      String(program.status || "").toLowerCase().includes("progress"),
    ).length,
    review: programs.filter((program: any) =>
      String(program.status || "").toLowerCase().includes("review"),
    ).length,
    actionRequired: programs.filter((program: any) =>
      String(program.status || "").toLowerCase().includes("action"),
    ).length,
  };
}

export default function InspectionsPage() {
  const [inspectionPrograms, setInspectionPrograms] = useState<
    InspectionProgramRecord[]
  >([]);
  const [selectedType, setSelectedType] = useState(inspectionTypes[0]);
  const [selectedDepth, setSelectedDepth] = useState<
    "quick" | "standard" | "intelligent"
  >("quick");
  const [regulatoryFocus, setRegulatoryFocus] = useState<
    "general" | "msha" | "osha"
  >("general");

  useEffect(() => {
    const seeded = seedInspectionProgramIfEmpty();
    setInspectionPrograms(seeded.length ? seeded : getInspectionProgram());
  }, []);

  const programStatus = useMemo(
    () => getProgramStatus(inspectionPrograms),
    [inspectionPrograms],
  );

  const selectedDepthDescription =
    workflowDepths.find(([id]) => id === selectedDepth)?.[2] ||
    "Select a workflow depth.";

  function startInspection() {
    clearActiveInspectionDraft();

    window.localStorage.setItem(
      "sentinel_selected_inspection_context",
      JSON.stringify({
        inspectionType: selectedType.id,
        inspectionTitle: selectedType.title,
        agency:
          regulatoryFocus === "msha"
            ? "MSHA"
            : regulatoryFocus === "osha"
              ? "OSHA"
              : "General",
        workflowDepth: selectedDepth,
      }),
    );
  }

  function selectInspectionType(type: (typeof inspectionTypes)[number]) {
    setSelectedType(type);
    setSelectedDepth(type.defaultDepth as "quick" | "standard" | "intelligent");
  }

  return (
    <section className="space-y-5">
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
              Inspections
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
              Start field work.
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
              Choose the inspection style, set the workflow depth, and begin the
              field capture process.
            </p>
          </div>

          <Link
            href={
              selectedType.id === "quick_hazard_capture" && selectedDepth === "quick"
                ? "/inspection-quick"
                : "/inspection-cover"
            }
            onClick={startInspection}
            className="rounded-xl bg-[#1D72B8] px-4 py-2.5 text-center text-xs font-black text-white shadow-sm transition hover:bg-[#5DB7FF]"
          >
            Start Inspection
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [String(programStatus.scheduled), "Scheduled"],
            [String(programStatus.inProgress), "In Progress"],
            [String(programStatus.review), "Awaiting Review"],
            [String(programStatus.actionRequired), "Action Required"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3"
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

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <SectionHeader
          eyebrow="Start Inspection"
          title="Choose inspection workflow"
          description="Select the field workflow that best fits the work being performed."
        />

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {inspectionTypes.map((type) => {
            const selected = selectedType.id === type.id;

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => selectInspectionType(type)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-[#1D72B8] bg-[#E8F4FF]"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-black text-slate-900">
                      {type.title}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                      {type.description}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                      selected
                        ? "bg-[#1D72B8] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {selected ? "Selected" : type.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Workflow Depth
            </p>

            <div className="mt-3 grid gap-2">
              {workflowDepths.map(([id, label, description]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setSelectedDepth(
                      id as "quick" | "standard" | "intelligent",
                    )
                  }
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    selectedDepth === id
                      ? "border-[#1D72B8] bg-white"
                      : "border-slate-200 bg-white/70 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {label}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                        {description}
                      </p>
                    </div>

                    <span className="text-xs font-black text-[#1D72B8]">
                      {selectedDepth === id ? "Selected" : ""}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Regulatory Focus
            </p>

            <div className="mt-3 grid gap-2">
              {regulatoryFocusOptions.map(([id, label, description]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setRegulatoryFocus(id as "general" | "msha" | "osha")
                  }
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    regulatoryFocus === id
                      ? "border-[#1D72B8] bg-white"
                      : "border-slate-200 bg-white/70 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {label}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                        {description}
                      </p>
                    </div>

                    <span className="text-xs font-black text-[#1D72B8]">
                      {regulatoryFocus === id ? "Selected" : ""}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Selected Setup
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            {selectedType.title} ·{" "}
            {workflowDepths.find(([id]) => id === selectedDepth)?.[1]} ·{" "}
            {
              regulatoryFocusOptions.find(([id]) => id === regulatoryFocus)?.[1]
            }
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            {selectedDepthDescription}
          </p>
        </div>

        <Link
          href={
            selectedType.id === "quick_hazard_capture" && selectedDepth === "quick"
              ? "/inspection-quick"
              : "/inspection-cover"
          }
          onClick={startInspection}
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#F97316] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#EA580C]"
        >
          Begin Selected Inspection
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Inspection Activity
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              Active programs
            </h2>
          </div>
        </div>

        {inspectionPrograms.length ? (
          <div className="mt-4 space-y-2">
            {inspectionPrograms.slice(0, 4).map((program) => (
              <div
                key={program.id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {program.title || "Inspection program"}
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                      {program.inspectionType || "General"} ·{" "}
                      {(program as any).frequency || program.workflowDepth?.replaceAll("_", " ") || "As needed"}
                    </p>
                  </div>

                  <Link
                    href="/inspection-cover"
                    onClick={startInspection}
                    className="shrink-0 rounded-lg bg-[#102A43] px-3 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                  >
                    Start
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
            No active inspection programs yet.
          </p>
        )}
      </section>
    </section>
  );
}
