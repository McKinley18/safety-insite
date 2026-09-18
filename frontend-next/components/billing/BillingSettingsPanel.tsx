"use client";

import { useEffect, useMemo, useState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  createCheckoutSession,
  createPortalSession,
  getBillingLifecycleCopy,
  getBillingMe,
  getBillingTierDisplayName,
  getBillingTierPrice,
  type BillingResponse,
  type BillingCheckoutTier,
} from "@/lib/billing";

type BillingSettingsPanelProps = {
  className?: string;
  title?: string;
  description?: string;
};

export default function BillingSettingsPanel({
  className = "",
  title = "Billing & plan",
  description = "View your current Safety InSite subscription and manage upgrades.",
}: BillingSettingsPanelProps) {
  const [billing, setBilling] = useState<BillingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<BillingCheckoutTier | "portal" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await getBillingMe();
        if (mounted) {
          setBilling(data);
          setMessage("");
        }
      } catch (error) {
        if (mounted) {
          setBilling(null);
          setMessage(
            error instanceof Error && error.message !== "AUTH_REQUIRED"
              ? error.message
              : "Billing details are not available right now.",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const tier = billing?.tier || "free";
  const tierLabel = getBillingTierDisplayName(tier);
  const tierPrice = getBillingTierPrice(tier);
  const canManage = Boolean(billing?.stripeCustomerId && billing?.billingConfigured);
  /**
   * §317. A PRICE IS A STATEMENT ABOUT WHAT THIS ACCOUNT PAYS, NOT ABOUT WHAT THE TIER COSTS.
   *
   * This rendered the catalogue price for the tier unconditionally, so an account holding Pro
   * through a pilot or support GRANT -- which is how every comped Beta participant would hold it
   * -- was told "$24.99/month" beside a subscription status of `none`, having never paid anything
   * and having no payment method on file. The catalogue price is still shown wherever it is the
   * truth; where the tier came from a grant it is replaced by what the account is actually on.
   */
  const grantedAccess = billing?.tierSource === "grant";
  const lifecycleCopy = useMemo(
    () => getBillingLifecycleCopy(billing || ({ status: "none" } as BillingResponse)),
    [billing],
  );

  const primaryUpgradeTier = useMemo<BillingCheckoutTier | null>(() => {
    if (tier === "free") return "pro";
    return null;
  }, [tier]);

  async function startCheckout(nextTier: BillingCheckoutTier) {
    if (actionLoading) return;

    try {
      setActionLoading(nextTier);
      setMessage("Opening secure checkout...");
      const session = await createCheckoutSession(nextTier);
      if (!session?.url) {
        throw new Error("Billing checkout did not return a URL.");
      }
      window.location.href = session.url;
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Billing checkout could not be started.",
      );
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
      if (!session?.url) {
        throw new Error("Billing portal did not return a URL.");
      }
      window.location.href = session.url;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Billing portal could not be opened.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <AppPanel padding="lg" className={className}>
      <SectionHeader
        eyebrow="Billing"
        title={title}
        description={description}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
            Current plan
          </p>
          <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
            {loading ? "Loading..." : tierLabel}
          </p>
          {/*
            * NO `loading` BRANCH HERE, DELIBERATELY. The tier defaults to `free` before the read
            * lands, so this renders "$0.00/month" during loading -- which is exactly the text the
            * pre-§317 code rendered and exactly what the statically prerendered HTML contains.
            * Adding an empty branch would have introduced a text node that is present on one side
            * of hydration and absent on the other, in a panel whose effect can resolve inside the
            * hydration window. The correction this line exists for is the GRANT case, and it needs
            * no loading branch to make it.
            */}
          <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {grantedAccess
              ? "Included — nothing is billed to this account"
              : `$${tierPrice.toFixed(2)}/month`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
            Subscription status
          </p>
          <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
            {loading ? "Loading..." : lifecycleCopy.statusLabel}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {loading ? "" : lifecycleCopy.renewalLabel}
          </p>
        </div>
      </div>

      {message && (
        <p className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {message}
        </p>
      )}

      {/*
        * §317 (CPF-3 / O-11). The previous sentence named the payment processor and the word
        * "environment" to the customer -- an internal vendor dependency and a deployment concept,
        * neither of which is the customer's to understand or act on. What they need is what is
        * true for them: nothing can be purchased here yet, and nothing they have is affected.
        */}
      {!billing?.billingConfigured && !loading ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          Payment is not available yet, so upgrades and subscription management cannot be opened
          from here. Your plan, your records and everything you have captured are unaffected.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {primaryUpgradeTier ? (
          <AppButton
            type="button"
            variant="accent"
            onClick={() => startCheckout(primaryUpgradeTier)}
            disabled={Boolean(actionLoading) || !billing?.billingConfigured}
            className="min-w-36"
          >
            {actionLoading === primaryUpgradeTier ? "Opening..." : "Upgrade to Pro"}
          </AppButton>
        ) : null}

        <AppButton
          type="button"
          variant="secondary"
          onClick={openPortal}
          disabled={Boolean(actionLoading) || !canManage}
          className="min-w-36"
        >
          {actionLoading === "portal" ? "Opening..." : "Manage Subscription"}
        </AppButton>
      </div>
    </AppPanel>
  );
}
