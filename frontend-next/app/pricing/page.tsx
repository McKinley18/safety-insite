"use client";

import { useState } from "react";
import PricingContent from "@/components/pricing/PricingContent";
import { hasAuthToken } from "@/lib/auth";

export default function PricingPage() {
  const [mode] = useState<"public" | "upgrade">(() =>
    hasAuthToken() ? "upgrade" : "public",
  );

  return <PricingContent mode={mode} />;
}
