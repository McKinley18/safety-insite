import { AppPanel } from "@/components/ui/AppPanel";
import { AppButton } from "@/components/ui/AppButton";
import { formatReviewDate } from "@/lib/inspection/reportReviewHelpers";

export function ReportDetailsPanel({ report, onEdit }: { report: any; onEdit: () => void }) {
  return (
    <AppPanel padding="sm" className="relative px-4 py-3">
      <AppButton
        type="button"
        onClick={onEdit}
        aria-label="Edit report details"
        title="Edit report details"
        variant="ghost"
        size="sm"
        className="absolute right-3 top-3 h-8 w-8 rounded-full px-0 py-0 text-slate-600 dark:text-slate-300 shadow-none hover:text-[#1D72B8]"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </AppButton>

      <h3 className="truncate pr-10 text-sm font-black tracking-tight text-slate-900 dark:text-slate-100">
        {report.organizationName || "Organization"} · {report.siteLocation || "Field Inspection"}
      </h3>

      <div className="mt-3 grid gap-2 lg:grid-cols-4">
        {[
          [
            "Date",
            formatReviewDate(report.inspectionDate || report.createdAt),
          ],
          [
            "Lead Inspector",
            report.leadInspector || "Not entered",
          ],
          [
            "Additional Inspectors",
            report.additionalInspectors?.length
              ? report.additionalInspectors.join(", ")
              : "None",
          ],
          [
            "Confidentiality",
            report.isConfidential
              ? report.confidentialityMarkerText || "Privileged & Confidential"
              : "No",
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex h-9 flex-col items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950 px-3 text-center ring-1 ring-slate-200 dark:ring-slate-800"
          >
            <p className="text-[9px] font-black uppercase tracking-wide text-[#1D72B8]">
              {label}
            </p>
            <p className="mt-0.5 max-w-full truncate text-xs font-black text-slate-800 dark:text-slate-200" title={String(value)}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </AppPanel>
  );
}
