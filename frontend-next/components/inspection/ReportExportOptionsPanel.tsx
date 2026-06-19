import { AppPanel } from "@/components/ui/AppPanel";

export function ReportExportOptionsPanel({ report, updateReportOption }: { report: any; updateReportOption: (key: string, value: boolean) => void }) {
  return (
    <AppPanel padding="lg">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [
            "includeStandardsInReport",
            "Standards",
            report.includeStandardsInReport !== false,
          ],
          [
            "includeActionsInReport",
            "Actions",
            report.includeActionsInReport !== false,
          ],
          [
            "includePhotosInReport",
            "Photos",
            report.includePhotosInReport !== false,
          ],
          [
            "includeSafeScopeNotesInReport",
            "HazLenz AI Notes",
            Boolean(report.includeSafeScopeNotesInReport),
          ],
        ].map(([key, label, checked]: any) => (
          <button
            key={key}
            type="button"
            onClick={() => updateReportOption(key, !checked)}
            className={`flex h-11 items-center justify-between rounded-xl border px-3 text-left transition ${
              checked
                ? "border-[#1D72B8] bg-[#E8F4FF] dark:bg-blue-950/40"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-900"
            }`}
          >
            <span className="truncate text-sm font-black text-slate-900 dark:text-slate-100">
              {label}
            </span>

            <span
              className={`ml-3 flex h-5 min-w-10 items-center justify-center rounded-full px-2 text-[10px] font-black uppercase tracking-wide ${
                checked
                  ? "bg-[#1D72B8] text-white"
                  : "bg-slate-200 text-slate-500 dark:text-slate-400"
              }`}
            >
              {checked ? "On" : "Off"}
            </span>
          </button>
        ))}
      </div>
    </AppPanel>
  );
}
