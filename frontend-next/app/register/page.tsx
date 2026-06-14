"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/safescope";
import { clearAuthSession } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppPanel } from "@/components/ui/AppPanel";
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
  const [name, setName] = useState("");
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

    if (!name.trim() || !email.trim()) {
      setStatusType("error");
      setStatus("Enter your name and email address.");
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
          name: name.trim(),
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
    <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <AppPanel variant="dark" padding="lg" className="rounded-[28px] p-6 text-white shadow-xl shadow-slate-300/40 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-200">
          Sentinel Safety
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Create a secure safety intelligence workspace.
        </h1>
        <p className="mt-4 text-sm font-semibold leading-6 text-slate-300">
          Build inspections, generate SafeScope intelligence, assign corrective actions, and maintain audit-ready safety records.
        </p>

        <div className="mt-6 space-y-3 text-sm font-bold text-slate-200">
          <p>✓ Role-based workspace access</p>
          <p>✓ Secure evidence and inspection workflow</p>
          <p>✓ SafeScope decision-support intelligence</p>
        </div>
      </AppPanel>

      <form onSubmit={handleRegister} className="rounded-[28px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Create an Account</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Create your Sentinel Safety workspace account.
        </p>

        <div className="mt-5 space-y-3">
          <AppInput autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <AppInput autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />

          <div className="relative">
            <AppInput autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type={showPassword ? "text" : "password"} className="pr-20" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#1D72B8]">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <AppInput autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" type={showPassword ? "text" : "password"} />

          <AppInput
            autoComplete="off"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Promo Code"
          />
          <p className="text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
            Enter an approved employer promo code for free Pro access.
          </p>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 text-xs font-bold text-slate-600 dark:text-slate-300">
            <p className="mb-2 font-black text-slate-800">Password Requirements</p>
            <p>{checks.length ? "✓" : "○"} At least 8 characters</p>
            <p>{checks.uppercase ? "✓" : "○"} One uppercase letter</p>
            <p>{checks.lowercase ? "✓" : "○"} One lowercase letter</p>
            <p>{checks.number ? "✓" : "○"} One number</p>
            <p>{checks.special ? "✓" : "○"} One special character</p>
            <p>{passwordsMatch ? "✓" : "○"} Passwords match</p>
          </div>

          <label className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-3 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0"
            />
            <span>
              I understand Sentinel Safety and SafeScope provide decision-support only. Final safety, compliance, and corrective action decisions remain the responsibility of qualified personnel and the user organization.
            </span>
          </label>

          <AppButton type="submit" disabled={loading} fullWidth size="lg">
            {loading ? "Creating..." : "Create Secure Workspace"}
          </AppButton>

          {status && (
            <p className={`rounded-xl p-3 text-sm font-bold ${
              statusType === "error" ? "bg-red-50 text-red-700" :
              statusType === "success" ? "bg-emerald-50 text-emerald-700" :
              "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300"
            }`}>
              {status}
            </p>
          )}

          <AppTextLink href="/login" className="block text-center">
            Sign In Instead
          </AppTextLink>
        </div>
      </form>
    </section>
  );
}
