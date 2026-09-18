"use client";

import { useEffect, useState } from "react";
import React from "react";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { hasAuthToken } from "@/lib/auth";

/**
 * §319 — THE ENGINE PAGE, ALIGNED TO THE §318 EVIDENCE BOUNDARY.
 *
 * ==================== WHY THIS PAGE WAS THE PROBLEM ====================
 *
 * §318 audited 38 rendered surfaces and found five statements that exceed the evidence. FOUR OF
 * THEM WERE HERE, which is not a coincidence: this is the page that explains the engine, so it is
 * the page most able to overstate it.
 *
 *   "Every finding includes a full visual and step-by-step AI Reasoning Trace" — the string
 *   "Reasoning Trace" appeared in the entire frontend exactly once: in that sentence. No such
 *   surface exists. §319 describes the traceability that DOES exist rather than building a surface
 *   to make a sentence true.
 *
 *   "Autonomously identifies…" — the project's own CLAIMS-GUARDRAILS.md prohibits "autonomous",
 *   and this was its only live use, attached to the one feature whose whole purpose is to STOP AND
 *   ASK A PERSON.
 *
 *   "To support repeatable validation and reasoning consistency…" — refuted by §158's own
 *   measurement: two executions of byte-identical verifier input returned different verdicts.
 *
 *   "Matches structured observations against APPROVED … regulatory frameworks" — citation
 *   selection is code-resident and corpus-independent (KG-3F). This described a corpus operation
 *   the product does not perform.
 *
 * ==================== WHAT THE STRUCTURE NOW HAS TO DO ====================
 *
 * §319 requires this page to distinguish HazLenz overall, the deterministic/governed engine, the
 * Expert layer, the provider contribution, human confirmation, and the known limitations — because
 * a reader who cannot tell those apart cannot tell which of them a given sentence is about. The
 * flat feature list could not carry that distinction, so the sections are grouped and each group
 * says which part of the system it describes.
 *
 * THE SINGLE MOST IMPORTANT FACT THIS PAGE NOW STATES: the deterministic engine reaches a finding,
 * a citation, a risk band and a corrective action WITHOUT the AI provider, and that is the path
 * every analysis takes. §317 proved it on a database containing nothing but migrations and with no
 * provider credential present.
 */
type Group = {
  eyebrow: string;
  heading: string;
  intro?: string;
  sections: { title: string; body: string }[];
};

const groups: Group[] = [
  {
    eyebrow: "The engine that runs every time",
    heading: "Governed analysis, without the AI",
    intro:
      "This is the part of HazLenz that runs on every observation. It is deterministic and it is ours: "
      + "governed rules, a governed regulatory knowledge base, and an evidence model. It reaches a "
      + "finding, a suggested standard, a risk band and a corrective action whether or not any AI "
      + "provider answers at all.",
    sections: [
      {
        title: "Structured observation understanding",
        body: "Processes natural-language safety observations into structured detail — equipment category, components in use, active worker tasks, exposure pathways, energy sources and control-related facts — for the hazard families the governed knowledge base covers.",
      },
      {
        title: "Hazard pattern recognition",
        body: "Recognises hazard patterns and terminology in free-text observations. Where a single observation describes more than one hazard, it can separate them into independently tracked findings rather than folding them into one general note.",
      },
      {
        title: "Standards-informed suggestion",
        // §319 (CM-1 finding 5). Was: "Matches structured observations against APPROVED MSHA and
        // OSHA regulatory frameworks". Selection is governed rules in code and does not consult the
        // corpus; the corpus supplies the regulatory TEXT and its review state. The sentence now
        // describes the mechanism that exists, and keeps the half that was always right.
        body: "Applies governed applicability rules to the observation to suggest potentially applicable MSHA and OSHA (General Industry and Construction) standards for qualified review. It shows how confident it is and whether the regulatory text for each citation has completed source review. It does not decide which standard legally applies.",
      },
      {
        title: "Evidence gap detection",
        // §319 (CM-1 finding 2). "Autonomously" removed. The capability is real; the adverb was the
        // claim, and it was the wrong one for a feature that exists to ask a person.
        body: "Identifies missing or ambiguous facts — worker proximity, equipment operational state, control status — and raises them as questions to settle before a finding is finalised. When a fact it depends on is unresolved, it says so and lowers its own confidence rather than assuming an answer.",
      },
      {
        title: "Advisory corrective action support",
        body: "Proposes a layered action plan for each finding, structured on the hierarchy of controls — an immediate containment step, a permanent correction, and a verification step — with the wording matched to the hazard family where a specific control is established. Every action is advisory and requires qualified review.",
      },
      {
        title: "Recorded basis for every finding",
        // §319 (CM-1 finding 1). Was: "Every finding includes a full visual and step-by-step AI
        // Reasoning Trace." No such surface exists anywhere in the product. This describes what a
        // reviewer can actually open today, and nothing more.
        body: "Each finding records the facts HazLenz used and where each one came from — your observation text, your confirmation, or the inspection's regulatory context — the passage it flagged from, why a standard was or was not supported, and what the conclusion does not cover. The generated report carries the same basis, so a reviewer can evaluate the finding rather than take it on trust.",
      },
    ],
  },
  {
    eyebrow: "The optional second opinion",
    heading: "HazLenz Expert, and the third-party model behind it",
    intro:
      "Expert review is a separate, optional layer on a single observation. It is where the AI in "
      + "\u201cHazLenz AI\u201d actually is, and it is worth being precise about what that means.",
    sections: [
      {
        title: "What the provider does",
        // §319 / §318 disclosure accessibility. The AI provider disclosure previously existed only
        // as an internal document reachable from no customer surface. Its substance is stated here,
        // on the page a customer reads to understand the engine.
        body: "The semantic reasoning in an Expert review is performed by a hosted third-party AI model operated by Anthropic. We did not build, train or host that model. When you request an Expert review, the text of your observation and its analysis context are sent to that provider. Photographs and attached documents are not.",
      },
      {
        title: "What the provider cannot do",
        body: "It cannot finalise a finding, certify anything as safe, or decide whether its own answer is admissible. Every response is checked against our rules by our code, and one that does not satisfy them is refused rather than repaired. The deterministic analysis above is unaffected by whether the provider answers.",
      },
      {
        title: "Availability",
        // §319. HZ-11's numerical ceiling is NOT disclosed here -- that decision is the product
        // owner's and is explicitly out of scope. This sentence exists so the page does not imply
        // unlimited availability, and so there is a place for the number when it is decided.
        body: "Expert review is available on Pro and is subject to usage limits during the Beta. Your deterministic HazLenz analysis is unaffected when Expert review is unavailable.",
      },
    ],
  },
  {
    eyebrow: "Where the decision sits",
    heading: "A person decides, every time",
    sections: [
      {
        title: "Human confirmation",
        body: "HazLenz never auto-finalises a finding. A qualified person reviews it, settles any fact the engine could not establish, sets the risk, confirms the corrective action, and decides whether the finding stands. Where a person settles a fact, the record says so and names which fact it was.",
      },
      {
        title: "Human-in-the-loop governance",
        body: "HazLenz is decision support. It does not declare violations, create official citations, determine compliance, or replace qualified safety professionals. Final safety, compliance and corrective-action decisions remain with you and your organisation.",
      },
    ],
  },
  {
    eyebrow: "Read this before you rely on it",
    heading: "What HazLenz does not do",
    intro:
      "Stated plainly, because these are the limits a safety professional needs in order to judge "
      + "the rest of the page.",
    sections: [
      {
        title: "It does not find every hazard",
        body: "Coverage is bounded to the hazard families the governed knowledge base establishes. A condition outside those families may not be proposed at all — this is deliberate, because a hazard asserted without a governed basis would be worse than one left to the inspector. You can always add a finding HazLenz did not identify; it is recorded as identified by you.",
      },
      {
        title: "It does not determine legal applicability",
        body: "A suggested standard is a candidate for review, not a determination that the provision governs your workplace. Applicability depends on facts, jurisdiction, and the current authoritative source — including facts the system was never given.",
      },
      {
        title: "No accuracy rate is claimed",
        // §319 (CM-1 finding 3). Was: "To support repeatable validation and reasoning consistency,
        // …". §158 measured different verdicts on byte-identical input, so "consistency" and
        // "repeatable" are refuted by our own evidence. The benchmark is real and is described as
        // what it is; the claim it was carrying is removed rather than softened.
        body: "An automated multi-scenario benchmark exercises the deterministic engine's observation understanding during development. It is a development instrument, not a measured product accuracy rate, and we do not publish one. The Expert layer's answers are not guaranteed to be identical between runs on identical input.",
      },
    ],
  },
];


export default function HazLenzPage() {
  // hasAuthToken() reads localStorage, so it is always false during SSR but true for a
  // signed-in visitor on the client. Seeding useState with it made the server and the
  // first client render disagree about which CTA to show, which React reports as
  // hydration error #418 and repairs by throwing away and re-rendering the subtree.
  // Resolving after mount keeps the first client render identical to the server HTML.
  const [isSignedIn, setIsSignedIn] = useState(false);
  useEffect(() => {
    setIsSignedIn(hasAuthToken());
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-4 py-4 sm:px-5 lg:py-7">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-[#1D72B8]/10 blur-3xl" />

        <div className="relative border-b border-slate-200/80 pb-6 sm:pb-8">
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,#0B1320_0%,#102A43_52%,#0B1320_100%)] p-5 text-white shadow-none sm:p-7 lg:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#1D72B8]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <div className="relative grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">
                  Safety intelligence reimagined
                </p>

                <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-5xl">
                  HazLenz AI.
                </h1>

                {/*
                  * §319 (§318 finding 7, NEEDS_SUBSTANTIATION). The previous sentence made six
                  * capability assertions in one breath, across a population it had not measured.
                  * Each half of what it claimed is real for the governed families; what was not
                  * supported was the implied universality. It is scoped rather than shortened, and
                  * the boundary is stated on the same screen rather than three sections later.
                  */}
                <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-200 sm:text-lg sm:leading-8">
                  A governed safety-analysis system. For the hazard families its knowledge base covers, it reads an inspection observation, extracts the structured facts it can establish, suggests standards that may apply, names the facts it could not establish, and proposes corrective actions — all for a qualified person to review and decide.
                </p>
              </div>

              <div className="border-l-4 border-blue-300/80 pl-4">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-100">
                  Qualified review required
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">
                  HazLenz AI supports professional judgment. It does not replace qualified safety review, declare violations, create citations, determine compliance, or make final decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/*
          * §319. GROUPED, because the distinction IS the disclosure. A flat list cannot tell a
          * reader which part of the system a sentence is about, and §318 found that the four
          * overstated claims all traded on exactly that ambiguity.
          */}
        {groups.map((group) => (
          <section key={group.heading} className="border-b border-slate-200/80 py-6 sm:py-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8] dark:text-[#5DB7FF]">
              {group.eyebrow}
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              {group.heading}
            </h2>
            {group.intro && (
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
                {group.intro}
              </p>
            )}

            <div className="mt-4 divide-y divide-slate-200/80">
              {group.sections.map((section) => (
                <div
                  key={section.title}
                  className="grid gap-2 py-4 sm:grid-cols-[0.34fr_0.66fr] sm:gap-4"
                >
                  <h3 className="text-base font-black tracking-tight text-slate-950 dark:text-slate-100">
                    {section.title}
                  </h3>

                  <p className="text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="py-7 text-center sm:py-8">
          <p className="mx-auto mb-5 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
            HazLenz AI supports qualified professional review. See the{" "}
            <a href="/legal" className="border-b-2 border-[#1D72B8] font-black text-[#1D72B8] hover:border-[#0B1320] hover:text-[#0B1320]">
              legal disclaimer
            </a>
            {" "}for use limitations.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {isSignedIn ? (
              <AppLinkButton
                href="/command-center"
                className="bg-[#1D72B8] px-6 py-3 text-white shadow-none hover:bg-[#0B1320]"
              >
                Return to Dashboard
              </AppLinkButton>
            ) : (
              <>
                <AppLinkButton
                  href="/login"
                  className="bg-[#1D72B8] px-6 py-3 text-white shadow-none hover:bg-[#0B1320]"
                >
                  Return to sign in
                </AppLinkButton>

                <AppLinkButton
                  href="/register"
                  variant="secondary"
                  className="bg-white px-6 py-3 !text-[#0B1320] shadow-none ring-1 ring-slate-200 hover:bg-blue-50"
                >
                  Create account
                </AppLinkButton>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
