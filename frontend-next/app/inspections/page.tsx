"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  getStoredPlanCode,
  getVerifiedPlanCode,
  hasPlanEntitlement,
  type PlanCode,
} from "@/lib/planEntitlements";
import {
  createPersistedInspection,
  createPersistedSite,
  listPersistedInspections,
  listPersistedSites,
  REGULATORY_CONTEXT_OPTIONS,
  regulatoryContextFromSettingsScope,
  regulatoryContextLabel,
  type PersistedInspection,
  type PersistedSite,
  type RegulatoryContext,
} from "@/lib/canonicalWorkflowApi";

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
    route: "/inspection-workspace",
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
    route: "/inspection-workspace",
    entitlement: "guidedInspection",
    tierLabel: "Pro",
    inspectionType: "guided_inspection",
  },
];

function getProgramStatus(programs: InspectionProgramRecord[]) {
  return {
    scheduled: programs.length || 0,
    inProgress: programs.filter((program) =>
      String(program.status || "").toLowerCase().includes("progress"),
    ).length,
    review: programs.filter((program) =>
      String(program.status || "").toLowerCase().includes("review"),
    ).length,
    actionRequired: programs.filter((program) =>
      String(program.status || "").toLowerCase().includes("action"),
    ).length,
  };
}

export default function InspectionsPage() {
  const router = useRouter();
  const [inspectionPrograms, setInspectionPrograms] = useState<
    InspectionProgramRecord[]
  >([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(workflowOptions[0]);
  const [expandedWorkflowId, setExpandedWorkflowId] = useState<WorkflowId | null>(null);
  const [planCode, setPlanCode] = useState<PlanCode>("basic");
  const [regulatoryScope, setRegulatoryScope] = useState("all");
  // Inspection-level regulatory context: chosen ONCE here, persisted on the inspection, and
  // inherited by every finding -- HazLenz never re-asks it per finding. Defaults from the
  // Settings page's stored default so a user with one regime never has to touch it.
  const [regulatoryContext, setRegulatoryContext] = useState<RegulatoryContext>("unknown");
  const [sites, setSites] = useState<PersistedSite[]>([]);
  const [persistedInspections, setPersistedInspections] = useState<PersistedInspection[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [newSiteName, setNewSiteName] = useState("");
  const [persistenceStatus, setPersistenceStatus] = useState("Loading saved workspace…");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const seeded = seedInspectionProgramIfEmpty();
    queueMicrotask(() => {
      setInspectionPrograms(seeded.length ? seeded : getInspectionProgram());
      setPlanCode(getStoredPlanCode());
      const storedScope = window.localStorage.getItem("sentinel_regulatory_scope") || "all";
      setRegulatoryScope(storedScope);
      setRegulatoryContext(regulatoryContextFromSettingsScope(storedScope));
    });
    getVerifiedPlanCode().then(setPlanCode).catch(() => {});
    Promise.all([listPersistedSites(), listPersistedInspections()])
      .then(([siteResult, inspections]) => {
        setSites(siteResult.data);
        setPersistedInspections(inspections);
        setSelectedSiteId(siteResult.data[0]?.id || "");
        setPersistenceStatus("Saved to Safety InSite");
      })
      .catch((error) => {
        setPersistenceStatus(
          error instanceof Error && error.message === "AUTH_REQUIRED"
            ? "Sign in to load saved inspections."
            : "Server unavailable — new work cannot be finalized.",
        );
      });
  }, []);

  const programStatus = useMemo(
    () => getProgramStatus(inspectionPrograms),
    [inspectionPrograms],
  );

  async function startInspection(workflow = selectedWorkflow) {
    if (!hasPlanEntitlement(workflow.entitlement, planCode)) return;
    if (!selectedSiteId) {
      setPersistenceStatus("Create or select a saved site before starting.");
      return;
    }

    setSaving(true);
    setPersistenceStatus("Saving inspection draft…");
    try {
      const persisted = await createPersistedInspection({
        siteId: selectedSiteId,
        title: workflow.title,
        regulatoryContext,
      });
      clearActiveInspectionDraft();

      window.localStorage.setItem(
        "sentinel_selected_inspection_context",
        JSON.stringify({
          persistedInspectionId: persisted.id,
          persistedSiteId: selectedSiteId,
          persistenceState: "saved",
          inspectionType: workflow.inspectionType,
          inspectionTitle: workflow.title,
          agency: regulatoryContextLabel(persisted.regulatoryContext || regulatoryContext),
          regulatoryContext: persisted.regulatoryContext || regulatoryContext,
          workflowDepth: workflow.id,
        }),
      );
      setPersistedInspections((current) => [persisted, ...current]);
      setPersistenceStatus("Draft saved to Safety InSite");
      router.push(workflow.route);
    } catch (error) {
      setPersistenceStatus(
        error instanceof Error ? error.message : "Inspection draft was not saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function addSite() {
    const name = newSiteName.trim();
    if (!name) return;
    setSaving(true);
    setPersistenceStatus("Saving site…");
    try {
      const site = await createPersistedSite(name);
      setSites((current) => [site, ...current]);
      setSelectedSiteId(site.id);
      setNewSiteName("");
      setPersistenceStatus("Site saved to Safety InSite");
    } catch (error) {
      setPersistenceStatus(error instanceof Error ? error.message : "Site was not saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="sentinel-mobile-page inspections-page-scroll-fix space-y-4 sm:space-y-4">
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

      <AppPanel padding="lg" className="inspections-start-panel overflow-visible pb-10 sm:pb-12">
        <div className="mx-auto mb-6 max-w-3xl rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-xs font-black uppercase tracking-[0.12em] text-slate-600">
              Saved site
              <select
                aria-label="Saved site"
                value={selectedSiteId}
                onChange={(event) => setSelectedSiteId(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-900"
              >
                <option value="">Select a site</option>
                {sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
              </select>
            </label>
            <label className="flex-1 text-xs font-black uppercase tracking-[0.12em] text-slate-600">
              New site
              <input
                aria-label="New site name"
                value={newSiteName}
                onChange={(event) => setNewSiteName(event.target.value)}
                maxLength={160}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-900"
              />
            </label>
            <button
              type="button"
              disabled={saving || !newSiteName.trim()}
              onClick={addSite}
              className="rounded-full bg-[#102A43] px-5 py-2.5 text-sm font-black text-white disabled:opacity-50"
            >
              Save site
            </button>
          </div>
          <label className="mt-3 block text-xs font-black uppercase tracking-[0.12em] text-slate-600">
            Regulatory context
            <select
              aria-label="Regulatory context"
              value={regulatoryContext}
              onChange={(event) => setRegulatoryContext(event.target.value as RegulatoryContext)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-900"
            >
              {REGULATORY_CONTEXT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} · {option.description}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] font-semibold normal-case tracking-normal text-slate-500">
              Set once for this inspection. Every finding inherits it, so HazLenz will not ask which agency applies for each one.
            </span>
          </label>
          <p role="status" className="mt-3 text-xs font-semibold text-slate-600">
            {persistenceStatus} · {persistedInspections.length} persisted inspection
            {persistedInspections.length === 1 ? "" : "s"}
          </p>
        </div>
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
                className={`inspection-workflow-card h-auto w-full max-w-[320px] overflow-visible rounded-xl border shadow-none transition hover:-translate-y-0.5 ${
                  selected
                    ? "border-[#1D72B8] bg-[#E8F4FF] dark:border-[#38bdf8] dark:bg-[#102A43]"
                    : "border-slate-200/80 bg-white hover:border-blue-200 hover:bg-white dark:border-white/15 dark:bg-[#0B1320] dark:hover:border-[#1D72B8] dark:hover:bg-[#0B1320]"
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
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1D72B8] dark:text-[#5DB7FF]">
                        {workflow.eyebrow}
                      </p>

                    </div>

                    <h3 className="mt-1 text-base font-black leading-tight text-slate-900 dark:text-white">
                      {workflow.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-300">
                      {workflow.description}
                    </p>
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-lg font-black text-[#102A43] shadow-none transition dark:border-white/15 dark:bg-[#0B1320] dark:text-white">
                    {expanded ? "−" : "+"}
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-slate-200/80 bg-white/85 px-4 py-4 sm:px-5 dark:border-white/10 dark:bg-[#0B1320]/85">
                    <p className="text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                      {workflow.details}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {featureRows.map((feature) => (
                        <div
                          key={feature}
                          className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-[11px] font-black leading-4 text-slate-600 shadow-none dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                        >
                          {feature}
                        </div>
                      ))}
                    </div>

                    {!allowed && (
                      <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-black leading-5 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                        {workflow.title} is available on the {workflow.tierLabel} plan.
                      </p>
                    )}

                    <div className="mt-3 flex justify-center">
                      {allowed ? (
                        <button
                          type="button"
                          disabled={saving || !selectedSiteId}
                          onClick={() => {
                            setSelectedWorkflow(workflow);
                            void startInspection(workflow);
                          }}
                          className="inline-flex w-full items-center justify-center rounded-full bg-[#F47C20] px-4 py-2.5 text-center text-sm font-black text-white shadow-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
                        >
                          {saving ? "Saving…" : `Start ${workflow.title}`}
                        </button>
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
          The regulatory context above defaults from{" "}
          <AppTextLink
            href="/settings"
            className="!text-xs !leading-5 font-black"
            style={{ textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "4px" }}
          >
            Settings
          </AppTextLink>
          {" "}({regulatoryContextLabel(regulatoryContextFromSettingsScope(regulatoryScope))}) and is saved with this inspection as{" "}
          <span className="font-black text-slate-700">{regulatoryContextLabel(regulatoryContext)}</span>.
        </p>


      </AppPanel>


      <div aria-hidden="true" className="h-28 shrink-0 sm:h-32 lg:h-16" />
    </section>
  );
}
