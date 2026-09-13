"use client";

/**
 * §276 / D-007 — SAY WHICH KIND OF EMPTY THIS IS.
 *
 * §275's Safety Calendar reported "0 EVENTS, 0 OPEN, 0 OVERDUE" while nine pieces of due
 * work sat on the server. The number was not the whole failure: the page had no way to
 * distinguish "you have nothing scheduled" from "your calendar could not be read", and a
 * user looking at the second one has no reason to suspect the first is not true.
 *
 * Now the server is the authority, and this strip reports the three states in which what
 * is on screen is not simply the server's current answer.
 */
export type SafetyCalendarSyncState = {
  serverReachable: boolean;
  servedFromCache: boolean;
  pendingCount: number;
  blockedCount: number;
  reason?: "no_session" | "unreachable" | "unauthorized";
};

const NOTICE_BASE =
  "rounded-lg border px-3 py-2.5 text-xs font-semibold leading-5 sm:px-4 sm:py-3 sm:text-sm";

export function CalendarSyncNotice({ state }: { state: SafetyCalendarSyncState }) {
  const notices: Array<{ key: string; tone: string; text: string }> = [];

  if (!state.serverReachable && state.reason !== "no_session") {
    notices.push({
      key: "offline",
      tone: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-400/60 dark:bg-[#4A3426] dark:text-amber-50",
      text: state.servedFromCache
        ? "Showing your last synced schedule. Safety InSite could not be reached, so anything changed since then is not here yet."
        : "Safety InSite could not be reached, so your scheduled work could not be loaded. This is not a sign that nothing is due.",
    });
  }

  if (state.blockedCount > 0) {
    notices.push({
      key: "blocked",
      tone: "border-red-300 bg-red-50 text-red-900 dark:border-red-400/60 dark:bg-[#4A2932] dark:text-red-50",
      text: `${state.blockedCount} ${state.blockedCount === 1 ? "task" : "tasks"} could not be saved to your account after several attempts. They are shown below and still need saving.`,
    });
  }

  const unsaved = state.pendingCount - state.blockedCount;
  if (unsaved > 0) {
    notices.push({
      key: "pending",
      tone: "border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-500 dark:bg-[#20364D] dark:text-slate-100",
      text: `${unsaved} ${unsaved === 1 ? "task is" : "tasks are"} waiting to sync. ${unsaved === 1 ? "It is" : "They are"} marked “Pending sync” below and will save automatically when Safety InSite is reachable.`,
    });
  }

  if (!notices.length) return null;

  return (
    <div className="space-y-2" data-testid="calendar-sync-notice">
      {notices.map((notice) => (
        <p key={notice.key} className={`${NOTICE_BASE} ${notice.tone}`}>
          {notice.text}
        </p>
      ))}
    </div>
  );
}
