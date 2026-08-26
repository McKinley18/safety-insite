"use client";

// IN-PRODUCT CONVERSION SURFACE.
//
// This is NOT /pricing. The person reading it is already signed in, already knows
// what Safety InSite does, and has almost certainly just been refused something on
// Free. So it does not re-explain the product, does not re-teach the workflow, and
// does not lay out a thirteen-row feature matrix: it states where they are, what
// Pro unlocks, what it costs, and gives one button. Anyone who wants the full
// comparison gets a link to /pricing.
//
// Plan facts come from components/pricing/planData so this page and /pricing can
// never quote different prices or different claims.
//
// If the account is already Pro, this stops selling. It shows plan state and the
// subscription-management action instead.

import { useEffect, useState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { AppTextLink } from "@/components/ui/AppTextLink";
import {
  FREE_LIMITATIONS,
  PRO_HEADLINE_BENEFITS,
  PRO_PRICE_CADENCE,
  PRO_PRICE_DISPLAY,
} from "@/components/pricing/planData";
import {
  createCheckoutSession,
  createPortalSession,
  getBillingMe,
  hasPaidAccess,
  type BillingResponse,
} from "@/lib/billing";

const emptyBilling: BillingResponse = {
  tier: "free",
  status: "none",
  currentPeriodStart: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripePriceId: null,
  entitlements: {},
};

function formatDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function UpgradeContent() {
  const [billing, setBilling] = useState<BillingResponse | null>(null);
  const [actionLoading, setActionLoading] = useState<"pro" | "portal" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    getBillingMe()
      .then((data) => {
        if (mounted) setBilling(data);
      })
      .catch((error) => {
        if (!mounted) return;
        setMessage(
          error instanceof Error && error.message !== "AUTH_REQUIRED"
            ? error.message
            : "Sign in to manage your plan.",
        );
      });
    return () => {
      mounted = false;
    };
  }, []);

  const resolved = billing || emptyBilling;
  const isPro = hasPaidAccess(resolved);
  // Until the billing response lands, the page knows nothing -- and defaulting to the
  // Free branch means a paying customer is served "Upgrade to Pro" for the duration of
  // one fetch. `billing` starts null on the server and on the first client render, so
  // rendering a placeholder here is also what keeps hydration consistent.
  const planResolved = billing !== null || Boolean(message);
  const canManage = Boolean(resolved.stripeCustomerId && resolved.billingConfigured);
  const renews = formatDate(resolved.currentPeriodEnd);

  async function startCheckout() {
    if (actionLoading) return;
    try {
      setActionLoading("pro");
      setMessage("Opening secure checkout...");
      const session = await createCheckoutSession("pro");
      if (!session?.url) throw new Error("Billing checkout did not return a URL.");
      window.location.href = session.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Billing checkout could not be started.");
    } finally {
      setActionLoading(null);
    }
  }

  async function openPortal() {
    if (actionLoading) return;
    try {
      setActionLoading("portal");
      setMessage("Opening customer portal...");
      const session = await createPortalSession();
      if (!session?.url) throw new Error("Billing portal did not return a URL.");
      window.location.href = session.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Billing portal could not be opened.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-4 px-1 pb-4">
      {/* Current plan first: this page's reader wants to know where they stand. */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Current plan
          </span>
          <span
            className={[
              "rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide",
              !planResolved
                ? "bg-slate-100 text-slate-400"
                : isPro
                  ? "bg-[#E8F4FF] text-[#1D72B8]"
                  : "bg-slate-100 text-slate-600",
            ].join(" ")}
          >
            {!planResolved ? "…" : isPro ? "Pro" : "Free"}
          </span>
        </div>

        {!planResolved ? (
          <div aria-live="polite" className="mt-3">
            <div className="h-7 w-3/4 animate-pulse rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />
            <p className="sr-only">Checking your plan…</p>
          </div>
        ) : isPro ? (
          <>
            <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
              You have full access to Safety InSite Pro.
            </h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              HazLenz AI review, standards suggestions, findings, corrective actions and
              reports are all enabled on this account.
              {renews ? ` Your plan renews ${renews}.` : ""}
              {resolved.cancelAtPeriodEnd
                ? " Your subscription is set to end at the close of the current period."
                : ""}
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
              Upgrade to Safety InSite Pro
            </h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              Free keeps your inspection and observation records. Pro is what turns those
              observations into findings you can stand behind.
            </p>

            <div className="mt-4 flex items-end gap-1.5">
              <span className="text-4xl font-black tracking-tight text-slate-950">
                {PRO_PRICE_DISPLAY}
              </span>
              <span className="pb-1.5 text-sm font-black text-slate-500">{PRO_PRICE_CADENCE}</span>
            </div>
          </>
        )}

        {message && (
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
            {message}
          </p>
        )}

        {!planResolved ? null : isPro ? (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <AppButton
              type="button"
              onClick={openPortal}
              disabled={Boolean(actionLoading) || !canManage}
              className="min-h-12 w-full rounded-2xl bg-[#102A43] hover:bg-[#1D72B8] sm:w-auto sm:px-6"
            >
              {actionLoading === "portal" ? "Opening..." : "Manage subscription"}
            </AppButton>

            <AppTextLink
              href="/command-center"
              tone="button"
            className="flex min-h-12 no-underline w-full items-center justify-center rounded-2xl bg-white px-6 text-sm font-black !text-[#102A43] ring-1 ring-slate-200 hover:bg-slate-50 sm:w-auto"
            >
              Back to work
            </AppTextLink>
          </div>
        ) : (
          <div className="mt-5">
            <AppButton
              type="button"
              onClick={startCheckout}
              disabled={Boolean(actionLoading) || !resolved.billingConfigured}
              className="min-h-12 w-full rounded-2xl bg-[#102A43] text-base hover:bg-[#1D72B8]"
            >
              {actionLoading === "pro" ? "Opening..." : `Upgrade to Pro — ${PRO_PRICE_DISPLAY}${PRO_PRICE_CADENCE}`}
            </AppButton>

            <p className="mt-3 text-center text-xs font-bold leading-5 text-slate-500">
              Billed monthly. Manage or cancel from your billing portal at any time.
            </p>

            {!resolved.billingConfigured && (
              <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-900 ring-1 ring-amber-200">
                Checkout is not available on this environment yet. Your account and records
                are unaffected.
              </p>
            )}
          </div>
        )}
      </div>

      {/* The case for the price -- four items, not a matrix. Hidden once already Pro. */}
      {planResolved && !isPro && (
        <>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-black tracking-tight text-slate-950 sm:text-lg">
              What Pro unlocks
            </h2>

            <ul className="mt-3 space-y-3">
              {PRO_HEADLINE_BENEFITS.map((benefit) => (
                <li key={benefit.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F4FF] text-[11px] font-black text-[#1D72B8]">
                    ✓
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-slate-950">{benefit.title}</span>
                    <span className="mt-0.5 block text-xs font-semibold leading-5 text-slate-600 sm:text-sm">
                      {benefit.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-black tracking-tight text-slate-950 sm:text-lg">
              What you are hitting on Free
            </h2>

            <ul className="mt-3 space-y-2">
              {FREE_LIMITATIONS.map((limit) => (
                <li
                  key={limit}
                  className="flex gap-2 text-sm font-semibold leading-5 text-slate-700"
                >
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-black text-slate-600">
                    —
                  </span>
                  <span className="min-w-0">{limit}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-xs font-bold leading-5 text-slate-500">
              Your existing inspections, observations, photos and calendar tasks stay exactly
              as they are on either plan.
            </p>
          </div>
        </>
      )}

      {/* slate-500 measured 4.39:1 against this page background -- under AA for normal
          text by a hair. slate-600 measures 6.98:1. */}
      <p className="px-2 text-center text-xs font-bold leading-5 text-slate-600">
        Want the full side-by-side?{" "}
        <AppTextLink href="/pricing" className="text-xs underline">
          See the complete plan comparison
        </AppTextLink>
      </p>
    </section>
  );
}
