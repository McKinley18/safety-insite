"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/hazlenzClient";
import { clearAuthSession } from "@/lib/auth";
import { apiFetch } from "@/lib/apiFetch";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { FREE_PRICE_DISPLAY, PRO_PRICE_DISPLAY } from "@/components/pricing/planData";
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
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro">("free");
  const [promoCode, setPromoCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  /**
   * §291 (SU-1). The agreement the SERVER currently requires, fetched rather than hard-coded.
   * A version compiled into the client goes stale the moment the document is revised, and the
   * server would then refuse every registration from a cached page. Fetching it means the client
   * always asserts the version the server is actually asking for.
   */
  /**
   * §308 (LG-3) — EVERY AGREEMENT THE SERVER REQUIRES, NOT ONE THE CLIENT WAS TOLD TO LOOK FOR.
   *
   * This used to search the list for `appliesTo === "INTERNAL_OWNER_USE"` and send that one. The
   * moment a Terms or Privacy document is published, that client would have gone on sending the
   * acknowledgement alone and every registration would have been refused for a missing acceptance
   * the page did not know existed.
   *
   * So the filter is now `requiredAtRegistration`, which is the server's own answer to "what must
   * be accepted", and the page sends an assertion for each. Publishing a document therefore needs
   * no frontend change at all — which is the §308 property that activation must be content
   * publication rather than another engineering project.
   */
  const [requiredAgreements, setRequiredAgreements] = useState<Array<{
    agreementId: string; version: string; title: string; counselStatus: string;
    requiredAtRegistration: boolean;
  }> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/agreements`, { method: "GET" });
        if (!response.ok) return;
        const data = await response.json();
        const required = (data?.agreements || []).filter(
          (a: any) => a?.requiredAtRegistration === true,
        );
        if (!cancelled) setRequiredAgreements(required);
      } catch {
        // Leave it null. The submit path below refuses rather than guessing a version, so a
        // failed fetch produces an honest "try again" instead of a registration the server will
        // reject for a reason the user cannot act on.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /** The acknowledgement, for the checkbox label. Null until the fetch lands. */
  const acknowledgement = (requiredAgreements || []).find(
    (a) => a.agreementId === "internal-pre-beta-acknowledgement",
  ) ?? null;

  /** The published legal documents among the required set. Empty until counsel approves any. */
  const requiredLegalDocuments = (requiredAgreements || []).filter(
    (a) => a.agreementId.startsWith("legal:"),
  );

  // /pricing sends visitors here as /register?plan=pro. The parameter used to be
  // ignored entirely, so "Choose Pro" landed on a form with Free preselected and the
  // plan selector changed nothing.
  //
  // Read after mount from window.location rather than with useSearchParams(): this
  // page is a single "use client" component, and in a production build a statically
  // rendered client page that calls useSearchParams() without a <Suspense> boundary
  // fails to build ("Missing Suspense boundary with useSearchParams"). Resolving on
  // mount also keeps the first client render identical to the server HTML, which is
  // the same reason the auth-dependent CTAs elsewhere in this app resolve this way.
  useEffect(() => {
    const plan = new URLSearchParams(window.location.search).get("plan");
    if (plan === "pro") setSelectedPlan("pro");
  }, []);

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

    // §291 (SU-1) / §308 (LG-3). Without the server's current requirement list there is nothing
    // truthful to assert, so this refuses rather than sending an acceptance of documents it could
    // not read. `null` means the fetch failed; an EMPTY ARRAY is a legitimate server answer and is
    // not an error — it is what "no legal document has been published yet" looks like.
    if (requiredAgreements === null) {
      setStatusType("error");
      setStatus("The current agreements could not be loaded. Please try again.");
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
          /**
           * §291 (SU-1). The acceptance is TRANSMITTED. It was previously evaluated here and
           * discarded, so the evidential record of consent was a tick in a browser that vanished
           * with the page. The server validates this against its own registry and writes the
           * record itself.
           */
          /*
           * §308. One assertion per required agreement. The server validates each against its own
           * registry and writes the row itself — the client cannot choose a version, cannot invent
           * one, and cannot supply a digest. This list is an assertion of WHAT was accepted, never
           * a record of it.
           */
          acceptedAgreements: requiredAgreements.map((agreement) => ({
            agreementId: agreement.agreementId,
            agreementVersion: agreement.version,
          })),
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
        // §275. Registration is throttled too, and "try again" is the wrong instruction
        // when trying again is exactly what is being refused.
        setStatus(response.status === 429
          ? "Too many attempts from this device. Wait a minute and try again."
          : "Account creation failed. Please try again.");
        return;
      }

      await response.json().catch(() => null);

      setStatusType("success");
      // Public self-registration never grants a paid plan -- the backend always
      // creates the account on Free and Stripe's webhook is what promotes it. Say
      // so, and carry the Pro intent through sign-in so the visitor lands on
      // checkout instead of being left on Free with no prompt.
      setStatus(
        selectedPlan === "pro"
          ? "Account created on Free. Sign in to complete Pro checkout..."
          : "Account created successfully. Redirecting to sign in...",
      );

      clearAuthSession();

      setTimeout(() => {
        router.push(selectedPlan === "pro" ? "/login?plan=pro" : "/login");
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
              Two plans. Pick the one that matches the work.
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-blue-100">
              Free keeps the inspection record. Pro adds the HazLenz AI review, the
              standards, the corrective actions and the reports. You can move up later
              without losing anything you have already captured.
            </p>
          </div>


        </div>

        <form onSubmit={handleRegister} className="bg-gradient-to-b from-white to-slate-50/80 p-5 text-slate-950 sm:p-8 lg:p-10 dark:from-[#07111F] dark:to-[#0B1320] dark:text-white">
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-none dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8] dark:text-[#5DB7FF]">
            Select your plan
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
            Every account is created on Free. Choosing Pro takes you to secure checkout
            after you sign in.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                id: "free" as const,
                name: "Free",
                price: FREE_PRICE_DISPLAY,
                badge: "Start here",
                description: "Keep the record of what you saw.",
                details: "Inspections, sites, observations with photo evidence, saved history, and calendar tasks",
              },
              {
                id: "pro" as const,
                name: "Pro",
                price: `${PRO_PRICE_DISPLAY}/mo`,
                badge: "Full access",
                description: "Turn observations into findings you can defend.",
                details: "HazLenz AI hazard review, suggested MSHA / OSHA standards, findings and risk scoring, corrective-action tracking, and professional reports",
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

                  <span className="mt-3 block border-t border-slate-200 pt-3 text-xs font-black leading-5 text-slate-600 dark:border-white/10 dark:text-slate-300">
                    {plan.details}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/*
          * §317 — EVERY FIELD ON THIS FORM WAS LABELLED ONLY BY ITS PLACEHOLDER.
          *
          * §317's sweep measured all six inputs here -- first name, last name, email, password,
          * confirm password and the promo code -- with no programmatic label of any kind. A
          * placeholder is not a label: it is announced inconsistently, it disappears the moment the
          * field has a value, and it leaves a screen-reader user re-reading a filled form with no
          * way to tell which field is which. This is the FIRST surface a newly invited external
          * participant meets and the only one standing between them and an account, so a screen
          * reader user could not reliably create one.
          *
          * `aria-label` rather than a visible `<label>`, deliberately: the placeholder IS the
          * visible label in this design, and adding a second visible one would change a layout
          * §317 has no authority to redesign. The name given matches the placeholder exactly, so
          * the announced name and the seen name are the same words.
          *
          * The email field also gains `type="email"`, which is the same defect batch 1 recorded on
          * /login as O-14 and which is worse here: a participant who mistypes their own address at
          * REGISTRATION owns an account at an address that does not exist, and password recovery
          * cannot reach them.
          */}
        <div className="mt-5 space-y-3">
          <AppInput
            aria-label="First Name"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
          />

          <AppInput
            aria-label="Last Name"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
          />

          <AppInput
            aria-label="Email"
            type="email"
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
              aria-label="Password"
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
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-xl text-xs font-black text-[#1D72B8] dark:text-[#5DB7FF]"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <AppInput
            aria-label="Confirm Password"
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
                aria-label="Promo Code"
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

          {/* The whole label is the tap target. A bare 16px checkbox is well under the
              44px phones need, and this one gates account creation. `min-h-11` plus the
              label text gives a target the size of the row. */}
          <label className="flex min-h-11 cursor-pointer items-start gap-3 border-t border-slate-200 py-3 text-xs font-semibold leading-5 text-slate-700 dark:border-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#1D72B8]"
            />
            <span>
              I understand Safety InSite and HazLenz AI provide decision-support only. Final safety, compliance, and corrective action decisions remain the responsibility of qualified personnel and the user organization.
              {acknowledgement ? (
                <span className="mt-1 block text-xs opacity-80">
                  {acknowledgement.title} (version {acknowledgement.version}).{" "}
                  {acknowledgement.counselStatus === "NOT_COUNSEL_REVIEWED"
                    ? "This is an internal pre-release acknowledgement and has not been reviewed by legal counsel. It is not the Terms of Service."
                    : null}
                </span>
              ) : null}

              {/*
                §308 (LG-3). NAMED ONLY WHEN THEY EXIST. Today no legal document is published, so
                this renders nothing and the control keeps saying exactly what it is — an internal
                acknowledgement. §308 forbids implying that acceptance against an unapproved
                document is possible, and the honest way to hold that line is for the sentence about
                Terms and Privacy to be ABSENT rather than hedged.

                When counsel approves and a version is activated, each appears here by name and
                version with a link to its published text, and the acceptance the server records
                binds to that exact version and digest.
              */}
              {requiredLegalDocuments.length ? (
                <span className="mt-2 block text-xs opacity-90">
                  By creating an account you accept{" "}
                  {requiredLegalDocuments.map((document, index) => (
                    <React.Fragment key={document.agreementId}>
                      {index > 0 ? (index === requiredLegalDocuments.length - 1 ? " and " : ", ") : null}
                      <a
                        href={document.agreementId === "legal:terms" ? "/terms" : "/privacy"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-black text-[#1D72B8] underline underline-offset-2 dark:text-[#5DB7FF]"
                      >
                        {document.title}
                      </a>{" "}
                      (version {document.version})
                    </React.Fragment>
                  ))}
                  .
                </span>
              ) : null}
            </span>
          </label>

          {/*
            §308 (LG-3). Reachable from registration whether or not anything is published — a
            visitor deciding whether to create an account is exactly who needs to be able to read
            them, and "there is nothing published yet" is itself information they are entitled to.
          */}
          {/*
            * §317. The same treatment /login's action links were given at §281, for the same
            * reason and against the same measurement: these are STANDALONE links rather than words
            * inside a sentence, and they measured 35x14 and 43x14 at 390px -- well under the 44px
            * both mobile platforms publish and under this product's own 36px floor. §308 requires
            * Terms and Privacy to be reachable without authentication from the public account
            * surfaces; a link a thumb cannot land on is not reachable in the sense that requirement
            * means. Only the tap target changes: the text, the placement and the visual size are
            * untouched.
            */}
          <p className="flex flex-wrap items-center justify-center text-center text-xs font-bold text-slate-500 dark:text-slate-400">
            <a href="/terms" className="inline-flex min-h-11 items-center justify-center rounded-xl px-3 hover:text-[#1D72B8] dark:hover:text-[#5DB7FF]">Terms</a>
            <span className="opacity-60">·</span>
            <a href="/privacy" className="inline-flex min-h-11 items-center justify-center rounded-xl px-3 hover:text-[#1D72B8] dark:hover:text-[#5DB7FF]">Privacy</a>
          </p>

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

          <div className="mt-2 flex justify-center border-t border-slate-200 pt-3">
            <AppTextLink href="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl px-3">
              Sign in instead
            </AppTextLink>
          </div>
        </div>
      </form>
      </div>
    </section>
  );
}
