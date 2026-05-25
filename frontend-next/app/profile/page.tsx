"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
      const raw = window.localStorage.getItem("sentinel_auth_user");
      const parsed = raw ? JSON.parse(raw) : {};

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
    const raw = window.localStorage.getItem("sentinel_auth_user") || "{}";
    const existing = JSON.parse(raw);

    const updated = {
      ...existing,
      firstName,
      lastName,
      email: profileEmail,
      name: [firstName, lastName].filter(Boolean).join(" ").trim(),
    };

    window.localStorage.setItem("sentinel_auth_user", JSON.stringify(updated));
    setUser(updated);
    setIdentityEditing(false);
    setStatus("Profile updated locally.");
  }

  function cancelAccountIdentityEdit() {
    loadUserProfile();
    setIdentityEditing(false);
  }

  function signOut() {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("sentinel_auth_token");
    window.localStorage.removeItem("sentinel_auth_user");
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
    <section className="space-y-5">
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-center text-white shadow-sm sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          User Profile
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          Personal account.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Manage account details, plan access, sign out, and account-level actions.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
                Account Details
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                {displayName}
              </h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                Review the personal identity details connected to this account.
              </p>
            </div>

            {!identityEditing && (
              <button
                type="button"
                onClick={() => setIdentityEditing(true)}
                className="mx-auto flex w-44 justify-center rounded-xl bg-[#102A43] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#1D72B8] sm:mx-0"
              >
                Edit Account
              </button>
            )}
          </div>

          {!identityEditing ? (
            <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50">
              {[
                ["First Name", firstName || "Not provided"],
                ["Last Name", lastName || "Not provided"],
                ["Email Address", profileEmail || "Not provided"],
                ["Plan", planLabel],
                ["Role", user.role || "user"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 px-3 py-3"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    {label}
                  </p>
                  <p className="text-right text-sm font-black text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                    First Name
                  </span>
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
                  />
                </label>

                <label>
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Last Name
                  </span>
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Email Address
                  </span>
                  <input
                    value={profileEmail}
                    onChange={(event) => setProfileEmail(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={saveAccountIdentity}
                  className="flex w-44 justify-center rounded-xl bg-[#102A43] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#1D72B8]"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={cancelAccountIdentityEdit}
                  className="flex w-44 justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {status && (
            <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-black text-emerald-700">
              {status}
            </p>
          )}
        </section>

        <section className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Plan Access
            </p>
            <h2 className="mt-1 text-xl font-black capitalize text-slate-900">
              {planLabel} plan
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              Upgrade or manage your account plan as your safety program grows.
            </p>

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => router.push("/pricing")}
                className="flex w-44 justify-center rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-black text-black transition hover:bg-[#EA580C]"
              >
                Upgrade Plan
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Account Actions
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              Session and account controls
            </h2>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={signOut}
                className="flex w-44 justify-center rounded-xl bg-[#102A43] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#1D72B8]"
              >
                Sign Out
              </button>

              <button
                type="button"
                onClick={deleteAccountPreview}
                className="flex w-44 justify-center rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-black text-red-700 transition hover:bg-red-100"
              >
                Delete Account
              </button>
            </div>
          </section>
        </section>
      </section>
    </section>
  );
}
