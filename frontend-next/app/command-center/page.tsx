"use client";

type CommandAssignment = {
  id: string;
  title: string;
  type: string;
  owner: string;
  dueDate: string;
  priority: string;
  status: string;
  createdAt: string;
};

const assignmentTypes = [
  "Corrective Action",
  "Inspection",
  "Follow-Up",
  "Review Task",
];

const assignmentPriorities = ["Low", "Medium", "High", "Critical"];

function loadCommandAssignments(): CommandAssignment[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem("sentinel_command_center_assignments");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCommandAssignments(assignments: CommandAssignment[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    "sentinel_command_center_assignments",
    JSON.stringify(assignments),
  );
}


import { useEffect, useMemo, useState } from "react";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import { getReports } from "@/lib/reportStorage";
import { getStoredActions, type StoredAction } from "@/lib/actionStorage";
import { getActivityEvents, saveActivityEvents, type ActivityEvent } from "@/lib/activityStorage";
import { getStoredPlanCode } from "@/lib/planEntitlements";
import {
  getSafetyCalendarEvents,
  getTodayDateKey,
  parseLocalCalendarDate,
  toDateKey,
} from "@/lib/safetyCalendar";
import type { SafetyCalendarEvent } from "@/types/safetyCalendar";
import { getAuthUser } from "@/lib/auth";

type DashboardReport = {
  id?: string;
  title?: string;
  createdAt?: string;
  location?: string;
  siteLocation?: string;
  findings?: any[];
};

function getRiskScore(finding: any) {
  return Number(
    finding.riskScore ||
      finding.safeScopeResult?.risk?.riskScore ||
      finding.safeScopeResult?.risk?.operationalRisk?.matrixScore ||
      0,
  );
}

function getRiskBand(finding: any) {
  return String(
    finding.safeScopeResult?.risk?.riskBand ||
      finding.safeScopeResult?.risk?.operationalRisk?.matrixBand ||
      "",
  ).toLowerCase();
}


function isActionOverdue(action: StoredAction) {
  if (String(action.status || "").toLowerCase() === "completed") return false;
  if (!action.due) return false;

  const dueDate = new Date(action.due);
  if (Number.isNaN(dueDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate.getTime() < today.getTime();
}

function getActionPriorityRank(priority?: string) {
  if (String(priority || "").toLowerCase() === "critical") return 0;
  if (String(priority || "").toLowerCase() === "high") return 1;
  if (String(priority || "").toLowerCase() === "medium") return 2;
  if (String(priority || "").toLowerCase() === "low") return 3;
  return 4;
}

function getActionStatusClass(action: StoredAction) {
  if (String(action.status || "").toLowerCase() === "completed") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (String(action.status || "").toLowerCase() === "blocked") {
    return "bg-red-50 text-red-700";
  }

  if (isActionOverdue(action)) {
    return "bg-red-50 text-red-700";
  }

  if (String(action.status || "").toLowerCase() === "in progress") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-orange-50 text-orange-700";
}

function formatDate(value?: string) {
  if (!value) return "Saved";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved";
  return date.toLocaleDateString();
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfSundayWeek(date: Date) {
  const next = new Date(date);
  next.setDate(next.getDate() - next.getDay());
  next.setHours(0, 0, 0, 0);
  return next;
}

function getWeekDayTone(dateKey: string, events: SafetyCalendarEvent[]) {
  const todayKey = getTodayDateKey();
  const soonKey = toDateKey(addDays(parseLocalCalendarDate(todayKey) || new Date(), 3));

  const hasOverdue = events.some(
    (event) => event.status === "Overdue" || event.date < todayKey,
  );

  if (hasOverdue) {
    return "border-red-400 bg-red-50 ring-2 ring-red-100";
  }

  const hasDueSoon = events.some(
    (event) =>
      event.status !== "Completed" &&
      event.date >= todayKey &&
      event.date <= soonKey,
  );

  if (hasDueSoon) {
    return "border-amber-400 bg-amber-50 ring-2 ring-amber-100";
  }

  if (dateKey === todayKey) {
    return "border-[#1D72B8] bg-[#E8F4FF]";
  }

  return "border-slate-200/80 bg-white";
}

function getWeekBadgeTone(events: SafetyCalendarEvent[]) {
  const todayKey = getTodayDateKey();

  const hasOverdue = events.some(
    (event) => event.status === "Overdue" || event.date < todayKey,
  );

  if (hasOverdue) return "bg-red-600 text-white";

  const hasCriticalHigh = events.some(
    (event) => event.priority === "Critical" || event.priority === "High",
  );

  if (hasCriticalHigh) return "bg-amber-500 text-white";

  return "bg-[#1D72B8] text-white";
}

function getCalendarEventTone(event: SafetyCalendarEvent) {
  if (event.status === "Completed") return "border-emerald-100 bg-emerald-50 text-emerald-800";
  if (event.status === "Overdue" || event.priority === "Critical") return "border-red-100 bg-red-50 text-red-800";
  if (event.priority === "High") return "border-orange-100 bg-orange-50 text-orange-800";
  if (event.type === "inspection") return "border-blue-100 bg-blue-50 text-blue-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function getCalendarEventTypeLabel(type: SafetyCalendarEvent["type"]) {
  if (type === "corrective_action") return "Action";
  if (type === "follow_up") return "Follow-up";
  if (type === "report_review") return "Report Review";
  if (type === "supervisor_review") return "Review";
  if (type === "inspection") return "Inspection";
  return "Task";
}

function formatCalendarDateLabel(dateKey: string) {
  const date = parseLocalCalendarDate(dateKey);
  if (!date) return "No date";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatCalendarMonthLabel(dateKey: string) {
  const date = parseLocalCalendarDate(dateKey);
  if (!date) return "Calendar";

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function uniqueCalendarEvents(events: SafetyCalendarEvent[]) {
  return Array.from(new Map(events.map((event) => [event.id, event])).values());
}


function getStoredCommandUser() {
  if (typeof window === "undefined") return {};
  try {
    return getAuthUser();
  } catch {
    return {};
  }
}

function isCompanyAccountOwner(planCode: string, user: any) {
  const normalizedPlan = String(
    user?.organizationPlanCode ||
      user?.effectivePlanCode ||
      user?.planCode ||
      user?.type ||
      planCode ||
      "",
  ).toLowerCase();

  const normalizedRole = String(
    user?.role ||
      user?.accountRole ||
      user?.organizationRole ||
      "",
  ).toLowerCase();

  const companyPlan =
    normalizedPlan === "company" ||
    normalizedPlan === "team" ||
    normalizedPlan === "enterprise";

  const ownerRole =
    normalizedRole === "owner" ||
    normalizedRole === "org_owner" ||
    normalizedRole === "account_owner" ||
    normalizedRole === "admin" ||
    normalizedRole === "super_admin";

  return companyPlan && ownerRole;
}

export default function DashboardPage() {

  const [assignments, setAssignments] = useState<CommandAssignment[]>([]);
  const [canAssignWork, setCanAssignWork] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentOwner, setAssignmentOwner] = useState("");
  const [assignmentType, setAssignmentType] = useState("Corrective Action");
  const [assignmentPriority, setAssignmentPriority] = useState("Medium");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState("");

  useEffect(() => {
    const storedUser = getStoredCommandUser();
    const storedPlan =
      window.localStorage.getItem("sentinel_plan_code") ||
      window.localStorage.getItem("sentinel_effective_plan_code") ||
      "";

    setCanAssignWork(isCompanyAccountOwner(storedPlan, storedUser));
    setAssignments(loadCommandAssignments());
  }, []);

  function addCommandAssignment() {
    if (!canAssignWork) {
      setAssignmentStatus("Assign Work is available only to Company account owners.");
      return;
    }

    if (!assignmentTitle.trim()) {
      setAssignmentStatus("Enter a work title before assigning.");
      return;
    }

    const assignment: CommandAssignment = {
      id: "assignment-" + Date.now(),
      title: assignmentTitle.trim(),
      type: assignmentType,
      owner: assignmentOwner.trim() || "Unassigned",
      dueDate: assignmentDueDate || "No due date",
      priority: assignmentPriority,
      status: "Open",
      createdAt: new Date().toISOString(),
    };

    const next = [assignment, ...assignments];
    setAssignments(next);
    saveCommandAssignments(next);

    setAssignmentTitle("");
    setAssignmentOwner("");
    setAssignmentDueDate("");
    setAssignmentPriority("Medium");
    setAssignmentType("Corrective Action");
    setAssignmentStatus("Work assigned.");
  }

  function closeCommandAssignment(id: string) {
    const next = assignments.map((assignment) =>
      assignment.id === id ? { ...assignment, status: "Closed" } : assignment,
    );
    setAssignments(next);
    saveCommandAssignments(next);
  }


  const [reports, setReports] = useState<DashboardReport[]>([]);
  const [storedActions, setStoredActions] = useState<StoredAction[]>([]);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<SafetyCalendarEvent[]>([]);
  const [selectedWeekDateKey, setSelectedWeekDateKey] = useState(getTodayDateKey());
  const [planCode, setPlanCode] = useState("basic");

  useEffect(() => {
    async function loadDashboardReports() {
      const savedReports = await getReports<DashboardReport>();
      const savedActions = await getStoredActions();
      const savedActivity = await getActivityEvents();
      const savedCalendarEvents = await getSafetyCalendarEvents();

      setPlanCode(getStoredPlanCode());
      setReports(Array.isArray(savedReports) ? savedReports : []);
      setStoredActions(Array.isArray(savedActions) ? savedActions : []);
      setActivityEvents(Array.isArray(savedActivity) ? savedActivity : []);
      setCalendarEvents(Array.isArray(savedCalendarEvents) ? savedCalendarEvents : []);
    }

    loadDashboardReports();
  }, []);

  const dashboard = useMemo(() => {
    const findings = reports.flatMap((report) =>
      (report.findings || []).map((finding: any) => ({
        ...finding,
        reportTitle: report.title || "Inspection Report",
        reportDate: report.createdAt,
        reportLocation: report.location || report.siteLocation,
      })),
    );

    const openActions = storedActions.filter(
      (action) => String(action.status || "").toLowerCase() !== "completed",
    );

    const overdueActions = openActions.filter(isActionOverdue);

    const blockedActions = openActions.filter(
      (action) => String(action.status || "").toLowerCase() === "blocked",
    );

    const inProgressActions = openActions.filter(
      (action) => String(action.status || "").toLowerCase() === "in progress",
    );

    const criticalFindings = findings.filter((finding) => {
      const riskScore = getRiskScore(finding);
      const riskBand = getRiskBand(finding);
      return riskScore >= 20 || riskBand.includes("critical");
    });

    const highPriorityActions = [...openActions]
      .sort((a, b) => {
        const overdueDelta =
          (isActionOverdue(b) ? 1 : 0) - (isActionOverdue(a) ? 1 : 0);

        if (overdueDelta !== 0) return overdueDelta;

        const priorityDelta =
          getActionPriorityRank(a.priority) - getActionPriorityRank(b.priority);

        if (priorityDelta !== 0) return priorityDelta;

        const aDue = a.due ? new Date(a.due).getTime() : Number.MAX_SAFE_INTEGER;
        const bDue = b.due ? new Date(b.due).getTime() : Number.MAX_SAFE_INTEGER;

        return aDue - bDue;
      })
      .slice(0, 5);

    const latestReports = [...reports]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 3);

    const recentActivity = activityEvents.slice(0, 3);

    const safeScopeReviewed = findings.filter((finding) =>
      Boolean(finding.safeScopeResult),
    ).length;

    return {
      reportCount: reports.length,
      findingCount: findings.length,
      openActions: openActions.length,
      overdueActions: overdueActions.length,
      blockedActions: blockedActions.length,
      inProgressActions: inProgressActions.length,
      criticalFindings: criticalFindings.length,
      safeScopeReviewed,
      highPriorityActions,
      latestReports,
      recentActivity,
    };
  }, [activityEvents, reports, storedActions]);

  const attentionItems = [
    dashboard.criticalFindings
      ? `${dashboard.criticalFindings} critical finding(s) need review`
      : null,
    dashboard.overdueActions
      ? `${dashboard.overdueActions} overdue corrective action(s)`
      : null,
    dashboard.openActions
      ? `${dashboard.openActions} open corrective action(s)`
      : null,
  ].filter(Boolean);

  const weekAtGlance = useMemo(() => {
    const today = parseLocalCalendarDate(getTodayDateKey()) || new Date();
    const weekStart = startOfSundayWeek(today);

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const dateKey = toDateKey(date);
      const eventsForDay = calendarEvents.filter(
        (event) => event.date === dateKey && event.status !== "Completed",
      );

      return {
        date,
        dateKey,
        events: eventsForDay,
      };
    });
  }, [calendarEvents]);

  const selectedDayTasks = useMemo(() => {
    return calendarEvents.filter(
      (event) =>
        event.date === selectedWeekDateKey &&
        event.status !== "Completed",
    );
  }, [calendarEvents, selectedWeekDateKey]);

  const upcomingTasks = useMemo(() => {
    const todayKey = getTodayDateKey();

    return uniqueCalendarEvents(
      calendarEvents.filter(
        (event) =>
          event.status !== "Completed" &&
          event.date >= todayKey &&
          event.date !== selectedWeekDateKey,
      ),
    ).slice(0, 5);
  }, [calendarEvents, selectedWeekDateKey]);

  async function dismissActivityEvent(activityId: string) {
    const next = activityEvents.filter((activity) => activity.id !== activityId);
    setActivityEvents(next);
    await saveActivityEvents(next);
  }

  return (
    <section className="sentinel-mobile-page space-y-4 sm:space-y-4">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,#0B1320_0%,#102A43_52%,#0B1320_100%)] text-white shadow-none ">
        <div className="relative isolate px-5 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-9">
          <div className="pointer-events-none absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-[#1D72B8]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 -z-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div className="text-center lg:text-left">
              <p className="text-center text-xs font-black uppercase tracking-[0.28em] text-blue-200 lg:text-left">
                InSite Home
              </p>

              <h1 className="mx-auto mt-4 max-w-3xl text-center text-3xl font-black leading-tight tracking-[-0.045em] text-white sm:text-4xl lg:mx-0 lg:text-left">
                Home
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-center text-sm font-semibold leading-6 text-slate-200 sm:text-base lg:mx-0 lg:text-left">
                Monitor inspections, findings, corrective actions, scheduled work, and HazLenz AI-supported safety review from one operational home screen.
              </p>


            </div>

            <div className="mx-auto grid w-full max-w-[360px] grid-cols-2 gap-2.5 lg:mx-0 lg:max-w-[390px]">
              {[
                [String(dashboard.reportCount), "Reports", "Inspection packages"],
                [String(dashboard.findingCount), "Findings", "Captured observations"],
                [String(dashboard.openActions), "Open Actions", "Active follow-up work"],
                [String(dashboard.overdueActions), "Overdue", "Needs attention"],
              ].map(([value, label, detail]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/12 bg-white/10 px-3 py-3 text-center shadow-none backdrop-blur"
                >
                  <p className="text-center text-2xl font-black tracking-[-0.06em] text-white sm:text-3xl">
                    {value}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">
                    {label}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-300">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {canAssignWork && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-none   sm:p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="sentinel-eyebrow">Company Command</p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-950">
                Assign Work
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                Assign corrective actions, inspections, follow-ups, and review tasks from the operational home screen.
              </p>
            </div>

            <span className="sentinel-status-pill">
              {assignments.filter((assignment) => assignment.status !== "Closed").length} open
            </span>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_auto]">
            <label>
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Work Title
              </span>
              <input
                value={assignmentTitle}
                onChange={(event) => setAssignmentTitle(event.target.value)}
                placeholder="Example: Verify guard installed on tail pulley"
                className="sentinel-input mt-2 min-h-[44px] text-sm font-bold"
              />
            </label>

            <label>
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Owner
              </span>
              <input
                value={assignmentOwner}
                onChange={(event) => setAssignmentOwner(event.target.value)}
                placeholder="Name or role"
                className="sentinel-input mt-2 min-h-[44px] text-sm font-bold"
              />
            </label>

            <label>
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Type
              </span>
              <select
                value={assignmentType}
                onChange={(event) => setAssignmentType(event.target.value)}
                className="sentinel-input mt-2 min-h-[44px] text-sm font-bold"
              >
                {assignmentTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Priority
              </span>
              <select
                value={assignmentPriority}
                onChange={(event) => setAssignmentPriority(event.target.value)}
                className="sentinel-input mt-2 min-h-[44px] text-sm font-bold"
              >
                {assignmentPriorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Due
              </span>
              <input
                type="date"
                value={assignmentDueDate}
                onChange={(event) => setAssignmentDueDate(event.target.value)}
                className="sentinel-input mt-2 min-h-[44px] text-sm font-bold"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-black text-slate-500">
              {assignmentStatus}
            </p>

            <button
              type="button"
              onClick={addCommandAssignment}
              className="sentinel-primary-button px-5 py-2.5 text-sm"
            >
              Assign Work
            </button>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
            {assignments.length ? (
              <div className="space-y-2">
                {assignments.slice(0, 5).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 shadow-none sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-black text-slate-950">
                        {assignment.title}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {assignment.type} · {assignment.owner} · {assignment.priority} priority · Due {assignment.dueDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="sentinel-status-pill bg-white">
                        {assignment.status}
                      </span>

                      {assignment.status !== "Closed" && (
                        <button
                          type="button"
                          onClick={() => closeCommandAssignment(assignment.id)}
                          className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
                No work has been assigned from Home yet.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-none   sm:p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <SectionHeader
            eyebrow="Week at a Glance"
            title="Upcoming safety work"
            description="A seven-day operational snapshot of scheduled inspections, corrective actions, follow-ups, and reviews."
          />

          <AppLinkButton
            href="/safety-calendar"
            size="sm"
            className="!inline-flex !w-fit shrink-0 self-start rounded-full bg-[#102A43] px-4 py-2 text-[11px] font-black !text-white shadow-none ring-1 ring-slate-900/10 transition hover:bg-[#1D72B8]"
          >
            Open Calendar
          </AppLinkButton>
        </div>

        <div className="mt-4 rounded-full border border-white/10 bg-[#0B1320] px-4 py-2 text-center text-xs font-black uppercase tracking-wide text-white shadow-none ring-1 ring-slate-900/10">
          {formatCalendarMonthLabel(weekAtGlance[0]?.dateKey || getTodayDateKey())}
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekAtGlance.map(({ date, dateKey, events }) => (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedWeekDateKey(dateKey)}
              className={`relative aspect-square min-h-0 rounded-xl border p-1.5 text-left shadow-none transition hover:-translate-y-0.5 hover:border-[#1D72B8] sm:p-2 ${
                selectedWeekDateKey === dateKey
                  ? "ring-2 ring-[#1D72B8]"
                  : ""
              } ${getWeekDayTone(
                dateKey,
                events,
              )}`}
            >
              <span className="absolute left-1.5 top-1.5 block text-[9px] font-black uppercase leading-none tracking-wide text-slate-500 sm:left-2 sm:top-2 sm:text-[10px]">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>

              <span className="absolute right-1.5 top-1.5 block text-[9px] font-black uppercase leading-none tracking-wide text-slate-900 sm:right-2 sm:top-2 sm:text-[10px]">
                {date.getDate()}
              </span>

              {events.length > 0 && (
                <span
                  className={`absolute bottom-1.5 left-1/2 flex h-6 min-w-8 -translate-x-1/2 items-center justify-center rounded-full px-2 text-[11px] font-black leading-none shadow-none sm:bottom-2 sm:h-7 sm:min-w-9 sm:text-xs ${getWeekBadgeTone(
                    events,
                  )}`}
                  title={`${events.length} scheduled item${events.length === 1 ? "" : "s"}`}
                >
                  {events.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-none   sm:p-4 sm:p-6">
        <SectionHeader
          eyebrow="Scheduled Work"
          title="Tasks and upcoming work"
          description="Selected-day safety work and the next scheduled items from the calendar."
        />

        <div className="mt-5 grid gap-4 sm:p-6 lg:grid-cols-2 lg:divide-x lg:divide-slate-200">
          <div className="lg:pr-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
                  Selected Day
                </p>
                <h3 className="mt-1 text-lg font-black tracking-[-0.035em] text-slate-950">
                  {formatCalendarDateLabel(selectedWeekDateKey)}
                </h3>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {selectedDayTasks.length ? (
                selectedDayTasks.map((event) => (
                  <AppLinkButton
                    key={event.id}
                    href="/safety-calendar"
                    variant="ghost"
                    className={`block w-full rounded-xl border px-4 py-3 text-left shadow-none transition hover:-translate-y-0.5 ${getCalendarEventTone(
                      event,
                    )}`}
                  >
                    <span className="block min-w-0">
                      <span className="block text-sm font-black leading-5">
                        {event.title}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-semibold leading-5">
                        <span>{getCalendarEventTypeLabel(event.type)} · {event.owner}</span>
                        <span className="rounded-full bg-white/75 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide">
                          {event.status}
                        </span>
                      </span>
                    </span>
                  </AppLinkButton>
                ))
              ) : (
                <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
                  No safety work is scheduled for this day.
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 lg:border-t-0 lg:pl-6 lg:pt-0">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
                Upcoming
              </p>
              <h3 className="mt-1 text-lg font-black tracking-[-0.035em] text-slate-950">
                Next scheduled tasks
              </h3>
            </div>

            <div className="mt-4 space-y-2">
              {upcomingTasks.length ? (
                upcomingTasks.map((event) => (
                  <AppLinkButton
                    key={event.id}
                    href="/safety-calendar"
                    variant="ghost"
                    className={`relative block w-full rounded-xl border px-4 pb-3 pt-9 text-left shadow-none transition hover:-translate-y-0.5 ${getCalendarEventTone(
                      event,
                    )}`}
                  >
                    <span className="absolute left-4 top-2 text-[10px] font-black uppercase tracking-wide">
                      {parseLocalCalendarDate(event.date)?.toLocaleDateString("en-US", {
                        weekday: "short",
                      })}{" "}
                      {parseLocalCalendarDate(event.date)?.getDate()}
                    </span>

                    <span className="block min-w-0">
                      <span className="block text-sm font-black leading-5">
                        {event.title}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-semibold leading-5">
                        <span>{getCalendarEventTypeLabel(event.type)} · {event.owner}</span>
                        <span className="rounded-full bg-white/75 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide">
                          {event.status}
                        </span>
                      </span>
                    </span>
                  </AppLinkButton>
                ))
              ) : (
                <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
                  No upcoming safety work is scheduled.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-none   sm:p-4 sm:p-6">
        <SectionHeader
          eyebrow="Operational Focus"
          title="Today’s priority and recent activity"
          description="Current attention signals and the latest workspace movement."
        />

        <div className="mt-5 grid gap-4 sm:p-6 lg:grid-cols-[0.85fr_1.15fr] lg:divide-x lg:divide-slate-200">
          <div className="lg:pr-6">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
              Needs Attention
            </p>
            <h3 className="mt-1 text-lg font-black tracking-[-0.035em] text-slate-950">
              Today’s priority
            </h3>

            {attentionItems.length ? (
              <div className="mt-4 space-y-2">
                {attentionItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-black text-orange-800 shadow-none"
                  >
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm font-medium leading-6 text-slate-400">
                No urgent signals in the current local workspace.
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 border-t border-slate-200 pt-5">
              {[
                [String(dashboard.criticalFindings), "Critical Findings", "border-red-100 bg-red-50/80 text-red-700"],
                [String(dashboard.safeScopeReviewed), "HazLenz AI Reviewed", "border-blue-100 bg-blue-50/80 text-[#102A43]"],
              ].map(([value, label, tone]) => (
                <div
                  key={label}
                  className={`rounded-xl border px-4 py-3 text-center shadow-none ${tone}`}
                >
                  <p className="text-2xl font-black tracking-[-0.06em]">{value}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] opacity-75">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 lg:border-t-0 lg:pl-6 lg:pt-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
              Activity
            </p>
            <h3 className="mt-1 text-lg font-black tracking-[-0.035em] text-slate-950">
              Recent activity
            </h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              A simplified timeline of the latest workspace movement.
            </p>

            <div className="mt-4">
              {dashboard.recentActivity.length ? (
                <div className="divide-y divide-slate-200">
                  {dashboard.recentActivity.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex gap-3 py-3"
                    >
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#E8F4FF] text-[10px] font-black uppercase text-[#1D72B8] ring-1 ring-blue-100">
                        {index + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black leading-5 text-slate-950">
                            {activity.title}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-500">
                            {activity.type}
                          </span>
                        </div>

                        {activity.detail && (
                          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                            {activity.detail}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => dismissActivityEvent(activity.id)}
                        aria-label={`Delete activity: ${activity.title}`}
                        className="shrink-0 self-start rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-400 transition hover:bg-red-50 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
                  No recent activity recorded.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-none   sm:p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeader
            eyebrow="Priorities"
            title="High priority actions"
            description="Critical and high priority tasks needing immediate attention."
          />

          <AppLinkButton
            href="/actions"
            size="sm"
            className="!inline-flex !w-fit shrink-0 self-start rounded-full bg-[#102A43] px-4 py-2 text-[11px] font-black !text-white shadow-none ring-1 ring-slate-900/10 transition hover:bg-[#1D72B8]"
          >
            Open Actions
          </AppLinkButton>
        </div>

        <div className="mt-4 space-y-2">
          {dashboard.highPriorityActions.length ? (
            dashboard.highPriorityActions.map((action) => (
              <AppLinkButton
                key={action.id}
                href="/actions"
                variant="ghost"
                className="block w-full rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-left shadow-none transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <span className="block min-w-0">
                  <span className="block text-sm font-black leading-5 text-slate-900">
                    {action.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-semibold leading-5 text-slate-500">
                    <span>Priority: <span className="font-black text-orange-600">{action.priority}</span></span>
                    <span>·</span>
                    <span>Status: <span className="font-black text-blue-600">{action.status}</span></span>
                  </span>
                </span>
              </AppLinkButton>
            ))
          ) : (
            <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
              No high-priority actions found.
            </p>
          )}
        </div>
      </section>
    </section>
  );
}
