"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/safescope";
import { apiFetch } from "@/lib/apiFetch";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppTextLink } from "@/components/ui/AppTextLink";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setStatusType("idle");
      setStatus("");

      const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        setStatusType("error");
        setStatus("Sign in failed. Check your email and password.");
        return;
      }

      const data = await response.json();

      if (data.token) {
        window.localStorage.setItem("sentinel_auth_token", data.token);
        window.localStorage.setItem("token", data.token);
      }

      if (data.user) {
        window.localStorage.setItem(
          "sentinel_auth_user",
          JSON.stringify(data.user),
        );
      }

      setStatusType("success");
      setStatus("Signed in successfully.");
      router.push("/command-center");
    } catch {
      setStatusType("error");
      setStatus("Server is waking up. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-6xl items-center justify-center px-2 py-6">
      <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-[#0B1320] p-6 text-white sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">
            Sentinel Safety
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-5xl">
            Welcome back.
          </h1>

          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-slate-300">
            Access your command center, inspections, reports, corrective actions,
            and SafeScope intelligence from one secure workspace.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              "Protected workspace access",
              "Audit-ready safety records",
              "Operational risk intelligence",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-[#102A43]">
                  ✓
                </span>
                <span className="text-sm font-black text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
              Sign In
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Access your workspace
            </h2>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Enter your email and password to continue.
            </p>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Email
                </span>
                <AppInput
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="bg-slate-50 px-3 placeholder:text-slate-400 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Password
                </span>

                <div className="relative">
                  <AppInput
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    className="bg-slate-50 px-3 pr-20 placeholder:text-slate-400 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#1D72B8]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <div className="flex justify-center">
                <AppButton
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="px-8 shadow-sm active:scale-[0.98]"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </AppButton>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1">
                <AppTextLink href="/register">
                  Create an account
                </AppTextLink>

                <AppTextLink href="/forgot-password" tone="slate">
                  Forgot password?
                </AppTextLink>
              </div>

              {status && (
                <p
                  className={`rounded-xl px-3 py-3 text-sm font-bold leading-5 ${
                    statusType === "error"
                      ? "bg-red-50 text-red-700"
                      : statusType === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-50 text-slate-600"
                  }`}
                >
                  {status}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
