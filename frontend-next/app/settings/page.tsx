"use client";

import PageHeader from "@/components/ui/PageHeader";
import { getStoredPlanCode, hasPlanEntitlement } from "@/lib/planEntitlements";
import { Facility, getFacilities, setFacilities } from "@/lib/facilityStorage";
import { useEffect, useMemo, useState } from "react";
import {
  getOrganizationInvites,
  getOrganizationMembers,
  getOrganizationSettings,
  inviteOrganizationMember,
  updateOrganizationSettings,
} from "@/lib/auth";

type RiskProfileId = "simple_4x4" | "standard_5x5" | "advanced_6x6";
type StorageMode = "local" | "cloud" | "ask";

const riskProfiles = [
  ["simple_4x4", "Simple 4x4", "Smaller teams or simpler programs."],
  ["standard_5x5", "Standard 5x5", "Recommended default for most operations."],
  ["advanced_6x6", "Advanced 6x6", "More detail for mature programs."],
] as const;

const storageModes = [
  ["local", "Private Device Storage", "Recommended. Reports stay on this device unless exported or synced."],
  ["cloud", "Encrypted Workspace Sync", "Optional. Reports save to the company workspace database."],
  ["ask", "Ask Every Report", "Choose private device storage or workspace sync when finalizing."],
] as const;

const roleDefinitions = [
  ["Owner", "Manage settings, users, reports, and workspace controls."],
  ["Auditor", "Create inspections, review SafeScope results, and manage findings."],
  ["Viewer", "View reports and actions without changing workspace settings."],
] as const;

function getMatrixSize(profile: RiskProfileId) {
  if (profile === "simple_4x4") return 4;
  if (profile === "advanced_6x6") return 6;
  return 5;
}

function getRiskColor(score: number, maxScore: number) {
  const ratio = score / (maxScore * maxScore);

  if (ratio >= 0.72) return "bg-red-500";
  if (ratio >= 0.45) return "bg-orange-400";
  if (ratio >= 0.25) return "bg-yellow-300";
  return "bg-emerald-400";
}

function RiskMatrixPreview({ riskProfileId }: { riskProfileId: RiskProfileId }) {
  const size = getMatrixSize(riskProfileId);
  const cells = [];

  for (let severity = size; severity >= 1; severity--) {
    for (let likelihood = 1; likelihood <= size; likelihood++) {
      const score = severity * likelihood;
      cells.push({ severity, likelihood, score });
    }
  }

  return (
    <div>
      <div
        className="grid overflow-hidden rounded-xl border border-slate-300 bg-white"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {cells.map((cell) => (
          <div
            key={`${cell.severity}-${cell.likelihood}`}
            className={`aspect-square border border-white/60 ${getRiskColor(cell.score, size)} flex items-center justify-center text-[10px] font-black text-slate-900`}
          >
            {cell.score}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[10px] font-black text-slate-600">
        <span className="rounded bg-emerald-100 py-1">Low</span>
        <span className="rounded bg-yellow-100 py-1">Moderate</span>
        <span className="rounded bg-orange-100 py-1">High</span>
        <span className="rounded bg-red-100 py-1">Critical</span>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [includeLogoOnCover, setIncludeLogoOnCover] = useState(true);
  const [riskProfileId, setRiskProfileId] = useState<RiskProfileId>("standard_5x5");
  const [storageMode, setStorageMode] = useState<StorageMode>("local");
  const [requirePinUnlock, setRequirePinUnlock] = useState(false);
  const [autoLockMinutes, setAutoLockMinutes] = useState("off");
  const [facilities, setFacilityList] = useState<Facility[]>([]);
  const [facilityName, setFacilityName] = useState("");
  const [facilityType, setFacilityType] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Auditor");
  const [planCode, setPlanCode] = useState("basic");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">("idle");

  const selectedMatrixLabel = useMemo(() => {
    return riskProfiles.find(([id]) => id === riskProfileId)?.[1] || "Standard 5x5";
  }, [riskProfileId]);

  useEffect(() => {
    async function loadSettings() {
      setPlanCode(getStoredPlanCode());

      try {
        setStatus("Loading settings...");
        const settings = await getOrganizationSettings();

        setOrganizationName(settings.name || "");
        setCompanyLogo(settings.logoPath || window.localStorage.getItem("sentinel_company_logo") || "");
        setIncludeLogoOnCover(window.localStorage.getItem("sentinel_include_logo_on_cover") !== "false");
        setRiskProfileId((settings.riskProfileId || "standard_5x5") as RiskProfileId);
        setStorageMode((window.localStorage.getItem("sentinel_report_storage_mode") as StorageMode | null) || "local");
        setRequirePinUnlock(window.localStorage.getItem("sentinel_require_pin_unlock") === "true");
        setAutoLockMinutes(window.localStorage.getItem("sentinel_auto_lock_minutes") || "off");
        setFacilityList(getFacilities());

        const [membersResult, invitesResult] = await Promise.allSettled([
          getOrganizationMembers(),
          getOrganizationInvites(),
        ]);

        setMembers(membersResult.status === "fulfilled" ? membersResult.value : []);
        setInvites(invitesResult.status === "fulfilled" ? invitesResult.value : []);

        if (membersResult.status === "rejected" || invitesResult.status === "rejected") {
          setStatusType("error");
          setStatus("Workspace settings loaded, but member/invite details could not be loaded.");
        } else {
          setStatus("");
          setStatusType("idle");
        }
      } catch {
        setStatusType("error");
        setStatus("Workspace settings have not been configured yet. Defaults are being used.");
      }
    }

    loadSettings();
  }, []);

  function handleLogoUpload(file?: File) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setCompanyLogo(String(reader.result || ""));
    reader.readAsDataURL(file);
  }


  function addFacility() {
    if (!facilityName.trim()) return;

    const nextFacilities = [
      ...facilities,
      {
        id: `facility-${Date.now()}`,
        name: facilityName.trim(),
        siteType: facilityType.trim(),
      },
    ];

    setFacilityList(nextFacilities);
    setFacilities(nextFacilities);
    setFacilityName("");
    setFacilityType("");
  }

  function removeFacility(id: string) {
    const nextFacilities = facilities.filter((facility) => facility.id !== id);
    setFacilityList(nextFacilities);
    setFacilities(nextFacilities);
  }

  async function saveSettings() {
    try {
      setStatusType("idle");
      setStatus("Saving settings...");

      const saved = await updateOrganizationSettings({
        name: organizationName,
        riskProfileId,
        logoPath: companyLogo,
      });

      window.localStorage.setItem("sentinel_company_risk_profile", saved.riskProfileId || riskProfileId);
      window.localStorage.setItem("sentinel_company_logo", saved.logoPath || companyLogo || "");
      window.localStorage.setItem("sentinel_include_logo_on_cover", String(includeLogoOnCover));
      window.localStorage.setItem("sentinel_report_storage_mode", storageMode);
      window.localStorage.setItem("sentinel_require_pin_unlock", String(requirePinUnlock));
      window.localStorage.setItem("sentinel_auto_lock_minutes", autoLockMinutes);

      setStatusType("success");
      setStatus("Settings saved.");
    } catch {
      setStatusType("error");
      setStatus("Settings could not be saved. Please make sure you are signed in.");
    }
  }

  async function sendInvite() {
    try {
      if (!inviteEmail.trim()) {
        setStatusType("error");
        setStatus("Enter an email address before sending an invite.");
        return;
      }

      setStatusType("idle");
      setStatus("Creating invitation...");

      const invite = await inviteOrganizationMember({
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      setInvites((current) => [invite, ...current]);
      setInviteEmail("");
      setStatusType("success");
      setStatus(`Invitation created for ${invite.email}.`);
    } catch {
      setStatusType("error");
      setStatus("Invitation could not be created. Please make sure you are signed in.");
    }
  }

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage your organization profile, employees, risk matrix, and report storage preferences."
      />

      <section>
        <h2 className="text-xl font-black text-slate-900">Workspace Profile</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Company information used across inspection reports and cover pages.
        </p>

        <div className="mt-4 grid gap-5 md:grid-cols-[1fr_220px]">
          <label className="block">
            <span className="text-sm font-black text-slate-700">Organization Name</span>
            <input
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
            />
          </label>

          <div>
            <p className="text-sm font-black text-slate-700">Logo</p>
            <div className="mt-2 flex min-h-24 items-center justify-center rounded-xl border border-slate-200 bg-white p-3">
              {companyLogo ? (
                <img src={companyLogo} alt="Company logo preview" className="max-h-20 max-w-full object-contain" />
              ) : (
                <span className="text-xs font-bold text-slate-400">No logo uploaded</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#102A43] px-5 py-3 text-sm font-black text-white">
            Choose Logo
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(event) => handleLogoUpload(event.target.files?.[0])}
              className="hidden"
            />
          </label>

          {companyLogo && (
            <button
              type="button"
              onClick={() => setCompanyLogo("")}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition-all duration-150 hover:bg-red-100"
            >
              Remove Logo
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIncludeLogoOnCover(!includeLogoOnCover)}
          className="mt-4 flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left"
        >
          <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${includeLogoOnCover ? "bg-[#1D72B8]" : "bg-white"}`}>
            {includeLogoOnCover ? "✓" : ""}
          </span>
          <span>
            <span className="block text-sm font-black text-slate-900">Include logo on inspection cover pages</span>
            <span className="block text-xs font-semibold text-slate-500">This can still be changed for individual reports.</span>
          </span>
        </button>
      </section>

      <section className="border-t border-slate-300 pt-6">
        <h2 className="text-xl font-black text-slate-900">Employees & Roles</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Add employees to the workspace and assign the right access level.
        </p>

        <div className="mt-4 space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="font-black text-slate-900">{member.name}</p>
                <p className="text-sm font-semibold text-slate-500">{member.email}</p>
              </div>
              <span className="text-xs font-black uppercase tracking-wide text-[#F97316]">{member.role}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_auto]">
          <input
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="employee@example.com"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
          />

          <select
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
          >
            <option value="Auditor">Auditor</option>
            <option value="Viewer">Viewer</option>
            <option value="Owner">Owner</option>
          </select>

          <button
            type="button"
            onClick={sendInvite}
            className="rounded-xl bg-[#102A43] px-5 py-3 text-sm font-black text-white"
          >
            Add Employee
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {roleDefinitions.map(([role, description]) => (
            <div key={role} className="border-l-4 border-[#F97316] bg-white p-3">
              <p className="text-sm font-black text-slate-900">{role}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{description}</p>
            </div>
          ))}
        </div>

        {!!invites.length && (
          <div className="mt-5 space-y-2">
            <h3 className="text-sm font-black text-slate-900">Pending Invites</h3>
            {invites.map((invite) => (
              <div key={invite.id} className="border-b border-slate-200 py-2">
                <p className="text-sm font-black text-slate-900">{invite.email}</p>
                <p className="break-all text-xs font-semibold text-slate-500">
                  {invite.role} • Token: {invite.token}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-slate-300 pt-6">
        <h2 className="text-xl font-black text-slate-900">Facilities</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Company accounts can save common facilities so inspectors can select locations quickly during inspections.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <input
            value={facilityName}
            onChange={(event) => setFacilityName(event.target.value)}
            placeholder="Facility name"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
          />

          <input
            value={facilityType}
            onChange={(event) => setFacilityType(event.target.value)}
            placeholder="Type / Area"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
          />

          <button
            type="button"
            onClick={addFacility}
            className="rounded-xl bg-[#102A43] px-5 py-3 text-sm font-black text-white"
          >
            Add Facility
          </button>
        </div>

        {facilities.length ? (
          <div className="mt-4 divide-y divide-slate-200 border-t border-slate-200">
            {facilities.map((facility) => (
              <div key={facility.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-black text-slate-900">{facility.name}</p>
                  {facility.siteType && (
                    <p className="text-sm font-semibold text-slate-500">{facility.siteType}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeFacility(facility.id)}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm font-bold text-slate-500">
            No facilities saved yet.
          </p>
        )}
      </section>

      <section className="border-t border-slate-300 pt-6">
        <h2 className="text-xl font-black text-slate-900">Risk Matrix</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Sets the default severity and likelihood scale for new inspections.
        </p>

        <div className="mt-4 grid gap-5 md:grid-cols-[1fr_220px]">
          <div className="space-y-2">
            {riskProfiles.map(([id, label, description]) => (
              <button
                key={id}
                type="button"
                onClick={() => setRiskProfileId(id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                  riskProfileId === id ? "border-[#1D72B8] bg-[#E8F4FF]" : "border-slate-200 bg-white"
                }`}
              >
                <span>
                  <span className="block text-sm font-black text-slate-900">{label}</span>
                  <span className="block text-xs font-semibold text-slate-500">{description}</span>
                </span>
                <span className="text-sm font-black text-[#1D72B8]">{riskProfileId === id ? "Selected" : ""}</span>
              </button>
            ))}
          </div>

          <div>
            <p className="mb-2 text-sm font-black text-slate-700">{selectedMatrixLabel}</p>
            <RiskMatrixPreview riskProfileId={riskProfileId} />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-300 pt-6">
        <h2 className="text-xl font-black text-slate-900">Data & Privacy</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Sentinel Safety is local-first. Inspection reports stay private on the device unless workspace sync is selected.
        </p>

        <div className="mt-4 space-y-2">
          {storageModes.map(([id, label, description]) => (
            <button
              key={id}
              type="button"
              onClick={() => setStorageMode(id)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                storageMode === id ? "border-[#1D72B8] bg-[#E8F4FF]" : "border-slate-200 bg-white"
              }`}
            >
              <span>
                <span className="block text-sm font-black text-slate-900">{label}</span>
                <span className="block text-xs font-semibold text-slate-500">{description}</span>
              </span>
              <span className="text-sm font-black text-[#1D72B8]">{storageMode === id ? "Selected" : ""}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-300 pt-6">
        <h2 className="text-xl font-black text-slate-900">Local Security</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Choose whether encrypted local reports open immediately or require an additional unlock step.
        </p>

        <button
          type="button"
          onClick={() => setRequirePinUnlock(!requirePinUnlock)}
          className="mt-4 flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left"
        >
          <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${requirePinUnlock ? "bg-[#1D72B8]" : "bg-white"}`}>
            {requirePinUnlock ? "✓" : ""}
          </span>
          <span>
            <span className="block text-sm font-black text-slate-900">Require PIN to open local reports</span>
            <span className="block text-xs font-semibold text-slate-500">
              Standard Mode keeps access fast. Protected Mode adds another unlock step for sensitive work.
            </span>
          </span>
        </button>

        <label className="mt-4 block">
          <span className="text-sm font-black text-slate-700">Auto-lock</span>
          <select
            value={autoLockMinutes}
            onChange={(event) => setAutoLockMinutes(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
          >
            <option value="off">Off</option>
            <option value="5">After 5 minutes</option>
            <option value="15">After 15 minutes</option>
            <option value="30">After 30 minutes</option>
          </select>
        </label>
      </section>

      <section className="border-t border-slate-300 pt-6">
        <button
          type="button"
          onClick={saveSettings}
          className="w-full rounded-xl bg-[#102A43] px-5 py-3 text-sm font-black text-white sm:w-auto"
        >
          Save Settings
        </button>

        {status && (
          <p
            className={`mt-3 rounded-xl p-3 text-sm font-bold ${
              statusType === "error"
                ? "bg-red-50 text-red-700"
                : statusType === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-50 text-slate-600"
            }`}
          >
            {status}
          </p>
        )}
      </section>
    </section>
  );
}
