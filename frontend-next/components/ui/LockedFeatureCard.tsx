import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { Badge } from "@/components/ui/Badge";

type LockedFeatureCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  requiredPlan: string;
  bullets?: string[];
  ctaHref?: string;
  ctaLabel?: string;
};

export default function LockedFeatureCard({
  eyebrow = "Plan Required",
  title,
  description,
  requiredPlan,
  bullets = [],
  ctaHref = "/pricing",
  ctaLabel = "Upgrade Access",
}: LockedFeatureCardProps) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-5 text-center shadow-sm">
      <div className="mx-auto max-w-xl">
        <div className="flex justify-center">
          <Badge tone="slate">{requiredPlan} Plan</Badge>
        </div>

        <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
          {eyebrow}
        </p>

        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
          {title}
        </h1>

        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
          {description}
        </p>

        {bullets.length ? (
          <div className="mt-4 grid gap-2 text-left">
            {bullets.map((bullet) => (
              <div
                key={bullet}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-700"
              >
                {bullet}
              </div>
            ))}
          </div>
        ) : null}

        <AppLinkButton
          href={ctaHref}
          variant="accent"
          className="mx-auto mt-5 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-center !text-white"
        >
          {ctaLabel}
        </AppLinkButton>
      </div>
    </section>
  );
}
