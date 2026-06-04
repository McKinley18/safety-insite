"use client";

import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppPanel } from "@/components/ui/AppPanel";
import { AppTextLink } from "@/components/ui/AppTextLink";

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto max-w-md space-y-5">
      <AppPanel as="div" padding="lg" className="border-0 p-6 sm:p-6">
        <h1 className="text-3xl font-black text-slate-900">Reset Password</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Enter your email and we will prepare the password reset flow.
        </p>

        <div className="mt-5 space-y-3">
          <AppInput placeholder="Email" />

          <AppButton fullWidth size="lg">
            Continue
          </AppButton>

          <AppTextLink href="/login" className="block text-center">
            Return to Sign In
          </AppTextLink>
        </div>
      </AppPanel>
    </section>
  );
}
