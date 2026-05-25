"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredPlanCode } from "@/lib/planEntitlements";
import { getFacilities } from "@/lib/facilityStorage";
import { getOrganizationSettings } from "@/lib/auth";

type StorageMode = "local" | "cloud" | "ask";

export default function SettingsHubPage() {
  const [organizationName, setOrganizationName] = useState("Sentinel Safety Workspace");
  const [riskProfileId, setRiskProfileId] = useState("standard_5x5");
  const [storageMode, setStorageMode] = useState<StorageMode>("local");
  const [planCode, setPlanCode] = useState("basic");
  const [facilityCount, setFacilityCount] = useState(0);
  const [profileEmail, setProfileEmail] = useState("");

  useEffect(() => {
    async function loadSummary() {
      setPlanCode(getStoredPlanCode());
      setFacilityCount(getFacilities().length);

      setStorageMode(
        (window.localStorage.getItem("sentinel_report_storage_mode") as StorageMode | null) || "local"
      );

      const user = JSON.parse(window.localStorage.getItem("sentinel_auth_user") || "{}");
      setProfileEmail(user.email || "");

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

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-white shadow-sm sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Workspace controls.
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Configure report defaults, risk settings, storage behavior, and workspace preferences.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Personal Profile
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              {profileEmail || "Profile settings"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Manage your name, email, password, and personal account details.
            </p>
          </div>

          <div className="flex justify-center sm:justify-end">
            <Link
              href="/profile"
              className="flex w-44 justify-center rounded-xl bg-[#102A43] px-4 py-2.5 text-sm font-black !text-white transition hover:bg-[#1D72B8]"
            >
              Manage Profile
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Organization
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            {organizationName}
          </h2>

          <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
              <span>Plan</span>
              <span className="font-black capitalize text-slate-900">{planCode}</span>
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
              Manage Organization
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Storage & Security
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            {storageLabel}
          </h2>

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
        </div>
      </section>

    </section>
  );
}
