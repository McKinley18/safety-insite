"use client";

import { useEffect, useState } from "react";
import {
  getReleaseStatus,
  startReleaseVersionWatch,
  subscribeToReleaseStatus,
  type ReleaseStatus,
} from "@/lib/release/versionCheck";

/**
 * §279 — WHAT THE USER SEES WHEN THEIR TAB IS BEHIND THE SERVER.
 *
 * ==================== TWO STATES, TWO VERY DIFFERENT POSTURES ====================
 *
 * UPDATE_AVAILABLE is a courtesy. The client still works, so this must not take the screen, must
 * not steal focus, and must be dismissible. An inspector halfway through documenting a hazard is
 * doing something more important than installing an update, and a notice that interrupts that is
 * a notice that teaches people to dismiss notices.
 *
 * UPDATE_REQUIRED and INCOMPATIBLE are not a courtesy. The server has said this bundle may not
 * write safety-critical records, and `apiFetch` is already refusing those writes. Saying nothing
 * would leave the inspector typing into a page that cannot save, which is the worst of the
 * available outcomes.
 *
 * ==================== WHY IT NEVER RELOADS BY ITSELF ====================
 *
 * The reload is always a click. §279 Part B required that recoverable work be protected before a
 * forced refresh, and §279's inventory found that the inspection workspace holds its in-progress
 * observation, clarification answers and reviewer risk choices in component state with no local
 * persistence -- a reload there destroys them. Until that is closed, an automatic reload would be
 * a feature that silently deletes an inspector's work, so the product asks and the person decides.
 * The blocking panel deliberately leaves the page behind it readable and selectable for exactly
 * that reason: whatever was typed can still be copied out before the refresh.
 */
export default function ReleaseVersionGuard() {
  const [status, setStatus] = useState<ReleaseStatus>(() => getReleaseStatus());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToReleaseStatus(setStatus);
    const stop = startReleaseVersionWatch();
    return () => {
      unsubscribe();
      stop();
    };
  }, []);

  const state = status.result.state;

  // A newer release re-opens a notice the user dismissed for the previous one; dismissing
  // "1.0.1 is available" is not consent to never hear about 1.0.2.
  const noticeKey = status.contract?.frontendVersion || "";
  const [dismissedFor, setDismissedFor] = useState("");
  useEffect(() => {
    if (dismissed && dismissedFor !== noticeKey) setDismissed(false);
  }, [dismissed, dismissedFor, noticeKey]);

  if (state === "UPDATE_REQUIRED" || state === "INCOMPATIBLE") {
    const refreshWorks = state === "UPDATE_REQUIRED";
    return (
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="insite-update-required-title"
        data-testid="update-required"
        className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-300 bg-white p-4 shadow-[0_-8px_24px_rgba(11,19,32,0.18)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-md sm:rounded-xl sm:border dark:border-slate-600 dark:bg-[#0F2036]"
      >
        <h2
          id="insite-update-required-title"
          className="text-sm font-black tracking-tight text-slate-900 dark:text-white"
        >
          {refreshWorks
            ? "Safety InSite has been updated"
            : "This version cannot reach the current server"}
        </h2>
        <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
          {refreshWorks
            ? "This page is running an older version and can no longer save. Anything you have typed but not saved will be lost when you refresh, so copy it out first if you need it."
            : "This page is running a version the server no longer supports, and refreshing will not resolve it. Copy out anything unsaved and contact support."}
        </p>
        {refreshWorks ? (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 w-full rounded-lg bg-[#1D72B8] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0B1320] sm:w-auto"
          >
            Refresh to continue
          </button>
        ) : null}
      </div>
    );
  }

  if (state === "UPDATE_AVAILABLE" && !dismissed) {
    return (
      <div
        role="status"
        data-testid="update-available"
        className="fixed inset-x-3 bottom-3 z-50 flex flex-col gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-lg sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-600 dark:bg-[#0F2036]"
      >
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          A newer version of Safety InSite is available.
        </span>
        <span className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-[#1D72B8] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0B1320]"
          >
            Refresh now
          </button>
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              setDismissedFor(noticeKey);
            }}
            className="rounded-md px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Later
          </button>
        </span>
      </div>
    );
  }

  return null;
}
