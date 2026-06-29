"use client";

import { useEffect, useMemo, useState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { AppPanel } from "@/components/ui/AppPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  createCheckoutSession,
  createPortalSession,
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

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Not available";
  return date.toLocaleDateString();
}

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

  const primaryUpgradeTier = useMemo<BillingCheckoutTier | null>(() => {
    if (tier === "free") return "pro";
    if (tier === "pro") return "expert";
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
          <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            ${tierPrice.toFixed(2)}/month
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
            Subscription status
          </p>
          <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
            {loading ? "Loading..." : (billing?.status || "none")}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {billing?.cancelAtPeriodEnd
              ? `Ends ${formatDate(billing?.currentPeriodEnd)}`
              : `Renewal ${formatDate(billing?.currentPeriodEnd)}`}
          </p>
        </div>
      </div>

      {message && (
        <p className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {message}
        </p>
      )}

      {!billing?.billingConfigured && !loading ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          Billing is not configured on this environment yet. Plan details still load, but checkout and portal actions are unavailable until the Stripe environment is set.
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
            {actionLoading === primaryUpgradeTier ? "Opening..." : `Upgrade to ${primaryUpgradeTier === "pro" ? "Pro" : "Expert"}`}
          </AppButton>
        ) : null}

        {tier === "free" ? (
          <AppButton
            type="button"
            variant="secondary"
            onClick={() => startCheckout("expert")}
            disabled={Boolean(actionLoading) || !billing?.billingConfigured}
            className="min-w-36"
          >
            {actionLoading === "expert" ? "Opening..." : "Compare Expert"}
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
