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

type WorkflowId = "quick" | "guided";
type PlanEntitlement = Parameters<typeof hasPlanEntitlement>[0];

const workflowOptions: {
  id: WorkflowId;
  title: string;
  eyebrow: string;
  description: string;
  details: string;
  route: string;
  entitlement: PlanEntitlement;
  tierLabel: string;
  inspectionType: string;
}[] = [
  {
    id: "quick",
    title: "Quick Inspection",
    eyebrow: "Free",
    description:
      "Capture a single finding quickly with photo evidence, observed condition, location, hazard category, quick action, and report output.",
    details:
      "Best when you see one issue and need to document it quickly without the full guided inspection workflow.",
    route: "/inspection-quick",
    entitlement: "quickCapture",
    tierLabel: "Free",
    inspectionType: "quick_hazard_capture",
  },
  {
    id: "guided",
    title: "Full Inspection",
    eyebrow: "Pro",
    description:
      "Complete a guided inspection with HazLenz AI review, risk scoring, standards support, corrective actions, and report generation.",
    details:
      "Best when you need a complete professional inspection report with multiple findings, HazLenz AI review, standards support, and final report packaging.",
    route: "/inspection-cover",
    entitlement: "guidedInspection",
    tierLabel: "Pro",
    inspectionType: "guided_inspection",
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
  const [expandedWorkflowId, setExpandedWorkflowId] = useState<WorkflowId | null>(null);
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
    <section className="sentinel-mobile-page space-y-4 sm:space-y-4">
      <HeroPanel align="center" className="text-white">
        <div className="flex flex-col items-center gap-4 sm:p-5 text-center lg:text-left">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
              Inspections
            </p>
            <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-[-0.045em] sm:text-4xl">
              Start field work.
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
              Choose the inspection workflow that fits the work: full documentation, fast hazard capture, or final review.
            </p>
          </div>

        </div>

        <div className="mx-auto mt-4 grid max-w-[390px] grid-cols-2 justify-center gap-2 sm:gap-2.5">
          {[
            [String(programStatus.scheduled), "Scheduled"],
            [String(programStatus.inProgress), "In Progress"],
            [String(programStatus.review), "Awaiting Review"],
            [String(programStatus.actionRequired), "Action Required"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="w-full rounded-xl border border-white/12 bg-white/10 px-4 py-3 text-center shadow-none backdrop-blur"
            >
              <p className="text-2xl font-black tracking-[-0.06em] text-white sm:text-3xl">
                {value}
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-300 sm:text-[10px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </HeroPanel>

      <AppPanel padding="lg" className="overflow-hidden">
        <SectionHeader
          eyebrow="Start"
          title="Choose inspection type"
          description="Use Quick Inspection for fast free capture, or Full Inspection for the guided Pro workflow with HazLenz AI review, standards support, corrective actions, and report generation."
        />

        <div className="mx-auto mt-4 grid max-w-3xl justify-items-center gap-3 sm:grid-cols-2">
          {workflowOptions.map((workflow) => {
            const selected = selectedWorkflow.id === workflow.id;
            const expanded = expandedWorkflowId === workflow.id;
            const allowed = hasPlanEntitlement(workflow.entitlement, planCode);

            const featureRows =
              workflow.id === "quick"
                ? [
                    "Single finding",
                    "Photo evidence",
                    "Observed condition",
                    "Quick report",
                  ]
                : [
                    "Guided evidence",
                    "HazLenz AI review",
                    "Risk + standards",
                    "Full report",
                  ];

            return (
              <article
                key={workflow.id}
                className={`h-full w-full max-w-[320px] overflow-hidden rounded-xl border shadow-none transition hover:-translate-y-0.5 ${
                  selected
                    ? "border-[#1D72B8] bg-[#E8F4FF]"
                    : "border-slate-200/80 bg-white hover:border-blue-200 hover:bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWorkflow(workflow);
                    setExpandedWorkflowId(expanded ? null : workflow.id);
                  }}
                  className="flex min-h-[138px] w-full items-center justify-between gap-3 px-3 py-3 text-left sm:px-4"
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

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-lg font-black text-[#102A43] shadow-none transition">
                    {expanded ? "−" : "+"}
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-slate-200/80 bg-white/85 px-4 py-4 sm:px-5">
                    <p className="text-xs font-semibold leading-5 text-slate-600">
                      {workflow.details}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {featureRows.map((feature) => (
                        <div
                          key={feature}
                          className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-[11px] font-black leading-4 text-slate-600 shadow-none"
                        >
                          {feature}
                        </div>
                      ))}
                    </div>

                    {!allowed && (
                      <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-black leading-5 text-amber-800">
                        {workflow.title} is available on the {workflow.tierLabel} plan.
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
                          className="inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-center !text-white shadow-none sm:w-auto sm:px-6"
                        >
                          Start {workflow.title}
                        </AppLinkButton>
                      ) : (
                        <AppLinkButton
                          href="/pricing"
                          variant="accent"
                          className="inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-center !text-white shadow-none sm:w-auto sm:px-6"
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
          HazLenz AI uses the default regulatory agency from{" "}
          <AppTextLink
            href="/settings"
            className="!text-xs !leading-5 font-black"
            style={{ textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "4px" }}
          >
            Settings
          </AppTextLink>
          . Current default:{" "}
          <span className="font-black text-slate-700">
            {regulatoryScope === "msha"
              ? "MSHA"
              : regulatoryScope === "osha_general"
                ? "OSHA General Industry"
                : regulatoryScope === "osha_construction"
                  ? "OSHA Construction"
                  : "Let HazLenz AI evaluate"}
          </span>
          .
        </p>


      </AppPanel>


    </section>
  );
}
