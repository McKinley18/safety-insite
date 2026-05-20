"use client";

import { useEffect, useState } from "react";
import { clearActiveInspectionDraft } from "@/lib/inspectionDraft";
import PageHeader from "@/components/ui/PageHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import SectionHeader from "@/components/ui/SectionHeader";
import MetricBlock from "@/components/ui/MetricBlock";
import EmptyState from "@/components/ui/EmptyState";
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
      "Fast photo, hazard category, short description, location, and action capture.",
    defaultDepth: "quick",
  },
  {
    id: "general_safety",
    title: "General Safety Inspection",
    description:
      "A more complete inspection workflow for multiple findings, evidence, risk review, and reporting.",
    defaultDepth: "standard",
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

const programStats = [
  ["2", "Scheduled"],
  ["1", "In Progress"],
  ["0", "Awaiting Review"],
  ["0", "Action Required"],
];

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
    <section className="space-y-7">
      <PageHeader
        eyebrow="Inspection Program"
        title="Inspections"
        description="Choose the inspection type, select the workflow depth, then start the field workflow."
      />

      <section className="border-t border-slate-200 py-5">
        <SectionHeader
          eyebrow="Start Inspection"
          title="Choose inspection type"
          description="Select the workflow, then begin field capture."
        />

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
              Inspection Type
            </span>
            <select
              value={selectedType.id}
              onChange={(event) => {
                const nextType =
                  inspectionTypes.find(
                    (type) => type.id === event.target.value,
                  ) || inspectionTypes[0];
                selectInspectionType(nextType);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
            >
              {inspectionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.title}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
              {selectedType.description}
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
              Workflow Depth
            </span>
            <select
              value={selectedDepth}
              onChange={(event) =>
                setSelectedDepth(
                  event.target.value as "quick" | "standard" | "intelligent",
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
            >
              {workflowDepths.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
              {workflowDepths.find(([id]) => id === selectedDepth)?.[2]}
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
              Regulatory Focus
            </span>
            <select
              value={regulatoryFocus}
              onChange={(event) =>
                setRegulatoryFocus(
                  event.target.value as "general" | "msha" | "osha",
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
            >
              <option value="general">General / Let SafeScope evaluate</option>
              <option value="msha">MSHA</option>
              <option value="osha">OSHA</option>
            </select>
            <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
              Can be refined during SafeScope review.
            </span>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold leading-6 text-slate-600">
            <span className="font-black text-slate-900">
              {selectedType.title}
            </span>{" "}
            · {regulatoryFocus.toUpperCase()} ·{" "}
            {selectedDepth.charAt(0).toUpperCase() + selectedDepth.slice(1)}
          </p>

          <div className="flex flex-wrap gap-2">
            <PrimaryButton
              href={
                selectedType.id === "quick_hazard_capture"
                  ? "/inspection-quick"
                  : "/inspection-cover"
              }
              onClick={startInspection}
            >
              Start Inspection
            </PrimaryButton>

            <SecondaryButton href="/reports">View Reports</SecondaryButton>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 py-5">
        <SectionHeader
          eyebrow="Program Status"
          title="Inspection workload"
          description="A quick view of scheduled, active, and review-based inspection activity."
        />

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {programStats.map(([value, label]) => (
            <MetricBlock key={label} value={value} label={label} />
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 py-5">
        <SectionHeader
          title="Saved Drafts"
          description="Draft inspections will appear here when an inspection is started but not finalized."
        />

        <div className="mt-4">
          {inspectionPrograms.length ? (
            <div className="border-y border-slate-200">
              {inspectionPrograms.slice(0, 3).map((program) => (
                <div
                  key={program.id}
                  className="border-b border-slate-200 py-4 last:border-b-0"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-black text-slate-900">
                        {program.title}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {program.inspectionType} •{" "}
                        {program.workflowDepth.replaceAll("_", " ")} •{" "}
                        {program.status.replaceAll("_", " ")}
                      </p>
                    </div>

                    <PrimaryButton
                      href="/inspection-cover"
                      onClick={() => clearActiveInspectionDraft()}
                    >
                      Continue
                    </PrimaryButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No unfinished inspections yet." />
          )}
        </div>
      </section>
    </section>
  );
}
