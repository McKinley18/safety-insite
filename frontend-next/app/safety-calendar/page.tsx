"use client";

import { useEffect, useMemo, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import { AppInput, AppSelect } from "@/components/ui/AppInput";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  createPersonalCalendarTask,
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
  if (event.status === "Completed") return "app-surface-muted";
  if (event.status === "Overdue" || event.priority === "Critical") return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200";
  if (event.priority === "High") return "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-200";
  if (event.type === "inspection") return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200";
  return "app-surface";
}

function sameDateKey(date: Date, dateKey: string) {
  return toDateKey(date) === dateKey;
}

function getDayCardTone(day: Date, dayEvents: SafetyCalendarEvent[]) {
  const todayKey = getTodayDateKey();
  const soonKey = toDateKey(addDays(parseLocalCalendarDate(todayKey) || new Date(), 3));

  const hasOverdue = dayEvents.some(
    (event) => event.status === "Overdue" || event.date < todayKey,
  );

  if (hasOverdue) {
    return "border-red-400 bg-red-50 dark:bg-red-950/20";
  }

  const hasDueSoon = dayEvents.some(
    (event) =>
      event.status !== "Completed" &&
      event.date >= todayKey &&
      event.date <= soonKey,
  );

  if (hasDueSoon) {
    return "border-amber-400 bg-amber-50 dark:bg-amber-950/20";
  }

  if (sameDateKey(day, todayKey)) {
    return "border-app-primary bg-app-primary/10";
  }

  return "app-surface";
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
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState(getTodayDateKey());
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskLocation, setTaskLocation] = useState("");
  const [taskMessage, setTaskMessage] = useState("");

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
    const gridEnd = addDays(startOfWeek(last), 6);
    const days: Date[] = [];

    for (
      let cursor = new Date(gridStart);
      cursor.getTime() <= gridEnd.getTime();
      cursor = addDays(cursor, 1)
    ) {
      days.push(new Date(cursor));
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

  async function refreshCalendarEvents() {
    const loaded = await getSafetyCalendarEvents();
    setEvents(loaded);
  }

  function openDateInDayView(dateKey: string) {
    const date = parseLocalCalendarDate(dateKey);
    if (date) setAnchorDate(date);
    setSelectedDateKey(dateKey);
    setExpandedMonthDateKey("");
    setView("day");
  }

  async function schedulePersonalTask() {
    setTaskMessage("");

    if (!taskTitle.trim()) {
      setTaskMessage("Add a task title before scheduling.");
      return;
    }

    try {
      const task = createPersonalCalendarTask({
        title: taskTitle,
        date: taskDate,
        priority: taskPriority as SafetyCalendarEvent["priority"],
        status: "Open",
        location: taskLocation,
      });

      await refreshCalendarEvents();

      const taskDateObject = parseLocalCalendarDate(task.date);
      if (taskDateObject) setAnchorDate(taskDateObject);
      setSelectedDateKey(task.date);
      setExpandedMonthDateKey(task.date);
      setView("day");

      setTaskTitle("");
      setTaskLocation("");
      setTaskPriority("Medium");
      setTaskDate(getTodayDateKey());
      setTaskMessage("Personal task scheduled.");
    } catch (error) {
      setTaskMessage(error instanceof Error ? error.message : "Unable to schedule task.");
    }
  }

  return (
    <section className="sentinel-mobile-page space-y-4 sm:space-y-4">
      <HeroPanel align="center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Safety Calendar
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-[-0.045em] sm:text-4xl">
          Organize inspections, actions, follow-ups, and review work.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          {canUseCompanyCalendar
            ? "Review inspections, corrective actions, follow-ups, reminders, and due work in one lightweight schedule."
            : "Manage your personal safety work, inspections, corrective actions, follow-ups, and review reminders."}
        </p>

        <div className="mx-auto mt-4 grid max-w-3xl grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {[
            [String(calendarSummary.total), "Events"],
            [String(calendarSummary.open), "Open"],
            [String(calendarSummary.overdue), "Overdue"],
            [String(calendarSummary.criticalHigh), "Critical / High"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-center shadow-none backdrop-blur">
              <p className="text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">{value}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-300">
                {label}
              </p>
            </div>
          ))}
        </div>
      </HeroPanel>

      {/* Personal safety calendar card removed */}

      <AppPanel padding="sm" className="space-y-2 px-2 py-2 sm:px-3 sm:py-3">
        <h2 className="text-lg font-black text-app-text">Calendar Controls</h2>
        <div className="inline-flex w-fit gap-1 rounded-full bg-slate-100 p-1">
          {/* View Switchers */}
          {(["month", "week", "day"] as CalendarView[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-normal transition ${
                view === item
                  ? "bg-[#102A43] text-white shadow-sm"
                  : "bg-transparent text-[#102A43] hover:bg-white"
              }`}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <AppSelect value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} fieldSize="sm" className="w-full">
            <option value="">▣ All types</option>
            <option value="inspection">🟦 Inspections</option>
            <option value="corrective_action">🟥 CA</option>
            <option value="follow_up">🟨 Follow-ups</option>
            <option value="supervisor_review">🟪 Reviews</option>
          </AppSelect>

          <AppSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} fieldSize="sm" className="w-full">
            <option value="">All statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">Prog</option>
            <option value="Completed">Done</option>
          </AppSelect>
        </div>
      </AppPanel>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div>
      {view === "month" && (
        <AppPanel padding="sm" className="px-0 py-0 overflow-hidden">
          {/* Unified Blue Header Banner */}
          <div className="bg-[#102A43] p-3 text-white">
            <div className="flex items-center justify-between">
              <AppButton type="button" variant="secondary" size="sm" onClick={() => moveDate("previous")}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </AppButton>

              <h2 className="text-xs font-black uppercase tracking-wide text-blue-200">
                {formatMonthLabel(anchorDate)}
              </h2>

              <AppButton type="button" variant="secondary" size="sm" onClick={() => moveDate("next")}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </AppButton>
            </div>
            
            <div className="mt-3 grid grid-cols-7 gap-0.5 text-center text-[10px] font-black uppercase tracking-wide text-blue-300 sm:gap-1">
              {WEEKDAY_LABELS.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
          </div>

          <div className="mt-1 grid grid-cols-7 gap-0.5 sm:gap-1 p-1">
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
                    style={{ borderRadius: 0 }}
                    className={`sentinel-calendar-day flex w-full flex-col items-start justify-start rounded-none border text-left align-top transition hover:border-[#1D72B8] ${dayTone} ${isCurrentMonth ? "" : "opacity-45"} ${
                      expanded ? "min-h-48 p-4 shadow-none" : "aspect-square p-1.5 sm:p-2"
                    }`}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <span className="block self-start text-xs font-black leading-none text-app-text">
                        {day.getDate()}
                      </span>

                      {expanded && (
                        <span className="rounded-full bg-app-surface-muted px-2 py-1 text-[10px] font-black text-app-text-muted">
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
                          <p className="text-sm font-black text-app-text">
                            {formatFullDate(day)}
                          </p>
                          <span className="rounded-full bg-app-surface-muted px-2 py-1 text-[10px] font-black text-app-text-muted">
                            {workSummary.total} item{workSummary.total === 1 ? "" : "s"}
                          </span>
                        </div>

                        {dayEvents.length ? (
                          dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`rounded-lg border px-3 py-2 ${eventTone(event)}`}
                            >
                              <p className="text-xs font-black text-app-text">
                                {event.title}
                              </p>
                              <p className="mt-1 text-[11px] font-semibold text-app-text-muted">
                                {eventTypeLabel(event.type)} · {event.owner} · {event.status}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="app-card app-text-soft rounded-lg border border-dashed px-3 py-2 text-xs font-semibold">
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
                <div key={dateKey} className="app-surface px-3 py-3">
                  <button
                    type="button"
                    onClick={() => selectDate(day)}
                    className="text-left"
                  >
                    <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                      {WEEKDAY_LABELS[day.getDay()]}
                    </p>
                    <p className="mt-1 text-lg font-black text-app-text">
                      {day.getDate()}
                    </p>
                  </button>

                  <div className="mt-3 space-y-2">
                    {dayEvents.length ? (
                      dayEvents.map((event) => (
                        <div key={event.id} className={`rounded-lg border px-2 py-2 text-xs font-bold ${eventTone(event)}`}>
                          <p className="font-black text-app-text">{event.title}</p>
                          <p className="mt-1 text-[11px] text-app-text-muted">{event.owner} · {event.status}</p>
                        </div>
                      ))
                    ) : (
                      <p className="app-card app-text-soft rounded-lg border border-dashed px-2 py-2 text-xs font-semibold">
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
            description="Review scheduled work, overdue items, locations, and source details for the selected day."
          />

          <div className="mt-4 space-y-3">
            {selectedEvents.length ? (
              selectedEvents.map((event) => (
                <div key={event.id} className={`rounded-lg border px-4 py-3 ${eventTone(event)}`}>
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-app-text-muted">
                        {eventTypeLabel(event.type)} · {event.priority}
                      </p>
                      <h3 className="mt-1 text-base font-black text-app-text">{event.title}</h3>
                      <p className="mt-1 text-xs font-semibold text-app-text-muted">
                        Responsible: {event.owner} · Location: {event.location}
                      </p>
                      {event.findingTitle && (
                        <p className="mt-1 text-xs font-semibold text-app-text-muted">
                          Finding: {event.findingTitle}
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg bg-app-surface-muted px-3 py-2 text-xs font-black text-app-text">
                      {event.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="app-card app-text-soft rounded-lg border border-dashed px-4 py-4 text-sm font-bold">
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
                  <span className="rounded-full bg-app-surface-muted px-2 py-1 text-[10px] font-black text-app-text-muted">
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
                        className={`w-full rounded-lg border px-3 py-2 text-left transition hover:border-[#1D72B8] ${eventTone(event)}`}
                      >
                        <p className="text-xs font-black text-app-text">
                          {event.title}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-app-text-muted">
                          {eventTypeLabel(event.type)} · {event.owner} · {event.date}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="app-card app-text-soft rounded-lg border border-dashed px-3 py-2 text-xs font-semibold">
                      Nothing here.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AppPanel>
      </div>

      <AppPanel padding="md" className="app-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
              Schedule My Task
            </p>
            <h2 className="mt-1 text-lg font-black text-app-text">
              Add personal safety work
            </h2>
            <p className="mt-1 text-sm font-bold leading-6 text-app-text-muted">
              Schedule a personal inspection reminder, follow-up, review, or safety task for yourself.
            </p>
          </div>
          {taskMessage && (
            <p className="rounded-xl bg-app-surface-muted px-3 py-2 text-xs font-black text-app-text">
              {taskMessage}
            </p>
          )}
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr_auto]">
          <AppInput
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            placeholder="Task title"
            fieldSize="sm"
          />
          <AppInput
            type="date"
            value={taskDate}
            onChange={(event) => setTaskDate(event.target.value)}
            fieldSize="sm"
          />
          <AppSelect
            value={taskPriority}
            onChange={(event) => setTaskPriority(event.target.value)}
            fieldSize="sm"
          >
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </AppSelect>
          <AppInput
            value={taskLocation}
            onChange={(event) => setTaskLocation(event.target.value)}
            placeholder="Location / note"
            fieldSize="sm"
          />
          <AppButton type="button" size="sm" onClick={schedulePersonalTask}>
            Schedule
          </AppButton>
        </div>
      </AppPanel>

    </section>
  );
}
