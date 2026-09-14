import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import React from 'react';

/**
 * §280 (D-036.4) — THE ONE EMPTY-STATE PATTERN.
 *
 * ==================== WHAT AN EMPTY STATE HAS TO SAY ====================
 *
 * Three things, and the product was reliably saying only the first:
 *
 *   1. WHAT IS EMPTY      — "No reports yet"
 *   2. WHAT THAT MEANS    — why the box is empty, so the user can tell "nothing has happened yet"
 *                           from "something is wrong" or "you are looking in the wrong place"
 *   3. WHAT TO DO NEXT    — the action that fills it
 *
 * §279 measured the failure mode on the dashboard: three boxes reading "Nothing here." with nothing
 * to do in any of them, which is the first screen a new account sees. "Nothing here." answers (1)
 * and refuses (2) and (3). On a safety product the second one matters more than it looks — an
 * inspector who cannot tell "no findings were recorded" from "findings could not be loaded" has
 * been handed a false all-clear by a blank panel.
 *
 * `description` is the MEANING and `actionLabel`/`href` is the NEXT STEP. Both are optional,
 * because a genuinely self-evident empty state should not be padded out to satisfy a template —
 * but a call site that supplies neither is saying it has nothing to add, which is worth having to
 * decide rather than defaulting into.
 *
 * ==================== RESTRAINT ====================
 *
 * A dashed outline, one line of heading, one of explanation, one action. No illustration, no
 * oversized icon, no encouragement. This appears in the middle of a working screen, several times
 * on some pages, and anything more assertive competes with the content that is actually there.
 */
type EmptyStateProps = {
  /** WHAT IS EMPTY. A statement, not a heading: "No reports yet". */
  title: string;
  /** WHAT IT MEANS. One sentence on why it is empty and what that does or does not imply. */
  description?: string;
  icon?: LucideIcon;
  /** WHAT TO DO NEXT — either an in-page action... */
  actionLabel?: string;
  onAction?: () => void;
  /** ...or a destination. `href` wins if both are supplied. */
  href?: string;
  className?: string;
};

export default function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  href,
  className = "",
}: EmptyStateProps) {
  /**
   * `!text-white` is load-bearing, not stylistic.
   *
   * globals.css carries an UNLAYERED `a { color: inherit; }`. Tailwind 4 puts its utilities in a
   * cascade layer, and unlayered CSS beats layered CSS whatever the specificity — so a plain
   * `text-white` on an anchor is silently ignored and the link inherits its parent's colour
   * instead. Measured across ten routes: 51 of the 54 anchors that ask for a text colour do not
   * get one. It is invisible almost everywhere because the inherited colour usually happens to be
   * close to the intended one.
   *
   * It stopped being invisible the moment this component grew an `href` branch: the action
   * rendered #0F172A text on its own #0F172A background — measured contrast ratio 1.0, a
   * completely unreadable button — while the identical `<button>` branch beside it was fine.
   * The `!` is what the rest of the product already uses for the same reason.
   *
   * The underlying cascade problem is NOT fixed here. Layering that `a` rule would let 51 dormant
   * utilities take effect at once across the product, which is a visual change nobody has looked
   * at; it is recorded for the product owner instead.
   */
  const actionClasses =
    "mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#0F172A] px-6 text-sm font-black !text-white shadow-sm hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 dark:bg-slate-100 dark:!text-slate-950 dark:hover:bg-white dark:focus:ring-slate-200";

  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-900 shadow-none ring-1 ring-white/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 sm:p-12 ${className}`}>
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 ring-4 ring-white dark:bg-slate-800 dark:ring-slate-900">
          <Icon className="h-6 w-6 text-[#1D72B8]" aria-hidden="true" />
        </div>
      )}
      <p className="text-base font-black text-slate-900 dark:text-white">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
          {description}
        </p>
      )}
      {actionLabel && href && (
        <Link href={href} className={actionClasses}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && !href && onAction && (
        <button type="button" onClick={onAction} className={actionClasses}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
