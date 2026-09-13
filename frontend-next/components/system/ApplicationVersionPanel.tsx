"use client";

import { useEffect, useState } from "react";
import { buildIdentity, displayBuildDate, displayVersion, shortSha } from "@/lib/release/buildIdentity";
import {
  checkReleaseVersion,
  getReleaseStatus,
  subscribeToReleaseStatus,
  type ReleaseStatus,
} from "@/lib/release/versionCheck";

/**
 * §279 — THE HUMAN-READABLE VERSION SURFACE.
 *
 * Low noise on purpose. The default line is a product version and a date, which is what a user
 * reading a support article or filing a report needs. The commit is a SUPPORT artifact, so it sits
 * one disclosure level down behind "Support details" -- present, copyable, and never something an
 * inspector is asked to interpret.
 *
 * It also reports the server's own release, because half of every version question in support is
 * "which server were you talking to", and a user who has to be walked through opening a developer
 * console to answer it has been failed by the product rather than by the person asking.
 */
export default function ApplicationVersionPanel() {
  const [status, setStatus] = useState<ReleaseStatus>(() => getReleaseStatus());
  const [showSupportDetail, setShowSupportDetail] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToReleaseStatus(setStatus);
    // The guard in the layout already schedules checks; this only covers the case where Settings
    // is the first thing a restored session opens and no check has completed yet.
    if (status.checkedAt === null) void checkReleaseVersion();
    return unsubscribe;
    // Intentionally once: re-running on every status change would re-trigger the check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildDate = displayBuildDate();
  const sha = shortSha();
  const contract = status.contract;

  const serverLine = (() => {
    switch (status.result.state) {
      case "CURRENT":
        return "Up to date with the Safety InSite service.";
      case "SUPPORTED":
        return "Supported by the Safety InSite service.";
      case "UPDATE_AVAILABLE":
        return "A newer version is available. Refresh this page to install it.";
      case "UPDATE_REQUIRED":
        return "This version is no longer supported. Refresh this page to continue working.";
      case "INCOMPATIBLE":
        return "This version cannot reach the current service. Contact support.";
      default:
        return "The Safety InSite service could not be reached to check for updates.";
    }
  })();

  return (
    <div data-testid="application-version" className="text-sm">
      <p className="font-bold text-slate-900 dark:text-white">{displayVersion()}</p>
      <p className="mt-1 font-semibold text-slate-600 dark:text-slate-300">
        {buildDate ? `Released ${buildDate}. ` : ""}
        {serverLine}
      </p>

      <button
        type="button"
        onClick={() => setShowSupportDetail((open) => !open)}
        aria-expanded={showSupportDetail}
        className="mt-2 rounded text-xs font-bold text-[#1D72B8] underline underline-offset-2 hover:text-[#0B1320] dark:text-[#5DB7FF]"
      >
        {showSupportDetail ? "Hide support details" : "Support details"}
      </button>

      {showSupportDetail ? (
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <dt>Application build</dt>
          <dd className="break-all font-mono" data-testid="application-version-sha">
            {sha || "not stamped"}
          </dd>
          <dt>Service release</dt>
          <dd className="break-all font-mono">{contract?.releaseVersion || "unavailable"}</dd>
          <dt>Service build</dt>
          <dd className="break-all font-mono">
            {contract ? `${String(contract.gitSha).slice(0, 12)} (${contract.versionSourceStatus})` : "unavailable"}
          </dd>
          <dt>Data schema</dt>
          <dd className="break-all font-mono">{contract?.schemaCompatibilityVersion || "unavailable"}</dd>
          <dt>Full application build</dt>
          <dd className="break-all font-mono">{buildIdentity.gitSha}</dd>
        </dl>
      ) : null}
    </div>
  );
}
