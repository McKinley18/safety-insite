"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { clearActiveInspectionDraft } from "@/lib/inspectionDraft";
import {
  InspectionProgramRecord,
  getInspectionProgram,
  seedInspectionProgramIfEmpty,
} from "@/lib/inspectionProgramStorage";
import {
  EntitlementKey,
  getStoredPlanCode,
  hasPlanEntitlement,
  type PlanCode,
} from "@/lib/planEntitlements";

type WorkflowId = "quick" | "guided" | "advanced";

const workflowOptions: {
  id: WorkflowId;
  title: string;
  eyebrow: string;
  description: string;
  details: string;
  route: string;
  entitlement: EntitlementKey;
  tierLabel: string;
  inspectionType: string;
}[] = [
  {
    id: "quick",
    title: "Quick Capture",
    eyebrow: "Basic",
    description:
      "Document a hazard fast with photo, location, and observed condition.",
    details:
      "Best for quick field documentation and fast SafeScope summary support.",
    route: "/inspection-quick",
    entitlement: "quickCapture",
    tierLabel: "Included",
    inspectionType: "quick_hazard_capture",
  },
  {
    id: "guided",
    title: "Guided Inspection",
    eyebrow: "Pro",
    description:
      "Use the structured workflow for evidence, SafeScope review, risk, standards, actions, and report options.",
    details:
      "Best for routine safety inspections and professional individual reporting.",
    route: "/inspection-cover",
    entitlement: "guidedInspection",
    tierLabel: "Pro",
    inspectionType: "guided_inspection",
  },
  {
    id: "advanced",
    title: "Advanced Review",
    eyebrow: "Company",
    description:
      "Build an audit-ready record with deeper validation, traceability, review triggers, and company workflow support.",
    details:
      "Best for formal audits, complex findings, team accountability, and defensible compliance records.",
    route: "/inspection-cover",
    entitlement: "advancedReview",
    tierLabel: "Company",
    inspectionType: "advanced_review",
  },
];


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

function planLabel(planCode: PlanCode) {
  if (planCode === "company") return "Company";
  if (planCode === "plus") return "Pro";
  return "Basic";
}

export default function InspectionsPage() {
  const [inspectionPrograms, setInspectionPrograms] = useState<
    InspectionProgramRecord[]
  >([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(workflowOptions[0]);
  const [expandedWorkflowId, setExpandedWorkflowId] = useState<WorkflowId | null>("quick");
  const [planCode, setPlanCode] = useState<PlanCode>("basic");
  const [regulatoryScope, setRegulatoryScope] = useState("all");

  useEffect(() => {
    const seeded = seedInspectionProgramIfEmpty();
    setInspectionPrograms(seeded.length ? seeded : getInspectionProgram());
    setPlanCode(getStoredPlanCode());
    setRegulatoryScope(window.localStorage.getItem("sentinel_regulatory_scope") || "all");
  }, []);

  const programStatus = useMemo(
    () => getProgramStatus(inspectionPrograms),
    [inspectionPrograms],
  );

  const selectedAllowed = hasPlanEntitlement(
    selectedWorkflow.entitlement,
    planCode,
  );

  function startInspection(workflow = selectedWorkflow) {
    if (!hasPlanEntitlement(workflow.entitlement, planCode)) return;

    clearActiveInspectionDraft();

    window.localStorage.setItem(
      "sentinel_selected_inspection_context",
      JSON.stringify({
        inspectionType: workflow.inspectionType,
        inspectionTitle: workflow.title,
        agency:
          regulatoryScope === "msha"
            ? "MSHA"
            : regulatoryScope === "osha_general"
              ? "OSHA General Industry"
              : regulatoryScope === "osha_construction"
                ? "OSHA Construction"
                : "General",
        workflowDepth: workflow.id,
      }),
    );
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
              Choose the right inspection depth for the work: quick capture,
              guided inspection, or advanced audit-ready review.
            </p>
          </div>

          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white">
            {planLabel(planCode)} Plan
          </span>
        </div>

        <div className="mx-auto mt-5 grid max-w-4xl grid-cols-2 justify-center gap-3 lg:grid-cols-4">
          {[
            [String(programStatus.scheduled), "Scheduled"],
            [String(programStatus.inProgress), "In Progress"],
            [String(programStatus.review), "Awaiting Review"],
            [String(programStatus.actionRequired), "Action Required"],
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

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Choose Workflow
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            What kind of inspection are you doing?
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Each option creates the same report structure, but changes how much
            detail is required from the user.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {workflowOptions.map((workflow) => {
            const selected = selectedWorkflow.id === workflow.id;
            const expanded = expandedWorkflowId === workflow.id;
            const allowed = hasPlanEntitlement(workflow.entitlement, planCode);

            const featureRows =
              workflow.id === "quick"
                ? [
                    "Photo + location + condition",
                    "SafeScope quick preview",
                    "Risk signal",
                    "One suggested action",
                  ]
                : workflow.id === "guided"
                  ? [
                      "Evidence workflow",
                      "Full SafeScope review",
                      "Standards suggestions",
                      "Report options",
                    ]
                  : [
                      "Audit validation",
                      "Traceability appendix",
                      "Review triggers",
                      "Team accountability",
                    ];

            return (
              <article
                key={workflow.id}
                className={`overflow-hidden rounded-2xl border shadow-sm transition ${
                  selected
                    ? "border-[#1D72B8] bg-[#E8F4FF]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWorkflow(workflow);
                    setExpandedWorkflowId(expanded ? null : workflow.id);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left sm:px-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                        {workflow.eyebrow}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                          allowed
                            ? selected
                              ? "bg-[#1D72B8] text-white"
                              : "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {allowed
                          ? selected
                            ? "Selected"
                            : workflow.tierLabel
                          : workflow.tierLabel}
                      </span>
                    </div>

                    <h3 className="mt-1 text-base font-black leading-tight text-slate-900">
                      {workflow.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                      {workflow.description}
                    </p>
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-black text-[#102A43] shadow-sm transition">
                    {expanded ? "−" : "+"}
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-slate-200 bg-white px-3 py-3 sm:px-4">
                    <p className="text-xs font-semibold leading-5 text-slate-600">
                      {workflow.details}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {featureRows.map((feature) => (
                        <div
                          key={feature}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] font-black leading-4 text-slate-600"
                        >
                          {feature}
                        </div>
                      ))}
                    </div>

                    {!allowed && (
                      <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-black leading-5 text-amber-800">
                        {workflow.title} requires the {workflow.tierLabel} plan.
                      </p>
                    )}

                    {allowed ? (
                      <Link
                        href={workflow.route}
                        onClick={() => {
                          setSelectedWorkflow(workflow);
                          startInspection(workflow);
                        }}
                        className="mt-3 flex w-full items-center justify-center rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-black text-black shadow-sm transition hover:bg-[#EA580C]"
                      >
                        Start {workflow.title}
                      </Link>
                    ) : (
                      <Link
                        href="/pricing"
                        className="mt-3 flex w-full items-center justify-center rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-black text-black shadow-sm transition hover:bg-[#EA580C]"
                      >
                        Unlock This Workflow
                      </Link>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Regulatory Agency
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            SafeScope uses the default regulatory agency selected in Workspace Settings.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-black text-slate-900">
              Current default: {
                regulatoryScope === "msha"
                  ? "MSHA"
                  : regulatoryScope === "osha_general"
                    ? "OSHA General Industry"
                    : regulatoryScope === "osha_construction"
                      ? "OSHA Construction"
                      : "All / Let SafeScope evaluate"
              }
            </p>
            <Link
              href="/settings/workspace"
              className="rounded-xl border border-[#1D72B8] bg-white px-3 py-2 text-center text-xs font-black text-[#102A43] transition hover:bg-[#E8F4FF]"
            >
              Change in Settings
            </Link>
          </div>
        </div>

      </section>

      {hasPlanEntitlement("inspectionAssignments", planCode) && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                Company Assignments
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                Active programs
              </h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                Company plan workspaces can assign inspections and track team
                activity.
              </p>
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
                        {(program as any).frequency ||
                          program.workflowDepth?.replaceAll("_", " ") ||
                          "As needed"}
                      </p>
                    </div>

                    <Link
                      href="/inspection-cover"
                      onClick={() => startInspection(selectedWorkflow)}
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
      )}
    </section>
  );
}
