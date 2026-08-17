"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { AppInput, AppSelect } from "@/components/ui/AppInput";
import SectionHeader from "@/components/ui/SectionHeader";
import { PriorityTodoPanel } from "@/components/calendar/PriorityTodoPanel";
import {
  clearCompletedPersonalCalendarEvents,
  completePersonalCalendarEvent,
  deletePersonalCalendarEvent,
  getTodayDateKey,
  isPersonalCalendarEvent,
  parseLocalCalendarDate,
  reopenPersonalCalendarEvent,
  toDateKey,
  updatePersonalCalendarEvent,
} from "@/lib/safetyCalendar";
import type { SafetyCalendarEvent } from "@/types/safetyCalendar";

function isCompletedCalendarStatus(status?: string) {
  return String(status || "").trim().toLowerCase() === "completed";
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function PriorityTodoSection({
  events,
  onEventsChanged,
}: {
  events: SafetyCalendarEvent[];
  onEventsChanged: () => void | Promise<void>;
}) {
  const router = useRouter();
  const [showCompleted, setShowCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [editingTaskDate, setEditingTaskDate] = useState(getTodayDateKey());
  const [editingTaskPriority, setEditingTaskPriority] = useState("Medium");
  const [editingTaskLocation, setEditingTaskLocation] = useState("");

  const displayEvents = useMemo(() => {
    if (showCompleted) return events;
    return events.filter((event) => !isCompletedCalendarStatus(event.status));
  }, [events, showCompleted]);

  const completedCount = useMemo(
    () =>
      events.filter(
        (event) => isPersonalCalendarEvent(event) && isCompletedCalendarStatus(event.status),
      ).length,
    [events],
  );

  const priorityTodoGroups = useMemo(() => {
    const todayKey = getTodayDateKey();
    const today = parseLocalCalendarDate(todayKey) || new Date();
    const weekEndKey = toDateKey(addDays(today, 7));

    const activeEvents = displayEvents.filter((event) => !isCompletedCalendarStatus(event.status));

    const overdue = activeEvents
      .filter((event) => event.status === "Overdue" || event.date < todayKey)
      .slice(0, 6);

    const dueToday = activeEvents
      .filter((event) => event.date === todayKey && event.status !== "Overdue")
      .slice(0, 6);

    const dueThisWeek = activeEvents
      .filter((event) => event.date > todayKey && event.date <= weekEndKey && event.status !== "Overdue")
      .slice(0, 6);

    const completedEvents = displayEvents
      .filter((event) => isCompletedCalendarStatus(event.status))
      .slice(0, 6);

    return [
      ["Overdue", overdue],
      ["Due Today", dueToday],
      ["Due This Week", dueThisWeek],
      ...(showCompleted ? ([["Completed", completedEvents]] as const) : []),
    ] as const;
  }, [displayEvents, showCompleted]);

  function openEventDay(event: SafetyCalendarEvent) {
    router.push(`/safety-calendar?date=${encodeURIComponent(event.date)}&view=day`);
  }

  function beginEditPersonalTask(event: SafetyCalendarEvent) {
    if (!isPersonalCalendarEvent(event)) {
      setMessage("Corrective actions are managed from their source inspection/action.");
      return;
    }

    setEditingTaskId(event.id);
    setEditingTaskTitle(event.title || "");
    setEditingTaskDate(event.date || getTodayDateKey());
    setEditingTaskPriority(event.priority || "Medium");
    setEditingTaskLocation(event.location || "");
    setMessage("");
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
      setMessage("Add a task title before saving.");
      return;
    }

    const updated = updatePersonalCalendarEvent(editingTaskId, {
      title: editingTaskTitle,
      date: editingTaskDate,
      priority: editingTaskPriority as SafetyCalendarEvent["priority"],
      location: editingTaskLocation,
    });

    if (!updated) {
      setMessage("Unable to update that task.");
      return;
    }

    await onEventsChanged();
    cancelEditPersonalTask();
    setMessage("Task updated.");
  }

  async function togglePersonalTaskComplete(event: SafetyCalendarEvent) {
    if (!isPersonalCalendarEvent(event)) {
      setMessage("Corrective actions are managed from their source inspection/action.");
      return;
    }

    const nextStatus =
      event.status === "Completed"
        ? reopenPersonalCalendarEvent(event.id)
        : completePersonalCalendarEvent(event.id);

    await onEventsChanged();
    setMessage(nextStatus?.status === "Completed" ? "Task marked complete." : "Task reopened.");
  }

  async function deleteCalendarEvent(event: SafetyCalendarEvent) {
    if (!isPersonalCalendarEvent(event)) {
      setMessage("Corrective actions are managed from their source inspection/action.");
      return;
    }

    const confirmed = window.confirm(`Delete "${event.title}" from your calendar?`);
    if (!confirmed) return;

    const deleted = deletePersonalCalendarEvent(event.id);
    await onEventsChanged();

    if (editingTaskId === event.id) cancelEditPersonalTask();
    setMessage(deleted ? "Task deleted." : "Unable to delete that task.");
  }

  async function clearCompletedTasks() {
    const removed = clearCompletedPersonalCalendarEvents();
    if (!removed) {
      setMessage("No completed personal tasks to clear.");
      return;
    }

    await onEventsChanged();
    setMessage("Completed personal tasks cleared.");
  }

  const editingTask = editingTaskId ? events.find((event) => event.id === editingTaskId) || null : null;

  return (
    <div className="space-y-4">
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
        completedCount={completedCount}
      />

      {message && !editingTaskId && (
        <p className="rounded-xl bg-app-surface-muted px-3 py-2 text-xs font-black text-app-text">
          {message}
        </p>
      )}

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

          {message && (
            <p className="mt-3 rounded-xl bg-app-surface-muted px-3 py-2 text-xs font-black text-app-text">
              {message}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <AppButton type="button" size="sm" onClick={() => void saveEditedPersonalTask()}>
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
                if (editingTask) void togglePersonalTaskComplete(editingTask);
              }}
            >
              {editingTask?.status === "Completed" ? "Reopen" : "Mark Complete"}
            </AppButton>
            <AppButton
              type="button"
              size="sm"
              variant="danger"
              onClick={() => {
                if (editingTask) void deleteCalendarEvent(editingTask);
              }}
            >
              Delete Task
            </AppButton>
          </div>
        </AppPanel>
      )}
    </div>
  );
}
