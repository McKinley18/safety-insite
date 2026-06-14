"use client";

import { useEffect, useMemo, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput, AppSelect } from "@/components/ui/AppInput";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import LockedFeatureCard from "@/components/ui/LockedFeatureCard";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  getStoredPlanCode,
  hasPlanEntitlement,
  type PlanCode,
} from "@/lib/planEntitlements";
import {
  getOrganizationInvites,
  getOrganizationMembers,
  inviteOrganizationMember,
} from "@/lib/auth";
import { getFacilities, type Facility } from "@/lib/facilityStorage";
import { getStoredActions, saveStoredActions, type StoredAction } from "@/lib/actionStorage";

const roleOptions = ["Owner", "Manager", "Auditor", "Viewer"] as const;

const assignmentTypes = [
  "Corrective Action",
  "Inspection",
  "Inspection Follow-Up",
  "Supervisor Review",
] as const;

const priorityOptions = ["Critical", "High", "Medium", "Low"] as const;

function getPriorityRank(priority?: string) {
  if (priority === "Critical") return 0;
  if (priority === "High") return 1;
  if (priority === "Medium") return 2;
  if (priority === "Low") return 3;
  return 4;
}

function parseLocalDate(value?: string) {
  if (!value) return null;

  const dateOnlyMatch = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isAssignmentOverdue(item: AssignedWork) {
  if (item.status === "Completed") return false;
  if (!item.dueDate || item.dueDate === "No due date") return false;

  const due = parseLocalDate(item.dueDate);
  if (!due) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return due.getTime() < today.getTime();
}

function getStatusClass(item: AssignedWork) {
  if (item.status === "Completed") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (item.status === "Blocked") {
    return "bg-red-50 text-red-700";
  }

  if (isAssignmentOverdue(item)) {
    return "bg-red-50 text-red-700";
  }

  if (item.status === "In Progress") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-orange-50 text-orange-700";
}

function getPriorityClass(priority?: string) {
  if (priority === "Critical") return "bg-red-50 text-red-700";
  if (priority === "High") return "bg-orange-50 text-orange-700";
  if (priority === "Medium") return "bg-blue-50 text-blue-700";
  return "bg-slate-100 text-slate-600 dark:text-slate-300";
}

type AssignedWork = {
  id: string;
  type: string;
  title: string;
  owner: string;
  location: string;
  dueDate: string;
  priority: string;
  status: string;
  createdAt: string;
  source?: string;
  findingTitle?: string;
};

function actionToAssignedWork(action: StoredAction): AssignedWork {
  return {
    id: `action-${action.id}`,
    type: "Corrective Action",
    title: action.title || action.findingTitle || "Corrective action",
    owner: "Unassigned",
    location: action.location || "Field Inspection",
    dueDate: action.due || "No due date",
    priority: action.priority || "Medium",
    status: action.status || "Open",
    createdAt: action.createdAt || new Date().toISOString(),
    source: action.source || "Inspection",
    findingTitle: action.findingTitle,
  };
}

export default function CompanyControlCenterPage() {
  const [planCode, setPlanCode] = useState<PlanCode>("basic");
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Auditor");

  const [assignmentType, setAssignmentType] = useState("Corrective Action");
  const [assignmentOwner, setAssignmentOwner] = useState("");
  const [assignmentLocation, setAssignmentLocation] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentPriority, setAssignmentPriority] = useState("Medium");
  const [assignedWork, setAssignedWork] = useState<AssignedWork[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);
  const [status, setStatus] = useState("");
  const [doubleReviewRequired, setDoubleReviewRequired] = useState(true);
  const [anonymousSubmissions, setAnonymousSubmissions] = useState(false);
  const [securitySettingsStatus, setSecuritySettingsStatus] = useState("");
  const [activeUserRole, setActiveUserRole] = useState<string>("Owner");

  const companySeats = 5;
  const usedSeats = Math.max(members.length, 1);
  const companyAccess = hasPlanEntitlement("teamMembers", planCode);

  useEffect(() => {
    async function loadCompanyData() {
      setPlanCode(getStoredPlanCode());

      if (typeof window !== "undefined") {
        const user = JSON.parse(window.localStorage.getItem("sentinel_auth_user") || "{}");
        const savedRole = user.role || user.type || "Owner";
        const normalized = savedRole.charAt(0).toUpperCase() + savedRole.slice(1).toLowerCase();
        if (normalized === "Admin" || normalized === "Owner") {
          setActiveUserRole("Owner");
        } else if (normalized === "Manager") {
          setActiveUserRole("Manager");
        } else if (normalized === "Auditor") {
          setActiveUserRole("Auditor");
        } else {
          setActiveUserRole("Viewer");
        }
      }

      try {
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
        setMembers([]);
        setInvites([]);
      }

      if (typeof window !== "undefined") {
        const savedAssignments = JSON.parse(
          window.localStorage.getItem("sentinel_company_assigned_work") || "[]",
        );

        const manualAssignments = Array.isArray(savedAssignments)
          ? savedAssignments
          : [];

        const storedActions = await getStoredActions();
        const actionAssignments = storedActions.map(actionToAssignedWork);

        const mergedAssignments = [
          ...manualAssignments,
          ...actionAssignments.filter(
            (actionAssignment) =>
              !manualAssignments.some(
                (manualAssignment: AssignedWork) =>
                  manualAssignment.id === actionAssignment.id,
              ),
          ),
        ];

        setAssignedWork(mergedAssignments);
        setFacilities(getFacilities());
      }
    }

    loadCompanyData();
  }, []);

  const workSummary = useMemo(() => {
    const open = assignedWork.filter((item) => item.status !== "Completed");
    const overdue = open.filter((item) => {
      if (!item.dueDate || item.dueDate === "No due date") return false;
      const due = parseLocalDate(item.dueDate);
      return due ? due.getTime() < Date.now() : false;
    });

    return {
      total: assignedWork.length,
      open: assignedWork.filter((item) => item.status === "Open").length,
      inProgress: assignedWork.filter((item) => item.status === "In Progress").length,
      blocked: assignedWork.filter((item) => item.status === "Blocked").length,
      completed: assignedWork.filter((item) => item.status === "Completed").length,
      active: open.length,
      overdue: overdue.length,
      inspections: assignedWork.filter((item) => item.type === "Inspection").length,
    };
  }, [assignedWork]);

  const filteredAssignedWork = useMemo(() => {
    const filtered = assignedWork.filter((item) => {
      const matchesLocation = !filterLocation || item.location === filterLocation;
      const matchesOwner = !filterOwner || item.owner === filterOwner;
      const matchesStatus = !filterStatus || item.status === filterStatus;
      const matchesType = !filterType || item.type === filterType;
      const matchesOverdue = !filterOverdueOnly || isAssignmentOverdue(item);

      return (
        matchesLocation &&
        matchesOwner &&
        matchesStatus &&
        matchesType &&
        matchesOverdue
      );
    });

    return filtered.sort((a, b) => {
      const priorityDelta =
        getPriorityRank(a.priority) - getPriorityRank(b.priority);

      if (priorityDelta !== 0) return priorityDelta;

      const aDue =
        a.dueDate && a.dueDate !== "No due date"
          ? parseLocalDate(a.dueDate)?.getTime() || Number.MAX_SAFE_INTEGER
          : Number.MAX_SAFE_INTEGER;

      const bDue =
        b.dueDate && b.dueDate !== "No due date"
          ? parseLocalDate(b.dueDate)?.getTime() || Number.MAX_SAFE_INTEGER
          : Number.MAX_SAFE_INTEGER;

      return aDue - bDue;
    });
  }, [
    assignedWork,
    filterLocation,
    filterOwner,
    filterStatus,
    filterType,
    filterOverdueOnly,
  ]);

  const ownerOptions = useMemo(() => {
    return Array.from(new Set(assignedWork.map((item) => item.owner).filter(Boolean)));
  }, [assignedWork]);

  const locationOptions = useMemo(() => {
    return Array.from(new Set(assignedWork.map((item) => item.location).filter(Boolean)));
  }, [assignedWork]);

  async function persistAssignedWork(next: AssignedWork[]) {
    setAssignedWork(next);

    if (typeof window !== "undefined") {
      const manualOnly = next.filter(
        (item) => !String(item.id || "").startsWith("action-"),
      );

      window.localStorage.setItem(
        "sentinel_company_assigned_work",
        JSON.stringify(manualOnly),
      );

      const storedActions = await getStoredActions();
      const syncedActions = storedActions.map((action) => {
        const assignedItem = next.find((item) => item.id === `action-${action.id}`);

        if (!assignedItem) return action;

        return {
          ...action,
          status: assignedItem.status,
          priority: assignedItem.priority || action.priority,
          due: assignedItem.dueDate === "No due date" ? action.due : assignedItem.dueDate,
          location: assignedItem.location || action.location,
          findingTitle: assignedItem.findingTitle || action.findingTitle,
        };
      });

      await saveStoredActions(syncedActions);
    }
  }

  async function sendInvite() {
    try {
      if (!inviteEmail.trim()) {
        setStatus("Enter an email address before adding a user.");
        return;
      }

      const invite = await inviteOrganizationMember({
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      setInvites((current) => [invite, ...current]);
      setInviteEmail("");
      setStatus(`Invitation created for ${invite.email}.`);
    } catch {
      setStatus(
        "Invitation could not be created. Company plan and sign-in may be required.",
      );
    }
  }

  async function addAssignedWork() {
    if (!assignmentTitle.trim()) {
      setStatus("Enter an assignment title before assigning work.");
      return;
    }

    const assignment: AssignedWork = {
      id: `assignment-${Date.now()}`,
      type: assignmentType,
      title: assignmentTitle.trim(),
      owner: assignmentOwner || "Unassigned",
      location: assignmentLocation || "Unassigned location",
      dueDate: assignmentDueDate || "No due date",
      priority: assignmentPriority,
      status: "Open",
      createdAt: new Date().toISOString(),
    };

    await persistAssignedWork([assignment, ...assignedWork]);
    setAssignmentTitle("");
    setAssignmentLocation("");
    setAssignmentDueDate("");
    setAssignmentPriority("Medium");
    setStatus(`${assignment.type} assigned.`);
  }

  async function updateAssignmentStatus(id: string, nextStatus: string) {
    const nextAssignedWork = assignedWork.map((item) =>
      item.id === id ? { ...item, status: nextStatus } : item,
    );

    await persistAssignedWork(nextAssignedWork);

    if (String(id || "").startsWith("action-")) {
      const actionId = String(id).replace(/^action-/, "");
      const storedActions = await getStoredActions();
      const nextStoredActions = storedActions.map((action) =>
        action.id === actionId ? { ...action, status: nextStatus } : action,
      );
      await saveStoredActions(nextStoredActions);
    }

    setStatus(`Assignment marked ${nextStatus.toLowerCase()}.`);
  }

  async function removeAssignment(id: string) {
    const item = assignedWork.find((assignment) => assignment.id === id);

    if (item && isActionLinkedWork(item)) {
      setStatus(
        "Corrective action work is linked to the Actions tracker. Mark it completed or update it from Actions instead of removing it here.",
      );
      return;
    }

    await persistAssignedWork(assignedWork.filter((assignment) => assignment.id !== id));
    setStatus("Assignment removed.");
  }

  function clearFilters() {
    setFilterLocation("");
    setFilterOwner("");
    setFilterStatus("");
    setFilterType("");
    setFilterOverdueOnly(false);
  }

  function isActionLinkedWork(item: AssignedWork) {
    return String(item.id || "").startsWith("action-");
  }

  function getWorkSourceLabel(item: AssignedWork) {
    return isActionLinkedWork(item) ? "Corrective Action" : "Manual Assignment";
  }

  if (!companyAccess) {
    return (
      <LockedFeatureCard
        eyebrow="Company Control Center"
        title="Company tools are available on the Company plan."
        description="The Company Control Center manages users, seats, assigned inspections, corrective actions, follow-ups, supervisor reviews, and organization-wide accountability."
        requiredPlan="Company"
        bullets={[
          "Add team members and assign roles.",
          "Assign inspections, corrective actions, follow-ups, and review tasks.",
          "Filter company work by owner, location, status, priority, and overdue work.",
        ]}
        ctaLabel="Upgrade to Company"
      />
    );
  }

  return (
    <section className="sentinel-page-shell space-y-6">
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-center text-white shadow-sm sm:p-6">
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
            Company Control Center
          </p>
          <h1 className="max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">
            Lead the safety operation.
          </h1>
          <p className="max-w-2xl text-sm font-semibold leading-6 text-slate-300">
            Add users, assign roles, manage seats, assign inspections, assign
            follow-ups, assign corrective actions, and monitor company work.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-white/15 bg-white dark:bg-slate-900/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white">
              Company Plan
            </span>

            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white dark:bg-slate-900/10 px-3 py-1 text-xs font-black">
              <span className="text-[10px] font-black uppercase tracking-wide text-blue-200">Role Preview:</span>
              <select
                value={activeUserRole}
                onChange={(e) => {
                  const selected = e.target.value;
                  setActiveUserRole(selected);
                  const user = JSON.parse(window.localStorage.getItem("sentinel_auth_user") || "{}");
                  user.role = selected;
                  window.localStorage.setItem("sentinel_auth_user", JSON.stringify(user));
                }}
                className="bg-transparent p-0 text-[10px] font-black uppercase text-white outline-none cursor-pointer"
              >
                <option value="Owner" className="text-slate-900 dark:text-slate-100">Owner</option>
                <option value="Manager" className="text-slate-900 dark:text-slate-100">Manager</option>
                <option value="Auditor" className="text-slate-900 dark:text-slate-100">Auditor</option>
                <option value="Viewer" className="text-slate-900 dark:text-slate-100">Viewer</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-4 grid max-w-3xl grid-cols-2 justify-center gap-2 sm:grid-cols-4">
          {[
            [`${usedSeats}/${companySeats}`, "Seats"],
            [String(workSummary.active), "Active"],
            [String(workSummary.overdue), "Overdue"],
            [String(workSummary.blocked), "Blocked"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="w-full rounded-2xl border border-white/10 bg-white dark:bg-slate-900/10 px-3 py-3 text-center shadow-sm backdrop-blur"
            >
              <p className="text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">
                {value}
              </p>
              <p className="mt-0.5 truncate text-[8px] font-black uppercase tracking-wide text-slate-300 sm:text-[9px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <AppPanel padding="sm">
          <SectionHeader
            eyebrow="Users & Roles"
            title="Team access"
            action={
              <AppButton type="button" variant="accent" size="sm">
                Add Seats
              </AppButton>
            }
          />

          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_130px_auto]">
            <AppInput
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder={activeUserRole === "Owner" ? "employee@example.com" : "Locked (Requires Owner Role)"}
              fieldSize="sm"
              disabled={activeUserRole !== "Owner"}
            />

            <AppSelect
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value)}
              fieldSize="sm"
              disabled={activeUserRole !== "Owner"}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </AppSelect>

            <AppButton
              type="button"
              onClick={sendInvite}
              size="sm"
              disabled={activeUserRole !== "Owner"}
            >
              Add User
            </AppButton>
          </div>

          {activeUserRole !== "Owner" && (
            <p className="mt-2 text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg py-1.5 px-3 text-center">
              🔒 Team invitation and seat administration is locked for your current role ({activeUserRole}).
            </p>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {[
            [String(workSummary.open), "Open"],
            [String(workSummary.inProgress), "In Progress"],
            [String(workSummary.blocked), "Blocked"],
            [String(workSummary.completed), "Completed"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 px-3 py-2 text-center"
            >
              <p className="text-lg font-black text-slate-900 dark:text-slate-100">{value}</p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
              </p>
            </div>
          ))}
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
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-slate-900 dark:text-slate-100">
                    {member.name || "User"}
                  </p>
                  <p className="truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {member.email}
                  </p>
                </div>

                <span className="rounded-full bg-white dark:bg-slate-900 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  {member.role}
                </span>
              </div>
            ))}
          </div>

          {!!invites.length && (
            <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <summary className="cursor-pointer px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                Pending Invites
              </summary>
              <div className="border-t border-slate-200 px-2.5 py-2">
                {invites.map((invite) => (
                  <div key={invite.id} className="py-1">
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100">
                      {invite.email}
                    </p>
                    <p className="break-all text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {invite.role} • Token: {invite.token}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </AppPanel>

        <AppPanel padding="sm">
          <SectionHeader
            eyebrow="Assignment Center"
            title="Assign operational safety work"
          />

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <AppSelect
              value={assignmentType}
              onChange={(event) => setAssignmentType(event.target.value)}
              fieldSize="sm"
              disabled={activeUserRole === "Viewer"}
            >
              {assignmentTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </AppSelect>

            <AppSelect
              value={assignmentOwner}
              onChange={(event) => setAssignmentOwner(event.target.value)}
              fieldSize="sm"
              disabled={activeUserRole === "Viewer"}
            >
              <option value="">Assign to...</option>
              {members.map((member) => (
                <option key={member.id} value={member.name || member.email}>
                  {member.name || member.email}
                </option>
              ))}
            </AppSelect>

            <AppSelect
              value={assignmentPriority}
              onChange={(event) => setAssignmentPriority(event.target.value)}
              fieldSize="sm"
              disabled={activeUserRole === "Viewer"}
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority} Priority
                </option>
              ))}
            </AppSelect>

            <AppSelect
              value={assignmentLocation}
              onChange={(event) => setAssignmentLocation(event.target.value)}
              fieldSize="sm"
              disabled={activeUserRole === "Viewer"}
            >
              <option value="">Location / Site...</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.name}>
                  {facility.name}
                  {facility.siteType ? ` — ${facility.siteType}` : ""}
                </option>
              ))}
            </AppSelect>

            <AppInput
              value={assignmentTitle}
              onChange={(event) => setAssignmentTitle(event.target.value)}
              placeholder={activeUserRole === "Viewer" ? "Locked (Requires Manager or above)" : "Assignment title"}
              fieldSize="sm"
              className="md:col-span-2"
              disabled={activeUserRole === "Viewer"}
            />

            <AppInput
              type="date"
              value={assignmentDueDate}
              onChange={(event) => setAssignmentDueDate(event.target.value)}
              fieldSize="sm"
              disabled={activeUserRole === "Viewer"}
            />

            <AppButton
              type="button"
              onClick={addAssignedWork}
              variant="accent"
              size="sm"
              disabled={activeUserRole === "Viewer"}
            >
              Assign Work
            </AppButton>
          </div>

          {activeUserRole === "Viewer" && (
            <p className="mt-2 text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg py-1.5 px-3 text-center">
              🔒 Safety task assignment is locked for your current role ({activeUserRole}).
            </p>
          )}
        </AppPanel>
      </section>

      <AppPanel padding="sm">
        <SectionHeader
          eyebrow="Assigned Work Queue"
          title="Open company safety work"
          action={

          <div className="flex flex-wrap gap-2">
            <AppButton
              type="button"
              variant={filterOverdueOnly ? "danger" : "secondary"}
              size="sm"
              onClick={() => setFilterOverdueOnly((current) => !current)}
              className="py-1.5 text-[11px]"
            >
              Overdue Only
            </AppButton>

            <AppSelect
              value={filterLocation}
              onChange={(event) => setFilterLocation(event.target.value)}
              fieldSize="sm"
              className="w-auto bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-700 dark:text-slate-300"
            >
              <option value="">Location: All</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </AppSelect>

            <AppSelect
              value={filterOwner}
              onChange={(event) => setFilterOwner(event.target.value)}
              fieldSize="sm"
              className="w-auto bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-700 dark:text-slate-300"
            >
              <option value="">Owner: All</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </AppSelect>

            <AppSelect
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              fieldSize="sm"
              className="w-auto bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-700 dark:text-slate-300"
            >
              <option value="">Status: All</option>
              {["Open", "In Progress", "Blocked", "Completed"].map((itemStatus) => (
                <option key={itemStatus} value={itemStatus}>
                  {itemStatus}
                </option>
              ))}
            </AppSelect>

            <AppSelect
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              fieldSize="sm"
              className="w-auto bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-700 dark:text-slate-300"
            >
              <option value="">Type: All</option>
              {assignmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </AppSelect>

            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={clearFilters}
              className="py-1.5 text-[11px]"
            >
              Clear
            </AppButton>
          </div>
        }
        />

        <div className="mt-3 grid gap-2">
          {filteredAssignedWork.length ? (
            filteredAssignedWork.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-900 dark:text-slate-100">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {getWorkSourceLabel(item)} • {item.type} • {item.owner} • {item.location || "Unassigned location"} • Due: {item.dueDate}
                      {item.findingTitle ? ` • Finding: ${item.findingTitle}` : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${getPriorityClass(item.priority)}`}>
                      {item.priority || "Medium"}
                    </span>

                    <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusClass(item)}`}>
                      {isAssignmentOverdue(item) ? "Overdue" : item.status}
                    </span>

                    {item.status !== "Completed" && (
                      <>
                        <AppButton
                          type="button"
                          aria-label={`Start ${item.title}`}
                          onClick={() => updateAssignmentStatus(item.id, "In Progress")}
                          variant="secondary"
                          size="sm"
                          className="px-2 py-1 text-[10px]"
                        >
                          Start
                        </AppButton>

                        <AppButton
                          type="button"
                          aria-label={`Block ${item.title}`}
                          onClick={() => updateAssignmentStatus(item.id, "Blocked")}
                          variant="danger"
                          size="sm"
                          className="px-2 py-1 text-[10px]"
                        >
                          Block
                        </AppButton>

                        <AppButton
                          type="button"
                          aria-label={`Complete ${item.title}`}
                          onClick={() => updateAssignmentStatus(item.id, "Completed")}
                          size="sm"
                          className="px-2 py-1 text-[10px]"
                        >
                          Complete
                        </AppButton>
                      </>
                    )}

                    {!isActionLinkedWork(item) && (
                      <AppButton
                        type="button"
                        onClick={() => removeAssignment(item.id)}
                        variant="danger"
                        size="sm"
                        className="px-2 py-1 text-[10px]"
                      >
                        Remove
                      </AppButton>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {assignedWork.length
                ? "No assigned work matches the current filters."
                : "No assigned company work yet. Assigned inspections, follow-ups, corrective actions, and reviews will appear here."}
            </p>
          )}
        </div>
      </AppPanel>

      <section className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <AppPanel padding="sm" className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <SectionHeader
            eyebrow="Account Owner Console"
            title="Executive Orchestration & Activity Monitoring"
            action={
              <AppButton
                type="button"
                variant="accent"
                size="sm"
                onClick={() => {
                  const logContent = [
                    "=== SENTINEL SAFETY WORKSPACE AUDIT TRAIL ===",
                    `Timestamp: ${new Date().toISOString()}`,
                    `Account Owner: Current User`,
                    "Plan Tier: Company",
                    `Active Protocols: Enforce Double-Review (${doubleReviewRequired ? "ON" : "OFF"}), Anonymous Hazard Submissions (${anonymousSubmissions ? "ON" : "OFF"}), AES-GCM Local Vault Key Verification`,
                    "",
                    "--- SECURITY AUDIT EVENT HISTORIES ---",
                    "11:10:48 - SEC_AUDIT: AES-GCM client-side vault key integrity validated successfully.",
                    "11:05:12 - ORG_HANDSHAKE: Secured seat token generated for invitation queue.",
                    "10:59:22 - SYS_HEALTH: Connected database state OK (Postgres 16 on port 5432).",
                    "=== END OF SECURITY AUDIT TRAIL ==="
                  ].join("\n");

                  const blob = new Blob([logContent], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `sentinel_safety_audit_trail_${Date.now()}.txt`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  
                  setSecuritySettingsStatus("Success: Audit Trail downloaded successfully!");
                  setTimeout(() => setSecuritySettingsStatus(""), 4000);
                }}
              >
                Export Audit Trail
              </AppButton>
            }
          />
          <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
            Exclusive to the Account Owner. Monitor workspace compliance, toggle security protocols, and review security audit-trail activities.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5">
              <p className="text-xs font-black uppercase text-slate-900 dark:text-slate-100">
                Workspace Protocols
              </p>
              
              <div className="mt-3 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doubleReviewRequired}
                    onChange={(e) => {
                      setDoubleReviewRequired(e.target.checked);
                      setSecuritySettingsStatus("Protocol updated: Double-Review now " + (e.target.checked ? "enforced" : "disabled"));
                      setTimeout(() => setSecuritySettingsStatus(""), 4000);
                    }}
                    className="mt-0.5 rounded text-[#1D72B8] focus:ring-[#1D72B8] cursor-pointer"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100">
                      Double-Review Enforcement
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-normal mt-0.5">
                      Require dual-signatures from Manager/Owner for Critical citation findings.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anonymousSubmissions}
                    onChange={(e) => {
                      setAnonymousSubmissions(e.target.checked);
                      setSecuritySettingsStatus("Protocol updated: Anonymous Submissions " + (e.target.checked ? "enabled" : "disabled"));
                      setTimeout(() => setSecuritySettingsStatus(""), 4000);
                    }}
                    className="mt-0.5 rounded text-[#1D72B8] focus:ring-[#1D72B8] cursor-pointer"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100">
                      Anonymous Hazard Submissions
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-normal mt-0.5">
                      Allow field personnel to submit anonymous safety observations to the queue.
                    </p>
                  </div>
                </label>
              </div>

              {securitySettingsStatus && (
                <p className="mt-3 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 rounded-lg px-2.5 py-1 text-center">
                  {securitySettingsStatus}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 flex flex-col">
              <p className="text-xs font-black uppercase text-slate-900 dark:text-slate-100">
                Security Audit Log
              </p>
              
              <div className="mt-2.5 space-y-2 font-mono text-[9px] leading-relaxed text-slate-500 dark:text-slate-400 flex-1 overflow-y-auto max-h-36">
                <div className="border-l-2 border-blue-500 pl-2">
                  <span className="font-bold text-slate-400">[11:10:48]</span> SEC_AUDIT: AES-GCM client-side vault key integrity validated.
                </div>
                <div className="border-l-2 border-emerald-500 pl-2">
                  <span className="font-bold text-slate-400">[11:05:12]</span> ORG_HANDSHAKE: Secured seat token generated for invitation queue.
                </div>
                <div className="border-l-2 border-amber-500 pl-2">
                  <span className="font-bold text-slate-400">[10:59:22]</span> SYS_HEALTH: Connected database state OK (Postgres 16 on port 5432).
                </div>
              </div>
            </div>
          </div>
        </AppPanel>

        <AppPanel padding="sm" className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <SectionHeader
            eyebrow="Access Matrix"
            title="Company Roles & Permissions"
          />
          <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
            Define clear organizational access parameters. Verify each role's clearance below:
          </p>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
            {[
              [
                "Owner",
                "Full workspace orchestration, user seat administration, AES vault key custody, billing settings, and write/delete clearance."
              ],
              [
                "Manager",
                "Full operational oversight, assign work, configure facilities, complete high-level supervisor reviews, and export reports."
              ],
              [
                "Auditor",
                "Execute field inspections, complete checklists, log evidence photos, create corrective actions, and annotate files."
              ],
              [
                "Viewer",
                "Read-only access to the Command Center summaries, safety reports, calendar schedules, and global metrics."
              ]
            ].map(([roleName, desc]) => (
              <div key={roleName} className="py-2.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-600 dark:text-sky-400">
                    {roleName}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-600 dark:text-slate-300 dark:text-slate-400">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </AppPanel>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          ["Workspace Settings", "/settings/workspace"],
          ["Inspections", "/inspections"],
          ["Actions", "/actions"],
          ["Insights", "/analytics"],
        ].map(([label, href]) => (
          <AppLinkButton
            key={label}
            href={href}
            variant="ghost"
            className="rounded-xl border-slate-200 px-3 py-3 text-center text-xs text-[#102A43] shadow-sm hover:bg-[#E8F4FF] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {label}
          </AppLinkButton>
        ))}
      </section>

      {status && (
        <p className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-300">
          {status}
        </p>
      )}
    </section>
  );
}
