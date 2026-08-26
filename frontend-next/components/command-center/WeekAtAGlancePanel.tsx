import { useState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { AppInput, AppSelect } from "@/components/ui/AppInput";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import SectionHeader from "@/components/ui/SectionHeader";
import { createPersonalCalendarTask, getTodayDateKey } from "@/lib/safetyCalendar";
import type { SafetyCalendarEvent } from "@/types/safetyCalendar";

export function WeekAtAGlancePanel({
  weekAtGlance,
  selectedWeekDateKey,
  setSelectedWeekDateKey,
  getWeekDayTone,
  getWeekBadgeTone,
  formatCalendarMonthLabel,
  onEventsChanged,
}: {
  weekAtGlance: Array<{
    date: Date;
    dateKey: string;
    events: SafetyCalendarEvent[];
  }>;
  selectedWeekDateKey: string;
  setSelectedWeekDateKey: (key: string) => void;
  getWeekDayTone: (dateKey: string, events: SafetyCalendarEvent[]) => string;
  getWeekBadgeTone: (events: SafetyCalendarEvent[]) => string;
  formatCalendarMonthLabel: (dateKey: string) => string;
  onEventsChanged: () => Promise<void>;
}) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<SafetyCalendarEvent["priority"]>("Medium");
  const [taskMessage, setTaskMessage] = useState("");

  async function addTask() {
    if (!taskTitle.trim()) {
      setTaskMessage("Add a task title first.");
      return;
    }

    try {
      createPersonalCalendarTask({
        title: taskTitle,
        date: selectedWeekDateKey,
        priority: taskPriority,
        status: "Open",
      });
      await onEventsChanged();
      setTaskTitle("");
      setTaskPriority("Medium");
      setTaskMessage("Task added.");
    } catch (error) {
      setTaskMessage(error instanceof Error ? error.message : "Unable to add task.");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-slate-950 shadow-none dark:border-white/15 dark:bg-[#0B1320] dark:text-white sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <SectionHeader
          eyebrow="Week at a Glance"
          title="This week’s safety work"
          description="A simple seven-day snapshot. Open the calendar for task details."
        />

        <AppLinkButton
          href="/safety-calendar"
          size="sm"
          className="!inline-flex !w-fit shrink-0 self-start rounded-full bg-[#102A43] px-4 py-2 text-[11px] font-black !text-white shadow-none ring-1 ring-slate-900/10 transition hover:bg-[#1D72B8]"
        >
          Open Calendar
        </AppLinkButton>
      </div>

      <div className="command-center-month-box mt-4 rounded-full border border-white/10 bg-[#0B1320] px-4 py-2 text-center text-xs font-black uppercase tracking-wide text-white shadow-none ring-1 ring-slate-900/10">
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
            } ${getWeekDayTone(dateKey, events)}`}
          >
            <span className="absolute left-1.5 top-1.5 block text-[9px] font-black uppercase leading-none tracking-wide text-slate-900 dark:text-white sm:left-2 sm:top-2 sm:text-[10px]">
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </span>

            <span className="absolute right-1.5 top-1.5 block text-[9px] font-black uppercase leading-none tracking-wide text-slate-900 dark:text-white sm:right-2 sm:top-2 sm:text-[10px]">
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

      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-white/15">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Add task for {selectedWeekDateKey}
            </span>
            <AppInput
              value={taskTitle}
              onChange={(event) => {
                setTaskTitle(event.target.value);
                if (taskMessage) setTaskMessage("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") void addTask();
              }}
              placeholder="Task title"
              fieldSize="sm"
            />
          </label>

          <AppSelect
            value={taskPriority}
            onChange={(event) => setTaskPriority(event.target.value as SafetyCalendarEvent["priority"])}
            fieldSize="sm"
            aria-label="Task priority"
            className="sm:w-32"
          >
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </AppSelect>

          <AppButton
            type="button"
            size="sm"
            variant="accent"
            onClick={() => void addTask()}
            className="command-center-add-task self-center app-accent-strong-surface px-3 !text-white sm:w-24"
          >
            Add Task
          </AppButton>
        </div>

        {taskMessage && (
          <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300" role="status">
            {taskMessage}
          </p>
        )}
      </div>
    </div>
  );
}
