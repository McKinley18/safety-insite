"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredPlanCode, hasPlanEntitlement } from "@/lib/planEntitlements";
import { getFacilities } from "@/lib/facilityStorage";
import { getOrganizationSettings } from "@/lib/auth";

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
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-center text-white shadow-sm sm:p-6">
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
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            App Preferences
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Workflow defaults
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Manage inspection defaults, app behavior, workspace setup, and report preferences.
          </p>

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
                  <Link
                    href="/settings/workspace"
                    className="flex w-44 justify-center rounded-xl bg-[#102A43] px-4 py-2.5 text-center text-sm font-black !text-white transition hover:bg-[#1D72B8]"
                  >
                    Workspace Setup
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Storage & Report Security
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            {storageLabel}
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Manage storage preferences, confidentiality defaults, report package
            behavior, and evidence handling.
          </p>

          <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
              <span>Local vault</span>
              <span className="font-black text-emerald-700">Enabled</span>
            </div>
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
              <span>Cloud sync</span>
              <span className="font-black text-slate-900">
                {storageMode === "cloud" ? "On" : "Off"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Data control</span>
              <span className="font-black text-slate-900">User selected</span>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <Link
              href="/settings/workspace"
              className="flex w-44 justify-center rounded-xl bg-[#102A43] px-4 py-2.5 text-sm font-black !text-white transition hover:bg-[#1D72B8]"
            >
              Change Storage
            </Link>
          </div>
        </section>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Workspace Preferences
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            {organizationName}
          </h2>

          <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
              <span>Plan</span>
              <span className="font-black capitalize text-slate-900">
                {planCode}
              </span>
            </div>
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
              <span>Locations saved</span>
              <span className="font-black text-slate-900">{facilityCount}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Risk matrix</span>
              <span className="font-black text-slate-900">{riskLabel}</span>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <Link
              href="/settings/workspace"
              className="flex w-44 justify-center rounded-xl bg-[#102A43] px-4 py-2.5 text-sm font-black !text-white transition hover:bg-[#1D72B8]"
            >
              Workspace Setup
            </Link>
          </div>
        </section>

        {isCompany ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Company Settings
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              Team and operational controls
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              Manage seats, roles, users, locations, inspections, follow-ups,
              corrective actions, and company-level task assignment.
            </p>

            <div className="mt-5 flex justify-center">
              <Link
                href="/company"
                className="flex w-44 justify-center rounded-xl bg-[#102A43] px-4 py-2.5 text-sm font-black !text-white transition hover:bg-[#1D72B8]"
              >
                Company Center
              </Link>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              Company Settings
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              Available on Company plan
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              Company settings unlock team management, seat controls, role
              assignment, company locations, assigned inspections, and assigned
              corrective work.
            </p>

            <div className="mt-5 flex justify-center">
              <Link
                href="/pricing"
                className="flex w-44 justify-center rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#EA580C]"
              >
                View Company
              </Link>
            </div>
          </section>
        )}
      </section>
    </section>
  );
}
