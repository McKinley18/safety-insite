"use client";

import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { HeroPanel } from "@/components/ui/HeroPanel";
import { AppPanel } from "@/components/ui/AppPanel";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput, AppSelect } from "@/components/ui/AppInput";
import SectionHeader from "@/components/ui/SectionHeader";
import { useEffect, useMemo, useState } from "react";
import { getStoredPlanCode, hasPlanEntitlement } from "@/lib/planEntitlements";
import { Facility, getFacilities, setFacilities } from "@/lib/facilityStorage";
import {
  getOrganizationInvites,
  getOrganizationMembers,
  getOrganizationSettings,
  inviteOrganizationMember,
  updateOrganizationSettings,
} from "@/lib/auth";

type RiskProfileId = "simple_4x4" | "standard_5x5" | "advanced_6x6";
type StorageMode = "local" | "cloud" | "ask";
type RegulatoryScope = "all" | "msha" | "osha_general" | "osha_construction";

const riskProfiles = [
  ["simple_4x4", "Simple 4x4", "Smaller teams or simpler programs."],
  ["standard_5x5", "Standard 5x5", "Recommended default for most operations."],
  ["advanced_6x6", "Advanced 6x6", "More detail for mature programs."],
] as const;

const regulatoryScopes = [
  ["all", "Let HazLenz AI evaluate", "Use when the app should decide the likely applicable agency."],
  ["msha", "MSHA", "Mining operations and 30 CFR matching."],
  ["osha_general", "OSHA General Industry", "General industry and 29 CFR 1910 matching."],
  ["osha_construction", "OSHA Construction", "Construction and 29 CFR 1926 matching."],
] as const;

const storageModes = [
  [
    "local",
    "Private Local Vault",
    "Reports stay encrypted on this device unless exported or synced.",
  ],
  [
    "cloud",
    "Cloud Workspace",
    "Reports sync to a shared workspace.",
  ],
  [
    "ask",
    "Ask Every Report",
    "Choose local or cloud storage when finalizing each report.",
  ],
] as const;

const confidentialityMarkerOptions = [
  "Privileged & Confidential",
  "Confidential Safety Review",
  "Internal Safety Use Only",
  "Draft — Subject to Review",
  "None",
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

function RiskMatrixPreview({
  riskProfileId,
}: {
  riskProfileId: RiskProfileId;
}) {
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
        className="grid overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700 bg-white"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {cells.map((cell) => (
          <div
            key={`${cell.severity}-${cell.likelihood}`}
            className={`aspect-square border border-white/60 ${getRiskColor(cell.score, size)} flex items-center justify-center text-[10px] font-black text-slate-900 dark:text-slate-100`}
          >
            {cell.score}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [includeLogoOnCover, setIncludeLogoOnCover] = useState(true);
  const [defaultIncludeCoverPage, setDefaultIncludeCoverPage] = useState(true);
  const [defaultConfidentialMarker, setDefaultConfidentialMarker] =
    useState(false);
  const [confidentialityMarkerText, setConfidentialityMarkerText] = useState(
    "Privileged & Confidential",
  );
  const [riskProfileId, setRiskProfileId] =
    useState<RiskProfileId>("standard_5x5");
  const [storageMode, setStorageMode] = useState<StorageMode>("local");
  const [regulatoryScope, setRegulatoryScope] = useState<RegulatoryScope>("all");
  const [requirePinUnlock, setRequirePinUnlock] = useState(false);
  const [autoLockMinutes, setAutoLockMinutes] = useState("off");

  const [facilities, setFacilityList] = useState<Facility[]>([]);
  const [facilityName, setFacilityName] = useState("");
  const [facilityType, setFacilityType] = useState("");
  const [facilityOwner, setFacilityOwner] = useState("");

  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Auditor");


  const [planCode, setPlanCode] = useState("basic");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const selectedMatrixLabel = useMemo(() => {
    return (
      riskProfiles.find(([id]) => id === riskProfileId)?.[1] || "Standard 5x5"
    );
  }, [riskProfileId]);

  const companyUsers = 5;
  const usedUsers = Math.max(members.length, 1);

  useEffect(() => {
    async function loadSettings() {
      setPlanCode(getStoredPlanCode());

      setCompanyLogo(
        window.localStorage.getItem("sentinel_company_logo") || "",
      );
      setIncludeLogoOnCover(
        window.localStorage.getItem("sentinel_include_logo_on_cover") !==
          "false",
      );
      setDefaultIncludeCoverPage(
        window.localStorage.getItem("sentinel_default_include_cover_page") !==
          "false",
      );
      setDefaultConfidentialMarker(
        window.localStorage.getItem("sentinel_default_confidential_marker") ===
          "true",
      );
      setConfidentialityMarkerText(
        window.localStorage.getItem("sentinel_confidential_marker_text") ||
          "Privileged & Confidential",
      );
      setStorageMode(
        (window.localStorage.getItem(
          "sentinel_report_storage_mode",
        ) as StorageMode | null) || "local",
      );
      setRegulatoryScope(
        (window.localStorage.getItem("sentinel_regulatory_scope") as RegulatoryScope | null) || "all",
      );
      setRequirePinUnlock(
        window.localStorage.getItem("sentinel_require_pin_unlock") === "true",
      );
      setAutoLockMinutes(
        window.localStorage.getItem("sentinel_auto_lock_minutes") || "off",
      );
      setFacilityList(getFacilities());

      try {
        const settings = await getOrganizationSettings();
        setOrganizationName(settings.name || "");
        setCompanyLogo(
          settings.logoPath ||
            window.localStorage.getItem("sentinel_company_logo") ||
            "",
        );
        setRiskProfileId(
          (settings.riskProfileId || "standard_5x5") as RiskProfileId,
        );
        setRegulatoryScope(
          (settings.regulatoryScope || window.localStorage.getItem("sentinel_regulatory_scope") || "all") as RegulatoryScope,
        );

        const [membersResult, invitesResult] = await Promise.allSettled([
          getOrganizationMembers(),
          getOrganizationInvites(),
        ]);

        setMembers(
          membersResult.status === "fulfilled" ? membersResult.value : [],
        );
        setInvites(
          invitesResult.status === "fulfilled" ? invitesResult.value : [],
        );
      } catch {
        setStatusType("idle");
        setStatus("");
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
        assignedOwner: facilityOwner.trim() || "Unassigned",
      } as any,
    ];

    setFacilityList(nextFacilities);
    setFacilities(nextFacilities);
    setFacilityName("");
    setFacilityType("");
    setFacilityOwner("");
  }

  function removeFacility(id: string) {
    const next = facilities.filter((facility) => facility.id !== id);
    setFacilityList(next);
    setFacilities(next);
  }

  function removeWorkspaceMember(identifier: string) {
    setMembers((current) =>
      current.filter((member) => String(member.id || member.email || member.name) !== identifier),
    );
    setStatusType("success");
    setStatus("Account removed from the workspace list.");
  }

  function removeWorkspaceInvite(identifier: string) {
    setInvites((current) =>
      current.filter((invite) => String(invite.id || invite.email) !== identifier),
    );
    setStatusType("success");
    setStatus("Pending invitation removed.");
  }

  async function sendInvite() {
    try {
      if (!inviteEmail.trim()) {
        setStatusType("error");
        setStatus("Enter an email address before sending an invite.");
        return;
      }

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
      setStatus(
        "Invitation could not be created. Sign-in may be required.",
      );
    }
  }

  async function saveSettings() {
    if (
      !hasPlanEntitlement("cloudReports", planCode) &&
      storageMode === "cloud"
    ) {
      setStorageMode("local");
      setStatusType("error");
      setStatus(
        "Cloud workspace sync is currently unavailable. Reports will stay on this device.",
      );
      return;
    }

    setStatusType("idle");
    setStatus("Saving settings...");

    let backendSynced = false;
    let saved: any = {};

    try {
      saved = await updateOrganizationSettings({
        name: organizationName,
        riskProfileId,
        regulatoryScope,
        logoPath: companyLogo,
      });

      backendSynced = true;
    } catch {
      // Local/dev mode should still allow settings to save.
      // Backend sync can happen later after the user is signed in.
      saved = {
        name: organizationName,
        riskProfileId,
        regulatoryScope,
        logoPath: companyLogo,
      };
    }

    window.localStorage.setItem(
      "sentinel_organization_name",
      saved.name || organizationName || "",
    );
    window.localStorage.setItem(
      "sentinel_company_risk_profile",
      saved.riskProfileId || riskProfileId,
    );
    window.localStorage.setItem(
      "sentinel_regulatory_scope",
      saved.regulatoryScope || regulatoryScope,
    );
    window.localStorage.setItem(
      "sentinel_company_logo",
      saved.logoPath || companyLogo || "",
    );
    window.localStorage.setItem(
      "sentinel_include_logo_on_cover",
      String(includeLogoOnCover),
    );
    window.localStorage.setItem(
      "sentinel_default_include_cover_page",
      String(defaultIncludeCoverPage),
    );
    window.localStorage.setItem(
      "sentinel_default_confidential_marker",
      String(defaultConfidentialMarker),
    );
    window.localStorage.setItem(
      "sentinel_confidential_marker_text",
      confidentialityMarkerText,
    );
    window.localStorage.setItem("sentinel_report_storage_mode", storageMode);
    window.localStorage.setItem(
      "sentinel_require_pin_unlock",
      String(requirePinUnlock),
    );
    window.localStorage.setItem(
      "sentinel_auto_lock_minutes",
      autoLockMinutes,
    );

    setStatusType("success");
    setStatus(
      backendSynced
        ? "Settings saved."
        : "Settings saved locally. Sign in later to sync workspace settings.",
    );
  }

  return (
    <section className="sentinel-page-shell space-y-4">
      <HeroPanel align="left">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Workspace Settings
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Organization controls.
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Adjust organization, locations, storage, risk matrix, security, and report defaults.
        </p>
      </HeroPanel>

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Quick View"
          title="Workspace summary"
          description="A compact view of the settings currently driving inspections and reports."
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              regulatoryScopes.find(([id]) => id === regulatoryScope)?.[1] ||
                "Let HazLenz AI evaluate",
              "Regulatory Scope",
            ],
            [selectedMatrixLabel, "Risk Matrix"],
            [
              storageModes.find(([id]) => id === storageMode)?.[1] ||
                "Private Local Vault",
              "Storage",
            ],
            [`${usedUsers}/${companyUsers}`, "Users"],
          ].map(([value, label]) => (
            <div key={label} className="border-l-4 border-[#1D72B8] bg-slate-50 dark:bg-slate-950 px-4 py-3">
              <p className="truncate text-sm font-black text-slate-950 dark:text-slate-100">{value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
              </p>
            </div>
          ))}
        </div>
      </AppPanel>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <AppPanel padding="lg">
          <SectionHeader
            eyebrow="HazLenz AI Defaults"
            title="Default Regulatory Scope"
            description="HazLenz AI uses this as the default agency context during inspection review. Users can still override hazard category during review."
          />

          <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200 dark:border-slate-800">
            {regulatoryScopes.map(([id, label, description]) => (
              <button
                key={id}
                type="button"
                onClick={() => setRegulatoryScope(id)}
                className="flex w-full items-center justify-between gap-4 px-1 py-4 text-left"
              >
                <span>
                  <span className="block text-sm font-black text-slate-950 dark:text-slate-100">
                    {label}
                  </span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
                    {description}
                  </span>
                </span>

                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${
                    regulatoryScope === id
                      ? "border-[#1D72B8] bg-[#1D72B8] text-white"
                      : "border-slate-300 dark:border-slate-700 bg-white text-transparent"
                  }`}
                >
                  ✓
                </span>
              </button>
            ))}
          </div>
        </AppPanel>

        <AppPanel padding="lg">
          <SectionHeader
            title="Organization"
            description="Organization information used on reports and cover pages."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
            <label className="block">
              <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                Organization Name
              </span>
              <AppInput
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                className="mt-2"
              />
            </label>

            <div>
              <p className="text-sm font-black text-slate-700 dark:text-slate-300">Logo</p>
              <div className="mt-2 flex min-h-24 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt="Organization logo preview"
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-400">
                    No logo uploaded
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black !text-white transition hover:bg-[#1D72B8]">
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
                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-50"
              >
                Remove Logo
              </button>
            )}
          </div>

          <div className="mt-5 border-y border-slate-200 dark:border-slate-800">
            <ToggleSwitch
              checked={includeLogoOnCover}
              onChange={() => setIncludeLogoOnCover(!includeLogoOnCover)}
              label="Include logo on inspection cover pages"
              description="This can still be changed for individual reports."
            />
          </div>
        </AppPanel>

        <AppPanel padding="lg">
          <SectionHeader
            title="Inspection Report Defaults"
            description="These defaults simplify the inspection start screen. Users can still override them for individual reports."
          />

          <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200 dark:border-slate-800">
            <ToggleSwitch
              checked={defaultIncludeCoverPage}
              onChange={() => setDefaultIncludeCoverPage(!defaultIncludeCoverPage)}
              label="Include cover page by default"
              description="New inspections will start with the cover page option enabled."
            />

            <ToggleSwitch
              checked={defaultConfidentialMarker}
              onChange={() => setDefaultConfidentialMarker(!defaultConfidentialMarker)}
              label="Include confidentiality marker by default"
              description="Use only when appropriate for your organization’s legal or internal review process."
            />
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-black text-slate-700 dark:text-slate-300">
              Confidentiality Marker Text
            </span>
            <AppSelect
              value={confidentialityMarkerText}
              onChange={(event) => setConfidentialityMarkerText(event.target.value)}
              className="mt-2"
            >
              {confidentialityMarkerOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </AppSelect>
          </label>
        </AppPanel>

        <AppPanel padding="lg">
          <SectionHeader
            title="Risk Matrix"
            description="Set the default severity and likelihood scale for new inspections."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px]">
            <div className="divide-y divide-slate-200 border-y border-slate-200 dark:border-slate-800">
              {riskProfiles.map(([id, label, description]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRiskProfileId(id)}
                  className="flex w-full items-center justify-between gap-4 px-1 py-4 text-left"
                >
                  <span>
                    <span className="block text-sm font-black text-slate-950 dark:text-slate-100">
                      {label}
                    </span>
                    <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
                      {description}
                    </span>
                  </span>

                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${
                      riskProfileId === id
                        ? "border-[#1D72B8] bg-[#1D72B8] text-white"
                        : "border-slate-300 dark:border-slate-700 bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </button>
              ))}
            </div>

            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {selectedMatrixLabel}
              </p>
              <RiskMatrixPreview riskProfileId={riskProfileId} />
            </div>
          </div>
        </AppPanel>

        <AppPanel padding="lg">
          <SectionHeader
            title="Storage"
            description="Choose how completed reports and evidence should be stored."
          />

          <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200 dark:border-slate-800">
            {storageModes.map(([id, label, description]) => {
              const disabled = id === "cloud" && !hasPlanEntitlement("cloudReports", planCode);

              return (
                <button
                  key={id}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && setStorageMode(id)}
                  className={`flex w-full items-center justify-between gap-4 px-1 py-4 text-left ${
                    disabled ? "opacity-50" : ""
                  }`}
                >
                  <span>
                    <span className="block text-sm font-black text-slate-950 dark:text-slate-100">
                      {label}
                    </span>
                    <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
                      {disabled
                        ? `${description} Currently unavailable.`
                        : description}
                    </span>
                  </span>

                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${
                      storageMode === id
                        ? "border-[#1D72B8] bg-[#1D72B8] text-white"
                        : "border-slate-300 dark:border-slate-700 bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
        </AppPanel>

        <AppPanel padding="lg">
          <SectionHeader
            title="Locations"
            description="Save common facilities, sites, or work areas for faster inspections."
          />

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
            <AppInput
              value={facilityName}
              onChange={(event) => setFacilityName(event.target.value)}
              placeholder="Facility name"
            />

            <AppInput
              value={facilityType}
              onChange={(event) => setFacilityType(event.target.value)}
              placeholder="Type / Area"
            />

            <AppInput
              value={facilityOwner}
              onChange={(event) => setFacilityOwner(event.target.value)}
              placeholder="Assign owner"
            />

            <AppButton type="button" onClick={addFacility}>
              Add
            </AppButton>
          </div>

          <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200 dark:border-slate-800">
            {facilities.length ? (
              facilities.map((facility) => (
                <div
                  key={facility.id}
                  className="flex items-center justify-between gap-3 px-1 py-3"
                >
                  <div>
                    <p className="text-sm font-black text-slate-950 dark:text-slate-100">
                      {facility.name}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {facility.siteType || "No type entered"}
                    </p>
                    <p className="text-xs font-bold text-slate-400">
                      Assigned to: {(facility as any).assignedOwner || "Unassigned"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFacility(facility.id)}
                    className="rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-black text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="px-1 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                No saved facilities yet.
              </p>
            )}
          </div>
        </AppPanel>

        <AppPanel padding="lg">
          <SectionHeader
            title="Security"
            description="Choose local unlock and auto-lock preferences."
          />

          <div className="mt-4 border-y border-slate-200 dark:border-slate-800">
            <ToggleSwitch
              checked={requirePinUnlock}
              onChange={() => setRequirePinUnlock(!requirePinUnlock)}
              label="Require PIN to open local reports"
              description="Adds another unlock step for sensitive work."
            />
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-black text-slate-700 dark:text-slate-300">
              Auto-lock Timer
            </span>
            <AppSelect
              value={autoLockMinutes}
              onChange={(event) => setAutoLockMinutes(event.target.value)}
              className="mt-2"
            >
              <option value="off">Off</option>
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
            </AppSelect>
          </label>
        </AppPanel>

      </div>

      {status && (
        <p
          className={`rounded-xl px-4 py-3 text-center text-sm font-black ${
            statusType === "success"
              ? "bg-emerald-50 text-emerald-700"
              : statusType === "error"
                ? "bg-red-50 text-red-700"
                : "bg-slate-100 text-slate-700 dark:text-slate-300"
          }`}
        >
          {status}
        </p>
      )}

      <div className="flex justify-center">
        <AppButton type="button" onClick={saveSettings} className="w-56">
          Save Settings
        </AppButton>
      </div>
    </section>
  );
}
