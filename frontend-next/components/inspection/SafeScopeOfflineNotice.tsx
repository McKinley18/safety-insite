export function SafeScopeOfflineNotice({ safeScopeResult }: { safeScopeResult: any }) {
  if (safeScopeResult?.mode !== "offline_limited_advisory") return null;

  return (
    <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-200 border-l-4 border-l-amber-500 dark:bg-amber-950/35 dark:ring-amber-900/60">
      <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">
        Offline Advisory Snapshot
      </p>
      <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
        {safeScopeResult.advisorySummary}
      </p>
      <div className="mt-2 space-y-1">
        <p className="text-[10px] font-black uppercase text-amber-600">Required Sync Actions:</p>
        <ul className="list-inside list-disc text-[10px] font-semibold text-slate-600 dark:text-slate-300">
          {safeScopeResult.requiredSyncActions.map((a: string) => <li key={a}>{a}</li>)}
        </ul>
      </div>
      <p className="mt-2 text-[10px] font-bold leading-relaxed text-amber-700 italic">
        ⚠️ SYNC REQUIRED: This observation was captured in mobile resilience mode. Final regulatory reliance requires online verification.
      </p>
    </div>
  );
}
