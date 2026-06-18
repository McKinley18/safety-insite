import { AppButton } from "@/components/ui/AppButton";

export function SafetyCalendarControls({
  anchorDate,
  formatMonthLabel,
  moveDate,
}: {
  anchorDate: Date;
  formatMonthLabel: (date: Date) => string;
  moveDate: (direction: "previous" | "next") => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <AppButton
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => moveDate("previous")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </AppButton>

      <h2 className="text-xs font-black uppercase tracking-wide text-blue-200">
        {formatMonthLabel(anchorDate)}
      </h2>

      <AppButton
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => moveDate("next")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </AppButton>
    </div>
  );
}
