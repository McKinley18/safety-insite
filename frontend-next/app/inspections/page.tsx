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
    description: "Fast photo, hazard category, short description, location, and action capture.",
    defaultDepth: "quick",
  },
  {
    id: "general_safety",
    title: "General Safety Inspection",
    description: "A more complete inspection workflow for multiple findings, evidence, risk review, and reporting.",
    defaultDepth: "standard",
  },
];

const workflowDepths = [
  ["quick", "Quick", "Fastest capture. Minimal required fields."],
  ["standard", "Standard", "Adds risk scoring and structured report detail."],
  ["intelligent", "Intelligent", "Adds SafeScope reasoning, confidence, and standards support."],
] as const;

const programStats = [
  ["2", "Scheduled"],
  ["1", "In Progress"],
  ["0", "Awaiting Review"],
  ["0", "Action Required"],
];

export default function InspectionsPage() {
  const [inspectionPrograms, setInspectionPrograms] = useState<InspectionProgramRecord[]>([]);
  const [selectedType, setSelectedType] = useState(inspectionTypes[0]);
  const [selectedDepth, setSelectedDepth] = useState<"quick" | "standard" | "intelligent">("quick");
  const [regulatoryFocus, setRegulatoryFocus] = useState<"general" | "msha" | "osha">("general");

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
        agency: regulatoryFocus === "msha" ? "MSHA" : regulatoryFocus === "osha" ? "OSHA" : "General",
        workflowDepth: selectedDepth,
      })
    );
  }

  function selectInspectionType(type: typeof inspectionTypes[number]) {
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

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="border-t border-slate-200 py-5">
          <SectionHeader
            eyebrow="Start Inspection"
            title="Choose inspection type"
            description="Different inspection types can shape the report, regulatory emphasis, and intelligence layer."
          />

          <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
            {inspectionTypes.map((type) => {
              const selected = selectedType.id === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => selectInspectionType(type)}
                  className={`w-full py-4 text-left transition ${
                    selected ? "bg-[#F8FBFF]" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        {type.title}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                        {type.description}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-3 text-xs font-black uppercase tracking-wide text-slate-400">
                      {selected && <span className="text-[#1D72B8]">Selected</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="border-t border-slate-200 py-5">
          <SectionHeader
            eyebrow="Workflow Depth"
            title="Set detail level"
            description="Start fast, then add intelligence when needed."
          />

          <div className="mt-5 space-y-2">
            {workflowDepths.map(([id, label, description]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedDepth(id)}
                className={`w-full rounded-xl border px-4 py-3 text-left ${
                  selectedDepth === id
                    ? "border-[#1D72B8] bg-[#F8FBFF]"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-black text-slate-900">{label}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  {description}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Regulatory Focus
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ["general", "General"],
                ["msha", "MSHA"],
                ["osha", "OSHA"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRegulatoryFocus(id as "general" | "msha" | "osha")}
                  className={`rounded-xl border px-3 py-2 text-xs font-black ${
                    regulatoryFocus === id
                      ? "border-[#1D72B8] bg-[#F8FBFF] text-[#1D72B8]"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Selected
            </p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {selectedType.title}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {regulatoryFocus.toUpperCase()} • {selectedDepth.charAt(0).toUpperCase() + selectedDepth.slice(1)} workflow
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <PrimaryButton
                href={selectedType.id === "quick_hazard_capture" ? "/inspection" : "/inspection-cover"}
                onClick={startInspection}
              >
                Start Inspection
              </PrimaryButton>

              <SecondaryButton href="/reports">
                View Reports
              </SecondaryButton>
            </div>
          </div>
        </aside>
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
                <div key={program.id} className="border-b border-slate-200 py-4 last:border-b-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-black text-slate-900">{program.title}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {program.inspectionType} • {program.workflowDepth.replaceAll("_", " ")} • {program.status.replaceAll("_", " ")}
                      </p>
                    </div>

                    <PrimaryButton href="/inspection-cover" onClick={() => clearActiveInspectionDraft()}>
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
