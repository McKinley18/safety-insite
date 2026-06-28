import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import { eventTone, eventTypeLabel } from "@/lib/calendar/helpers";
import { isPersonalCalendarEvent } from "@/lib/safetyCalendar";
import type { SafetyCalendarEvent } from "@/types/safetyCalendar";

interface PriorityTodoPanelProps {
  priorityTodoGroups: readonly (readonly [string, SafetyCalendarEvent[]])[];
  openEventDay: (event: SafetyCalendarEvent) => void;
  isPersonalCalendarEvent: typeof isPersonalCalendarEvent;
  onEditPersonalEvent: (event: SafetyCalendarEvent) => void;
  onTogglePersonalEvent: (event: SafetyCalendarEvent) => void | Promise<void>;
  deleteCalendarEvent: (event: SafetyCalendarEvent) => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
  onClearCompletedTasks: () => void;
  activeCount: number;
  completedCount: number;
}

export function PriorityTodoPanel({
  priorityTodoGroups,
  openEventDay,
  isPersonalCalendarEvent,
  onEditPersonalEvent,
  onTogglePersonalEvent,
  deleteCalendarEvent,
  showCompleted,
  onToggleShowCompleted,
  onClearCompletedTasks,
  activeCount,
  completedCount,
}: PriorityTodoPanelProps) {
  return (
    <AppPanel padding="md" className="h-fit">
      <SectionHeader
        eyebrow="Priority Work"
        title="To Do"
        description="Click any item to open that day on the calendar."
        action={
          <span className="rounded-full bg-app-surface-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-app-text-muted">
            {activeCount} active
          </span>
        }
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
                    className={`rounded-xl border px-3 py-3 transition hover:border-[#1D72B8] ${eventTone(event)}`}
                  >
                    <div className="flex flex-col gap-2">
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
                        <p className="mt-1 text-[11px] font-semibold text-app-text-muted">
                          {event.location}
                          {event.sourceLabel ? ` · ${event.sourceLabel}` : ""}
                        </p>
                      </button>

                      {isPersonalCalendarEvent(event) ? (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
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
                            aria-label={`Delete ${event.title}`}
                            title="Delete to-do task"
                          >
                            Delete
                          </AppButton>
                        </div>
                      ) : (
                        <p className="rounded-lg bg-app-surface-muted px-2.5 py-2 text-[10px] font-semibold text-app-text-muted">
                          Inspection action · Read-only
                        </p>
                      )}
                    </div>
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
        <AppButton
          type="button"
          size="sm"
          variant={showCompleted ? "primary" : "secondary"}
          onClick={onToggleShowCompleted}
          className="h-8 px-3 text-[10px]"
        >
          {showCompleted ? "Hide completed" : `Show completed${completedCount > 0 ? ` (${completedCount})` : ""}`}
        </AppButton>

        {completedCount > 0 ? (
          <AppButton
            type="button"
            size="sm"
            variant="danger"
            onClick={onClearCompletedTasks}
            className="h-8 px-3 text-[10px]"
          >
            Clear completed
          </AppButton>
        ) : (
          <span className="text-[10px] font-semibold text-app-text-muted">
            Completed tasks stay hidden until shown.
          </span>
        )}
      </div>
    </AppPanel>
  );
}
