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


import { useEffect, useMemo, useState } from "react";
import { StatsGrid } from "@/components/command-center/StatsGrid";
import { WeekAtAGlancePanel } from "@/components/command-center/WeekAtAGlancePanel";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import { getReports } from "@/lib/reportStorage";
import { getStoredActions, type StoredAction } from "@/lib/actionStorage";
import { getActivityEvents, saveActivityEvents, type ActivityEvent } from "@/lib/activityStorage";
import { getStoredPlanCode, getVerifiedPlanCode } from "@/lib/planEntitlements";
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
  const rawScore =
    finding.riskScore ??
    finding.safeScopeResult?.risk?.riskScore ??
    finding.safeScopeResult?.risk?.operationalRisk?.matrixScore;

  const score = Number(rawScore);
  return Number.isFinite(score) ? score : null;
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

  useEffect(() => {
    const storedUser = getStoredCommandUser();
    const storedPlan =
      window.localStorage.getItem("sentinel_plan_code") ||
      window.localStorage.getItem("sentinel_effective_plan_code") ||
      "";

  }, []);


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
      getVerifiedPlanCode().then(setPlanCode).catch(() => {});
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
      return (riskScore !== null && riskScore >= 20) || riskBand.includes("critical");
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
                <span className="text-[#5DB7FF]">Safety InSite Home</span>
              </p>

              <h1 className="mx-auto mt-4 max-w-3xl text-center text-3xl font-black leading-tight tracking-[-0.045em] text-white sm:text-4xl lg:mx-0 lg:text-left">
                Home
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-center text-sm font-semibold leading-6 text-slate-200 sm:text-base lg:mx-0 lg:text-left">
                Start inspections, review due work, track corrective actions, and keep your safety follow-up organized from one simple home screen.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
                <AppLinkButton
                  href="/inspection"
                  className="!inline-flex !w-[172px] shrink-0 justify-center rounded-full bg-[#1D72B8] px-5 py-3 text-sm font-black !text-white shadow-none transition hover:bg-[#5DB7FF] hover:!text-[#0B1320]"
                >
                  Start Inspection
                </AppLinkButton>
                <AppLinkButton
                  href="/reports"
                  variant="accent"
                  className="!inline-flex !w-[172px] shrink-0 justify-center rounded-full !bg-orange-500 px-5 py-3 text-sm font-black !text-white shadow-none transition hover:!bg-orange-600"
                >
                  View Reports
                </AppLinkButton>
              </div>
            </div>

            <StatsGrid dashboard={dashboard} />
          </div>
        </div>
      </div>

      <WeekAtAGlancePanel
        weekAtGlance={weekAtGlance}
        selectedWeekDateKey={selectedWeekDateKey}
        setSelectedWeekDateKey={setSelectedWeekDateKey}
        getWeekDayTone={getWeekDayTone}
        getWeekBadgeTone={getWeekBadgeTone}
        formatCalendarMonthLabel={formatCalendarMonthLabel}
      />



    </section>
  );
}
