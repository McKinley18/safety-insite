"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { getStoredActions, type StoredAction } from "@/lib/actionStorage";

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

function isAssignmentOverdue(item: AssignedWork) {
  if (item.status === "Completed") return false;
  if (!item.dueDate || item.dueDate === "No due date") return false;

  const due = new Date(item.dueDate);
  if (Number.isNaN(due.getTime())) return false;

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
  return "bg-slate-100 text-slate-600";
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
  const [status, setStatus] = useState("");

  const companySeats = 5;
  const usedSeats = Math.max(members.length, 1);
  const companyAccess = hasPlanEntitlement("teamMembers", planCode);

  useEffect(() => {
    async function loadCompanyData() {
      setPlanCode(getStoredPlanCode());

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
      return new Date(item.dueDate).getTime() < Date.now();
    });

    return {
      total: assignedWork.length,
      open: open.length,
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

      return matchesLocation && matchesOwner && matchesStatus && matchesType;
    });

    return filtered.sort((a, b) => {
      const priorityDelta =
        getPriorityRank(a.priority) - getPriorityRank(b.priority);

      if (priorityDelta !== 0) return priorityDelta;

      const aDue =
        a.dueDate && a.dueDate !== "No due date"
          ? new Date(a.dueDate).getTime()
          : Number.MAX_SAFE_INTEGER;

      const bDue =
        b.dueDate && b.dueDate !== "No due date"
          ? new Date(b.dueDate).getTime()
          : Number.MAX_SAFE_INTEGER;

      return aDue - bDue;
    });
  }, [assignedWork, filterLocation, filterOwner, filterStatus, filterType]);

  const ownerOptions = useMemo(() => {
    return Array.from(new Set(assignedWork.map((item) => item.owner).filter(Boolean)));
  }, [assignedWork]);

  const locationOptions = useMemo(() => {
    return Array.from(new Set(assignedWork.map((item) => item.location).filter(Boolean)));
  }, [assignedWork]);

  function persistAssignedWork(next: AssignedWork[]) {
    setAssignedWork(next);

    if (typeof window !== "undefined") {
      const manualOnly = next.filter(
        (item) => !String(item.id || "").startsWith("action-"),
      );

      window.localStorage.setItem(
        "sentinel_company_assigned_work",
        JSON.stringify(manualOnly),
      );
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

  function addAssignedWork() {
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

    persistAssignedWork([assignment, ...assignedWork]);
    setAssignmentTitle("");
    setAssignmentLocation("");
    setAssignmentDueDate("");
    setAssignmentPriority("Medium");
    setStatus(`${assignment.type} assigned.`);
  }

  function updateAssignmentStatus(id: string, nextStatus: string) {
    persistAssignedWork(
      assignedWork.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item,
      ),
    );
    setStatus(`Assignment marked ${nextStatus.toLowerCase()}.`);
  }

  function removeAssignment(id: string) {
    persistAssignedWork(assignedWork.filter((item) => item.id !== id));
    setStatus("Assignment removed.");
  }

  function clearFilters() {
    setFilterLocation("");
    setFilterOwner("");
    setFilterStatus("");
    setFilterType("");
  }

  function previewPlan(nextPlan: PlanCode) {
    setPlanCode(nextPlan);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "sentinel_auth_user",
        JSON.stringify({ planCode: nextPlan, type: nextPlan }),
      );
    }
  }

  if (!companyAccess) {
    return (
      <section className="space-y-5">
        <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-center text-white shadow-sm sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
            Company Control Center
          </p>
          <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
            Account leadership workspace.
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
            Manage users, seats, roles, assignments, inspections, follow-ups,
            corrective work, and company-wide accountability.
          </p>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Company Plan Required
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Unlock team operations.
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Basic and Pro users still keep access to Workspace Settings for
            locations, security, report defaults, risk matrix, and regulatory
            defaults. The Company Control Center adds account leadership tools:
            users, roles, seats, assigned inspections, corrective actions,
            follow-ups, reviews, and company data filters.
          </p>

          <div className="mt-4 grid gap-3 text-left md:grid-cols-3">
            {[
              [
                "Users & Roles",
                "Add employees and assign Owner, Manager, Auditor, or Viewer access.",
              ],
              [
                "Assigned Work",
                "Assign inspections, corrective actions, follow-ups, and reviews.",
              ],
              [
                "Company Visibility",
                "Filter work by owner, type, status, facility, and due date.",
              ],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
              >
                <p className="text-sm font-black text-slate-900">{title}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  {body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              href="/pricing"
              className="rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#EA580C]"
            >
              Upgrade to Company
            </Link>

            <Link
              href="/settings/workspace"
              className="rounded-xl border border-[#1D72B8] bg-white px-4 py-2.5 text-sm font-black text-[#102A43] transition hover:bg-[#E8F4FF]"
            >
              Workspace Settings
            </Link>

            <button
              type="button"
              onClick={() => previewPlan("company")}
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
            >
              Preview Company
            </button>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-center text-white shadow-sm sm:p-6">
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
            Company Control Center
          </p>
          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
            Lead the safety operation.
          </h1>
          <p className="max-w-2xl text-sm font-semibold leading-6 text-slate-300">
            Add users, assign roles, manage seats, assign inspections, assign
            follow-ups, assign corrective actions, and monitor company work.
          </p>

          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white">
            Company Plan
          </span>
        </div>

        <div className="mx-auto mt-4 grid max-w-3xl grid-cols-4 justify-center gap-1.5 sm:gap-2">
          {[
            [`${usedSeats}/${companySeats}`, "Seats"],
            [String(workSummary.open), "Open Work"],
            [String(workSummary.overdue), "Overdue"],
            [String(workSummary.inspections), "Inspections"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-2 py-2 text-center"
            >
              <p className="text-lg font-black tracking-tight text-white sm:text-xl">
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
        <section className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                Users & Roles
              </p>
              <h2 className="mt-0.5 text-base font-black text-slate-900">
                Team access
              </h2>
            </div>

            <button
              type="button"
              className="rounded-lg bg-[#F97316] px-3 py-1.5 text-[10px] font-black text-black transition hover:bg-[#EA580C]"
            >
              Add Seats
            </button>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_130px_auto]">
            <input
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="employee@example.com"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1D72B8]"
            />

            <select
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1D72B8]"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={sendInvite}
              className="rounded-lg bg-[#102A43] px-3 py-2 text-xs font-black !text-white transition hover:bg-[#1D72B8]"
            >
              Add User
            </button>
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
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-slate-900">
                    {member.name || "User"}
                  </p>
                  <p className="truncate text-[11px] font-semibold text-slate-500">
                    {member.email}
                  </p>
                </div>

                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                  {member.role}
                </span>
              </div>
            ))}
          </div>

          {!!invites.length && (
            <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50">
              <summary className="cursor-pointer px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                Pending Invites
              </summary>
              <div className="border-t border-slate-200 px-2.5 py-2">
                {invites.map((invite) => (
                  <div key={invite.id} className="py-1">
                    <p className="text-xs font-black text-slate-900">
                      {invite.email}
                    </p>
                    <p className="break-all text-[11px] font-semibold text-slate-500">
                      {invite.role} • Token: {invite.token}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
          <div className="border-b border-slate-200 pb-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Assignment Center
            </p>
            <h2 className="mt-0.5 text-base font-black text-slate-900">
              Assign operational safety work
            </h2>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <select
              value={assignmentType}
              onChange={(event) => setAssignmentType(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1D72B8]"
            >
              {assignmentTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <select
              value={assignmentOwner}
              onChange={(event) => setAssignmentOwner(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1D72B8]"
            >
              <option value="">Assign to...</option>
              {members.map((member) => (
                <option key={member.id} value={member.name || member.email}>
                  {member.name || member.email}
                </option>
              ))}
            </select>

            <select
              value={assignmentPriority}
              onChange={(event) => setAssignmentPriority(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1D72B8]"
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority} Priority
                </option>
              ))}
            </select>

            <select
              value={assignmentLocation}
              onChange={(event) => setAssignmentLocation(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1D72B8]"
            >
              <option value="">Location / Site...</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.name}>
                  {facility.name}
                  {facility.siteType ? ` — ${facility.siteType}` : ""}
                </option>
              ))}
            </select>

            <input
              value={assignmentTitle}
              onChange={(event) => setAssignmentTitle(event.target.value)}
              placeholder="Assignment title"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1D72B8] md:col-span-2"
            />

            <input
              type="date"
              value={assignmentDueDate}
              onChange={(event) => setAssignmentDueDate(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1D72B8]"
            />

            <button
              type="button"
              onClick={addAssignedWork}
              className="rounded-lg bg-[#F97316] px-3 py-2 text-xs font-black text-black transition hover:bg-[#EA580C]"
            >
              Assign Work
            </button>
          </div>
        </section>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Assigned Work Queue
            </p>
            <h2 className="mt-0.5 text-base font-black text-slate-900">
              Open company safety work
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filterLocation}
              onChange={(event) => setFilterLocation(event.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-[11px] font-bold text-slate-700 outline-none"
            >
              <option value="">Location: All</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={filterOwner}
              onChange={(event) => setFilterOwner(event.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-[11px] font-bold text-slate-700 outline-none"
            >
              <option value="">Owner: All</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-[11px] font-bold text-slate-700 outline-none"
            >
              <option value="">Status: All</option>
              {["Open", "In Progress", "Blocked", "Completed"].map((itemStatus) => (
                <option key={itemStatus} value={itemStatus}>
                  {itemStatus}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-[11px] font-bold text-slate-700 outline-none"
            >
              <option value="">Type: All</option>
              {assignmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-black text-slate-700 transition hover:bg-slate-100"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          {filteredAssignedWork.length ? (
            filteredAssignedWork.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                      {item.type} • {item.owner} • {item.location || "Unassigned location"} • Due: {item.dueDate}
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
                        <button
                          type="button"
                          onClick={() => updateAssignmentStatus(item.id, "In Progress")}
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[10px] font-black text-slate-700"
                        >
                          Start
                        </button>

                        <button
                          type="button"
                          onClick={() => updateAssignmentStatus(item.id, "Blocked")}
                          className="rounded-lg border border-red-200 bg-white px-2 py-1 text-[10px] font-black text-red-700"
                        >
                          Block
                        </button>

                        <button
                          type="button"
                          onClick={() => updateAssignmentStatus(item.id, "Completed")}
                          className="rounded-lg bg-[#102A43] px-2 py-1 text-[10px] font-black text-white"
                        >
                          Complete
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => removeAssignment(item.id)}
                      className="rounded-lg border border-red-200 bg-white px-2 py-1 text-[10px] font-black text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
              {assignedWork.length
                ? "No assigned work matches the current filters."
                : "No assigned company work yet. Assigned inspections, follow-ups, corrective actions, and reviews will appear here."}
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          ["Workspace Settings", "/settings/workspace"],
          ["Inspections", "/inspections"],
          ["Actions", "/actions"],
          ["Insights", "/analytics"],
        ].map(([label, href]) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center text-xs font-black text-[#102A43] shadow-sm transition hover:bg-[#E8F4FF]"
          >
            {label}
          </Link>
        ))}
      </section>

      {status && (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
          {status}
        </p>
      )}
    </section>
  );
}
