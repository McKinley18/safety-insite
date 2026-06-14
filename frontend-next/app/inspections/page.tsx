"use client";

import { useEffect, useMemo, useState } from "react";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { AppTextLink } from "@/components/ui/AppTextLink";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import { clearActiveInspectionDraft } from "@/lib/inspectionDraft";
import {
  InspectionProgramRecord,
  getInspectionProgram,
  seedInspectionProgramIfEmpty,
} from "@/lib/inspectionProgramStorage";
import {
  EntitlementKey,
  getPlanDisplayName,
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
      "Best for quick field documentation and fast ReviewCore summary support.",
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
      "Use the structured workflow for evidence, ReviewCore review, risk, standards, actions, and report options.",
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
  return getPlanDisplayName(planCode);
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
    <section className="sentinel-mobile-page space-y-5 sm:space-y-6">
      <HeroPanel align="center" className="text-white">
        <div className="flex flex-col items-center gap-4 sm:p-5 text-center lg:text-left">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
              Inspections
            </p>
            <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">
              Start field work.
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
              Choose the right inspection depth for the work: quick capture,
              guided inspection, or advanced audit-ready review.
            </p>
          </div>

        </div>

        <div className="mx-auto mt-4 grid max-w-3xl grid-cols-4 justify-center gap-1.5 sm:gap-2">
          {[
            [String(programStatus.scheduled), "Scheduled"],
            [String(programStatus.inProgress), "In Progress"],
            [String(programStatus.review), "Awaiting Review"],
            [String(programStatus.actionRequired), "Action Required"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-center shadow-sm backdrop-blur"
            >
              <p className="text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">
                {value}
              </p>
              <p className="mt-0.5 truncate text-[8px] font-black uppercase tracking-wide text-slate-300 sm:text-[9px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </HeroPanel>

      <AppPanel padding="lg" className="overflow-hidden">
        <SectionHeader
          eyebrow="Choose Workflow"
          title="What kind of inspection are you doing?"
          description="Each option creates the same report structure, but changes how much detail is required from the user."
        />

        <div className="mt-4 space-y-2">
          {workflowOptions.map((workflow) => {
            const selected = selectedWorkflow.id === workflow.id;
            const expanded = expandedWorkflowId === workflow.id;
            const allowed = hasPlanEntitlement(workflow.entitlement, planCode);

            const featureRows =
              workflow.id === "quick"
                ? [
                    "Photo + location + condition",
                    "ReviewCore quick preview",
                    "Risk signal",
                    "One suggested action",
                  ]
                : workflow.id === "guided"
                  ? [
                      "Evidence workflow",
                      "Full ReviewCore review",
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
                className={`overflow-hidden rounded-xl border shadow-sm transition hover:-translate-y-0.5 ${
                  selected
                    ? "border-[#1D72B8] bg-[#E8F4FF]"
                    : "border-slate-200 bg-white/90 hover:border-blue-200 hover:bg-white"
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
                    <div className="flex flex-col items-start gap-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                        {workflow.eyebrow}
                      </p>

                    </div>

                    <h3 className="mt-1 text-base font-black leading-tight text-slate-900">
                      {workflow.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                      {workflow.description}
                    </p>
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-black text-[#102A43] shadow-sm transition">
                    {expanded ? "−" : "+"}
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-slate-200 bg-white/85 px-4 py-4 sm:px-5">
                    <p className="text-xs font-semibold leading-5 text-slate-600">
                      {workflow.details}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {featureRows.map((feature) => (
                        <div
                          key={feature}
                          className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-[11px] font-black leading-4 text-slate-600 shadow-sm"
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

                    <div className="mt-3 flex justify-center">
                      {allowed ? (
                        <AppLinkButton
                          href={workflow.route}
                          onClick={() => {
                            setSelectedWorkflow(workflow);
                            startInspection(workflow);
                          }}
                          variant="accent"
                          className="inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-center !text-white shadow-sm sm:w-auto sm:px-6"
                        >
                          Start Inspection
                        </AppLinkButton>
                      ) : (
                        <AppLinkButton
                          href="/pricing"
                          variant="accent"
                          className="inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-center !text-white shadow-sm sm:w-auto sm:px-6"
                        >
                          Unlock This Workflow
                        </AppLinkButton>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>


        <p className="mx-auto mt-4 max-w-sm text-center text-xs font-semibold leading-5 text-slate-500">
          ReviewCore uses the default regulatory agency from{" "}
          <AppTextLink
            href="/settings/workspace"
            className="!text-xs !leading-5 font-black"
            style={{ textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "4px" }}
          >
            Workspace Settings
          </AppTextLink>
          . Current default:{" "}
          <span className="font-black text-slate-700">
            {regulatoryScope === "msha"
              ? "MSHA"
              : regulatoryScope === "osha_general"
                ? "OSHA General Industry"
                : regulatoryScope === "osha_construction"
                  ? "OSHA Construction"
                  : "Let ReviewCore evaluate"}
          </span>
          .
        </p>


      </AppPanel>


    </section>
  );
}
