"use client";

import { useEffect, useMemo, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import { AppSelect } from "@/components/ui/AppInput";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  getSafetyCalendarEvents,
  getTodayDateKey,
  parseLocalCalendarDate,
  toDateKey,
} from "@/lib/safetyCalendar";
import type { SafetyCalendarEvent } from "@/types/safetyCalendar";
import {
  getStoredPlanCode,
  hasPlanEntitlement,
  type PlanCode,
} from "@/lib/planEntitlements";

type CalendarView = "month" | "week" | "day";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  next.setDate(next.getDate() - next.getDay());
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function eventTypeLabel(type: SafetyCalendarEvent["type"]) {
  if (type === "corrective_action") return "Action";
  if (type === "follow_up") return "Follow-up";
  if (type === "report_review") return "Report Review";
  if (type === "supervisor_review") return "Review";
  if (type === "inspection") return "Inspection";
  return "Task";
}

function eventTone(event: SafetyCalendarEvent) {
  if (event.status === "Completed") return "border-emerald-100 bg-emerald-50 text-emerald-800";
  if (event.status === "Overdue" || event.priority === "Critical") return "border-red-100 bg-red-50 text-red-800";
  if (event.priority === "High") return "border-orange-100 bg-orange-50 text-orange-800";
  if (event.type === "inspection") return "border-blue-100 bg-blue-50 text-blue-800";
  return "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300";
}

function sameDateKey(date: Date, dateKey: string) {
  return toDateKey(date) === dateKey;
}

function getDayCardTone(day: Date, dayEvents: SafetyCalendarEvent[]) {
  const todayKey = getTodayDateKey();
  const dayKey = toDateKey(day);
  const soonKey = toDateKey(addDays(parseLocalCalendarDate(todayKey) || new Date(), 3));

  const hasOverdue = dayEvents.some(
    (event) => event.status === "Overdue" || event.date < todayKey,
  );

  if (hasOverdue) {
    return "border-red-400 bg-red-50 ring-2 ring-red-100";
  }

  const hasDueSoon = dayEvents.some(
    (event) =>
      event.status !== "Completed" &&
      event.date >= todayKey &&
      event.date <= soonKey,
  );

  if (hasDueSoon) {
    return "border-amber-400 bg-amber-50 ring-2 ring-amber-100";
  }

  if (sameDateKey(day, todayKey)) {
    return "border-[#1D72B8] bg-[#E8F4FF]";
  }

  return "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900";
}

function getDayWorkSummary(dayEvents: SafetyCalendarEvent[]) {
  const todayKey = getTodayDateKey();

  const activeEvents = dayEvents.filter((event) => event.status !== "Completed");
  const overdue = activeEvents.filter(
    (event) => event.status === "Overdue" || event.date < todayKey,
  );
  const criticalHigh = activeEvents.filter(
    (event) => event.priority === "Critical" || event.priority === "High",
  );

  return {
    total: activeEvents.length,
    overdue: overdue.length,
    criticalHigh: criticalHigh.length,
  };
}

export default function SafetyCalendarPage() {
  const [events, setEvents] = useState<SafetyCalendarEvent[]>([]);
  const [view, setView] = useState<CalendarView>("month");
  const [anchorDate, setAnchorDate] = useState(() => {
    const parsed = parseLocalCalendarDate(getTodayDateKey());
    return parsed || new Date();
  });
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayDateKey());
  const [expandedMonthDateKey, setExpandedMonthDateKey] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planCode, setPlanCode] = useState<PlanCode>("basic");

  const canUseCompanyCalendar = hasPlanEntitlement("inspectionAssignments", planCode);

  useEffect(() => {
    async function loadEvents() {
      setPlanCode(getStoredPlanCode());

      const loaded = await getSafetyCalendarEvents();
      setEvents(loaded);
    }

    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType = !typeFilter || event.type === typeFilter;
      const matchesOwner = !canUseCompanyCalendar || !ownerFilter || event.owner === ownerFilter;
      const matchesStatus = !statusFilter || event.status === statusFilter;

      return matchesType && matchesOwner && matchesStatus;
    });
  }, [canUseCompanyCalendar, events, ownerFilter, statusFilter, typeFilter]);

  const ownerOptions = useMemo(() => {
    return Array.from(new Set(events.map((event) => event.owner).filter(Boolean))).sort();
  }, [events]);

  const eventsByDate = useMemo(() => {
    return filteredEvents.reduce<Record<string, SafetyCalendarEvent[]>>((acc, event) => {
      acc[event.date] = [...(acc[event.date] || []), event];
      return acc;
    }, {});
  }, [filteredEvents]);

  const selectedEvents = eventsByDate[selectedDateKey] || [];

  const priorityTodoGroups = useMemo(() => {
    const todayKey = getTodayDateKey();
    const today = parseLocalCalendarDate(todayKey) || new Date();
    const weekEnd = addDays(today, 7);
    const weekEndKey = toDateKey(weekEnd);

    const activeEvents = filteredEvents.filter(
      (event) => event.status !== "Completed",
    );

    const overdue = activeEvents
      .filter((event) => event.status === "Overdue" || event.date < todayKey)
      .slice(0, 6);

    const dueToday = activeEvents
      .filter((event) => event.date === todayKey && event.status !== "Overdue")
      .slice(0, 6);

    const dueThisWeek = activeEvents
      .filter(
        (event) =>
          event.date > todayKey &&
          event.date <= weekEndKey &&
          event.status !== "Overdue",
      )
      .slice(0, 6);

    const unassigned = activeEvents
      .filter((event) => event.owner === "Unassigned")
      .slice(0, 6);

    return [
      ["Overdue", overdue],
      ["Due Today", dueToday],
      ["Due This Week", dueThisWeek],
      ...(canUseCompanyCalendar ? ([["Unassigned", unassigned]] as const) : []),
    ] as const;
  }, [canUseCompanyCalendar, filteredEvents]);

  const monthDays = useMemo(() => {
    const first = startOfMonth(anchorDate);
    const last = endOfMonth(anchorDate);
    const gridStart = startOfWeek(first);
    const days: Date[] = [];

    for (let index = 0; index < 42; index += 1) {
      days.push(addDays(gridStart, index));
    }

    return { first, last, days };
  }, [anchorDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(anchorDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [anchorDate]);

  const calendarSummary = useMemo(() => {
    const open = filteredEvents.filter((event) => event.status !== "Completed");
    const overdue = filteredEvents.filter((event) => event.status === "Overdue");
    const criticalHigh = filteredEvents.filter(
      (event) => event.priority === "Critical" || event.priority === "High",
    );

    return {
      total: filteredEvents.length,
      open: open.length,
      overdue: overdue.length,
      criticalHigh: criticalHigh.length,
    };
  }, [filteredEvents]);

  function moveDate(direction: "previous" | "next") {
    const next = new Date(anchorDate);

    if (view === "month") {
      next.setMonth(next.getMonth() + (direction === "next" ? 1 : -1));
    } else if (view === "week") {
      next.setDate(next.getDate() + (direction === "next" ? 7 : -7));
    } else {
      next.setDate(next.getDate() + (direction === "next" ? 1 : -1));
      setSelectedDateKey(toDateKey(next));
    }

    setAnchorDate(next);
  }

  function selectDate(date: Date) {
    const dateKey = toDateKey(date);
    setAnchorDate(date);
    setSelectedDateKey(dateKey);

    if (view === "month") {
      setExpandedMonthDateKey((current) => (current === dateKey ? "" : dateKey));
    }
  }

  function openEventDay(event: SafetyCalendarEvent) {
    const date = parseLocalCalendarDate(event.date);
    if (date) setAnchorDate(date);
    setSelectedDateKey(event.date);
    setExpandedMonthDateKey("");
    setView("day");
  }

  function openDateInDayView(dateKey: string) {
    const date = parseLocalCalendarDate(dateKey);
    if (date) setAnchorDate(date);
    setSelectedDateKey(dateKey);
    setExpandedMonthDateKey("");
    setView("day");
  }

  return (
    <section className="sentinel-page-shell space-y-6">
      <HeroPanel align="center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Safety Calendar
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">
          Organize inspections, actions, follow-ups, and review work.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          {canUseCompanyCalendar
            ? "Manage team inspections, corrective actions, follow-ups, review work, owners, and organization-wide workload visibility."
            : "Manage your personal safety work, inspections, corrective actions, follow-ups, and review reminders."}
        </p>

        <div className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [String(calendarSummary.total), "Events"],
            [String(calendarSummary.open), "Open"],
            [String(calendarSummary.overdue), "Overdue"],
            [String(calendarSummary.criticalHigh), "Critical / High"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center shadow-sm backdrop-blur">
              <p className="text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">{value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-300">
                {label}
              </p>
            </div>
          ))}
        </div>
      </HeroPanel>

      {!canUseCompanyCalendar && (
        <AppPanel padding="sm" className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Personal Safety Calendar
          </p>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-600 dark:text-slate-300">
            Basic and Pro plans show personal safety work. Company workspaces add owner filters, team assignments, unassigned work visibility, and organization-wide workload planning.
          </p>
        </AppPanel>
      )}

      <AppPanel padding="sm" className="px-3 py-3 sm:px-3 sm:py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Calendar Controls
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-slate-100">
              {view === "month" ? formatMonthLabel(anchorDate) : formatFullDate(anchorDate)}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["month", "week", "day"] as CalendarView[]).map((item) => (
              <AppButton
                key={item}
                type="button"
                variant={view === item ? "primary" : "secondary"}
                size="sm"
                onClick={() => setView(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </AppButton>
            ))}

            <AppButton type="button" variant="secondary" size="sm" onClick={() => moveDate("previous")}>
              Previous
            </AppButton>
            <AppButton type="button" variant="secondary" size="sm" onClick={() => moveDate("next")}>
              Next
            </AppButton>
          </div>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <AppSelect value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} fieldSize="sm">
            <option value="">▣ All work types</option>
            <option value="inspection">🟦 Inspections</option>
            <option value="corrective_action">🟥 Corrective Actions</option>
            <option value="follow_up">🟨 Follow-ups</option>
            <option value="supervisor_review">🟪 Reviews</option>
            <option value="custom">⬛ Custom Tasks</option>
          </AppSelect>

          {canUseCompanyCalendar && (
            <AppSelect value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)} fieldSize="sm">
              <option value="">All owners</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </AppSelect>
          )}

          <AppSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} fieldSize="sm">
            <option value="">All statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </AppSelect>
        </div>
      </AppPanel>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div>
      {view === "month" && (
        <AppPanel padding="lg">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-wide text-slate-400">
            {WEEKDAY_LABELS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {monthDays.days.map((day) => {
              const dateKey = toDateKey(day);
              const dayEvents = eventsByDate[dateKey] || [];
              const isCurrentMonth = day.getMonth() === anchorDate.getMonth();
              const dayTone = getDayCardTone(day, dayEvents);
              const workSummary = getDayWorkSummary(dayEvents);
              const expanded = expandedMonthDateKey === dateKey;

              return (
                <div
                  key={dateKey}
                  className={expanded ? "col-span-7 sm:col-span-2 lg:col-span-3" : ""}
                >
                  <button
                    type="button"
                    onClick={() => selectDate(day)}
                    className={`flex w-full flex-col items-start justify-start rounded-xl border text-left align-top transition hover:border-[#1D72B8] ${dayTone} ${isCurrentMonth ? "" : "opacity-45"} ${
                      expanded ? "min-h-48 p-4 shadow-lg" : "aspect-square p-1.5 sm:p-2"
                    }`}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <span className="block self-start text-xs font-black leading-none text-slate-900 dark:text-slate-100">
                        {day.getDate()}
                      </span>

                      {expanded && (
                        <span className="rounded-full bg-white/80 dark:bg-slate-900/75 px-2 py-1 text-[10px] font-black text-slate-600 dark:text-slate-300">
                          Collapse
                        </span>
                      )}
                    </div>

                    {!expanded && workSummary.total > 0 && (
                      <div className="mt-auto flex w-full justify-end pt-2">
                        <span
                          className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[10px] font-black ${
                            workSummary.overdue > 0
                              ? "bg-red-600 text-white"
                              : workSummary.criticalHigh > 0
                                ? "bg-amber-500 text-white"
                                : "bg-[#1D72B8] text-white"
                          }`}
                          title={`${workSummary.total} scheduled item${workSummary.total === 1 ? "" : "s"}`}
                        >
                          {workSummary.total}
                        </span>
                      </div>
                    )}

                    {expanded && (
                      <div className="mt-4 w-full space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                            {formatFullDate(day)}
                          </p>
                          <span className="rounded-full bg-white/80 dark:bg-slate-900/75 px-2 py-1 text-[10px] font-black text-slate-600 dark:text-slate-300">
                            {workSummary.total} item{workSummary.total === 1 ? "" : "s"}
                          </span>
                        </div>

                        {dayEvents.length ? (
                          dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`rounded-lg border px-3 py-2 ${eventTone(event)}`}
                            >
                              <p className="text-xs font-black">
                                {event.title}
                              </p>
                              <p className="mt-1 text-[11px] font-semibold">
                                {eventTypeLabel(event.type)} · {event.owner} · {event.status}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/65 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            No safety work is scheduled for this day.
                          </p>
                        )}

                        {dayEvents.length > 0 && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              openDateInDayView(dateKey);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openDateInDayView(dateKey);
                              }
                            }}
                            className="inline-flex rounded-lg bg-[#102A43] px-3 py-2 text-xs font-black text-white"
                          >
                            Open Day Agenda
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </AppPanel>
      )}

      {view === "week" && (
        <AppPanel padding="lg">
          <div className="grid gap-3 lg:grid-cols-7">
            {weekDays.map((day) => {
              const dateKey = toDateKey(day);
              const dayEvents = eventsByDate[dateKey] || [];

              return (
                <div key={dateKey} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3">
                  <button
                    type="button"
                    onClick={() => selectDate(day)}
                    className="text-left"
                  >
                    <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                      {WEEKDAY_LABELS[day.getDay()]}
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100">
                      {day.getDate()}
                    </p>
                  </button>

                  <div className="mt-3 space-y-2">
                    {dayEvents.length ? (
                      dayEvents.map((event) => (
                        <div key={event.id} className={`rounded-lg border px-2 py-2 text-xs font-bold ${eventTone(event)}`}>
                          <p className="font-black">{event.title}</p>
                          <p className="mt-1 text-[11px]">{event.owner} · {event.status}</p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        No work.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </AppPanel>
      )}

      {view === "day" && (
        <AppPanel padding="lg">
          <SectionHeader
            eyebrow="Day Agenda"
            title={formatFullDate(parseLocalCalendarDate(selectedDateKey) || anchorDate)}
            description="Review scheduled work, overdue items, owners, locations, and source details for the selected day."
          />

          <div className="mt-4 space-y-3">
            {selectedEvents.length ? (
              selectedEvents.map((event) => (
                <div key={event.id} className={`rounded-xl border px-4 py-3 ${eventTone(event)}`}>
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide">
                        {eventTypeLabel(event.type)} · {event.priority}
                      </p>
                      <h3 className="mt-1 text-base font-black">{event.title}</h3>
                      <p className="mt-1 text-xs font-semibold">
                        Owner: {event.owner} · Location: {event.location}
                      </p>
                      {event.findingTitle && (
                        <p className="mt-1 text-xs font-semibold">
                          Finding: {event.findingTitle}
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg bg-white/70 dark:bg-slate-900/65 px-3 py-2 text-xs font-black">
                      {event.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                No safety work is scheduled for this day.
              </p>
            )}
          </div>
        </AppPanel>
      )}
        </div>

        <AppPanel padding="md" className="h-fit">
          <SectionHeader
            eyebrow="Priority Work"
            title="To Do"
            description="Click any item to open that day on the calendar."
          />

          <div className="mt-4 space-y-4">
            {priorityTodoGroups.map(([groupLabel, groupEvents]) => (
              <div key={groupLabel}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1D72B8]">
                    {groupLabel}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600 dark:text-slate-300">
                    {groupEvents.length}
                  </span>
                </div>

                <div className="mt-2 space-y-2">
                  {groupEvents.length ? (
                    groupEvents.map((event) => (
                      <button
                        key={`${groupLabel}-${event.id}`}
                        type="button"
                        onClick={() => openEventDay(event)}
                        className={`w-full rounded-xl border px-3 py-2 text-left transition hover:border-[#1D72B8] ${eventTone(event)}`}
                      >
                        <p className="text-xs font-black">
                          {event.title}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold">
                          {eventTypeLabel(event.type)} · {event.owner} · {event.date}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Nothing here.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AppPanel>
      </div>
    </section>
  );
}
