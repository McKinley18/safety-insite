"use client";

import { useEffect, useMemo, useState } from "react";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import { getReports } from "@/lib/reportStorage";
import { getStoredActions, type StoredAction } from "@/lib/actionStorage";
import { getActivityEvents, type ActivityEvent } from "@/lib/activityStorage";
import { getStoredPlanCode } from "@/lib/planEntitlements";
import {
  getSafetyCalendarEvents,
  getTodayDateKey,
  parseLocalCalendarDate,
  toDateKey,
} from "@/lib/safetyCalendar";
import type { SafetyCalendarEvent } from "@/types/safetyCalendar";

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

  return "border-slate-200 bg-white";
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

export default function DashboardPage() {
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

  return (
    <section className="space-y-5">
      <HeroPanel align="center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Sentinel Command Center
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          Safety work snapshot.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          A quick view of inspections, findings, corrective actions, and items
          that need attention.
        </p>

        <div className="mx-auto mt-4 grid max-w-3xl grid-cols-4 justify-center gap-1.5 sm:gap-2">
          {[
            [String(dashboard.reportCount), "Reports"],
            [String(dashboard.findingCount), "Findings"],
            [String(dashboard.openActions), "Open Actions"],
            [String(dashboard.overdueActions), "Overdue"],
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
      </HeroPanel>

      <AppPanel padding="md">
        <div className="flex items-start justify-between gap-3">
          <SectionHeader
            eyebrow="Week at a Glance"
            title="Upcoming safety work"
            description="A quick seven-day snapshot of scheduled inspections, actions, follow-ups, and reviews."
          />

          <AppLinkButton
            href="/safety-calendar"
            size="sm"
            className="!inline-flex !w-fit shrink-0 self-start rounded-lg bg-[#102A43] px-2.5 py-1 text-[10px] !text-white hover:bg-[#1D72B8]"
          >
            Open Calendar
          </AppLinkButton>
        </div>

        <div className="mt-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs font-black uppercase tracking-wide text-slate-700">
          {formatCalendarMonthLabel(weekAtGlance[0]?.dateKey || getTodayDateKey())}
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekAtGlance.map(({ date, dateKey, events }) => (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedWeekDateKey(dateKey)}
              className={`relative aspect-square min-h-0 rounded-xl border p-1.5 text-left shadow-sm transition hover:border-[#1D72B8] sm:p-2 ${
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
                  className={`absolute bottom-1.5 left-1/2 flex h-6 min-w-8 -translate-x-1/2 items-center justify-center rounded-full px-2 text-[11px] font-black leading-none sm:bottom-2 sm:h-7 sm:min-w-9 sm:text-xs ${getWeekBadgeTone(
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
      </AppPanel>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <AppPanel padding="md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <SectionHeader
              eyebrow="Tasks"
              title={formatCalendarDateLabel(selectedWeekDateKey)}
              description="Selected-day safety work from the week snapshot."
            />
          </div>

          <div className="mt-4 space-y-2">
            {selectedDayTasks.length ? (
              selectedDayTasks.map((event) => (
                <AppLinkButton
                  key={event.id}
                  href="/safety-calendar"
                  variant="ghost"
                  className={`block w-full rounded-2xl border px-3 py-3 text-left shadow-sm ${getCalendarEventTone(
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
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
                No safety work is scheduled for this day.
              </p>
            )}
          </div>
        </AppPanel>

        <AppPanel padding="md">
          <SectionHeader
            eyebrow="Upcoming"
            title="Next scheduled tasks"
            description="The next open tasks outside the selected day."
          />

          <div className="mt-4 space-y-2">
            {upcomingTasks.length ? (
              upcomingTasks.map((event) => (
                <AppLinkButton
                  key={event.id}
                  href="/safety-calendar"
                  variant="ghost"
                  className={`relative block w-full rounded-2xl border px-3 pb-3 pt-9 text-left shadow-sm ${getCalendarEventTone(
                    event,
                  )}`}
                >
                  <span className="absolute left-3 top-2 text-[10px] font-black uppercase tracking-wide">
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
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
                No upcoming safety work is scheduled.
              </p>
            )}
          </div>
        </AppPanel>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <AppPanel padding="md">
          <SectionHeader
            eyebrow="Needs Attention"
            title="Today’s priority"
          />

          {attentionItems.length ? (
            <div className="mt-4 space-y-2">
              {attentionItems.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-3 text-sm font-black text-orange-800"
                >
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm font-black text-emerald-700">
              No urgent signals in the current local workspace.
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              [String(dashboard.criticalFindings), "Critical Findings"],
              [String(dashboard.safeScopeReviewed), "SafeScope Reviewed"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 px-3 py-3 text-center"
              >
                <p className="text-xl font-black text-slate-900">{value}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </AppPanel>

     </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <AppPanel padding="md">
          <SectionHeader
            eyebrow="Activity"
            title="Recent safety activity"
            description="The most recent safety audits, actions, and events in this workspace."
          />
          <div className="mt-4 space-y-2">
            {dashboard.recentActivity.length ? (
              dashboard.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-4 shadow-sm"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    {activity.type}
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">
                    {activity.title}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    {activity.detail}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-500 text-center">
                No recent activity recorded.
              </p>
            )}
          </div>
        </AppPanel>

        <AppPanel padding="md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <SectionHeader
              eyebrow="Priorities"
              title="High priority actions"
              description="Critical and high priority tasks needing immediate attention."
            />
          </div>
          <div className="mt-4 space-y-2">
            {dashboard.highPriorityActions.length ? (
              dashboard.highPriorityActions.map((action) => (
                <AppLinkButton
                  key={action.id}
                  href="/actions"
                  variant="ghost"
                  className="block w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 px-4 py-3 text-left shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="block min-w-0">
                    <span className="block text-sm font-black leading-5 text-slate-900 dark:text-slate-100">
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
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-500 text-center">
                No high-priority actions found.
              </p>
            )}
          </div>
        </AppPanel>
      </section>
    </section>
  );
}
