"use client";

import { useEffect, useMemo, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import { PriorityTodoPanel } from "@/components/calendar/PriorityTodoPanel";
import { AppInput, AppSelect } from "@/components/ui/AppInput";
import SectionHeader from "@/components/ui/SectionHeader";
import { CalendarViewRenderer } from "@/components/calendar/CalendarViewRenderer";
import {
  createPersonalCalendarTask,
  completePersonalCalendarEvent,
  clearCompletedPersonalCalendarEvents,
  deletePersonalCalendarEvent,
  isPersonalCalendarEvent,
  reopenPersonalCalendarEvent,
  updatePersonalCalendarEvent,
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
    return "border-app-primary bg-app-brand-soft";
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
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [editingTaskDate, setEditingTaskDate] = useState(getTodayDateKey());
  const [editingTaskPriority, setEditingTaskPriority] = useState("Medium");
  const [editingTaskLocation, setEditingTaskLocation] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  const canUseCompanyCalendar = hasPlanEntitlement("inspectionAssignments", planCode);

  function isCompletedCalendarStatus(status?: string) {
    return String(status || "").trim().toLowerCase() === "completed";
  }

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

  const displayEvents = useMemo(() => {
    if (showCompleted) return filteredEvents;
    return filteredEvents.filter((event) => !isCompletedCalendarStatus(event.status));
  }, [filteredEvents, showCompleted]);

  const completedPersonalTaskCount = useMemo(
    () =>
      filteredEvents.filter(
        (event) => isPersonalCalendarEvent(event) && isCompletedCalendarStatus(event.status),
      ).length,
    [filteredEvents],
  );

  const eventsByDate = useMemo(() => {
    return displayEvents.reduce<Record<string, SafetyCalendarEvent[]>>((acc, event) => {
      acc[event.date] = [...(acc[event.date] || []), event];
      return acc;
    }, {});
  }, [displayEvents]);

  const selectedEvents = eventsByDate[selectedDateKey] || [];

  const priorityTodoGroups = useMemo(() => {
    const todayKey = getTodayDateKey();
    const today = parseLocalCalendarDate(todayKey) || new Date();
    const weekEnd = addDays(today, 7);
    const weekEndKey = toDateKey(weekEnd);

    const activeEvents = displayEvents.filter(
      (event) => !isCompletedCalendarStatus(event.status),
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

    const completedEvents = displayEvents
      .filter((event) => isCompletedCalendarStatus(event.status))
      .slice(0, 6);

    return [
      ["Overdue", overdue],
      ["Due Today", dueToday],
      ["Due This Week", dueThisWeek],
      ...(canUseCompanyCalendar ? ([["Unassigned", unassigned]] as const) : []),
      ...(showCompleted ? ([["Completed", completedEvents]] as const) : []),
    ] as const;
  }, [canUseCompanyCalendar, displayEvents, showCompleted]);

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
    const open = displayEvents.filter((event) => !isCompletedCalendarStatus(event.status));
    const overdue = displayEvents.filter((event) => String(event.status || "").toLowerCase() === "overdue");
    const criticalHigh = displayEvents.filter(
      (event) => event.priority === "Critical" || event.priority === "High",
    );

    return {
      total: displayEvents.length,
      open: open.length,
      overdue: overdue.length,
      criticalHigh: criticalHigh.length,
    };
  }, [displayEvents]);

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

  function beginEditPersonalTask(event: SafetyCalendarEvent) {
    if (!isPersonalCalendarEvent(event)) {
      setTaskMessage("Corrective actions are managed from their source inspection/action.");
      return;
    }

    setEditingTaskId(event.id);
    setEditingTaskTitle(event.title || "");
    setEditingTaskDate(event.date || getTodayDateKey());
    setEditingTaskPriority(event.priority || "Medium");
    setEditingTaskLocation(event.location || "");
    setTaskMessage("");
  }

  function cancelEditPersonalTask() {
    setEditingTaskId(null);
    setEditingTaskTitle("");
    setEditingTaskDate(getTodayDateKey());
    setEditingTaskPriority("Medium");
    setEditingTaskLocation("");
  }

  async function saveEditedPersonalTask() {
    if (!editingTaskId) return;

    if (!editingTaskTitle.trim()) {
      setTaskMessage("Add a task title before saving.");
      return;
    }

    const updated = updatePersonalCalendarEvent(editingTaskId, {
      title: editingTaskTitle,
      date: editingTaskDate,
      priority: editingTaskPriority as SafetyCalendarEvent["priority"],
      location: editingTaskLocation,
    });

    if (!updated) {
      setTaskMessage("Unable to update that task.");
      return;
    }

    await refreshCalendarEvents();
    setSelectedDateKey(updated.date);
    const updatedDate = parseLocalCalendarDate(updated.date);
    if (updatedDate) setAnchorDate(updatedDate);
    setExpandedMonthDateKey(updated.date);
    setView("day");
    cancelEditPersonalTask();
    setTaskMessage("Task updated.");
  }

  async function togglePersonalTaskComplete(event: SafetyCalendarEvent) {
    if (!isPersonalCalendarEvent(event)) {
      setTaskMessage(
        // Source-managed corrective actions remain read-only here until a safe write-back exists.
        "Corrective actions are managed from their source inspection/action.",
      );
      return;
    }

    const nextStatus =
      event.status === "Completed"
        ? reopenPersonalCalendarEvent(event.id)
        : completePersonalCalendarEvent(event.id);

    await refreshCalendarEvents();

    setTaskMessage(nextStatus?.status === "Completed" ? "Task marked complete." : "Task reopened.");
  }

  const editingTask = editingTaskId
    ? events.find((event) => event.id === editingTaskId) || null
    : null;

  async function deleteCalendarEvent(event: SafetyCalendarEvent) {
    if (!isPersonalCalendarEvent(event)) {
      setTaskMessage(
        // Source-managed corrective actions remain read-only here until a safe write-back exists.
        "Corrective actions are managed from their source inspection/action.",
      );
      return;
    }

    const confirmed = window.confirm(`Delete "${event.title}" from your calendar?`);
    if (!confirmed) return;

    const deleted = deletePersonalCalendarEvent(event.id);
    await refreshCalendarEvents();

    if (editingTaskId === event.id) {
      cancelEditPersonalTask();
    }

    setTaskMessage(deleted ? "Task deleted." : "Unable to delete that task.");
  }

  async function clearCompletedTasks() {
    const removed = clearCompletedPersonalCalendarEvents();
    if (!removed) {
      setTaskMessage("No completed personal tasks to clear.");
      return;
    }

    await refreshCalendarEvents();
    setTaskMessage("Completed personal tasks cleared.");
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
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex w-fit gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-900">
            {(["month", "week", "day"] as CalendarView[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setView(item)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-normal transition ${
                  view === item
                    ? "bg-[#102A43] text-white shadow-sm"
                    : "bg-transparent text-[#102A43] hover:bg-white dark:text-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs font-semibold leading-5 text-app-text-muted">
          Completed tasks are hidden from the active calendar. You can show or clear completed personal tasks anytime.
        </p>

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
          <CalendarViewRenderer
            view={view}
            anchorDate={anchorDate}
            monthDays={monthDays}
            eventsByDate={eventsByDate}
            getDayCardTone={getDayCardTone}
            getDayWorkSummary={getDayWorkSummary}
            expandedMonthDateKey={expandedMonthDateKey}
            setExpandedMonthDateKey={setExpandedMonthDateKey}
            selectDate={selectDate}
            openDateInDayView={openDateInDayView}
            formatMonthLabel={formatMonthLabel}
            moveDate={moveDate}
            weekDays={weekDays}
            selectedDateKey={selectedDateKey}
            selectedEvents={selectedEvents}
            formatFullDate={formatFullDate}
            isPersonalCalendarEvent={isPersonalCalendarEvent}
            onOpenDay={openDateInDayView}
            onEditPersonalEvent={beginEditPersonalTask}
            onTogglePersonalEvent={togglePersonalTaskComplete}
            deleteCalendarEvent={deleteCalendarEvent}
          />
        </div>
        <PriorityTodoPanel
          priorityTodoGroups={priorityTodoGroups}
          openEventDay={openEventDay}
          isPersonalCalendarEvent={isPersonalCalendarEvent}
          onEditPersonalEvent={beginEditPersonalTask}
          onTogglePersonalEvent={togglePersonalTaskComplete}
          deleteCalendarEvent={deleteCalendarEvent}
          showCompleted={showCompleted}
          onToggleShowCompleted={() => setShowCompleted((current) => !current)}
          onClearCompletedTasks={() => {
            void clearCompletedTasks();
          }}
          completedCount={completedPersonalTaskCount}
        />
      </div>

      {editingTaskId && (
        <AppPanel padding="md" className="app-card">
          <SectionHeader
            eyebrow="Edit Personal Task"
            title="Update your calendar task"
            description="Personal tasks can be edited, completed, reopened, or deleted from here."
          />

          <div className="mt-4 grid gap-2 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
            <AppInput
              value={editingTaskTitle}
              onChange={(event) => setEditingTaskTitle(event.target.value)}
              placeholder="Task title"
              fieldSize="sm"
            />
            <AppInput
              type="date"
              value={editingTaskDate}
              onChange={(event) => setEditingTaskDate(event.target.value)}
              fieldSize="sm"
            />
            <AppSelect
              value={editingTaskPriority}
              onChange={(event) => setEditingTaskPriority(event.target.value)}
              fieldSize="sm"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </AppSelect>
            <AppInput
              value={editingTaskLocation}
              onChange={(event) => setEditingTaskLocation(event.target.value)}
              placeholder="Location / note"
              fieldSize="sm"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <AppButton type="button" size="sm" onClick={saveEditedPersonalTask}>
              Save Task
            </AppButton>
            <AppButton type="button" size="sm" variant="secondary" onClick={cancelEditPersonalTask}>
              Cancel
            </AppButton>
            <AppButton
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                if (editingTask) {
                  void togglePersonalTaskComplete(editingTask);
                }
              }}
            >
              {editingTask?.status === "Completed" ? "Reopen" : "Mark Complete"}
            </AppButton>
            <AppButton
              type="button"
              size="sm"
              variant="danger"
              onClick={() => {
                if (editingTask) {
                  void deleteCalendarEvent(editingTask);
                }
              }}
            >
              Delete Task
            </AppButton>
          </div>
        </AppPanel>
      )}

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
