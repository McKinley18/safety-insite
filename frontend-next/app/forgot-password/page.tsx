"use client";

import { FormEvent, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppTextLink } from "@/components/ui/AppTextLink";
import { API_BASE_URL } from "@/lib/safescope";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API_BASE_URL}/auth/password-reset/request`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setMessage("If that account exists, password reset instructions will be sent.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-4xl items-start justify-center px-0 py-3 sm:px-4 sm:py-5">
      <div className="grid w-full overflow-hidden bg-white shadow-none sm:rounded-[28px] sm:border sm:border-slate-200 sm:shadow-2xl sm:shadow-slate-300/40 md:grid-cols-[0.85fr_1.15fr]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0B1320] via-[#102A43] to-[#0B1320] p-5 text-white sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#1D72B8]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-6 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          <div className="relative inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-blue-100 ring-1 ring-white/15">
            Account recovery
          </div>

          <h1 className="relative mt-4 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
            Reset access.
          </h1>

          <p className="relative mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-300">
            Enter your email to start a secure password reset.
          </p>

        </div>

        <form onSubmit={submit} className="bg-gradient-to-b from-white to-slate-50/80 p-5 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-md">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Reset your password
            </h2>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              We’ll send reset instructions to the email connected to your account.
            </p>

            <div className="mt-5 space-y-4 sm:mt-6">
              <AppInput
                aria-label="Email address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                inputMode="email"
                placeholder="Email address"
                className="bg-slate-50 px-3 placeholder:text-slate-500 focus:bg-white"
              />

              <div className="flex justify-center pt-1">
                <AppButton
                  type="submit"
                  disabled={submitting}
                  size="md"
                  className="min-h-11 bg-[#1D72B8] px-6 text-sm text-white shadow-sm shadow-blue-900/20 hover:bg-[#0B1320] active:scale-[0.98]"
                >
                  {submitting ? "Sending…" : "Send reset link"}
                </AppButton>
              </div>
              {message ? <p role="status" className="text-center text-sm font-semibold text-slate-600">{message}</p> : null}

              <div className="mt-2 flex justify-center border-t border-slate-200 pt-3">
                <AppTextLink href="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl px-3">
                  Return to sign in
                </AppTextLink>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
