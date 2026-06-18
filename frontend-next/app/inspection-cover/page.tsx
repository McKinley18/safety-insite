"use client";

import { useEffect, useState } from "react";
import { getCoverPage, setCoverPage } from "@/lib/reportStorage";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";

export default function InspectionCoverPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [leadInspector, setLeadInspector] = useState("");
  const [additionalInspectors, setAdditionalInspectors] = useState([""]);
  const [includeCoverPage, setIncludeCoverPage] = useState(true);
  const [isConfidential, setIsConfidential] = useState(false);
  const [confidentialityMarkerText, setConfidentialityMarkerText] = useState(
    "Privileged & Confidential",
  );
  const [companyLogo, setCompanyLogo] = useState("");
  const [includeLogoOnCover, setIncludeLogoOnCover] = useState(true);

  useEffect(() => {
    async function loadCoverPage() {
      const savedLogo = localStorage.getItem("sentinel_company_logo") || "";
      const savedIncludeLogo =
        localStorage.getItem("sentinel_include_logo_on_cover") !== "false";
      const defaultCoverPage =
        localStorage.getItem("sentinel_default_include_cover_page") !== "false";
      const defaultConfidential =
        localStorage.getItem("sentinel_default_confidential_marker") === "true";
      const savedConfidentialityMarkerText =
        localStorage.getItem("sentinel_confidential_marker_text") ||
        "Privileged & Confidential";

      setConfidentialityMarkerText(savedConfidentialityMarkerText);
      setCompanyLogo(savedLogo);
      setIncludeLogoOnCover(savedIncludeLogo);
      setIncludeCoverPage(defaultCoverPage);
      setIsConfidential(defaultConfidential);

      const parsed = await getCoverPage<any>();
      if (!parsed) return;

      setOrganizationName(parsed.organizationName || "");
      setSiteLocation(parsed.siteLocation || "");
      setInspectionDate(
        parsed.inspectionDate || new Date().toISOString().slice(0, 10),
      );
      setLeadInspector(parsed.leadInspector || "");
      setAdditionalInspectors(
        parsed.additionalInspectors?.length
          ? parsed.additionalInspectors
          : [""],
      );
      setIncludeCoverPage(parsed.includeCoverPage ?? defaultCoverPage);
      setIsConfidential(parsed.isConfidential ?? defaultConfidential);
      setConfidentialityMarkerText(
        parsed.confidentialityMarkerText || savedConfidentialityMarkerText,
      );
      setCompanyLogo(parsed.companyLogo || savedLogo);
      setIncludeLogoOnCover(parsed.includeLogoOnCover ?? savedIncludeLogo);
    }

    loadCoverPage();
  }, []);

  async function saveCoverPage() {
    await setCoverPage({
      organizationName,
      siteLocation,
      inspectionDate: inspectionDate || new Date().toISOString().slice(0, 10),
      leadInspector,
      additionalInspectors: additionalInspectors.filter(Boolean),
      includeCoverPage,
      isConfidential,
      confidentialityMarkerText,
      companyLogo,
      includeLogoOnCover,
    });
  }

  return (
    <section className="sentinel-page-shell space-y-6">
      <HeroPanel align="center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Inspection Start
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">
          Start Field Inspection
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Capture the problem first. Report details can come from saved
          settings and be reviewed before final output.
        </p>
      </HeroPanel>

      <AppPanel variant="subtle" padding="lg">
        <SectionHeader
          eyebrow="Field-first workflow"
          title="Capture observations before final report assembly."
          description="Start with inspector names and report options. The inspection itself begins with photo capture and observed condition — HazLenz AI can help classify the hazard after capture."
        />
      </AppPanel>

      <AppPanel padding="lg">
        <SectionHeader title="Inspection Team" />

        <label className="mb-1.5 mt-4 block text-sm font-extrabold text-slate-700">
          Lead Inspector
        </label>
        <AppInput
          value={leadInspector}
          onChange={(event) => setLeadInspector(event.target.value)}
          placeholder="Inspector name"
          className="bg-white/90"
        />

        <label className="mb-1.5 mt-4 block text-sm font-extrabold text-slate-700">
          Additional Inspectors
        </label>

        {additionalInspectors.map((inspector, index) => (
          <div key={index} className="mb-3 flex gap-2">
            <AppInput
              value={inspector}
              onChange={(event) => {
                const next = [...additionalInspectors];
                next[index] = event.target.value;
                setAdditionalInspectors(next);
              }}
              placeholder={`Additional inspector ${index + 1}`}
              className="min-w-0 flex-1 bg-white/90"
            />

            <AppButton
              type="button"
              variant="danger"
              size="sm"
              onClick={() =>
                setAdditionalInspectors(
                  additionalInspectors.filter((_, i) => i !== index),
                )
              }
            >
              Remove
            </AppButton>
          </div>
        ))}

        <AppButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setAdditionalInspectors([...additionalInspectors, ""])}
        >
          + Add Inspector
        </AppButton>
      </AppPanel>

      <AppPanel padding="lg">
        <SectionHeader title="Report Options" />

        <button
          type="button"
          onClick={() => setIncludeCoverPage(!includeCoverPage)}
          className="mt-4 flex w-full gap-2.5 rounded-2xl border border-slate-200 bg-white/90 shadow-sm px-3.5 py-3 text-left"
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-[#1D72B8] text-[13px] font-black text-white ${
              includeCoverPage ? "bg-[#1D72B8]" : "bg-white"
            }`}
          >
            {includeCoverPage ? "✓" : ""}
          </span>

          <span className="flex-1">
            <span className="block text-sm font-black text-slate-800">
              Include cover page
            </span>
            <span className="mt-1 block text-xs leading-[17px] text-slate-600">
              Site, logo, and report branding will use saved
              defaults when available.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsConfidential(!isConfidential)}
          className="mt-3 flex w-full gap-2.5 rounded-xl border border-red-300 bg-red-50 px-3.5 py-3 text-left"
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-red-600 text-[13px] font-black text-white ${
              isConfidential ? "bg-red-600" : "bg-white"
            }`}
          >
            {isConfidential ? "✓" : ""}
          </span>

          <span className="flex-1">
            <span className="block text-sm font-black text-red-800">
              Include confidentiality marker
            </span>
            <span className="mt-1 block text-xs font-black text-red-800">
              {confidentialityMarkerText}
            </span>
            <span className="mt-1 block text-xs leading-[17px] text-red-900">
              Adds the selected confidentiality marking to the report when
              appropriate for your organization&apos;s review process.
            </span>
          </span>
        </button>
      </AppPanel>

      <div className="flex justify-center">
        <AppLinkButton
          href="/inspection"
          onClick={saveCoverPage}
          variant="primary"
          className="rounded-full bg-[#1D72B8] px-[18px] py-[13px] hover:bg-[#155A93]"
        >
          Start Inspection
        </AppLinkButton>
      </div>
    </section>
  );
}
