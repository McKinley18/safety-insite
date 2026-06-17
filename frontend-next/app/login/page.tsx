"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/safescope";
import { apiFetch } from "@/lib/apiFetch";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppTextLink } from "@/components/ui/AppTextLink";
import { isLocalDevAuthBypassEnabled, LOCAL_DEV_AUTH_TOKEN, setAuthSession } from "@/lib/auth";
import { AI_ENGINE_NAME, APP_DESCRIPTION, APP_NAME } from "@/lib/brand";

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

      if (isLocalDevAuthBypassEnabled()) {
        const localUser = {
          firstName: "Christopher",
          lastName: "McKinley",
          name: "Christopher McKinley",
          email: email.trim() || "mckinley.christopherd@gmail.com",
          role: "admin",
          type: "pro",
        };

        setAuthSession(LOCAL_DEV_AUTH_TOKEN, localUser);

        setStatusType("success");
        setStatus("Signed in locally.");
        router.replace("/command-center");
        return;
      }

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
        setAuthSession(data.token, data.user);
      }

      setStatusType("success");
      setStatus("Signed in successfully.");
      router.replace("/command-center");
    } catch {
      setStatusType("error");
      setStatus("Server is waking up. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-150px)] max-w-6xl items-center justify-center px-0 py-0 sm:px-4 sm:py-6">
      <div className="grid w-full overflow-hidden bg-white shadow-none sm:rounded-[32px] sm:border sm:border-slate-200 sm:shadow-2xl sm:shadow-slate-300/40 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0B1320] via-[#102A43] to-[#0B1320] p-5 text-white sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#1D72B8]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <h1 className="relative mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Welcome back.
          </h1>

          <p className="relative mt-4 max-w-xl text-sm font-semibold leading-6 text-slate-300">
            {APP_DESCRIPTION}
          </p>

          <div className="relative mt-5 grid gap-2.5 sm:mt-8 sm:gap-3">
            {[
              "Protected workspace access",
              "Audit-ready safety records",
              `Powered by ${AI_ENGINE_NAME}`,
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-3.5 py-2.5 ring-1 ring-white/10 sm:rounded-2xl sm:px-4 sm:py-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#102A43]">
                  ✓
                </span>
                <span className="text-sm font-black text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="bg-gradient-to-b from-white to-slate-50/80 p-5 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Access GuideGuard
            </h2>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Enter your email and password to continue to GuideGuard.
            </p>

            <div className="mt-5 space-y-4 sm:mt-6">
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
                  className="bg-slate-50 px-3 placeholder:text-slate-500 focus:bg-white"
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
                    className="bg-slate-50 px-3 pr-20 placeholder:text-slate-500 focus:bg-white"
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
                  className="w-full bg-[#1D72B8] px-8 text-white shadow-sm hover:bg-[#0B1320] active:scale-[0.98] sm:w-auto"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </AppButton>
              </div>

              <div className="mt-2 border-t border-slate-200 pt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
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
