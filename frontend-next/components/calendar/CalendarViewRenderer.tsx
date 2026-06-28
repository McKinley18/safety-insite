import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import { SafetyCalendarControls } from "@/components/calendar/SafetyCalendarControls";
import { eventTone, eventTypeLabel } from "@/lib/calendar/helpers";
import {
  isPersonalCalendarEvent,
  toDateKey,
  parseLocalCalendarDate,
} from "@/lib/safetyCalendar";
import type { SafetyCalendarEvent } from "@/types/safetyCalendar";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarViewRendererProps {
  view: "month" | "week" | "day";
  anchorDate: Date;
  monthDays: { days: Date[] };
  eventsByDate: Record<string, SafetyCalendarEvent[]>;
  getDayCardTone: (day: Date, dayEvents: SafetyCalendarEvent[]) => string;
  getDayWorkSummary: (dayEvents: SafetyCalendarEvent[]) => { total: number; overdue: number; criticalHigh: number };
  expandedMonthDateKey: string;
  setExpandedMonthDateKey: (key: string) => void;
  selectDate: (date: Date) => void;
  openDateInDayView: (dateKey: string) => void;
  formatMonthLabel: (date: Date) => string;
  moveDate: (direction: "previous" | "next") => void;
  weekDays: Date[];
  selectedDateKey: string;
  selectedEvents: SafetyCalendarEvent[];
  formatFullDate: (date: Date) => string;
  isPersonalCalendarEvent: typeof isPersonalCalendarEvent;
  onOpenDay: (dateKey: string) => void;
  onEditPersonalEvent: (event: SafetyCalendarEvent) => void;
  onTogglePersonalEvent: (event: SafetyCalendarEvent) => void | Promise<void>;
  deleteCalendarEvent: (event: SafetyCalendarEvent) => void;
}

export function CalendarViewRenderer({
  view,
  anchorDate,
  monthDays,
  eventsByDate,
  getDayCardTone,
  getDayWorkSummary,
  expandedMonthDateKey,
  setExpandedMonthDateKey,
  selectDate,
  openDateInDayView,
  formatMonthLabel,
  moveDate,
  weekDays,
  selectedDateKey,
  selectedEvents,
  formatFullDate,
  isPersonalCalendarEvent,
  onOpenDay,
  onEditPersonalEvent,
  onTogglePersonalEvent,
  deleteCalendarEvent,
}: CalendarViewRendererProps) {
  if (view === "month") {
    return (
      <AppPanel padding="sm" className="px-0 py-0 overflow-hidden">
        <div className="bg-[#102A43] p-3 text-white">
          <SafetyCalendarControls
            anchorDate={anchorDate}
            formatMonthLabel={formatMonthLabel}
            moveDate={moveDate}
          />
          <div className="mt-3 grid grid-cols-7 gap-0.5 text-center text-[10px] font-black uppercase tracking-wide text-blue-300 sm:gap-1">
            {WEEKDAY_LABELS.map((day) => <div key={day}>{day}</div>)}
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
              <div key={dateKey} className={expanded ? "col-span-7 sm:col-span-2 lg:col-span-3" : ""}>
                <div
                  style={{ borderRadius: 0 }}
                  className={`sentinel-calendar-day relative flex w-full flex-col overflow-hidden rounded-none border text-left align-top transition hover:border-[#1D72B8] ${dayTone} ${isCurrentMonth ? "" : "opacity-45"} ${expanded ? "min-h-48 p-4 shadow-none" : "aspect-square min-h-0 p-1.5 sm:p-2"}`}
                >
                  <button
                    type="button"
                    onClick={() => selectDate(day)}
                    className={`relative flex h-full w-full items-start justify-between gap-3 text-left ${expanded ? "" : "overflow-hidden"}`}
                  >
                    <span className="block text-xs font-black leading-none text-app-text sm:text-[13px]">
                      {day.getDate()}
                    </span>
                    {expanded && (
                      <span className="rounded-full bg-app-surface-muted px-2 py-1 text-[10px] font-black text-app-text-muted">
                        Collapse
                      </span>
                    )}
                    {!expanded && workSummary.total > 0 && (
                      <span
                        className={`absolute bottom-1.5 right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[10px] font-black leading-none shadow-none ${
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
                    )}
                  </button>
                  {expanded && (
                    <div className="mt-4 w-full space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-app-text">{formatFullDate(day)}</p>
                        <span className="rounded-full bg-app-surface-muted px-2 py-1 text-[10px] font-black text-app-text-muted">{workSummary.total} item{workSummary.total === 1 ? "" : "s"}</span>
                      </div>
                      {dayEvents.length ? (
                        dayEvents.map((event) => (
                          <div key={event.id} className={`rounded-lg border px-3 py-2 ${eventTone(event)}`}>
                            <p className="text-xs font-black text-app-text">{event.title}</p>
                            <p className="mt-1 text-[11px] font-semibold text-app-text-muted">{eventTypeLabel(event.type)} · {event.owner} · {event.status}</p>
                            <p className="mt-1 text-[11px] font-semibold text-app-text-muted">
                              {event.location}
                              {event.sourceLabel ? ` · ${event.sourceLabel}` : ""}
                            </p>
                            {isPersonalCalendarEvent(event) && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <AppButton
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={(clickEvent) => {
                                    clickEvent.stopPropagation();
                                    onOpenDay(dateKey);
                                  }}
                                  className="h-8 px-2.5 text-[10px]"
                                >
                                  Open Day
                                </AppButton>
                                <AppButton
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={(clickEvent) => {
                                    clickEvent.stopPropagation();
                                    void onTogglePersonalEvent(event);
                                  }}
                                  className="h-8 px-2.5 text-[10px]"
                                >
                                  {event.status === "Completed" ? "Reopen" : "Complete"}
                                </AppButton>
                                <AppButton
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={(clickEvent) => {
                                    clickEvent.stopPropagation();
                                    onEditPersonalEvent(event);
                                  }}
                                  className="h-8 px-2.5 text-[10px]"
                                >
                                  Edit
                                </AppButton>
                                <AppButton
                                  type="button"
                                  size="sm"
                                  variant="danger"
                                  onClick={(clickEvent) => {
                                    clickEvent.stopPropagation();
                                    deleteCalendarEvent(event);
                                  }}
                                  className="h-8 px-2.5 text-[10px]"
                                >
                                  Delete
                                </AppButton>
                              </div>
                            )}
                            {!isPersonalCalendarEvent(event) && (
                              <p className="mt-2 text-[10px] font-semibold text-app-text-muted">
                                Managed from source inspection/action.
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="app-card app-text-soft rounded-lg border border-dashed px-3 py-2 text-xs font-semibold">No safety work is scheduled for this day.</p>
                      )}
                      {dayEvents.length > 0 && (
                        <AppButton
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDateInDayView(dateKey);
                          }}
                          className="h-8 px-3 text-[10px]"
                        >
                          Open Day Agenda
                        </AppButton>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </AppPanel>
    );
  }

  if (view === "week") {
    return (
      <AppPanel padding="lg">
        <div className="grid gap-3 lg:grid-cols-7">
          {weekDays.map((day) => {
            const dateKey = toDateKey(day);
            const dayEvents = eventsByDate[dateKey] || [];
            return (
              <div key={dateKey} className="app-surface px-3 py-3">
                <button type="button" onClick={() => selectDate(day)} className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">{WEEKDAY_LABELS[day.getDay()]}</p>
                  <p className="mt-1 text-lg font-black text-app-text">{day.getDate()}</p>
                </button>
                    <div className="mt-3 space-y-2">
                      {dayEvents.length ? (
                        dayEvents.map((event) => (
                          <div key={event.id} className={`rounded-lg border px-2 py-2 text-xs font-bold ${eventTone(event)}`}>
                            <p className="font-black text-app-text">{event.title}</p>
                            <p className="mt-1 text-[11px] text-app-text-muted">{event.owner} · {event.status}</p>
                            <p className="mt-1 text-[11px] text-app-text-muted">
                              {event.location}
                              {event.sourceLabel ? ` · ${event.sourceLabel}` : ""}
                            </p>
                            {isPersonalCalendarEvent(event) && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <AppButton
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => onOpenDay(dateKey)}
                                  className="h-8 px-2.5 text-[10px]"
                                >
                                  Open Day
                                </AppButton>
                                <AppButton
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => void onTogglePersonalEvent(event)}
                                  className="h-8 px-2.5 text-[10px]"
                                >
                                  {event.status === "Completed" ? "Reopen" : "Complete"}
                                </AppButton>
                                <AppButton
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => onEditPersonalEvent(event)}
                                  className="h-8 px-2.5 text-[10px]"
                                >
                                  Edit
                                </AppButton>
                                <AppButton
                                  type="button"
                                  size="sm"
                                  variant="danger"
                                  onClick={() => deleteCalendarEvent(event)}
                                  className="h-8 px-2.5 text-[10px]"
                                >
                                  Delete
                                </AppButton>
                              </div>
                            )}
                            {!isPersonalCalendarEvent(event) && (
                              <p className="mt-2 text-[10px] text-app-text-muted">
                                Managed from source inspection/action.
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                    <p className="app-card app-text-soft rounded-lg border border-dashed px-2 py-2 text-xs font-semibold">No work.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </AppPanel>
    );
  }

  if (view === "day") {
    return (
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
                    <p className="text-[10px] font-black uppercase tracking-wide text-app-text-muted">{eventTypeLabel(event.type)} · {event.priority}</p>
                    <h3 className="mt-1 text-base font-black text-app-text">{event.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-app-text-muted">Responsible: {event.owner} · Location: {event.location}</p>
                    {event.sourceLabel && (
                      <p className="mt-1 text-xs font-semibold text-app-text-muted">
                        Source: {event.sourceLabel}
                      </p>
                    )}
                    {event.findingTitle && <p className="mt-1 text-xs font-semibold text-app-text-muted">Finding: {event.findingTitle}</p>}
                  </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-app-surface-muted px-3 py-2 text-xs font-black text-app-text">{event.status}</div>
                      {isPersonalCalendarEvent(event) ? (
                        <>
                          <AppButton
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => onOpenDay(event.date)}
                            className="h-8 px-2.5 text-[10px]"
                          >
                            Open Day
                          </AppButton>
                          <AppButton
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => void onTogglePersonalEvent(event)}
                            className="h-8 px-2.5 text-[10px]"
                          >
                            {event.status === "Completed" ? "Reopen" : "Complete"}
                          </AppButton>
                          <AppButton
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => onEditPersonalEvent(event)}
                            className="h-8 px-2.5 text-[10px]"
                          >
                            Edit
                          </AppButton>
                          <AppButton
                            type="button"
                            size="sm"
                            variant="danger"
                            onClick={() => deleteCalendarEvent(event)}
                            className="h-8 px-2.5 text-[10px]"
                          >
                            Delete
                          </AppButton>
                        </>
                      ) : (
                        <p className="text-[10px] font-semibold text-app-text-muted">
                          Managed from source inspection/action.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
            ))
          ) : (
            <p className="app-card app-text-soft rounded-lg border border-dashed px-4 py-4 text-sm font-bold">No safety work is scheduled for this day.</p>
          )}
        </div>
      </AppPanel>
    );
  }

  return null;
}
