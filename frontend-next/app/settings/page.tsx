"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredPlanCode } from "@/lib/planEntitlements";
import { getFacilities } from "@/lib/facilityStorage";
import { getOrganizationSettings } from "@/lib/auth";

type StorageMode = "local" | "cloud" | "ask";

export default function SettingsHubPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [organizationName, setOrganizationName] = useState(
    "Sentinel Safety Workspace",
  );
  const [riskProfileId, setRiskProfileId] = useState("standard_5x5");
  const [storageMode, setStorageMode] = useState<StorageMode>("local");
  const [planCode, setPlanCode] = useState("basic");
  const [facilityCount, setFacilityCount] = useState(0);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [status, setStatus] = useState("");
  const [passwordResetStatus, setPasswordResetStatus] = useState("");

  useEffect(() => {
    async function loadSummary() {
      setPlanCode(getStoredPlanCode());
      setFacilityCount(getFacilities().length);

      setStorageMode(
        (window.localStorage.getItem(
          "sentinel_report_storage_mode",
        ) as StorageMode | null) || "local",
      );

      setMfaEnabled(window.localStorage.getItem("sentinel_mfa_enabled") === "true");

      const user = JSON.parse(
        window.localStorage.getItem("sentinel_auth_user") || "{}",
      );

      const nameParts = String(user.name || "").trim().split(" ").filter(Boolean);
      setFirstName(user.firstName || nameParts[0] || "");
      setLastName(user.lastName || nameParts.slice(1).join(" ") || "");
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

  function saveAccountIdentity() {
    const raw = window.localStorage.getItem("sentinel_auth_user") || "{}";
    const user = JSON.parse(raw);

    const updated = {
      ...user,
      firstName,
      lastName,
      name: [firstName, lastName].filter(Boolean).join(" ").trim(),
    };

    window.localStorage.setItem("sentinel_auth_user", JSON.stringify(updated));
    setStatus("Account identity updated locally.");
  }

  function requestPasswordReset() {
    setPasswordResetStatus(
      "Password reset request prepared. Email delivery will connect when production auth email is enabled.",
    );
  }

  function toggleMfa() {
    const next = !mfaEnabled;
    setMfaEnabled(next);
    window.localStorage.setItem("sentinel_mfa_enabled", String(next));
    setStatus(next ? "MFA marked enabled locally." : "MFA marked disabled locally.");
  }

  return (
    <section className="space-y-5">
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-center text-white shadow-sm sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Settings
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          Account settings.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Manage your identity, sign-in security, app lock controls, storage
          preferences, and report security from one place.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Account Identity
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            User details
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Update the name shown on reports, reviews, and account activity.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label>
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                First Name
              </span>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
              />
            </label>

            <label>
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Last Name
              </span>
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Email Address
              </span>
              <input
                value={profileEmail}
                disabled
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500"
              />
            </label>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={saveAccountIdentity}
              className="rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-black text-black transition hover:bg-[#EA580C]"
            >
              Save Account
            </button>
          </div>

          {status && (
            <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-black text-emerald-700">
              {status}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Account Security
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Sign-in and app protection
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Manage password reset, MFA, app lock, PIN unlock, auto-lock timing,
            storage preferences, and report security.
          </p>

          <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50">
            <div className="px-3 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Password Reset
                  </h3>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    Request a secure password reset for this account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={requestPasswordReset}
                  className="flex w-44 justify-center rounded-xl bg-[#102A43] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#1D72B8]"
                >
                  Request Reset
                </button>
              </div>

              {passwordResetStatus && (
                <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-600">
                  {passwordResetStatus}
                </p>
              )}
            </div>

            <div className="px-3 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">
                      Multi-Factor Authentication
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                        mfaEnabled
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-white text-slate-500"
                      }`}
                    >
                      {mfaEnabled ? "Enabled" : "Off"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    Add an additional verification step for sensitive account access.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleMfa}
                  className="flex w-44 justify-center rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#EA580C]"
                >
                  {mfaEnabled ? "Disable MFA" : "Enable MFA"}
                </button>
              </div>

              <p className="mt-2 text-[11px] font-semibold leading-5 text-slate-500">
                Local preview only. Production MFA should connect to the authentication provider before release.
              </p>
            </div>

            <div className="px-3 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    App Lock, Storage & Report Security
                  </h3>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    Manage PIN unlock, auto-lock timing, storage preferences,
                    confidentiality markers, and report defaults.
                  </p>
                </div>

                <Link
                  href="/settings/workspace"
                  className="flex w-44 justify-center rounded-xl bg-[#102A43] px-4 py-2.5 text-center text-sm font-black !text-white transition hover:bg-[#1D72B8]"
                >
                  Manage Security
                </Link>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Organization
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
              Manage Organization
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Storage & Report Defaults
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
        </section>
      </section>
    </section>
  );
}
