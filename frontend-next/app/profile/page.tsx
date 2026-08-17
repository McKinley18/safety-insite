"use client";

import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHeaders, clearAuthSession, getAuthUser, hasAuthToken, setAuthUser } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/safescope";
import { apiFetch } from "@/lib/apiFetch";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import SummaryRow from "@/components/ui/SummaryRow";
import BillingSettingsPanel from "@/components/billing/BillingSettingsPanel";

type UserProfile = {
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  type?: string;
  subscriptionTier?: string;
  billingTier?: string;
  planCode?: string;
  effectivePlanCode?: string;
  organizationId?: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const [isAuthorized] = useState(() => hasAuthToken());
  const [user, setUser] = useState<UserProfile>({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [identityEditing, setIdentityEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteInFlight, setDeleteInFlight] = useState(false);

  function loadUserProfile() {
    try {
      const parsed = getAuthUser();

      const nameParts = String(parsed.name || "")
        .trim()
        .split(" ")
        .filter(Boolean);

      setUser(parsed);
      setFirstName(parsed.firstName || nameParts[0] || "");
      setLastName(parsed.lastName || nameParts.slice(1).join(" ") || "");
      setProfileEmail(parsed.email || "");
    } catch {
      setUser({});
    }
  }

  useEffect(() => {
    if (!hasAuthToken()) {
      router.replace("/login");
      return;
    }

    loadUserProfile();
  }, [router]);

  function saveAccountIdentity() {
    const existing = getAuthUser();

    const updated = {
      ...existing,
      firstName,
      lastName,
      email: profileEmail,
      name: [firstName, lastName].filter(Boolean).join(" ").trim(),
    };

    setAuthUser(updated);
    setUser(updated);
    setIdentityEditing(false);
    setStatus("Profile updated locally.");
  }

  function cancelAccountIdentityEdit() {
    loadUserProfile();
    setIdentityEditing(false);
  }

  function signOut() {
    clearAuthSession();
    router.push("/login");
  }

  function openDeleteConfirm() {
    setDeleteError("");
    setDeletePassword("");
    setDeleteConfirming(true);
  }

  function cancelDeleteConfirm() {
    setDeleteConfirming(false);
    setDeletePassword("");
    setDeleteError("");
  }

  async function confirmDeleteAccount() {
    if (!deletePassword) {
      setDeleteError("Enter your password to confirm account deletion.");
      return;
    }

    setDeleteInFlight(true);
    setDeleteError("");

    try {
      const response = await apiFetch(`${API_BASE_URL}/auth/me`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!response.ok) {
        let message = "Account deletion failed. Please try again.";
        try {
          const parsed = await response.json();
          if (typeof parsed?.message === "string") message = parsed.message;
        } catch {
          // Non-JSON error body: keep the generic message rather than surfacing raw text.
        }
        setDeleteError(message);
        setDeleteInFlight(false);
        return;
      }

      clearAuthSession();
      router.push("/login?accountDeleted=1");
    } catch {
      setDeleteError("Account deletion failed. Check your connection and try again.");
      setDeleteInFlight(false);
    }
  }

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ").trim() || "Safety InSite User";

  const planLabel = String(
    user.subscriptionTier || user.billingTier || user.planCode || user.type || "free",
  );

  return (
    <section className="sentinel-page-shell space-y-6">
      <HeroPanel align="center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          User Profile
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">
          Personal account.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Manage account details, plan access, sign out, and account-level actions.
        </p>
      </HeroPanel>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <AppPanel padding="md" className="relative">
          <SectionHeader
            eyebrow="Account Details"
            title={displayName}
            description="Review the personal identity details connected to this account."
            action={
              !identityEditing ? (
                <button
                  type="button"
                  onClick={() => setIdentityEditing(true)}
                  aria-label="Edit account details"
                  title="Edit account details"
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[#102A43] shadow-sm transition hover:bg-blue-50 hover:text-[#1D72B8]"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null
            }
          />

          {!identityEditing ? (
            <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-none ring-1 ring-white/70">
              <div className="px-3 py-3 text-xs font-black uppercase tracking-wide text-slate-700">
                <SummaryRow label="First Name" value={firstName || "Not provided"} />
              </div>
              <div className="px-3 py-3 text-xs font-black uppercase tracking-wide text-slate-700">
                <SummaryRow label="Last Name" value={lastName || "Not provided"} />
              </div>
              <div className="px-3 py-3 text-xs font-black uppercase tracking-wide text-slate-700">
                <SummaryRow label="Email Address" value={profileEmail || "Not provided"} />
              </div>
              <div className="px-3 py-3 text-xs font-black uppercase tracking-wide text-slate-700">
                <SummaryRow label="Plan" value={planLabel} last />
              </div>
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-black uppercase tracking-wide text-slate-700">
                    First Name
                  </span>
                  <AppInput
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="mt-2"
                  />
                </label>

                <label>
                  <span className="text-xs font-black uppercase tracking-wide text-slate-700">
                    Last Name
                  </span>
                  <AppInput
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="mt-2"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-700">
                    Email Address
                  </span>
                  <AppInput
                    value={profileEmail}
                    onChange={(event) => setProfileEmail(event.target.value)}
                    className="mt-2"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <AppButton
                  type="button"
                  onClick={saveAccountIdentity}
                  className="w-44"
                >
                  Save Changes
                </AppButton>

                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={cancelAccountIdentityEdit}
                  className="w-44"
                >
                  Cancel
                </AppButton>
              </div>
            </>
          )}

          {status && (
            <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-black text-emerald-700">
              {status}
            </p>
          )}
        </AppPanel>

        <section className="space-y-4">
          <BillingSettingsPanel
            title={`${planLabel} plan`}
            description="Upgrade or manage your account plan as your safety program grows."
          />

          <AppPanel padding="lg">
            <SectionHeader
              eyebrow="Session"
              title="Session controls"
              description="Sign out of this device when you are finished using Safety InSite."
            />

            <div className="mt-4 flex justify-center">
              <AppButton
                type="button"
                onClick={signOut}
                className="w-44 bg-[#102A43] hover:bg-[#1D72B8]"
              >
                Sign Out
              </AppButton>
            </div>
          </AppPanel>

          <AppPanel padding="md" className="border-red-200 bg-red-50">
            <SectionHeader
              eyebrow="Danger Zone"
              title="Delete account"
              description="Permanently removes your login access. This cannot be undone from the app — enter your password to confirm."
            />

            {!deleteConfirming ? (
              <div className="mt-4 flex justify-center">
                <AppButton
                  type="button"
                  variant="danger"
                  onClick={openDeleteConfirm}
                  className="w-44"
                >
                  Delete Account
                </AppButton>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <label>
                  <span className="text-xs font-black uppercase tracking-wide text-slate-700">
                    Confirm your password
                  </span>
                  <AppInput
                    type="password"
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                    className="mt-2"
                    autoFocus
                  />
                </label>

                {deleteError && (
                  <p className="rounded-xl bg-red-100 px-3 py-2 text-center text-xs font-black text-red-700">
                    {deleteError}
                  </p>
                )}

                <div className="flex flex-wrap justify-center gap-2">
                  <AppButton
                    type="button"
                    variant="danger"
                    onClick={confirmDeleteAccount}
                    disabled={deleteInFlight}
                    className="w-44"
                  >
                    {deleteInFlight ? "Deleting..." : "Yes, delete my account"}
                  </AppButton>

                  <AppButton
                    type="button"
                    variant="secondary"
                    onClick={cancelDeleteConfirm}
                    disabled={deleteInFlight}
                    className="w-44"
                  >
                    Cancel
                  </AppButton>
                </div>
              </div>
            )}
          </AppPanel>
        </section>
      </section>
    </section>
  );
}
