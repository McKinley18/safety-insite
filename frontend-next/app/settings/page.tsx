"use client";

import { useEffect, useState } from "react";
import { getStoredPlanCode, hasPlanEntitlement } from "@/lib/planEntitlements";
import { getFacilities } from "@/lib/facilityStorage";
import { getOrganizationSettings } from "@/lib/auth";
import { AppPanel } from "@/components/ui/AppPanel";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";

type StorageMode = "local" | "cloud" | "ask";
type RiskProfileId = "simple_4x4" | "standard_5x5" | "advanced_6x6";
type RegulatoryScope = "all" | "msha" | "osha_general" | "osha_construction";

const storageModes = [
  ["local", "Private Local Vault", "Keep reports on this device unless exported."],
  ["cloud", "Company Cloud", "Sync reports to the shared company workspace."],
  ["ask", "Ask Each Report", "Choose local or cloud when finalizing each report."],
] as const;

const riskProfiles = [
  ["simple_4x4", "Simple 4x4", "Fast scoring for simpler programs."],
  ["standard_5x5", "Standard 5x5", "Recommended default for most operations."],
  ["advanced_6x6", "Advanced 6x6", "More detail for mature safety programs."],
] as const;

const regulatoryScopes = [
  ["all", "Let HazLenz AI Evaluate", "HazLenz AI decides the likely agency context."],
  ["msha", "MSHA", "Mining operations and 30 CFR review."],
  ["osha_general", "OSHA General Industry", "General industry and 29 CFR 1910 review."],
  ["osha_construction", "OSHA Construction", "Construction and 29 CFR 1926 review."],
] as const;

function SelectorCard({
  selected,
  label,
  description,
  onClick,
}: {
  selected: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-4 py-3 text-left transition",
        selected
          ? "border-[#1D72B8] bg-[#E8F4FF] shadow-none"
          : "border-slate-200/80 bg-white shadow-none hover:border-blue-200 hover:bg-white",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-950">{label}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <span
          className={[
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-black",
            selected
              ? "border-[#1D72B8] bg-[#1D72B8] text-white"
              : "border-slate-300 bg-white text-transparent",
          ].join(" ")}
        >
          ✓
        </span>
      </div>
    </button>
  );
}

function OverviewItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="sentinel-metric-card text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

export default function SettingsHubPage() {
  const [organizationName, setOrganizationName] = useState("AuditAlly Workspace");
  const [riskProfileId, setRiskProfileId] = useState<RiskProfileId>("standard_5x5");
  const [storageMode, setStorageMode] = useState<StorageMode>("local");
  const [regulatoryScope, setRegulatoryScope] = useState<RegulatoryScope>("all");
  const [planCode, setPlanCode] = useState("basic");
  const [facilityCount, setFacilityCount] = useState(0);

  useEffect(() => {
    async function loadSummary() {
      const storedPlan = getStoredPlanCode();
      setPlanCode(storedPlan);
      setFacilityCount(getFacilities().length);

      setStorageMode(
        (window.localStorage.getItem("sentinel_report_storage_mode") as StorageMode | null) ||
          "local",
      );

      setRegulatoryScope(
        (window.localStorage.getItem("sentinel_regulatory_scope") as RegulatoryScope | null) ||
          "all",
      );

      try {
        const settings = await getOrganizationSettings();
        setOrganizationName(settings.name || "AuditAlly Workspace");
        setRiskProfileId((settings.riskProfileId || "standard_5x5") as RiskProfileId);
        setRegulatoryScope(
          (settings.regulatoryScope ||
            window.localStorage.getItem("sentinel_regulatory_scope") ||
            "all") as RegulatoryScope,
        );
      } catch {
        setOrganizationName("AuditAlly Workspace");
      }
    }

    loadSummary();
  }, []);

  function updateStorageMode(value: StorageMode) {
    setStorageMode(value);
    window.localStorage.setItem("sentinel_report_storage_mode", value);
  }

  function updateRiskProfile(value: RiskProfileId) {
    setRiskProfileId(value);
    window.localStorage.setItem("sentinel_company_risk_profile", value);
  }

  function updateRegulatoryScope(value: RegulatoryScope) {
    setRegulatoryScope(value);
    window.localStorage.setItem("sentinel_regulatory_scope", value);
  }

  const storageLabel =
    storageModes.find(([id]) => id === storageMode)?.[1] || "Private Local Vault";

  const riskLabel =
    riskProfiles.find(([id]) => id === riskProfileId)?.[1] || "Standard 5x5";

  const scopeLabel =
    regulatoryScopes.find(([id]) => id === regulatoryScope)?.[1] ||
    "Let HazLenz AI Evaluate";

  const isCompany = hasPlanEntitlement("teamMembers", planCode);

  return (
    <section className="sentinel-page-shell space-y-4">
      <HeroPanel align="center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Settings
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">
          Account preferences.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Manage workspace defaults, report behavior, storage, security, and
          company controls from one place.
        </p>
      </HeroPanel>

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Workspace Overview"
          title={organizationName}
          description="A quick snapshot of the settings currently applied to this workspace."
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <OverviewItem label="Plan" value={planCode} />
          <OverviewItem label="Storage" value={storageLabel} />
          <OverviewItem label="Risk Matrix" value={riskLabel} />
          <OverviewItem label="HazLenz AI Scope" value={scopeLabel} />
          <OverviewItem label="Locations" value={facilityCount} />
        </div>
      </AppPanel>

      <section className="grid gap-4 xl:grid-cols-2">
        <AppPanel padding="lg">
          <SectionHeader
            eyebrow="Quick Selectors"
            title="Report storage"
            description="Choose where new reports should be saved by default."
          />

          <div className="mt-4 grid gap-3">
            {storageModes.map(([id, label, description]) => (
              <SelectorCard
                key={id}
                selected={storageMode === id}
                label={label}
                description={description}
                onClick={() => updateStorageMode(id)}
              />
            ))}
          </div>
        </AppPanel>

        <AppPanel padding="lg">
          <SectionHeader
            eyebrow="Quick Selectors"
            title="Risk matrix"
            description="Set the default severity and likelihood scale for new inspections."
          />

          <div className="mt-4 grid gap-3">
            {riskProfiles.map(([id, label, description]) => (
              <SelectorCard
                key={id}
                selected={riskProfileId === id}
                label={label}
                description={description}
                onClick={() => updateRiskProfile(id)}
              />
            ))}
          </div>
        </AppPanel>
      </section>

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="HazLenz AI Defaults"
          title="Default regulatory scope"
          description="Set the default agency context HazLenz AI should use during inspection review."
        />

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {regulatoryScopes.map(([id, label, description]) => (
            <SelectorCard
              key={id}
              selected={regulatoryScope === id}
              label={label}
              description={description}
              onClick={() => updateRegulatoryScope(id)}
            />
          ))}
        </div>
      </AppPanel>

      <section className="grid gap-4 lg:grid-cols-2">
        <AppPanel padding="lg">
          <SectionHeader
            eyebrow="Detailed Setup"
            title="Workspace setup"
            description="Open the full workspace settings page for report defaults, logo, security, locations, and team controls."
          />

          <div className="mt-5 flex justify-center">
            <AppLinkButton href="/settings/workspace" className="w-44">
              Workspace Setup
            </AppLinkButton>
          </div>
        </AppPanel>

        {isCompany ? (
          <AppPanel padding="lg">
            <SectionHeader
              eyebrow="Company Settings"
              title="Team and operational controls"
              description="Manage seats, roles, users, inspections, follow-ups, corrective actions, and company-level task assignment."
            />

            <div className="mt-5 flex justify-center">
              <AppLinkButton href="/company" className="w-44">
                Company Center
              </AppLinkButton>
            </div>
          </AppPanel>
        ) : (
          <AppPanel variant="dashed" padding="md">
            <SectionHeader
              eyebrow="Company Settings"
              title="Available on Company plan"
              description="Company settings unlock team management, seat controls, role assignment, shared locations, assigned inspections, and assigned corrective work."
            />

            <div className="mt-5 flex justify-center">
              <AppLinkButton href="/pricing" className="w-44">
                View Plans
              </AppLinkButton>
            </div>
          </AppPanel>
        )}
      </section>
    </section>
  );
}
