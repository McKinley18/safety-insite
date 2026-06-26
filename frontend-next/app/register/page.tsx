"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/safescope";
import { clearAuthSession } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppTextLink } from "@/components/ui/AppTextLink";

function validatePassword(password: string) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro" | "expert">("free");
  const [promoCode, setPromoCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const checks = validatePassword(password);
  const passwordValid = Object.values(checks).every(Boolean);
  const passwordsMatch = !!password && password === confirmPassword;

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setStatusType("error");
      setStatus("Enter your first name, last name, and email address.");
      return;
    }

    if (!passwordValid) {
      setStatusType("error");
      setStatus("Password does not meet all requirements.");
      return;
    }

    if (!passwordsMatch) {
      setStatusType("error");
      setStatus("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setStatusType("error");
      setStatus("You must accept the user agreement before creating an account.");
      return;
    }

    try {
      setLoading(true);
      setStatusType("idle");
      setStatus("Creating account...");

      const response = await apiFetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          password,
          type: "individual",
          selectedPlan,
          planCode: selectedPlan,
          promoCode: promoCode.trim() || undefined,
        }),
      });

      if (response.status === 409) {
        setStatusType("error");
        setStatus("An account may already exist for this email. Try signing in instead.");
        return;
      }

      if (response.status === 400) {
        const errorData = await response.json().catch(() => null);
        setStatusType("error");
        setStatus(errorData?.message || "Account creation failed. Check your details and try again.");
        return;
      }

      if (!response.ok) {
        setStatusType("error");
        setStatus("Account creation failed. Please try again.");
        return;
      }

      await response.json().catch(() => null);

      setStatusType("success");
      setStatus("Account created successfully. Redirecting to sign in...");

      clearAuthSession();

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setStatusType("error");
      setStatus("Server unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100svh-150px)] max-w-6xl items-center justify-center px-0 py-4 pb-10 sm:px-4 sm:py-6">
      <div className="grid w-full overflow-hidden bg-white text-slate-950 shadow-none sm:rounded-[32px] sm:border sm:border-slate-200 sm:shadow-2xl sm:shadow-slate-300/40 dark:border-white/10 dark:bg-[#07111F] dark:text-white lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0B1320] via-[#102A43] to-[#0B1320] p-5 text-white sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#1D72B8]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-6 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          <div className="relative inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-blue-100 ring-1 ring-white/15">
            Choose your access
          </div>

          <h1 className="relative mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Select a plan.
          </h1>

          <div className="relative mt-4 max-w-xl rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/10">
            <p className="text-sm font-black leading-6 text-white">
              Select the plan that best fits your inspection workflow.
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-blue-100">
              You can start free, choose a paid tier for more HazLenz AI and reporting tools, and upgrade later as your needs grow.
            </p>
          </div>


        </div>

        <form onSubmit={handleRegister} className="bg-gradient-to-b from-white to-slate-50/80 p-5 text-slate-950 sm:p-8 lg:p-10 dark:from-[#07111F] dark:to-[#0B1320] dark:text-white">
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-none dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Select your plan
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
            Choose Free to try the workflow, Pro for regular inspection work, or Expert for deeper HazLenz review and stronger report tools.
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {[
              {
                id: "free" as const,
                name: "Free",
                price: "$0",
                badge: "Start here",
                description: "Try the core workflow.",
                details: "Core inspection capture, basic reports, and limited HazLenz AI reviews",
              },
              {
                id: "pro" as const,
                name: "Pro",
                price: "$6.99/mo",
                badge: "Active use",
                description: "For regular safety inspection work.",
                details: "Expanded HazLenz AI review, professional reports, corrective-action tracking, and saved history",
              },
              {
                id: "expert" as const,
                name: "Expert",
                price: "$11.99/mo",
                badge: "Advanced",
                description: "For deeper review and stronger reporting.",
                details: "Advanced HazLenz reasoning, enhanced report packages, larger evidence history, and custom report branding",
              },
            ].map((plan) => {
              const active = selectedPlan === plan.id;

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={[
                    "rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-[#1D72B8] bg-blue-50 ring-4 ring-blue-100 dark:border-blue-300 dark:bg-blue-950/30 dark:ring-blue-900/40"
                      : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-lg font-black text-slate-950 dark:text-white">
                        {plan.name}
                      </span>
                      <span className="mt-0.5 block text-xs font-black text-[#1D72B8] dark:text-blue-200">
                        {plan.price}
                      </span>
                    </span>
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide",
                        active
                          ? "bg-[#1D72B8] text-white"
                          : "bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10",
                      ].join(" ")}
                    >
                      {plan.badge}
                    </span>
                  </span>

                  <span className="mt-2 block text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                    {plan.description}
                  </span>

                  <span className="mt-3 block border-t border-slate-200 pt-3 text-xs font-black leading-5 text-slate-500 dark:border-white/10 dark:text-slate-300">
                    {plan.details}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <AppInput
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
          />

          <AppInput
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
          />

          <AppInput
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <details className="group text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-black text-[#1D72B8] dark:text-[#5DB7FF]">
              Password requirements
              <span className="transition group-open:rotate-180">⌄</span>
            </summary>
            <div className="mt-2 space-y-1 pl-1 text-slate-700 dark:text-slate-200">
              <p>{checks.length ? "✓" : "○"} At least 8 characters</p>
              <p>{checks.uppercase ? "✓" : "○"} One uppercase letter</p>
              <p>{checks.lowercase ? "✓" : "○"} One lowercase letter</p>
              <p>{checks.number ? "✓" : "○"} One number</p>
              <p>{checks.special ? "✓" : "○"} One special character</p>
            </div>
          </details>

          <div className="relative">
            <AppInput
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              className="pr-20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#1D72B8]"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <AppInput
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            type={showPassword ? "text" : "password"}
          />

          <details className="group text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-black text-slate-600 hover:text-[#1D72B8] dark:text-slate-300 dark:hover:text-[#5DB7FF]">
              Have an employer promo code?
              <span className="transition group-open:rotate-180">⌄</span>
            </summary>
            <div className="mt-2 space-y-2">
              <AppInput
                autoComplete="off"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo Code"
              />
              <p>
                Optional. Use an approved access code if one was provided.
              </p>
            </div>
          </details>

          <label className="flex gap-3 border-t border-slate-200 pt-3 text-xs font-semibold leading-5 text-slate-700 dark:border-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0"
            />
            <span>
              I understand Safety InSite and HazLenz AI provide decision-support only. Final safety, compliance, and corrective action decisions remain the responsibility of qualified personnel and the user organization.
            </span>
          </label>

          <div className="flex justify-center pt-1">
            <AppButton type="submit" disabled={loading} size="md" className="min-h-11 bg-[#1D72B8] px-6 text-sm text-white shadow-sm shadow-blue-900/20 hover:bg-[#0B1320] active:scale-[0.98]">
            {loading ? "Creating..." : "Create account"}
          </AppButton>
          </div>

          {status && (
            <p className={`rounded-xl p-3 text-sm font-bold ${
              statusType === "error" ? "bg-red-50 text-red-700" :
              statusType === "success" ? "bg-emerald-50 text-emerald-700" :
              "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200"
            }`}>
              {status}
            </p>
          )}

          <div className="mt-2 border-t border-slate-200 pt-4 text-center">
            <AppTextLink href="/login" className="block">
            Sign in instead
            </AppTextLink>
          </div>
        </div>
      </form>
      </div>
    </section>
  );
}
