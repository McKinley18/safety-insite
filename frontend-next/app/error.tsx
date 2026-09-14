"use client";

import { useEffect } from "react";

import SystemStatePanel from "@/components/system/SystemStatePanel";
import { AppButton } from "@/components/ui/AppButton";
import { AppLinkButton } from "@/components/ui/AppLinkButton";

/**
 * §280 (D-034) — THE APPLICATION ERROR BOUNDARY.
 *
 * Safety InSite had no `error.tsx` at any level. An uncaught render error anywhere in the product
 * fell through to the framework's own screen, which in production says almost nothing and does not
 * look like Safety InSite at all. An inspector standing in a plant would have had no way to tell a
 * bug from a broken account.
 *
 * WHAT IT PROMISES, AND WHAT IT REFUSES TO PROMISE. Anything already saved to Safety InSite is on
 * the server and is unaffected by a client render error — that is a fact, and it is stated. What
 * this screen does NOT say is that the user's unsaved typing survived, because this boundary
 * cannot know: it is remounting the tree that held it. D-035 is what actually protects that work;
 * a reassurance printed here would be a guess in the product's voice at the exact moment someone
 * is deciding whether to trust it.
 *
 * `unstable_retry()` re-fetches and re-renders the boundary's children — the right first action,
 * because a transient failure recovers without losing the client's state. `reset()` is deliberately
 * not used: it re-renders without re-fetching, which for a data-driven surface usually reproduces
 * the same error.
 *
 * The `digest` is shown because it is the only identifier a support conversation can use, and it
 * is presented as a reference rather than as something to interpret. `error.message` is NOT
 * rendered: Next serialises the real message to the client in development only, so showing it
 * would be honest locally and empty in production — a field that is blank exactly where it matters.
 */
export default function ApplicationError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // The product has no error-reporting service wired up. This at least puts the real error in
    // the one place a support session can reach it -- and states plainly that it goes nowhere else.
    console.error("[Safety InSite] unhandled application error", error);
  }, [error]);

  return (
    <SystemStatePanel
      eyebrow="Application error"
      title="Something went wrong"
      tone="error"
      role="alert"
      body={
        <>
          <p>
            Safety InSite could not finish loading this screen. Trying again often resolves it; if
            it does not, the dashboard is still reachable.
          </p>
          <p>
            Inspections, observations, findings and reports already saved to Safety InSite are held
            on the server and are not affected by this.
          </p>
        </>
      }
      actions={
        <>
          <AppButton type="button" variant="primary" size="lg" onClick={() => unstable_retry()}>
            Try again
          </AppButton>
          <AppLinkButton href="/command-center" variant="secondary" size="lg">
            Go to dashboard
          </AppLinkButton>
        </>
      }
      detail={
        error.digest ? (
          <p>
            Reference for support: <span className="font-mono">{error.digest}</span>
          </p>
        ) : null
      }
    />
  );
}
