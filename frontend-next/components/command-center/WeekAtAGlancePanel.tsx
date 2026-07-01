import { AppPanel } from "@/components/ui/AppPanel";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import SectionHeader from "@/components/ui/SectionHeader";
import { getTodayDateKey } from "@/lib/safetyCalendar";

export function WeekAtAGlancePanel({
  weekAtGlance,
  selectedWeekDateKey,
  setSelectedWeekDateKey,
  getWeekDayTone,
  getWeekBadgeTone,
  formatCalendarMonthLabel,
}: {
  weekAtGlance: any[];
  selectedWeekDateKey: string;
  setSelectedWeekDateKey: (key: string) => void;
  getWeekDayTone: (dateKey: string, events: any[]) => string;
  getWeekBadgeTone: (events: any[]) => string;
  formatCalendarMonthLabel: (dateKey: string) => string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 !bg-white p-4 !text-slate-950 shadow-none sm:p-6">
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

      <div className="mt-4 rounded-full border border-white/10 bg-[#0B1320] px-4 py-2 text-center text-xs font-black uppercase tracking-wide text-white shadow-none ring-1 ring-slate-900/10">
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
            <span className="absolute left-1.5 top-1.5 block text-[9px] font-black uppercase leading-none tracking-wide !text-slate-900 sm:left-2 sm:top-2 sm:text-[10px]">
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </span>

            <span className="absolute right-1.5 top-1.5 block text-[9px] font-black uppercase leading-none tracking-wide !text-slate-900 sm:right-2 sm:top-2 sm:text-[10px]">
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
    </div>
  );
}
