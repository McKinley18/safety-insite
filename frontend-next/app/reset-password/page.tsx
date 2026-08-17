"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/safescope";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppTextLink } from "@/components/ui/AppTextLink";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password-reset/complete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      setMessage(response.ok ? "Password reset successful. You can now sign in." : "This reset link is invalid or expired.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-lg px-4 py-10">
      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl">
        <h1 className="text-3xl font-black text-slate-950">Choose a new password</h1>
        <p className="mt-2 text-sm font-semibold text-slate-600">Use at least eight characters with upper and lower case, a number, and a symbol.</p>
        <AppInput aria-label="New password" name="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-6" />
        <AppButton type="submit" disabled={submitting || token.length < 32} className="mt-5">
          {submitting ? "Resetting…" : "Reset password"}
        </AppButton>
        {message ? <p role="status" className="mt-4 text-sm font-semibold text-slate-700">{message}</p> : null}
        <AppTextLink href="/login" className="mt-5 block">Return to sign in</AppTextLink>
      </form>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center font-semibold">Loading secure reset form…</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
