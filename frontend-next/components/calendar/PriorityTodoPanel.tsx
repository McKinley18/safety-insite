import { AppPanel } from "@/components/ui/AppPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import { eventTone, eventTypeLabel } from "@/lib/calendar/helpers";
import type { SafetyCalendarEvent } from "@/types/safetyCalendar";

interface PriorityTodoPanelProps {
  priorityTodoGroups: readonly (readonly [string, SafetyCalendarEvent[]])[];
  openEventDay: (event: SafetyCalendarEvent) => void;
  deleteCalendarEvent: (event: SafetyCalendarEvent) => void;
}

export function PriorityTodoPanel({ priorityTodoGroups, openEventDay, deleteCalendarEvent }: PriorityTodoPanelProps) {
  return (
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
                  <div
                    key={`${groupLabel}-${event.id}`}
                    className={`rounded-lg border px-3 py-2 text-left transition hover:border-[#1D72B8] ${eventTone(event)}`}
                  >
                    <button
                      type="button"
                      onClick={() => openEventDay(event)}
                      className="w-full text-left"
                    >
                      <p className="text-xs font-black text-app-text">
                        {event.title}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-app-text-muted">
                        {eventTypeLabel(event.type)} · {event.owner} · {event.date}
                      </p>
                    </button>

                    {event.source === "personal_task" && (
                      <button
                        type="button"
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation();
                          deleteCalendarEvent(event);
                        }}
                        className="mt-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-black text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                        aria-label={`Delete ${event.title}`}
                        title="Delete to-do task"
                      >
                        Delete
                      </button>
                    )}
                  </div>
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
  );
}
