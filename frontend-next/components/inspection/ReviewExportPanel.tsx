import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";

export function ReviewExportPanel({
  humanReviewConfirmed,
  setHumanReviewConfirmed,
  exportWarning,
  setExportWarning,
  exportReport,
}: {
  humanReviewConfirmed: boolean;
  setHumanReviewConfirmed: (confirmed: boolean) => void;
  exportWarning: string;
  setExportWarning: (warning: string) => void;
  exportReport: () => void;
}) {
  return (
    <AppPanel padding="md" className="text-center">
      <button
        type="button"
        onClick={() => {
          setHumanReviewConfirmed(!humanReviewConfirmed);
          if (exportWarning) setExportWarning("");
        }}
        className="mx-auto flex max-w-2xl items-start gap-3 text-left"
      >
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-[#1D72B8] text-xs font-black text-white ${
            humanReviewConfirmed ? "bg-[#1D72B8]" : "bg-white dark:bg-slate-950"
          }`}
        >
          {humanReviewConfirmed ? "✓" : ""}
        </span>

        <span>
          <span className="block text-sm font-black text-slate-900 dark:text-slate-100">
            I confirm this report has been reviewed by a qualified person.
          </span>
          <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
            HazLenz AI outputs, standards, risk ratings, corrective actions,
            and report language have been independently reviewed before export.
            Use of this report remains subject to the Safety InSite legal terms.
          </span>

          <a
            href="/legal"
            className="mt-2 inline-block text-xs font-black text-[#1D72B8] underline underline-offset-2"
            onClick={(event) => event.stopPropagation()}
          >
            Review legal terms
          </a>
        </span>
      </button>

      {exportWarning && (
        <p className="mx-auto mt-3 max-w-md rounded-lg bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 ring-1 ring-amber-200">
          {exportWarning}
        </p>
      )}

      <AppButton
        type="button"
        onClick={exportReport}
        disabled={!humanReviewConfirmed}
        className="mx-auto mt-4 h-10 w-44 px-3 text-xs"
      >
        Export Final PDF
      </AppButton>

      {!humanReviewConfirmed && (
        <p className="mt-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
          Confirm qualified-person review to enable export.
        </p>
      )}
    </AppPanel>
  );
}
