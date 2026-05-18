"use client";

import PageHeader from "@/components/ui/PageHeader";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
  email?: string;
  role?: string;
  type?: string;
  organizationId?: number;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile>({});
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem("sentinel_auth_user");

      if (raw) {
        const parsed = JSON.parse(raw);

        setUser(parsed);

        if (parsed.name) {
          setFullName(parsed.name);
        }
      }
    } catch {}
  }, []);

  function saveProfile() {
    const updated = {
      ...user,
      name: fullName,
    };

    window.localStorage.setItem(
      "sentinel_auth_user",
      JSON.stringify(updated)
    );

    setUser(updated);

    setStatus("Profile updated locally.");
  }

  function signOut() {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("sentinel_auth_token");
    window.localStorage.removeItem("sentinel_auth_user");

    router.push("/login");
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Personal Account"
        title="Profile & Preferences"
        description="Manage your Sentinel Safety identity, access, and account preferences."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              Account Identity
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {fullName || "Sentinel User"}
            </h2>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              {user.email || "No email available"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#E8F4FF] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#1D72B8]">
              {user.type || "basic"}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-700">
              {user.role || "user"}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Personal Details
          </p>

          <div className="mt-4 space-y-4">
            <label className="space-y-2 block">
              <span className="text-sm font-black text-slate-700">
                Full Name
              </span>

              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-black text-slate-700">
                Email Address
              </span>

              <input
                value={user.email || ""}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
            Security & Access
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="text-sm font-black text-slate-900">
                Account Security
              </h3>

              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                Password reset, MFA, and advanced account security controls
                will be available in a future release.
              </p>
            </div>

            <button
              onClick={signOut}
              className="rounded-xl bg-[#102A43] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1D72B8]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={saveProfile}
          className="rounded-xl bg-[#102A43] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1D72B8]"
        >
          Save Profile
        </button>

        {status && (
          <p className="text-sm font-bold text-emerald-600">
            {status}
          </p>
        )}
      </div>
    </section>
  );
}
