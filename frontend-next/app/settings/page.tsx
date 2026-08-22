"use client";

import { useEffect, useState } from "react";
import { getPlanDisplayName, getStoredPlanCode, getVerifiedPlanCode } from "@/lib/planEntitlements";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import BillingSettingsPanel from "@/components/billing/BillingSettingsPanel";
import {
  readThemePreferenceFromStorage,
  themePreferenceLabels,
  type ThemePreference,
} from "@/lib/theme";
import { setThemePreference } from "@/components/system/ThemeController";
import { CustomRiskMatrixBuilder } from "@/components/settings/CustomRiskMatrixBuilder";
import { readCustomRiskMatrix, type CustomRiskMatrix } from "@/lib/customRiskMatrix";
import { Pencil, Trash2 } from "lucide-react";
import {
  createPersistedSite,
  deletePersistedSite,
  listPersistedSites,
  updatePersistedSite,
  type PersistedSite,
} from "@/lib/canonicalWorkflowApi";

type StorageMode = "local" | "cloud" | "ask";
type RiskProfileId = "simple_4x4" | "standard_5x5" | "advanced_6x6" | "custom";
type RegulatoryScope = "all" | "msha" | "osha_general" | "osha_construction";
const themeModes = ["light", "dark"] as const satisfies readonly ThemePreference[];

const storageModes = [
  ["local", "Private Local Vault", "Keep reports on this device unless exported."],
  ["cloud", "Cloud Sync", "Sync reports when cloud storage is available."],
  ["ask", "Ask Each Report", "Choose local or cloud when finalizing each report."],
] as const;

const riskProfiles = [
  ["simple_4x4", "Simple 4x4", "Fast scoring for simpler programs."],
  ["standard_5x5", "Standard 5x5", "Recommended default for most operations."],
  ["advanced_6x6", "Advanced 6x6", "More detail for mature safety programs."],
  ["custom", "Custom Matrix", "Build your own likelihood × severity matrix."],
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
          ? "settings-selected-card border-[#1D72B8] bg-[#E8F4FF] shadow-none dark:border-[#5DB7FF] dark:bg-[#1B4F78] dark:text-white"
          : "border-slate-200/80 bg-white shadow-none hover:border-blue-200 hover:bg-white dark:border-slate-600 dark:bg-[#16283D] dark:hover:border-[#5DB7FF]/60 dark:hover:bg-[#1D3A55]",
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
              : "border-slate-300 bg-white text-transparent dark:border-slate-500 dark:bg-[#20364D]",
          ].join(" ")}
        >
          {selected ? "✓" : null}
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
  const [customMatrix, setCustomMatrix] = useState<CustomRiskMatrix | null>(null);
  const [sites, setSites] = useState<PersistedSite[]>([]);
  const [newSiteName, setNewSiteName] = useState("");
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editingSiteName, setEditingSiteName] = useState("");
  const [siteStatus, setSiteStatus] = useState("Loading saved sites…");
  const [siteSaving, setSiteSaving] = useState(false);

  useEffect(() => {
    const storedPlanCode = getStoredPlanCode();
    const storedStorageMode =
      (window.localStorage.getItem("sentinel_report_storage_mode") as StorageMode | null) ||
      "local";
    const storedRiskProfileId =
      (window.localStorage.getItem("sentinel_risk_profile") as RiskProfileId | null) ||
      (window.localStorage.getItem("sentinel_company_risk_profile") as RiskProfileId | null) ||
      "standard_5x5";
    const storedRegulatoryScope =
      (window.localStorage.getItem("sentinel_regulatory_scope") as RegulatoryScope | null) ||
      "all";
    const storedThemePreference = readThemePreferenceFromStorage(window.localStorage);
    const storedCustomMatrix = readCustomRiskMatrix(window.localStorage);

    queueMicrotask(() => {
      setPlanCode(storedPlanCode);
      setStorageMode(storedStorageMode);
      setRiskProfileId(storedRiskProfileId);
      setRegulatoryScope(storedRegulatoryScope);
      setThemePreferenceState(storedThemePreference);
      setCustomMatrix(storedCustomMatrix);
    });

    getVerifiedPlanCode().then(setPlanCode).catch(() => {});
    listPersistedSites()
      .then((result) => {
        setSites(result.data);
        setSiteStatus(result.data.length ? `${result.data.length} saved site${result.data.length === 1 ? "" : "s"}.` : "No saved sites yet.");
      })
      .catch((error) => {
        setSiteStatus(error instanceof Error ? error.message : "Unable to load saved sites.");
      });
  }, []);

  async function addSite() {
    const name = newSiteName.trim();
    if (name.length < 2) {
      setSiteStatus("Enter a site name with at least 2 characters.");
      return;
    }
    setSiteSaving(true);
    setSiteStatus("Adding site…");
    try {
      const site = await createPersistedSite(name);
      setSites((current) => [site, ...current]);
      setNewSiteName("");
      setSiteStatus("Site added.");
    } catch (error) {
      setSiteStatus(error instanceof Error ? error.message : "Unable to add site.");
    } finally {
      setSiteSaving(false);
    }
  }

  async function saveSiteName(siteId: string) {
    const name = editingSiteName.trim();
    if (name.length < 2) {
      setSiteStatus("Enter a site name with at least 2 characters.");
      return;
    }
    setSiteSaving(true);
    setSiteStatus("Saving site…");
    try {
      const updated = await updatePersistedSite(siteId, name);
      setSites((current) => current.map((site) => site.id === siteId ? updated : site));
      setEditingSiteId(null);
      setEditingSiteName("");
      setSiteStatus("Site updated.");
    } catch (error) {
      setSiteStatus(error instanceof Error ? error.message : "Unable to update site.");
    } finally {
      setSiteSaving(false);
    }
  }

  async function removeSite(site: PersistedSite) {
    if (!window.confirm(`Delete “${site.name}” from your saved sites?`)) return;
    setSiteSaving(true);
    setSiteStatus("Deleting site…");
    try {
      await deletePersistedSite(site.id);
      setSites((current) => current.filter((item) => item.id !== site.id));
      if (editingSiteId === site.id) {
        setEditingSiteId(null);
        setEditingSiteName("");
      }
      setSiteStatus("Site deleted.");
    } catch (error) {
      setSiteStatus(error instanceof Error ? error.message : "Unable to delete site.");
    } finally {
      setSiteSaving(false);
    }
  }

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
    riskProfileId === "custom"
      ? customMatrix?.name || "Custom Matrix"
      : riskProfiles.find(([id]) => id === riskProfileId)?.[1] || "Standard 5x5";

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
          <OverviewItem label="Plan" value={getPlanDisplayName(planCode)} />
          <OverviewItem label="Storage" value={storageLabel} />
          <OverviewItem label="Risk Matrix" value={riskLabel} />
          <OverviewItem label="HazLenz AI Scope" value={scopeLabel} />
        </div>
      </AppPanel>

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Sites"
          title="Saved sites"
          description="Add, rename, or remove the sites available when starting an inspection."
        />

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-200">
              Add a site
            </span>
            <input
              value={newSiteName}
              onChange={(event) => setNewSiteName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void addSite();
              }}
              maxLength={160}
              placeholder="Site name"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:ring-2 focus:ring-[#1D72B8]/20 dark:border-slate-500 dark:bg-[#16283D] dark:text-white"
            />
          </label>
          <button
            type="button"
            disabled={siteSaving || newSiteName.trim().length < 2}
            onClick={() => void addSite()}
            className="self-center rounded-full bg-[#F47C20] px-4 py-2 text-xs font-black text-white transition hover:bg-[#D96510] disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
          >
            Add Site
          </button>
        </div>

        <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-200" role="status">
          {siteStatus}
        </p>

        <div className="mt-4 grid gap-2">
          {sites.map((site) => {
            const editing = editingSiteId === site.id;
            return (
              <div
                key={site.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-[#16283D]"
              >
                {editing ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      value={editingSiteName}
                      onChange={(event) => setEditingSiteName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void saveSiteName(site.id);
                        if (event.key === "Escape") setEditingSiteId(null);
                      }}
                      maxLength={160}
                      autoFocus
                      aria-label={`Rename ${site.name}`}
                      className="min-w-0 flex-1 rounded-lg border border-[#1D72B8] bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none ring-2 ring-[#1D72B8]/20 dark:bg-[#20364D] dark:text-white"
                    />
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        disabled={siteSaving || editingSiteName.trim().length < 2}
                        onClick={() => void saveSiteName(site.id)}
                        className="rounded-full bg-[#1D72B8] px-4 py-2 text-xs font-black text-white transition hover:bg-[#155A91] disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        disabled={siteSaving}
                        onClick={() => {
                          setEditingSiteId(null);
                          setEditingSiteName("");
                        }}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-100 dark:border-slate-500 dark:bg-[#20364D] dark:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-black text-slate-950 dark:text-white">
                      {site.name}
                    </p>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={siteSaving}
                        onClick={() => {
                          setEditingSiteId(site.id);
                          setEditingSiteName(site.name);
                        }}
                        aria-label={`Edit ${site.name}`}
                        title={`Edit ${site.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1D72B8]/40 bg-[#E8F4FF] text-[#1D72B8] transition hover:bg-[#D7ECFF] disabled:opacity-50 dark:border-[#5DB7FF]/50 dark:bg-[#20364D] dark:text-[#8DD0FF]"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={siteSaving}
                        onClick={() => void removeSite(site)}
                        aria-label={`Delete ${site.name}`}
                        title={`Delete ${site.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-red-300 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-400/40 dark:bg-red-950/40 dark:text-red-200"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AppPanel>

      <BillingSettingsPanel
        title="Billing & plan"
        description="Check your current subscription tier and manage upgrades from one simple place."
      />

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Appearance"
          title="Theme preference"
          description="Choose how Safety InSite renders on this device."
        />

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {themeModes.map((mode) => (
            <SelectorCard
              key={mode}
              selected={themePreference === mode}
              label={themePreferenceLabels[mode]}
              description={
                mode === "light"
                  ? "Always use the light theme."
                  : "Always use the dark theme."
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

      {riskProfileId === "custom" && (
        <AppPanel padding="lg">
          <SectionHeader
            eyebrow="Risk"
            title="Custom risk matrix"
            description="Define your own likelihood × severity scale and risk levels, then save it to use as your default."
          />

          <div className="mt-4">
            <CustomRiskMatrixBuilder onSaved={setCustomMatrix} />
          </div>
        </AppPanel>
      )}

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
