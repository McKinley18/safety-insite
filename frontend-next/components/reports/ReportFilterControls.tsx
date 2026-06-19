import { AppInput, AppSelect } from "@/components/ui/AppInput";

export function ReportFilterControls({
  reportSearch,
  setReportSearch,
  reportSortOrder,
  setReportSortOrder,
}: {
  reportSearch: string;
  setReportSearch: (value: string) => void;
  reportSortOrder: "newest" | "oldest";
  setReportSortOrder: (value: "newest" | "oldest") => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-3 text-slate-900 shadow-none ring-1 ring-white/70 backdrop-blur-xl">
      <div className="sentinel-phone-toolbar items-center sm:flex sm:flex-wrap sm:gap-2">
        <AppInput
          value={reportSearch}
          onChange={(event) => setReportSearch(event.target.value)}
          placeholder="Search reports"
          fieldSize="sm"
          className="w-full sm:max-w-xs"
        />

        <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 min-h-[44px] text-xs font-black text-slate-600 shadow-none sm:w-fit">
          Sort
          <select
            value={reportSortOrder}
            onChange={(event) =>
              setReportSortOrder(event.target.value as "newest" | "oldest")
            }
            className="bg-transparent text-sm font-black text-slate-900 outline-none w-full min-h-[48px]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
      </div>
    </div>
  );
}
