"use client";

import PageHeader from "@/components/ui/PageHeader";
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
      <PageHeader
        eyebrow="Settings"
        title="Workspace Setup"
        description="Review your current setup, then open the section you want to change."
      />

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

          <Link
            href="/profile"
            className="rounded-xl bg-[#102A43] px-4 py-2.5 text-sm font-black !text-white transition hover:bg-[#1D72B8]"
          >
            Manage Profile
          </Link>
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

          <Link
            href="/settings/workspace"
            className="mt-5 inline-flex rounded-xl bg-[#102A43] px-4 py-2.5 text-sm font-black !text-white transition hover:bg-[#1D72B8]"
          >
            Manage Organization
          </Link>
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

          <Link
            href="/settings/workspace"
            className="mt-5 inline-flex rounded-xl bg-[#102A43] px-4 py-2.5 text-sm font-black !text-white transition hover:bg-[#1D72B8]"
          >
            Change Storage
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
          Quick Setup Checklist
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ["Profile", profileEmail ? "Ready" : "Review"],
            ["Organization", organizationName ? "Ready" : "Review"],
            ["Locations", facilityCount ? `${facilityCount} saved` : "Add locations"],
            ["Storage", storageLabel],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                {label}
              </p>
              <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
