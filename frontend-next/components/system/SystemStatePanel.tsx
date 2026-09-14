import type { ReactNode } from "react";

/**
 * §280 (D-034) — THE ONE PRESENTATION FOR THE PRODUCT'S SYSTEM STATES.
 *
 * ==================== WHAT WAS WRONG ====================
 *
 * Safety InSite shipped with no `not-found.tsx`, no `error.tsx` at any level, and no
 * `loading.tsx`. A customer who mistyped a URL met Next.js' unbranded default 404. An uncaught
 * render error had no product-owned surface at all — the framework's own error screen is what a
 * safety professional would have seen mid-inspection, and in production that screen says
 * essentially nothing.
 *
 * ==================== WHY ONE COMPONENT ====================
 *
 * Three surfaces, three framework file conventions, one thing to say: what happened, and the one
 * action worth offering. Writing them separately is how they drift, and a 404 that looks like a
 * different product from the error page is worse than either alone.
 *
 * ==================== WHAT IT DELIBERATELY DOES NOT DO ====================
 *
 * It makes no claim about the user's work. An error boundary cannot know whether an in-progress
 * observation survived, so it does not say "your work is safe" and it does not say it is lost.
 * Anything else would be a guess printed in the voice of the product, on the screen a person
 * reads when they are already worried — see D-035 for what actually protects the draft.
 *
 * `tone` is not decoration: it selects the accent used for the icon rail, and under the §280
 * colour rule ORANGE means attention/unresolved, never "this page is interesting".
 */
export type SystemStateTone = "neutral" | "attention" | "error";

// The rail is non-text, so it keeps the brighter brand values in both themes. The eyebrow is
// text, so the light-mode value is the darkened one that clears 4.5:1 on the app surface --
// #BB5609 rather than #F97316, which is the same correction the accent button variant carries.
const toneRail: Record<SystemStateTone, string> = {
  neutral: "bg-[#1D72B8]",
  attention: "bg-[#BB5609]",
  error: "bg-red-600 dark:bg-red-500",
};

const toneEyebrow: Record<SystemStateTone, string> = {
  neutral: "text-[#1D72B8] dark:text-[#5DB7FF]",
  attention: "text-[#BB5609] dark:text-[#F97316]",
  error: "text-red-700 dark:text-red-300",
};

export default function SystemStatePanel({
  eyebrow,
  title,
  body,
  tone = "neutral",
  actions,
  detail,
  /**
   * `status` for something the user is waiting on, `alert` for something that has already gone
   * wrong. Both are live regions, so a screen reader announces the state on arrival rather than
   * leaving a blind user on a page whose only content is a heading they must go looking for.
   */
  role = "status",
}: {
  eyebrow: string;
  title: string;
  body: ReactNode;
  tone?: SystemStateTone;
  actions?: ReactNode;
  detail?: ReactNode;
  role?: "status" | "alert";
}) {
  return (
    <div className="mx-auto flex w-full max-w-[36rem] flex-col items-start px-1 py-10 sm:py-16">
      <div
        role={role}
        aria-live={role === "alert" ? "assertive" : "polite"}
        className="w-full overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-sm"
      >
        <div className={`h-1.5 w-full ${toneRail[tone]}`} aria-hidden="true" />
        <div className="p-6 sm:p-8">
          <p
            className={`text-[11px] font-black uppercase tracking-[0.18em] ${toneEyebrow[tone]}`}
          >
            {eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-app-primary sm:text-3xl">
            {title}
          </h1>
          <div className="mt-3 space-y-3 text-[15px] font-semibold leading-6 text-app-secondary">
            {body}
          </div>
          {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
          {detail && (
            <div className="mt-7 border-t border-app-border pt-4 text-xs font-semibold leading-5 text-app-muted">
              {detail}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
