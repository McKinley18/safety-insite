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
          type: "company",
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
    <section className="mx-auto flex min-h-[calc(100dvh-150px)] max-w-6xl items-center justify-center px-0 py-0 sm:px-4 sm:py-6">
      <div className="grid w-full overflow-hidden bg-white shadow-none sm:rounded-[32px] sm:border sm:border-slate-200 sm:shadow-2xl sm:shadow-slate-300/40 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0B1320] via-[#102A43] to-[#0B1320] p-5 text-white sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#1D72B8]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-6 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          <div className="relative inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-blue-100 ring-1 ring-white/15">
            Secure onboarding
          </div>

          <h1 className="relative mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Create your Safety InSite account.
          </h1>

          <p className="relative mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-300 sm:mt-4">
            Start an inspection-first hub for inspections, corrective actions, audit-ready records, and HazLenz AI decision support.
          </p>

          <div className="relative mt-5 grid gap-2.5 sm:mt-8 sm:gap-3">
            {[
              "Inspection and report records",
              "Secure inspection evidence",
              "HazLenz AI intelligence support",
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

        <form onSubmit={handleRegister} className="bg-gradient-to-b from-white to-slate-50/80 p-5 sm:p-8 lg:p-10">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Create an Account</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Create your Safety InSite account.
        </p>

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

          <details className="group text-xs font-semibold leading-5 text-slate-500">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-black text-[#1D72B8]">
              Password requirements
              <span className="transition group-open:rotate-180">⌄</span>
            </summary>
            <div className="mt-2 space-y-1 pl-1 text-slate-600">
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

          <details className="group text-xs font-semibold leading-5 text-slate-500">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-black text-slate-500 hover:text-[#1D72B8]">
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

          <label className="flex gap-3 border-t border-slate-200 pt-3 text-xs font-semibold leading-5 text-slate-600">
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
            {loading ? "Creating..." : "Create Secure Account"}
          </AppButton>
          </div>

          {status && (
            <p className={`rounded-xl p-3 text-sm font-bold ${
              statusType === "error" ? "bg-red-50 text-red-700" :
              statusType === "success" ? "bg-emerald-50 text-emerald-700" :
              "bg-slate-50 text-slate-600"
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
