import { AppPanel } from "@/components/ui/AppPanel";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import AnnotationPreview from "@/components/evidence/AnnotationPreview";
import {
  getReportStableKey,
  getRiskLabel,
  riskClasses,
  getStorageLabel,
  getStorageClass,
  getReportIntegrity,
  getReportTitle,
  getReportLocation,
  getReportDate,
  formatDate,
} from "@/lib/inspection/reportListService";
import { type Report } from "@/lib/inspection/inspectionTypes";

export function ReportCard({
  report,
  editing,
  expanded,
  editTitle,
  setEditTitle,
  editLocation,
  setEditLocation,
  onToggleExpanded,
  onBeginEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onReview,
  onExport,
}: {
  report: Report;
  editing: boolean;
  expanded: boolean;
  editTitle: string;
  setEditTitle: (value: string) => void;
  editLocation: string;
  setEditLocation: (value: string) => void;
  onToggleExpanded: () => void;
  onBeginEdit: () => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onReview: (report: Report) => void;
  onExport: (report: Report) => void;
}) {
  const risk = getRiskLabel(report);
  const firstPhoto = report.findings?.flatMap(
    (finding: any) => finding.photos || [],
  )?.[0];
  const integrity = getReportIntegrity(report);

  return (
    <AppPanel
      as="article"
      padding="sm"
      className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-0 shadow-none sm:p-0"
    >
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onBeginEdit();
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/80 bg-white text-xs font-black text-[#102A43] shadow-none hover:border-[#1D72B8]"
          aria-label="Edit report"
          title="Edit report"
        >
          ✎
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(report.id);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-red-100 bg-white text-xs font-black text-red-700 shadow-none hover:bg-red-50"
          aria-label="Delete report"
          title="Delete report"
        >
          🗑
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleExpanded}
        className="relative flex w-full items-start gap-3 px-4 py-4 pr-[5.5rem] text-left transition hover:bg-slate-50/80"
      >
        <div className="min-w-0">
          <div className="flex w-fit max-w-full flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex w-fit items-center rounded-md px-1.5 py-0 text-xs font-black uppercase leading-3 tracking-wide ${riskClasses(
                risk,
              )}`}
            >
              {risk}
            </span>

            <span
              className={`inline-flex w-fit items-center rounded-md border px-1.5 py-0 text-xs font-black uppercase leading-3 tracking-wide ${getStorageClass(
                report.storageSource,
              )}`}
            >
              {report.storageSource === "cloud"
                ? "Cloud"
                : report.storageSource === "seed"
                  ? "Sample"
                  : "Local"}
            </span>
          </div>

          <h3 className="mt-1.5 text-[15px] font-black leading-tight tracking-[-0.02em] text-slate-900">
            {getReportTitle(report)}
          </h3>

          <p className="mt-0.5 text-[11px] font-semibold leading-4 text-slate-500">
            {getReportDate(report)} · {getReportLocation(report)}
          </p>
        </div>

        <span className="mt-2 inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#1D72B8] shadow-none sm:absolute sm:bottom-1.5 sm:right-3 sm:mt-0">
          {expanded ? "Hide details ▲" : "View details ▼"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50/45 px-4 py-4">
          {editing ? (
            <div className="sentinel-phone-stack sm:grid sm:grid-cols-2 sm:gap-3">
              <AppInput
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                placeholder="Report title"
              />

              <AppInput
                value={editLocation}
                onChange={(event) => setEditLocation(event.target.value)}
                placeholder="Location"
              />

              <div className="sentinel-phone-actions sm:col-span-2 sm:flex sm:flex-wrap sm:gap-2">
                <AppButton
                  type="button"
                  size="sm"
                  onClick={() => onSaveEdit(report.id)}
                  className="text-xs"
                >
                  Save
                </AppButton>

                <AppButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onCancelEdit}
                  className="text-xs"
                >
                  Cancel
                </AppButton>
              </div>
            </div>
          ) : (
            <div className="sentinel-phone-stack sm:grid sm:grid-cols-[76px_1fr] sm:gap-2.5">
              {firstPhoto ? (
                <div className="hidden h-[76px] w-[76px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:block">
                  <AnnotationPreview
                    photoUrl={firstPhoto.url}
                    annotations={firstPhoto.annotations || []}
                  />
                </div>
              ) : (
                <div className="hidden h-[76px] w-[76px] rounded-xl border border-dashed border-slate-300 bg-slate-50 sm:block" />
              )}

              <div className="min-w-0">
                <div className="rounded-xl border border-slate-200/80 bg-white/95 px-4 py-4 shadow-none">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                        Report Contents
                      </p>
                      <h4 className="mt-0.5 text-sm font-black text-slate-900">
                        Inspection report
                      </h4>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${riskClasses(
                        risk,
                      )}`}
                    >
                      {risk}
                    </span>
                  </div>

                  <div className="mt-2 grid w-full grid-cols-[repeat(auto-fit,minmax(82px,1fr))] gap-1.5">
                    {[
                      [`${report.findings?.length || 0}`, "Findings"],
                      [`${integrity.evidenceCount}`, "Evidence"],
                      [`${integrity.standardsCount}`, "Standards"],
                      [`${integrity.actionCount}`, "Actions"],
                    ].map(([value, label]) => (
                      <div
                        key={label}
                        className="min-w-0 rounded-lg border border-slate-200/80 bg-slate-50/70 px-2 py-1.5 text-center"
                      >
                        <p className="text-center text-xs font-black leading-none text-slate-900">
                          {value}
                        </p>
                        <p className="mt-0.5 text-center text-[9px] font-black uppercase tracking-wide text-slate-400">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 text-[11px] font-semibold leading-4 text-slate-600">
                    <p className="text-[10px] font-black uppercase tracking-wide text-[#1D72B8]">
                      Report details
                    </p>
                    <p className="mt-1">Created {formatDate(report.createdAt)}.</p>
                    <p className="mt-1 break-all text-[10px] text-slate-400">
                      Record ID: {report.id}
                    </p>
                  </div>

                  <div className="sentinel-phone-actions mt-2 sm:flex sm:flex-wrap sm:gap-1.5">
                    <AppButton
                      type="button"
                      size="sm"
                      onClick={() => onReview(report)}
                      className="text-xs"
                    >
                      Review
                    </AppButton>

                    <AppButton
                      type="button"
                      size="sm"
                      onClick={() => onExport(report)}
                      className="bg-[#F97316] text-xs text-black hover:bg-[#EA580C]"
                    >
                      Export PDF
                    </AppButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppPanel>
  );
}
