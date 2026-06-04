"use client";

import { useEffect, useState } from "react";
import { getStoredPlanCode, hasPlanEntitlement } from "@/lib/planEntitlements";
import { getFacilities } from "@/lib/facilityStorage";
import { getOrganizationSettings } from "@/lib/auth";
import { AppPanel } from "@/components/ui/AppPanel";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import SummaryRow from "@/components/ui/SummaryRow";

type StorageMode = "local" | "cloud" | "ask";

export default function SettingsHubPage() {
  const [organizationName, setOrganizationName] = useState(
    "Sentinel Safety Workspace",
  );
  const [riskProfileId, setRiskProfileId] = useState("standard_5x5");
  const [storageMode, setStorageMode] = useState<StorageMode>("local");
  const [planCode, setPlanCode] = useState("basic");
  const [facilityCount, setFacilityCount] = useState(0);

  useEffect(() => {
    async function loadSummary() {
      const storedPlan = getStoredPlanCode();
      setPlanCode(storedPlan);
      setFacilityCount(getFacilities().length);

      setStorageMode(
        (window.localStorage.getItem(
          "sentinel_report_storage_mode",
        ) as StorageMode | null) || "local",
      );

      try {
        const settings = await getOrganizationSettings();
        setOrganizationName(settings.name || "Sentinel Safety Workspace");
        setRiskProfileId(settings.riskProfileId || "standard_5x5");
      } catch {
        setOrganizationName("Sentinel Safety Workspace");
      }
    }

    loadSummary();
  }, []);

  const storageLabel =
    storageMode === "cloud"
      ? "Company Cloud Workspace"
      : storageMode === "ask"
        ? "Ask Every Report"
        : "Private Local Vault";

  const riskLabel =
    riskProfileId === "simple_4x4"
      ? "Simple 4x4"
      : riskProfileId === "advanced_6x6"
        ? "Advanced 6x6"
        : "Standard 5x5";

  const isCompany = hasPlanEntitlement("teamMembers", planCode);

  return (
    <section className="space-y-5">
      <HeroPanel align="center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Settings
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          Account preferences.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Manage sign-in preferences, app security, storage behavior, report
          defaults, and workspace controls.
        </p>
      </HeroPanel>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <AppPanel padding="md">
          <SectionHeader
            eyebrow="App Preferences"
            title="Workflow defaults"
            description="Manage inspection defaults, app behavior, workspace setup, and report preferences."
          />

          <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50">
            <div className="px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Inspection Defaults
                  </h3>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    Configure cover pages, regulatory defaults, risk matrix, and report package behavior.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Locations & Workspace
                  </h3>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    Manage saved facilities, work areas, and workspace preferences.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-3 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Workspace Setup
                  </h3>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    Open the full workspace settings page for detailed configuration.
                  </p>
                </div>

                <div className="flex justify-center sm:justify-end">
                  <AppLinkButton href="/settings/workspace" className="w-44">
                    Workspace Setup
                  </AppLinkButton>
                </div>
              </div>
            </div>
          </div>
        </AppPanel>
        <AppPanel padding="md">
          <SectionHeader
            eyebrow="Storage & Report Security"
            title={storageLabel}
            description="Manage storage preferences, confidentiality defaults, report package behavior, and evidence handling."
          />

          <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
            <SummaryRow label="Local vault" value="Enabled" valueClassName="text-emerald-700" />
            <SummaryRow label="Cloud sync" value={storageMode === "cloud" ? "On" : "Off"} />
            <SummaryRow label="Data control" value="User selected" last />
          </div>

          <div className="mt-5 flex justify-center">
            <AppLinkButton href="/settings/workspace" className="w-44">
              Change Storage
            </AppLinkButton>
          </div>
        </AppPanel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <AppPanel padding="md">
          <SectionHeader
            eyebrow="Workspace Preferences"
            title={organizationName}
          />

          <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
            <SummaryRow label="Plan" value={planCode} valueClassName="capitalize text-slate-900" />
            <SummaryRow label="Locations saved" value={facilityCount} />
            <SummaryRow label="Risk matrix" value={riskLabel} last />
          </div>

          <div className="mt-5 flex justify-center">
            <AppLinkButton href="/settings/workspace" className="w-44">
              Workspace Setup
            </AppLinkButton>
          </div>
        </AppPanel>

        {isCompany ? (
          <AppPanel padding="md">
            <SectionHeader
              eyebrow="Company Settings"
              title="Team and operational controls"
              description="Manage seats, roles, users, locations, inspections, follow-ups, corrective actions, and company-level task assignment."
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
              description="Company settings unlock team management, seat controls, role assignment, company locations, assigned inspections, and assigned corrective work."
            />

            <div className="mt-5 flex justify-center">
              <AppLinkButton href="/pricing" variant="accent" className="w-44">
                View Company
              </AppLinkButton>
            </div>
          </AppPanel>
        )}
      </section>
    </section>
  );
}
