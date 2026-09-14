import { AppButton } from "@/components/ui/AppButton";

/**
 * Month navigation for the Safety Calendar.
 *
 * §286 / D-058. Both controls are ICON-ONLY, and neither carried an accessible name: a screen
 * reader announced the two most important controls on the page as "button" and "button", with
 * nothing to distinguish going back from going forward. The name is supplied by `aria-label` and
 * names the DIRECTION AND THE UNIT ("Previous month"), because "previous" alone does not say
 * previous what, and this component is the only place the month is moved from.
 *
 * The visible month heading beside them is not a substitute: it labels the RANGE, not the buttons,
 * and a reader tabbing to a control is given that control's name, not its neighbour's.
 */
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
        aria-label="Previous month"
        onClick={() => moveDate("previous")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
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
        aria-label="Next month"
        onClick={() => moveDate("next")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
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
