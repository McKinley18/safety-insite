"use client";

import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, getAuthUser, setAuthUser } from "@/lib/auth";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import SummaryRow from "@/components/ui/SummaryRow";

type UserProfile = {
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  type?: string;
  organizationId?: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [identityEditing, setIdentityEditing] = useState(false);
  const [status, setStatus] = useState("");

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
    loadUserProfile();
  }, []);

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

  function deleteAccountPreview() {
    setStatus(
      "Account deletion request prepared. Production deletion should require confirmation, re-authentication, and backend account removal.",
    );
  }

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ").trim() || "Sentinel User";

  const planLabel = String(user.type || "basic");

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
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#102A43] text-white shadow-sm transition hover:bg-[#1D72B8]"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null
            }
          />

          {!identityEditing ? (
            <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50">
              <div className="px-3 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
                <SummaryRow label="First Name" value={firstName || "Not provided"} />
              </div>
              <div className="px-3 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
                <SummaryRow label="Last Name" value={lastName || "Not provided"} />
              </div>
              <div className="px-3 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
                <SummaryRow label="Email Address" value={profileEmail || "Not provided"} />
              </div>
              <div className="px-3 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
                <SummaryRow label="Plan" value={planLabel} />
              </div>
              <div className="px-3 py-3 text-xs font-black uppercase tracking-wide text-slate-400">
                <SummaryRow label="Role" value={user.role || "user"} last />
              </div>
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                    First Name
                  </span>
                  <AppInput
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="mt-2"
                  />
                </label>

                <label>
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Last Name
                  </span>
                  <AppInput
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="mt-2"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">
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
          <AppPanel padding="lg">
            <SectionHeader
              eyebrow="Plan Access"
              title={`${planLabel} plan`}
              description="Upgrade or manage your account plan as your safety program grows."
            />

            <div className="mt-4 flex justify-center">
              <AppButton
                type="button"
                variant="accent"
                onClick={() => router.push("/pricing")}
                className="w-44"
              >
                Upgrade Plan
              </AppButton>
            </div>
          </AppPanel>

          <AppPanel padding="lg">
            <SectionHeader
              eyebrow="Session"
              title="Session controls"
              description="Sign out of this device when you are finished using Sentinel Safety."
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
              description="Account deletion should permanently remove personal account access and should require confirmation before completion."
            />

            <div className="mt-4 flex justify-center">
              <AppButton
                type="button"
                variant="danger"
                onClick={deleteAccountPreview}
                className="w-44"
              >
                Delete Account
              </AppButton>
            </div>
          </AppPanel>
        </section>
      </section>
    </section>
  );
}
