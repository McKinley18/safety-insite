"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearActiveInspectionDraft } from "@/lib/inspectionDraft";
import PageHeader from "@/components/ui/PageHeader";
import {
  InspectionProgramRecord,
  getInspectionProgram,
  seedInspectionProgramIfEmpty,
} from "@/lib/inspectionProgramStorage";

const programStats = [
  ["2", "Scheduled"],
  ["1", "In Progress"],
  ["0", "Awaiting Review"],
  ["0", "Action Required"],
];

const workflowDepths = [
  {
    level: "Level 1",
    title: "Quick Capture",
    description:
      "Fast field documentation with photo capture, hazard category selection, and action assignment.",
    features: [
      "Photo capture",
      "Hazard category",
      "Short description",
      "Assign action",
    ],
    tone: "bg-slate-50 border-slate-200",
  },
  {
    level: "Level 2",
    title: "Standard Inspection",
    description:
      "Structured inspections with risk scoring, findings management, and corrective actions.",
    features: [
      "Severity scoring",
      "Likelihood scoring",
      "Corrective actions",
      "Professional reporting",
    ],
    tone: "bg-blue-50 border-blue-100",
  },
  {
    level: "Level 3",
    title: "Intelligent Inspection",
    description:
      "SafeScope-assisted operational intelligence with standards reasoning and defensibility insight.",
    features: [
      "SafeScope intelligence",
      "Confidence scoring",
      "Standards reasoning",
      "Escalation detection",
    ],
    tone: "bg-emerald-50 border-emerald-100",
  },
];

const inspectionProgram = [
  {
    title: "Workplace Exam",
    type: "MSHA / Field",
    status: "Scheduled",
    location: "Primary Operation",
    assignedTo: "Unassigned",
    due: "Set during start",
    progress: "0%",
    risk: "Not started",
  },
  {
    title: "General Safety Inspection",
    type: "OSHA / Facility",
    status: "Ready",
    location: "Plant / Facility",
    assignedTo: "Current user",
    due: "Open",
    progress: "0%",
    risk: "Not started",
  },
  {
    title: "Contractor Area Audit",
    type: "Contractor / Site",
    status: "Template",
    location: "Custom",
    assignedTo: "Choose inspector",
    due: "Optional",
    progress: "0%",
    risk: "Not started",
  },
];

function statusClass(status: string) {
  if (status === "Scheduled") return "bg-blue-50 text-blue-700";
  if (status === "Ready") return "bg-emerald-50 text-emerald-700";
  return "bg-slate-100 text-slate-700";
}

export default function InspectionsPage() {
  const [inspectionPrograms, setInspectionPrograms] = useState<InspectionProgramRecord[]>([]);

  useEffect(() => {
    const seeded = seedInspectionProgramIfEmpty();
    setInspectionPrograms(seeded.length ? seeded : getInspectionProgram());
  }, []);

  return (
    <section className="space-y-7">
      <PageHeader
        eyebrow="Inspection Program"
        title="Inspections"
        description="Plan, start, and manage operational inspections from one workspace."
      />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[24px] bg-[#0B1320] px-5 py-6 text-white shadow-sm">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[1px] text-[#F97316]">
            Guided Workflow
          </p>
          <h2 className="text-2xl font-black">Start a field-ready inspection</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
            Build a professional inspection record with cover details, hazard observations,
            photos, SafeScope standards support, risk review, corrective actions, and final report generation.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/inspection-cover"
              onClick={() => clearActiveInspectionDraft()}
              className="rounded-xl bg-[#F97316] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-500"
            >
              Start Inspection
            </Link>

            <Link
              href="/reports"
              className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
            >
              View Reports
            </Link>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Program Status
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {programStats.map(([value, label]) => (
              <div key={label} className="rounded-xl bg-slate-50 px-3 py-3 text-center">
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Workflow Depth
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-900">
              Scale inspection complexity to the operation
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Sentinel Safety adapts from quick field capture to advanced operational intelligence workflows.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {workflowDepths.map((workflow) => (
            <div
              key={workflow.title}
              className={`rounded-2xl border p-4 ${workflow.tone}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-700">
                  {workflow.level}
                </span>
              </div>

              <h3 className="mt-3 text-lg font-black text-slate-900">
                {workflow.title}
              </h3>

              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                {workflow.description}
              </p>

              <div className="mt-4 space-y-2">
                {workflow.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-xl bg-white px-3 py-2 text-sm font-black text-slate-700"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Inspection Workflows
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">Start from an operational template</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Templates help standardize inspection quality while keeping field entry fast.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-600">
            Templates
          </span>
        </div>

        <div className="mt-5 grid gap-4">
          {inspectionProgram.map((inspection) => (
            <div key={inspection.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(inspection.status)}`}>
                      {inspection.status}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
                      {inspection.type}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-black text-slate-900">
                    {inspection.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {inspection.location}
                  </p>
                </div>

                <Link
                  href="/inspection-cover"
                  onClick={() => clearActiveInspectionDraft()}
                  className="rounded-xl bg-[#102A43] px-4 py-2.5 text-center text-sm font-black text-white transition hover:bg-[#1D72B8]"
                >
                  Start
                </Link>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                {[
                  ["Assigned", inspection.assignedTo],
                  ["Due", inspection.due],
                  ["Progress", inspection.progress],
                  ["Risk", inspection.risk],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-white px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 font-black text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5">
        <h2 className="text-xl font-black text-slate-900">Saved Drafts</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Draft inspections will appear here when an inspection is started but not finalized.
        </p>
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
          No unfinished inspections yet.
        </p>
      </section>
    </section>
  );
}
