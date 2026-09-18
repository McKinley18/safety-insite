"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppTextLink } from "@/components/ui/AppTextLink";
import { API_BASE_URL } from "@/lib/hazlenzClient";

/**
 * §317 (CPF-2, recovery) — THIS PAGE MAY NOT PROMISE AN EMAIL THE SERVICE CANNOT SEND.
 *
 * ==================== WHAT §317 MEASURED ====================
 *
 * Production sets PASSWORD_RESET_PROVIDER but holds no provider credential (EM-2), so a reset
 * request today does all of this and none of it matters: it mints a token, fails to deliver, and
 * then -- correctly, per §306 -- ROLLS THE TOKEN BACK so no live credential is stranded on an
 * account whose owner never received it. Nothing is written and nothing is sent. The page then
 * told the visitor "If that account exists, password reset instructions will be sent."
 *
 * For an external Beta participant who has forgotten their password that sentence is the whole
 * problem. It is not merely unhelpful; it is the reason they will wait for an email instead of
 * asking for help, and there is no other recovery route in the product. §317 states the rule
 * directly: do not pretend password recovery is operational if email cannot be delivered.
 *
 * ==================== WHY THIS DOES NOT LEAK WHETHER AN ACCOUNT EXISTS ====================
 *
 * The distinction that matters is WHOSE fact is being disclosed. §306 proved byte-identical
 * responses for known, unknown and case-variant addresses, plus a timing comparison, and none of
 * that is touched here: the request, the response and the wording of the generic answer are
 * unchanged, and this page still never learns whether the address it submitted exists.
 *
 * What is disclosed instead is a property of the SERVICE -- whether it can send password-reset
 * email at all -- which is the same answer for every visitor, is account-independent, and is
 * already served publicly by /health/ready. A capability statement that is identical for all
 * callers cannot distinguish one account from another.
 *
 * ==================== AND IT FAILS TOWARDS THE FORM ====================
 *
 * If the capability cannot be read -- the probe fails, the shape changes, the service is mid-
 * deploy -- the page behaves exactly as it did before. A recovery surface must never be withdrawn
 * because a health check did not answer; the cost of wrongly offering the form is a visitor who
 * waits, and the cost of wrongly withdrawing it is a visitor who cannot recover an account that
 * could have recovered itself.
 */
type RecoveryCapability = "UNKNOWN" | "CONFIGURED" | "UNAVAILABLE";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [capability, setCapability] = useState<RecoveryCapability>("UNKNOWN");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // A 503 from readiness still carries the body, so the status is not checked -- only
        // whether the field this page depends on is present and says what it says.
        const response = await fetch(`${API_BASE_URL}/health/ready`);
        const body = await response.json() as { passwordResetEmail?: { state?: string } };
        const state = body?.passwordResetEmail?.state;
        if (!active || typeof state !== "string") return;
        setCapability(state === "CONFIGURED" ? "CONFIGURED" : "UNAVAILABLE");
      } catch {
        // Deliberately leaves UNKNOWN, which renders the form. See the header.
      }
    })();
    return () => { active = false; };
  }, []);

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

          {/*
            * §319. THE HERO WAS STALE AGAINST THE NOTICE §317 PUT ON THE SAME PAGE.
            *
            * §317 stopped the form promising an email the service cannot send, and did it in the
            * form column. The hero still said "Enter your email to start a secure password reset",
            * so the page invited an action three lines above the notice explaining that the action
            * would not reach anyone. Neither half was false on its own; together they contradicted.
            *
            * The hero now reads from the SAME capability the notice reads, so the two cannot drift
            * apart again — and it falls back to the original sentence when the capability is
            * unknown, for the same reason the form does: a recovery surface must never be withdrawn
            * because a health probe did not answer.
            *
            * No email is activated and EM-2 is untouched.
            */}
          <p className="relative mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-300">
            {capability === "UNAVAILABLE"
              ? "Password reset by email is not switched on yet, so this form cannot reach you. If you cannot sign in, contact the person who invited you."
              : "Enter your email to start a secure password reset."}
          </p>

        </div>

        <form onSubmit={submit} className="bg-gradient-to-b from-white to-slate-50/80 p-5 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-md">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Reset your password
            </h2>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {capability === "UNAVAILABLE"
                ? "Password reset by email is not switched on yet."
                : "We’ll send reset instructions to the email connected to your account."}
            </p>

            {capability === "UNAVAILABLE" ? (
              <div
                role="status"
                data-testid="recovery-unavailable"
                className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900"
              >
                <p className="font-black">No reset email can be sent right now.</p>
                <p className="mt-1">
                  Sending is not configured on this service, so submitting this form would not
                  reach you. Nothing is wrong with your account and nothing you have captured is
                  affected.
                </p>
                <p className="mt-2">
                  If you cannot sign in, contact the person who invited you to Safety InSite and
                  they will arrange access. Do not send anyone your password.
                </p>
              </div>
            ) : null}

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
                  disabled={submitting || capability === "UNAVAILABLE"}
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
