"use client";

import { useEffect, useState } from "react";
import { getStoredPlanCode } from "@/lib/planEntitlements";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  readThemePreferenceFromStorage,
  themePreferenceLabels,
  type ThemePreference,
} from "@/lib/theme";
import { setThemePreference } from "@/components/system/ThemeController";

type StorageMode = "local" | "cloud" | "ask";
type RiskProfileId = "simple_4x4" | "standard_5x5" | "advanced_6x6";
type RegulatoryScope = "all" | "msha" | "osha_general" | "osha_construction";
const themeModes = ["light", "dark", "system"] as const satisfies readonly ThemePreference[];

const storageModes = [
  ["local", "Private Local Vault", "Keep reports on this device unless exported."],
  ["cloud", "Cloud Sync", "Sync reports when cloud storage is available."],
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
      aria-pressed={selected}
      data-selected={selected ? "true" : "false"}
      className={[
        "rounded-xl border px-4 py-3 text-left transition",
        selected
          ? "settings-selected-card border-[#1D72B8] bg-[#E8F4FF] shadow-none dark:border-sky-400 dark:bg-[#102A43] dark:text-white"
          : "border-slate-200/80 bg-white shadow-none hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-950 dark:text-white">{label}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-100">
            {description}
          </p>
        </div>

        <span
          className={[
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-black",
            selected
              ? "border-[#1D72B8] bg-[#1D72B8] text-white dark:border-sky-300 dark:bg-sky-400 dark:text-slate-950"
              : "border-slate-300 bg-white text-transparent dark:border-slate-600 dark:bg-slate-900",
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
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 dark:text-slate-200">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

export default function SettingsHubPage() {
  const [riskProfileId, setRiskProfileId] = useState<RiskProfileId>("standard_5x5");
  const [storageMode, setStorageMode] = useState<StorageMode>("local");
  const [regulatoryScope, setRegulatoryScope] = useState<RegulatoryScope>("all");
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("light");
  const [planCode, setPlanCode] = useState("free");

  useEffect(() => {
    setPlanCode(getStoredPlanCode());

    setStorageMode(
      (window.localStorage.getItem("sentinel_report_storage_mode") as StorageMode | null) ||
        "local",
    );

    setRiskProfileId(
      (window.localStorage.getItem("sentinel_risk_profile") as RiskProfileId | null) ||
        (window.localStorage.getItem("sentinel_company_risk_profile") as RiskProfileId | null) ||
        "standard_5x5",
    );

    setRegulatoryScope(
      (window.localStorage.getItem("sentinel_regulatory_scope") as RegulatoryScope | null) ||
        "all",
    );

    setThemePreferenceState(readThemePreferenceFromStorage(window.localStorage));
  }, []);

  function updateStorageMode(value: StorageMode) {
    setStorageMode(value);
    window.localStorage.setItem("sentinel_report_storage_mode", value);
  }

  function updateRiskProfile(value: RiskProfileId) {
    setRiskProfileId(value);
    window.localStorage.setItem("sentinel_risk_profile", value);
  }

  function updateRegulatoryScope(value: RegulatoryScope) {
    setRegulatoryScope(value);
    window.localStorage.setItem("sentinel_regulatory_scope", value);
  }

  function updateThemePreference(value: ThemePreference) {
    setThemePreferenceState(value);
    setThemePreference(value);
  }

  const storageLabel =
    storageModes.find(([id]) => id === storageMode)?.[1] || "Private Local Vault";

  const riskLabel =
    riskProfiles.find(([id]) => id === riskProfileId)?.[1] || "Standard 5x5";

  const scopeLabel =
    regulatoryScopes.find(([id]) => id === regulatoryScope)?.[1] ||
    "Let HazLenz AI Evaluate";

  return (
    <section className="sentinel-page-shell settings-dark-readable space-y-4">
      <HeroPanel align="center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Settings
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">
          Settings.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-100">
          Set your report storage, risk matrix, and HazLenz AI defaults.
        </p>
      </HeroPanel>

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Settings Overview"
          title="Current defaults"
          description="A quick snapshot of the defaults currently applied to your inspections and reports."
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewItem label="Plan" value={planCode} />
          <OverviewItem label="Storage" value={storageLabel} />
          <OverviewItem label="Risk Matrix" value={riskLabel} />
          <OverviewItem label="HazLenz AI Scope" value={scopeLabel} />
        </div>
      </AppPanel>

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Appearance"
          title="Theme preference"
          description="Choose how Safety InSite renders on this device."
        />

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {themeModes.map((mode) => (
            <SelectorCard
              key={mode}
              selected={themePreference === mode}
              label={themePreferenceLabels[mode]}
              description={
                mode === "light"
                  ? "Always use the light theme."
                  : mode === "dark"
                    ? "Always use the dark theme."
                    : "Follow the device system setting."
              }
              onClick={() => updateThemePreference(mode)}
            />
          ))}
        </div>
      </AppPanel>

      <section className="grid gap-4 xl:grid-cols-2">
        <AppPanel padding="lg">
          <SectionHeader
            eyebrow="Reports"
            title="Report storage"
            description="Choose where new reports are saved."
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
            eyebrow="Risk"
            title="Risk matrix"
            description="Set the default severity and likelihood scale."
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

    </section>
  );
}
