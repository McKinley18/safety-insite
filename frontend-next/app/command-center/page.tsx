"use client";



import { useCallback, useEffect, useMemo, useState } from "react";
import { StatsGrid } from "@/components/command-center/StatsGrid";
import { WeekAtAGlancePanel } from "@/components/command-center/WeekAtAGlancePanel";
import { PriorityTodoSection } from "@/components/calendar/PriorityTodoSection";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import { getStoredPlanCode, getVerifiedPlanCode } from "@/lib/planEntitlements";
import {
  getTodayDateKey,
  parseLocalCalendarDate,
  toDateKey,
} from "@/lib/safetyCalendar";
/**
 * §281 (D-041). The counters no longer come from `lib/reportStorage`, `lib/actionStorage` or
 * `lib/activityStorage`. Those three device-local stores were written ONLY by the `/inspection`
 * route that D-038 retired, so every counter on this page read a store the active product never
 * wrote — measured at §281 as `0 REPORTS / 0 FINDINGS / 0 OPEN ACTIONS / 0 OVERDUE` while fully
 * online, against seven inspections and nine observations on the server.
 */
import { loadDashboardCounters, type DashboardCounters } from "@/lib/data/dashboardCounters";
import type { SafetyCalendarEvent } from "@/types/safetyCalendar";
import { getAuthUser } from "@/lib/auth";








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
    return "border-red-400 bg-red-50 ring-2 ring-red-100 dark:border-red-500 dark:bg-red-950/30 dark:ring-red-900/40";
  }

  const hasDueSoon = events.some(
    (event) =>
      event.status !== "Completed" &&
      event.date >= todayKey &&
      event.date <= soonKey,
  );

  if (hasDueSoon) {
    return "border-amber-400 bg-amber-50 ring-2 ring-amber-100 dark:border-amber-500 dark:bg-amber-950/30 dark:ring-amber-900/40";
  }

  if (dateKey === todayKey) {
    return "calendar-light-box calendar-today-box border-[#1D72B8] bg-[#E8F4FF]";
  }

  return "calendar-light-box border-slate-200/80 bg-white";
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


  const [counters, setCounters] = useState<DashboardCounters | null>(null);
  const [selectedWeekDateKey, setSelectedWeekDateKey] = useState(getTodayDateKey());
  const [planCode, setPlanCode] = useState("basic");

  /**
   * Memoised because it feeds the `weekAtGlance` memo below: a fresh `[]` on every render would
   * make that memo recompute every time and defeat its own purpose.
   */
  const calendarEvents = useMemo(() => counters?.calendarEvents ?? [], [counters]);

  const refreshCounters = useCallback(async () => {
    setCounters(await loadDashboardCounters(getTodayDateKey()));
  }, []);

  useEffect(() => {
    // Both reads are asynchronous and set state from their own callbacks. `setPlanCode` used to be
    // called synchronously in this effect body, which React flags as a cascading render -- the
    // stored plan is read inside the promise chain that also fetches the verified one.
    Promise.resolve()
      .then(() => setPlanCode(getStoredPlanCode()))
      .then(() => getVerifiedPlanCode())
      .then(setPlanCode)
      .catch(() => {});
    void refreshCounters();
  }, [refreshCounters]);

  /**
   * §281 (D-041). What stood here computed `criticalFindings`, `hazLenzReviewed`,
   * `highPriorityActions`, `latestReports` and `recentActivity` from the same dead local stores —
   * and NONE of them was rendered anywhere on this page. They were dead derivations of data that
   * was itself never written. Removed with the stores; nothing that reached a screen is lost.
   *
   * The four figures that DO reach a screen are now each a `DataValue`, so a tile that could not
   * be established renders "—" and says why, and can never render a zero the product cannot
   * stand behind.
   */
  const tiles = useMemo(() => {
    if (!counters) return null;
    return [
      // §285 (D-044). The four approved operational KPIs. `Reports` moved off the board for
      // `Findings` -- a report is an OUTPUT of an inspection, and how many of them exist says less
      // about the state of safety work than how many hazards are on the books. `Overdue` carries
      // its noun, because a bare "Overdue" beside three counted nouns does not say overdue WHAT.
      { key: "inspections", label: "Inspections", description: "Records on this account", value: counters.inspections },
      { key: "findings", label: "Findings", description: "Hazards recorded across inspections", value: counters.findings },
      { key: "openActions", label: "Open Actions", description: "Active follow-up work", value: counters.openActions },
      { key: "overdue", label: "Overdue Actions", description: "Past their due date", value: counters.overdue },
    ];
  }, [counters]);

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
                  href="/inspections"
                  className="!inline-flex !w-[172px] shrink-0 justify-center rounded-full bg-[#1D72B8] px-5 py-3 text-sm font-black !text-white shadow-none transition hover:bg-[#5DB7FF] hover:!text-[#0B1320]"
                >
                  Start Inspection
                </AppLinkButton>
                {/* "Start Inspection" is this page's primary action. This was an orange accent
                    button, which both competed with it for primacy and misused the warning colour
                    for a benign navigation link.

                    §280 (D-036.3). This comment already said the button "now uses the same
                    secondary treatment" -- and it did not: the element still carried
                    `variant="accent"` and `app-accent-strong-surface`. The comment described an
                    intention; the markup kept the orange. Both now agree, and the hierarchy really
                    does read primary -> secondary. */}
                <AppLinkButton
                  href="/reports"
                  variant="secondary"
                  className="!inline-flex !w-[172px] shrink-0 justify-center rounded-full px-5 py-3 text-sm font-black shadow-none transition"
                >
                  View Reports
                </AppLinkButton>
              </div>
            </div>

            {/* Until the first read returns there is no state to report, so the grid renders
                nothing rather than four zeros that would be replaced a moment later. A flash of
                "0 OVERDUE" is the same lie as a permanent one, for as long as someone is
                looking at it. */}
            {tiles && <StatsGrid tiles={tiles} />}
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
        onEventsChanged={refreshCounters}
      />

      <PriorityTodoSection events={calendarEvents} onEventsChanged={refreshCounters} />

    </section>
  );
}
