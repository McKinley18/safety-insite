import { AppPanel } from "@/components/ui/AppPanel";
import { AppTextLink } from "@/components/ui/AppTextLink";
import { HeroPanel } from "@/components/ui/HeroPanel";

const sections = [
  {
    title: "Intelligent Standard Matching",
    body: "SafeScope Intelligence is the proprietary engine within Sentinel Safety that helps map observed hazards to relevant MSHA, OSHA, and safety management concepts.",
  },
  {
    title: "Learning and Feedback",
    body: "User review, acceptance, rejection, and correction feedback can improve the taxonomy and strengthen future standards-matching logic.",
  },
  {
    title: "Security and Isolation",
    body: "SafeScope is designed as a protected intelligence layer. Organizational data should remain isolated by workspace and handled as sensitive operational information.",
  },
  {
    title: "Professional Oversight",
    body: "SafeScope does not replace competent safety professionals. All AI suggestions must be reviewed, verified, and approved before use in official reports or operational decisions.",
  },
];

export default function SafeScopePage() {
  return (
    <section className="space-y-5">
      <HeroPanel align="left" className="mb-[22px] p-6 sm:p-6">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[1px] text-orange-500">
          Sentinel Safety Intelligence
        </p>
        <h1 className="mb-2.5 text-[34px] font-black text-white">SafeScope</h1>
        <p className="text-[15px] font-bold leading-[23px] text-slate-300">
          SafeScope is the proprietary intelligence engine powering hazard classification, standards suggestions, and report-support logic inside Sentinel Safety.
        </p>
      </HeroPanel>

      <AppPanel padding="md">
        {sections.map((section) => (
          <div key={section.title} className="border-b border-slate-200 py-[18px] last:border-b-0">
            <h2 className="mb-2 text-xl font-black text-slate-900">{section.title}</h2>
            <p className="text-[15px] leading-[23px] text-slate-500">{section.body}</p>
          </div>
        ))}
      </AppPanel>

      <AppTextLink href="/login" className="mt-[18px] block text-center">
        Return to Sign In
      </AppTextLink>
    </section>
  );
}
