"use client";

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
  ["all", "Let SafeScope evaluate", "Use when the app should decide the likely applicable agency."],
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
    "Company Cloud Workspace",
    "Reports sync to the shared company workspace.",
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

  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Auditor");

  const [assignmentType, setAssignmentType] = useState("Corrective Action");
  const [assignmentOwner, setAssignmentOwner] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignedWork, setAssignedWork] = useState<any[]>([]);

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

  const companySeats = 5;
  const usedSeats = Math.max(members.length, 1);

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
      },
    ];

    setFacilityList(nextFacilities);
    setFacilities(nextFacilities);
    setFacilityName("");
    setFacilityType("");
  }

  function removeFacility(id: string) {
    const next = facilities.filter((facility) => facility.id !== id);
    setFacilityList(next);
    setFacilities(next);
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
        "Invitation could not be created. Company plan and sign-in may be required.",
      );
    }
  }

  function addAssignedWork() {
    if (!assignmentTitle.trim()) {
      setStatusType("error");
      setStatus("Enter an assignment title before adding work.");
      return;
    }

    const assignment = {
      id: `assignment-${Date.now()}`,
      type: assignmentType,
      title: assignmentTitle.trim(),
      owner: assignmentOwner || "Unassigned",
      dueDate: assignmentDueDate || "No due date",
      status: "Open",
      createdAt: new Date().toISOString(),
    };

    setAssignedWork((current) => [assignment, ...current]);
    setAssignmentTitle("");
    setAssignmentDueDate("");
    setStatusType("success");
    setStatus(`${assignment.type} assigned.`);
  }

  async function saveSettings() {
    try {
      if (
        !hasPlanEntitlement("cloudReports", planCode) &&
        storageMode === "cloud"
      ) {
        setStorageMode("local");
        setStatusType("error");
        setStatus(
          "Cloud workspace sync requires the Company plan. Reports will stay on this device.",
        );
        return;
      }

      setStatusType("idle");
      setStatus("Saving settings...");

      const saved = await updateOrganizationSettings({
        name: organizationName,
        riskProfileId,
        regulatoryScope,
        logoPath: companyLogo,
      });

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
      setStatus("Settings saved.");
    } catch {
      setStatusType("error");
      setStatus(
        "Settings could not be saved. Please make sure you are signed in.",
      );
    }
  }

  return (
    <section className="space-y-5">
      <HeroPanel align="left">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Workspace Settings
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Organization controls.
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Adjust organization, team, locations, storage, risk matrix, security, and report defaults.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [
              regulatoryScopes.find(([id]) => id === regulatoryScope)?.[1] ||
                "Let SafeScope evaluate",
              "Regulatory Scope",
            ],
            [selectedMatrixLabel, "Risk Matrix"],
            [
              storageModes.find(([id]) => id === storageMode)?.[1] ||
                "Private Local Vault",
              "Storage",
            ],
            [`${usedSeats}/${companySeats}`, "Seats"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3"
            >
              <p className="truncate text-sm font-black text-white">{value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-300">
                {label}
              </p>
            </div>
          ))}
        </div>
      </HeroPanel>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <AppPanel padding="md">
          <SectionHeader
            eyebrow="SafeScope Defaults"
          title="Default Regulatory Scope"
          description="SafeScope uses this as the default agency context during inspection review. Users can still override hazard category during review."
        />

        <div className="mt-4 grid gap-3">
          {regulatoryScopes.map(([id, label, description]) => (
            <button
              key={id}
              type="button"
              onClick={() => setRegulatoryScope(id)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                regulatoryScope === id
                  ? "border-[#1D72B8] bg-[#E8F4FF]"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="text-sm font-black text-slate-900">{label}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                {description}
              </p>
            </button>
          ))}
        </div>
        </AppPanel>

        <AppPanel padding="md">
        <SectionHeader
          title="Organization"
          description="Company information used on reports and cover pages."
        />

        <div className="mt-4 grid gap-5 md:grid-cols-[1fr_220px]">
          <label className="block">
            <span className="text-sm font-black text-slate-700">
              Organization Name
            </span>
            <AppInput
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              className="mt-2"
            />
          </label>

          <div>
            <p className="text-sm font-black text-slate-700">Logo</p>
            <div className="mt-2 flex min-h-24 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt="Company logo preview"
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

        <button
          type="button"
          onClick={() => setIncludeLogoOnCover(!includeLogoOnCover)}
          className="mt-4 flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left"
        >
          <span
            className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${includeLogoOnCover ? "bg-[#1D72B8]" : "bg-white"}`}
          >
            {includeLogoOnCover ? "✓" : ""}
          </span>
          <span>
            <span className="block text-sm font-black text-slate-900">
              Include logo on inspection cover pages
            </span>
            <span className="block text-xs font-semibold text-slate-500">
              This can still be changed for individual reports.
            </span>
          </span>
        </button>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Inspection Report Defaults
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            These defaults simplify the inspection start screen. Users can still
            override them for individual reports.
          </p>

          <button
            type="button"
            onClick={() => setDefaultIncludeCoverPage(!defaultIncludeCoverPage)}
            className="mt-4 flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left"
          >
            <span
              className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${defaultIncludeCoverPage ? "bg-[#1D72B8]" : "bg-white"}`}
            >
              {defaultIncludeCoverPage ? "✓" : ""}
            </span>
            <span>
              <span className="block text-sm font-black text-slate-900">
                Include cover page by default
              </span>
              <span className="block text-xs font-semibold text-slate-500">
                New inspections will start with the cover page option enabled.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setDefaultConfidentialMarker(!defaultConfidentialMarker)
            }
            className="mt-3 flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left"
          >
            <span
              className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${defaultConfidentialMarker ? "bg-[#1D72B8]" : "bg-white"}`}
            >
              {defaultConfidentialMarker ? "✓" : ""}
            </span>
            <span>
              <span className="block text-sm font-black text-slate-900">
                Include confidentiality marker by default
              </span>
              <span className="block text-xs font-semibold text-slate-500">
                Use only when appropriate for your organization’s legal or
                internal review process.
              </span>
            </span>
          </button>

          <label className="mt-4 block">
            <span className="text-sm font-black text-slate-700">
              Default confidentiality marker text
            </span>
            <AppSelect
              value={confidentialityMarkerText}
              onChange={(event) =>
                setConfidentialityMarkerText(event.target.value)
              }
              className="mt-2"
            >
              {confidentialityMarkerOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </AppSelect>
          </label>
        </div>
        </AppPanel>

        <AppPanel padding="md">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Company Command Hub
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              Team, seats, roles, and assigned work
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              One place for account leaders and managers to add employees,
              assign roles, manage seats, assign inspections, assign follow-ups,
              assign corrective actions, and track safety work.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
            <p className="text-2xl font-black text-slate-900">
              {usedSeats}/{companySeats}
            </p>
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              Seats Used
            </p>
          </div>
        </div>

        {hasPlanEntitlement("teamMembers", planCode) ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1D72B8]">
                    Users & Roles
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    Add employees and define their workspace access.
                  </p>
                </div>

                <AppButton
                  type="button"
                  variant="accent"
                  size="sm"
                >
                  Add Seats
                </AppButton>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_130px_auto]">
                <AppInput
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="employee@example.com"
                  fieldSize="sm"
                />

                <AppSelect
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value)}
                  fieldSize="sm"
                >
                  <option value="Owner">Owner</option>
                  <option value="Manager">Manager</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Viewer">Viewer</option>
                </AppSelect>

                <AppButton
                  type="button"
                  onClick={sendInvite}
                  size="sm"
                >
                  Add User
                </AppButton>
              </div>

              <div className="mt-3 grid gap-2">
                {(members.length
                  ? members
                  : [
                      {
                        id: "owner",
                        name: "Account Owner",
                        email: "Owner account",
                        role: "Owner",
                      },
                    ]
                ).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-slate-900">
                        {member.name || "User"}
                      </p>
                      <p className="truncate text-[11px] font-semibold text-slate-500">
                        {member.email}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>

              {!!invites.length && (
                <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2">
                  <p className="text-xs font-black text-slate-900">
                    Pending Invites
                  </p>
                  <div className="mt-2 grid gap-2">
                    {invites.map((invite) => (
                      <div key={invite.id}>
                        <p className="text-xs font-black text-slate-900">
                          {invite.email}
                        </p>
                        <p className="break-all text-[11px] font-semibold text-slate-500">
                          {invite.role} • Token: {invite.token}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1D72B8]">
                Assignment Center
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                Assign corrective actions, inspections, follow-ups, and reviews.
              </p>

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <AppSelect
                  value={assignmentType}
                  onChange={(event) => setAssignmentType(event.target.value)}
                  fieldSize="sm"
                >
                  <option>Corrective Action</option>
                  <option>Inspection</option>
                  <option>Inspection Follow-Up</option>
                  <option>Supervisor Review</option>
                </AppSelect>

                <AppSelect
                  value={assignmentOwner}
                  onChange={(event) => setAssignmentOwner(event.target.value)}
                  fieldSize="sm"
                >
                  <option value="">Assign to...</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.name || member.email}>
                      {member.name || member.email}
                    </option>
                  ))}
                </AppSelect>

                <AppInput
                  value={assignmentTitle}
                  onChange={(event) => setAssignmentTitle(event.target.value)}
                  placeholder="Assignment title"
                  fieldSize="sm"
                  className="md:col-span-2"
                />

                <AppInput
                  type="date"
                  value={assignmentDueDate}
                  onChange={(event) => setAssignmentDueDate(event.target.value)}
                  fieldSize="sm"
                />

                <AppButton
                  type="button"
                  onClick={addAssignedWork}
                  variant="accent"
                  size="sm"
                >
                  Assign Work
                </AppButton>
              </div>

              <div className="mt-3 grid gap-2">
                {assignedWork.length ? (
                  assignedWork.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black text-slate-900">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                            {item.type} • {item.owner} • Due: {item.dueDate}
                          </p>
                        </div>

                        <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-orange-700">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-500">
                    No assigned company work yet.
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-900">
              Company plan required
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              Team management, seats, roles, assignments, shared corrective
              actions, and inspection follow-up tracking are available on the
              Company plan.
            </p>
          </div>
        )}
        </AppPanel>

        <AppPanel padding="md">
        <SectionHeader
          title="Locations"
          description="Save common facilities, sites, or work areas for faster inspections."
        />

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
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

          <AppButton
            type="button"
            onClick={addFacility}
          >
            Add Location
          </AppButton>
        </div>

        {facilities.length ? (
          <div className="mt-4 divide-y divide-slate-200 border-t border-slate-200">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-black text-slate-900">{facility.name}</p>
                  {facility.siteType && (
                    <p className="text-sm font-semibold text-slate-500">
                      {facility.siteType}
                    </p>
                  )}
                </div>

                <AppButton
                  type="button"
                  onClick={() => removeFacility(facility.id)}
                  variant="danger"
                  size="sm"
                >
                  Remove
                </AppButton>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-bold text-slate-500">
            No locations saved yet.
          </p>
        )}
        </AppPanel>

        <AppPanel padding="md">
        <SectionHeader
          title="Storage"
          description="Choose where inspection reports are saved."
        />

        <div className="mt-4 space-y-2">
          {storageModes.map(([id, label, description]) => {
            const cloudLocked =
              id === "cloud" && !hasPlanEntitlement("cloudReports", planCode);

            return (
              <button
                key={id}
                type="button"
                disabled={cloudLocked}
                onClick={() => {
                  if (cloudLocked) return;
                  setStorageMode(id);
                }}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                  storageMode === id
                    ? "border-[#1D72B8] bg-[#E8F4FF]"
                    : "border-slate-200 bg-white"
                } ${cloudLocked ? "cursor-not-allowed opacity-55" : ""}`}
              >
                <span>
                  <span className="block text-sm font-black text-slate-900">
                    {label}
                    {cloudLocked ? " — Company only" : ""}
                  </span>
                  <span className="block text-xs font-semibold text-slate-500">
                    {cloudLocked
                      ? "Upgrade to Company to sync reports to a shared workspace."
                      : description}
                  </span>
                </span>
                <span className="text-sm font-black text-[#1D72B8]">
                  {storageMode === id ? "Selected" : ""}
                </span>
              </button>
            );
          })}

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
            <p className="text-sm font-black text-slate-900">
              Google Drive Backup — Planned
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Future option for user-controlled report and evidence backup.
            </p>
          </div>
        </div>
        </AppPanel>

        <AppPanel padding="md">
        <SectionHeader
          title="Risk Matrix"
          description="Set the default severity and likelihood scale for new inspections."
        />

        <div className="mt-4 grid gap-5 md:grid-cols-[1fr_220px]">
          <div className="space-y-2">
            {riskProfiles.map(([id, label, description]) => (
              <button
                key={id}
                type="button"
                onClick={() => setRiskProfileId(id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                  riskProfileId === id
                    ? "border-[#1D72B8] bg-[#E8F4FF]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span>
                  <span className="block text-sm font-black text-slate-900">
                    {label}
                  </span>
                  <span className="block text-xs font-semibold text-slate-500">
                    {description}
                  </span>
                </span>
                <span className="text-sm font-black text-[#1D72B8]">
                  {riskProfileId === id ? "Selected" : ""}
                </span>
              </button>
            ))}
          </div>

          <div>
            <p className="mb-2 text-sm font-black text-slate-700">
              {selectedMatrixLabel}
            </p>
            <RiskMatrixPreview riskProfileId={riskProfileId} />
          </div>
        </div>
        </AppPanel>

        <AppPanel padding="md">
        <SectionHeader
          title="Security"
          description="Choose local unlock and auto-lock preferences."
        />

        <button
          type="button"
          onClick={() => setRequirePinUnlock(!requirePinUnlock)}
          className="mt-4 flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left"
        >
          <span
            className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${requirePinUnlock ? "bg-[#1D72B8]" : "bg-white"}`}
          >
            {requirePinUnlock ? "✓" : ""}
          </span>
          <span>
            <span className="block text-sm font-black text-slate-900">
              Require PIN to open local reports
            </span>
            <span className="block text-xs font-semibold text-slate-500">
              Adds another unlock step for sensitive work.
            </span>
          </span>
        </button>

        <label className="mt-4 block">
          <span className="text-sm font-black text-slate-700">Auto-lock</span>
          <AppSelect
            value={autoLockMinutes}
            onChange={(event) => setAutoLockMinutes(event.target.value)}
            className="mt-2"
          >
            <option value="off">Off</option>
            <option value="5">After 5 minutes</option>
            <option value="15">After 15 minutes</option>
            <option value="30">After 30 minutes</option>
          </AppSelect>
        </label>
        </AppPanel>
      </div>

      <section className="mx-auto flex w-fit justify-center rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_12px_30px_rgba(15,23,42,0.14)] backdrop-blur lg:sticky lg:bottom-4 lg:z-30">
        <AppButton
          type="button"
          onClick={saveSettings}
          variant="accent"
        >
          Save Settings
        </AppButton>

        {status && (
          <p
            className={`mt-2 max-w-xs rounded-lg px-2 py-1.5 text-xs font-bold ${
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
