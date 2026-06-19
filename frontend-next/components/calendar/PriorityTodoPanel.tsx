import { AppPanel } from "@/components/ui/AppPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import { eventTone, eventTypeLabel } from "@/lib/calendar/helpers";
import type { SafetyCalendarEvent } from "@/types/safetyCalendar";

interface PriorityTodoPanelProps {
  priorityTodoGroups: readonly (readonly [string, SafetyCalendarEvent[]])[];
  openEventDay: (event: SafetyCalendarEvent) => void;
}

export function PriorityTodoPanel({ priorityTodoGroups, openEventDay }: PriorityTodoPanelProps) {
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
  );
}
