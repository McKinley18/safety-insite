"use client";

import { getCoverPage, setCoverPage } from "@/lib/reportStorage";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    <section>
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-center text-white shadow-sm sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          Inspection Start
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          Start Field Inspection
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Capture the problem first. Report details can come from workspace
          settings and be reviewed before final output.
        </p>
      </section>

      <div className="rounded-2xl border border-blue-100 bg-[#F4F9FF] px-4 py-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Field-first workflow
        </p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
          Start with inspector names and report options. The inspection itself
          begins with photo capture and observed condition — SafeScope can help
          classify the hazard after capture.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">Inspection Team</h2>

        <label className="mb-1.5 mt-4 block text-sm font-extrabold text-slate-700">
          Lead Inspector
        </label>
        <input
          value={leadInspector}
          onChange={(e) => setLeadInspector(e.target.value)}
          placeholder="Inspector name"
          className="h-[50px] w-full rounded-[14px] border border-slate-200 bg-slate-50 px-3.5 text-slate-900 outline-none focus:border-[#1D72B8]"
        />

        <label className="mb-1.5 mt-4 block text-sm font-extrabold text-slate-700">
          Additional Inspectors
        </label>

        {additionalInspectors.map((inspector, index) => (
          <div key={index} className="mb-3 flex gap-2">
            <input
              value={inspector}
              onChange={(e) => {
                const next = [...additionalInspectors];
                next[index] = e.target.value;
                setAdditionalInspectors(next);
              }}
              placeholder={`Additional inspector ${index + 1}`}
              className="h-[50px] min-w-0 flex-1 rounded-[14px] border border-slate-200 bg-slate-50 px-3.5 text-slate-900 outline-none focus:border-[#1D72B8]"
            />

            <button
              type="button"
              onClick={() =>
                setAdditionalInspectors(
                  additionalInspectors.filter((_, i) => i !== index),
                )
              }
              className="rounded-xl border border-red-200 bg-white px-3 text-xs font-black text-red-700"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setAdditionalInspectors([...additionalInspectors, ""])}
          className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-800"
        >
          + Add Inspector
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">Report Options</h2>

        <button
          type="button"
          onClick={() => setIncludeCoverPage(!includeCoverPage)}
          className="mt-4 flex w-full gap-2.5 rounded-[14px] border border-slate-300 bg-slate-50 px-3.5 py-3 text-left"
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 border-[#1D72B8] text-[13px] font-black text-white ${
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
              Organization, site, logo, and report branding will use workspace
              defaults when available.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsConfidential(!isConfidential)}
          className="mt-3 flex w-full gap-2.5 rounded-[14px] border border-red-300 bg-red-50 px-3.5 py-3 text-left"
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 border-red-600 text-[13px] font-black text-white ${
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
      </div>

      <div className="mt-5 flex justify-center">
        <Link
          href="/inspection"
          onClick={saveCoverPage}
          className="rounded-full bg-[#1D72B8] px-[18px] py-[13px] text-sm font-black text-white"
        >
          Start Inspection
        </Link>
      </div>
    </section>
  );
}
