"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { AppInput, AppSelect, AppTextarea } from "@/components/ui/AppInput";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import {
  fetchCloudActions,
  updateCloudAction,
  updateCloudActionStatus,
  type CloudAction,
} from "@/lib/cloudActions";
import { getTodayDateKey } from "@/lib/safetyCalendar";

/**
 * THE CORRECTIVE ACTION LIFECYCLE — the customer surface for managing and closing an action.
 *
 * ==================== §287 / D-050 — WHAT THIS EXISTS TO CLOSE ====================
 *
 * §286 measured that `GET /actions`, `PATCH /actions/:id/status` and `GET /actions/export` were
 * implemented, authorized and working, that `lib/cloudActions.ts` implemented the client for them,
 * and that NO ROUTE IMPORTED IT. A corrective action could be raised and could never be closed
 * from the product: the customer's only view of one after creation was the Safety Calendar
 * (read-only) and the report PDF.
 *
 * The product owner's decision is that this is an incomplete core v1 lifecycle rather than a
 * register item, so it is closed here.
 *
 * ==================== WHY IT LIVES ON THE SAFETY CALENDAR ====================
 *
 * The direction is to prefer an existing active Actions/Calendar surface over another route. The
 * Safety Calendar is already the product's due-work surface: corrective actions already appear on
 * it as events, and the inspector who needs to close one is the inspector looking at what is due.
 *
 * It reads `GET /actions` rather than the calendar projection, deliberately. The projection is
 * DATED -- it excludes an action with no due date, because a calendar has nowhere to put one -- and
 * a management surface that silently omitted undated actions would leave exactly the actions
 * nobody is tracking invisible. This panel is the one place that shows all of them.
 *
 * ==================== NO SECOND CORRECTIVE-ACTION SYSTEM ====================
 *
 * Every read and write goes through the existing `lib/cloudActions.ts` to the existing server
 * routes. There is no local action store, no optimistic cache that could disagree with the server,
 * and no derived status: after every mutation the list is re-read, so what is on screen is what the
 * server said last. That is the D-007 authority rule applied to actions.
 */

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  completed: "Completed",
  verified: "Verified",
  cancelled: "Cancelled",
};

/**
 * §287 / D-052. How each lifecycle state is described to a customer.
 *
 * `completed` says what is true and claims nothing further: the work is recorded as done, and no
 * independent verification is recorded. It deliberately does not say "awaiting verification",
 * because that would assert that a verification is expected, and whether verification is required
 * at all is an open product-policy question rather than something this screen may decide.
 */
const STATE_DESCRIPTION: Record<string, string> = {
  open: "Not started.",
  in_progress: "Work is under way.",
  completed: "Recorded as done. No independent verification has been recorded.",
  verified: "Recorded as done and independently verified.",
  cancelled: "No longer required.",
};

/** Overdue is derived against the local day and never stored — the rule the calendar already uses. */
function isOverdue(action: CloudAction) {
  if (!action.dueDateKey) return false;
  if (action.lifecycleState === "completed" || action.lifecycleState === "verified") return false;
  if (action.lifecycleState === "cancelled") return false;
  return action.dueDateKey < getTodayDateKey();
}

function formatDueDate(dateKey: string) {
  if (!dateKey) return "No due date";
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  if (Number.isNaN(date.getTime())) return "No due date";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Requests a 44px minimum on every control in this panel — these are field controls, used on a
 * phone, often in gloves.
 *
 * §287, MEASURED: on a PHONE it resolves to 40px, not 44px, and that is not a bug in this line.
 * `globals.css` carries a deliberate mobile rule
 *
 *     .sentinel-mobile-page button, .sentinel-mobile-page a, .sentinel-mobile-page label
 *       { min-height: 40px; }
 *
 * whose descendant selector outranks a single utility class. 40px clears the product's own 36px
 * mobile floor (§73.3) and sits below the 44px iOS HIG / WCAG 2.5.5 (AAA) guideline, which is
 * exactly the App-Format item §286 registered.
 *
 * It is NOT overridden here. The one lever is that shared rule, changing it moves every button on
 * every mobile surface, and §287's direction is explicit that no broad redesign belongs in this
 * section. Overriding it for this panel alone would instead make these controls the only 44px
 * buttons on a phone — an inconsistency introduced without design authority. The class stays
 * because it is correct at every other width, and the shortfall is reported rather than hidden.
 */
const TOUCH = "min-h-11";

type Draft = { dueDate: string; priority: string; assignedToName: string };

export function CorrectiveActionsPanel({
  onActionsChanged,
}: {
  /** Lets the calendar re-read itself after a change, so the two surfaces cannot disagree. */
  onActionsChanged?: () => void | Promise<void>;
}) {
  const [actions, setActions] = useState<CloudAction[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [showClosed, setShowClosed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ dueDate: "", priority: "Medium", assignedToName: "" });
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closureNotes, setClosureNotes] = useState("");
  /**
   * §287. The id of whichever action currently has a write in flight.
   *
   * REPEATED-TAP PROTECTION IS NOT JUST A DISABLED BUTTON. The button is disabled, but a disabled
   * button is a rendering that can be raced -- a second tap can land before React re-renders, and
   * a hardware keyboard can fire the click twice. This flag is read inside the handler itself, so
   * a second invocation returns before it reaches the network whatever the button looks like.
   */
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (options: { quiet?: boolean } = {}) => {
    if (!options.quiet) setState("loading");
    try {
      const result = await fetchCloudActions({ limit: 100 });
      setActions(result.actions);
      setTotal(result.total);
      setState("ready");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Corrective actions could not be loaded.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => {
    const rows = showClosed
      ? actions
      : actions.filter((action) => action.lifecycleState === "open" || action.lifecycleState === "in_progress");
    // Overdue first, then by due date, then undated last: the order an inspector needs.
    return [...rows].sort((a, b) => {
      const aOver = isOverdue(a) ? 0 : 1;
      const bOver = isOverdue(b) ? 0 : 1;
      if (aOver !== bOver) return aOver - bOver;
      if (!a.dueDateKey && !b.dueDateKey) return a.title.localeCompare(b.title);
      if (!a.dueDateKey) return 1;
      if (!b.dueDateKey) return -1;
      return a.dueDateKey.localeCompare(b.dueDateKey);
    });
  }, [actions, showClosed]);

  const openCount = actions.filter(
    (action) => action.lifecycleState === "open" || action.lifecycleState === "in_progress",
  ).length;
  const overdueCount = actions.filter(isOverdue).length;

  function beginEdit(action: CloudAction) {
    setClosingId(null);
    setMessage("");
    setEditingId(action.id);
    setDraft({
      dueDate: action.dueDateKey,
      priority: action.priority,
      assignedToName: action.assignedToName,
    });
  }

  /**
   * §287 / D-051. Save the edited fields.
   *
   * The SERVER is authoritative: this sends the change and then RE-READS the list rather than
   * patching local state from the response, so the due date on screen after a save is the date the
   * server persisted. A refresh or a restart shows the same thing for the same reason.
   */
  async function saveEdit(action: CloudAction) {
    if (busyId) return;
    setBusyId(action.id);
    setMessage("");
    try {
      await updateCloudAction(action.id, {
        // A bare calendar day. See `updateCloudAction` for why this must not be an instant.
        ...(draft.dueDate ? { dueDate: draft.dueDate } : {}),
        priorityCode: draft.priority.toLowerCase() === "critical"
          ? "urgent"
          : (draft.priority.toLowerCase() as "low" | "medium" | "high"),
        assignedToName: draft.assignedToName,
      });
      setEditingId(null);
      await load({ quiet: true });
      await onActionsChanged?.();
    } catch (error) {
      // The edit panel stays OPEN and the values stay in the fields: an error that discards what
      // the user typed makes them retype it, and retyping is where a second submit comes from.
      setMessage(error instanceof Error ? error.message : "The action could not be updated.");
    } finally {
      setBusyId(null);
    }
  }

  /**
   * §287 / D-052. Close an action — and ONLY close it.
   *
   * This records completion. It does not claim the correction was independently verified and it
   * does not claim a supervisor signed off, because neither happened: the person pressing this is
   * frequently the person who raised the action. The server no longer stamps the verification
   * fields on a close, and the panel says which of the two states the action is in.
   *
   * Closure notes are OPTIONAL. Nothing is substituted when they are empty.
   */
  async function closeAction(action: CloudAction) {
    if (busyId) return;
    setBusyId(action.id);
    setMessage("");
    try {
      await updateCloudActionStatus(action.id, "Completed", closureNotes);
      setClosingId(null);
      setClosureNotes("");
      await load({ quiet: true });
      await onActionsChanged?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The action could not be closed.");
    } finally {
      setBusyId(null);
    }
  }

  async function reopenAction(action: CloudAction) {
    if (busyId) return;
    setBusyId(action.id);
    setMessage("");
    try {
      await updateCloudActionStatus(action.id, "Open");
      await load({ quiet: true });
      await onActionsChanged?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The action could not be reopened.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppPanel padding="md" className="app-card" data-testid="corrective-actions-panel">
      <SectionHeader
        eyebrow="Corrective Actions"
        title="Track and close corrective actions"
        /* §287. "On this account" is precise, not decorative: `GET /actions` is scoped to the
           caller's owner/organization scope. It therefore does NOT include the unowned rows D-056
           describes — actions written at finalization with no ownership scope, which belong to no
           account and are invisible to every customer read. That gap is registered, not hidden
           behind wording that would imply this list is exhaustive of the table. */
        description="Every corrective action on this account, including ones with no due date. Changes are saved to your account, not to this device."
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-app-border bg-app-surface-muted px-3 py-1 text-xs font-black text-app-text">
          {openCount} open
        </span>
        {/* Overdue is named in TEXT, not only tinted — the D-063 rule applied from inception. */}
        <span
          className={overdueCount > 0
            ? "rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-black text-red-800 dark:border-red-400/60 dark:bg-[#4A2932] dark:text-red-50"
            : "rounded-full border border-app-border bg-app-surface-muted px-3 py-1 text-xs font-black text-app-text-muted"}
        >
          {overdueCount} overdue
        </span>
        <AppButton
          type="button"
          size="md"
          variant="secondary"
          className={TOUCH}
          aria-pressed={showClosed}
          onClick={() => setShowClosed((current) => !current)}
        >
          {showClosed ? "Hide closed" : "Show closed"}
        </AppButton>
        <AppButton
          type="button"
          size="md"
          variant="secondary"
          className={TOUCH}
          disabled={state === "loading"}
          onClick={() => void load()}
        >
          {state === "loading" ? "Refreshing…" : "Refresh"}
        </AppButton>
      </div>

      {message && (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800 dark:border-red-400/60 dark:bg-[#4A2932] dark:text-red-50">
          {message}
        </p>
      )}

      {state === "loading" && (
        <p aria-live="polite" className="mt-3 text-sm font-semibold text-app-text-muted">
          Loading corrective actions…
        </p>
      )}

      {state === "error" && (
        <EmptyState
          title="Corrective actions are unavailable"
          description="Nothing local is being shown in their place. Retry when the connection is restored."
          actionLabel="Retry"
          onAction={() => void load()}
        />
      )}

      {state === "ready" && visible.length === 0 && (
        <EmptyState
          title={showClosed ? "No corrective actions" : "No open corrective actions"}
          description={showClosed
            ? "Corrective actions raised from an inspection review appear here."
            : "Nothing is open. Closed actions are still here — use Show closed."}
        />
      )}

      {state === "ready" && visible.length > 0 && (
        <ul className="mt-4 space-y-3">
          {visible.map((action) => {
            const overdue = isOverdue(action);
            const closed = action.lifecycleState === "completed" || action.lifecycleState === "verified";
            const busy = busyId === action.id;
            return (
              <li
                key={action.id}
                className={`rounded-xl border p-3 ${overdue
                  ? "border-red-300 bg-red-50 dark:border-red-400/60 dark:bg-[#3A2129]"
                  : "border-app-border bg-app-surface"}`}
                data-testid="corrective-action-row"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-black text-app-text">{action.title}</h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Status by WORD. A reader who cannot tell the tints apart still reads it. */}
                    <span
                      className="rounded-full border border-app-border bg-app-surface-muted px-2 py-0.5 text-xs font-black text-app-text"
                      data-testid="action-lifecycle-state"
                    >
                      {STATUS_LABEL[action.lifecycleState] || action.lifecycleState}
                    </span>
                    {overdue && (
                      <span className="rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-black text-red-900 dark:border-red-400/60 dark:bg-[#5A2932] dark:text-red-50">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-1 text-xs font-semibold text-app-text-muted">
                  {STATE_DESCRIPTION[action.lifecycleState] || ""}
                </p>

                <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs font-semibold text-app-text-muted sm:grid-cols-2">
                  <div className="flex gap-2">
                    <dt className="font-black">Due</dt>
                    <dd>{formatDueDate(action.dueDateKey)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-black">Priority</dt>
                    <dd>{action.priority}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-black">Assigned to</dt>
                    <dd>{action.assignedToName || "Unassigned"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-black">Reference</dt>
                    <dd>{action.displayId || "—"}</dd>
                  </div>
                  {action.closureNotes && (
                    <div className="flex gap-2 sm:col-span-2">
                      <dt className="font-black">Closure notes</dt>
                      <dd>{action.closureNotes}</dd>
                    </div>
                  )}
                </dl>

                {/* §287 / D-052. Stated where a reader of a closed action will look for it, so the
                    absence of verification is a fact on the screen rather than something they have
                    to notice is missing. */}
                {action.closedWithoutVerification && (
                  <p className="mt-2 rounded-lg border border-app-border bg-app-surface-muted px-2.5 py-1.5 text-xs font-semibold text-app-text-muted">
                    Closed by the person who recorded it. No independent verification or supervisor
                    sign-off has been recorded for this action.
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {!closed && (
                    <>
                      <AppButton
                        type="button"
                        size="md"
                        className={TOUCH}
                        disabled={busy}
                        data-testid="close-action"
                        onClick={() => {
                          setEditingId(null);
                          setClosureNotes("");
                          setClosingId(closingId === action.id ? null : action.id);
                        }}
                      >
                        {closingId === action.id ? "Cancel" : "Close action"}
                      </AppButton>
                      <AppButton
                        type="button"
                        size="md"
                        variant="secondary"
                        className={TOUCH}
                        disabled={busy}
                        data-testid="edit-action"
                        onClick={() => (editingId === action.id ? setEditingId(null) : beginEdit(action))}
                      >
                        {editingId === action.id ? "Cancel edit" : "Edit"}
                      </AppButton>
                    </>
                  )}
                  {closed && (
                    <AppButton
                      type="button"
                      size="md"
                      variant="secondary"
                      className={TOUCH}
                      disabled={busy}
                      data-testid="reopen-action"
                      onClick={() => void reopenAction(action)}
                    >
                      {busy ? "Working…" : "Reopen"}
                    </AppButton>
                  )}
                </div>

                {editingId === action.id && (
                  <div className="mt-3 rounded-lg border border-app-border bg-app-surface-muted p-3" data-testid="action-edit-form">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-app-text-muted">
                          Due date
                        </span>
                        <AppInput
                          type="date"
                          value={draft.dueDate}
                          onChange={(event) => setDraft((d) => ({ ...d, dueDate: event.target.value }))}
                          aria-label="Corrective action due date"
                          className={TOUCH}
                          data-testid="action-due-date"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-app-text-muted">
                          Priority
                        </span>
                        <AppSelect
                          value={draft.priority}
                          onChange={(event) => setDraft((d) => ({ ...d, priority: event.target.value }))}
                          aria-label="Corrective action priority"
                          className={TOUCH}
                        >
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </AppSelect>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-app-text-muted">
                          Assigned to
                        </span>
                        <AppInput
                          value={draft.assignedToName}
                          onChange={(event) => setDraft((d) => ({ ...d, assignedToName: event.target.value }))}
                          placeholder="Responsible person"
                          aria-label="Corrective action responsible person"
                          className={TOUCH}
                        />
                      </label>
                    </div>
                    <div className="mt-3">
                      <AppButton
                        type="button"
                        size="md"
                        className={TOUCH}
                        disabled={busy}
                        data-testid="save-action"
                        onClick={() => void saveEdit(action)}
                      >
                        {busy ? "Saving…" : "Save changes"}
                      </AppButton>
                    </div>
                  </div>
                )}

                {closingId === action.id && (
                  <div className="mt-3 rounded-lg border border-app-border bg-app-surface-muted p-3" data-testid="action-close-form">
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-app-text-muted">
                        What was done (optional)
                      </span>
                      <AppTextarea
                        rows={3}
                        value={closureNotes}
                        onChange={(event) => setClosureNotes(event.target.value)}
                        placeholder="Describe the correction, if you want it on the record."
                        aria-label="Closure notes"
                        data-testid="closure-notes"
                      />
                    </label>
                    {/* §287. Says plainly what closing does and does not claim, BEFORE the press. */}
                    <p className="mt-2 text-xs font-semibold text-app-text-muted">
                      Closing records that this action is done. It does not record an independent
                      verification or a supervisor sign-off. Notes are optional and nothing is added
                      if you leave this blank.
                    </p>
                    <div className="mt-3">
                      <AppButton
                        type="button"
                        size="md"
                        className={TOUCH}
                        disabled={busy}
                        data-testid="confirm-close-action"
                        onClick={() => void closeAction(action)}
                      >
                        {busy ? "Closing…" : "Confirm close"}
                      </AppButton>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* The server caps a page at 100. Saying so beats looking complete. */}
      {state === "ready" && total > actions.length && (
        <p className="mt-3 text-xs font-semibold text-app-text-muted">
          Showing {actions.length} of {total} corrective actions.
        </p>
      )}
    </AppPanel>
  );
}
