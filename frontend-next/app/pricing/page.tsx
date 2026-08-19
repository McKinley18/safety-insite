"use client";

import { useEffect, useState } from "react";
import PricingContent from "@/components/pricing/PricingContent";
import { hasAuthToken } from "@/lib/auth";

export default function PricingPage() {
  // hasAuthToken() reads localStorage, so it is always false during SSR but true
  // for a signed-in visitor on the client. Seeding useState with it made the server
  // render the "public" pricing copy while the first client render produced the
  // "upgrade" copy, which React reports as hydration error #418 and repairs by
  // discarding and re-rendering the tree. Resolving after mount keeps the first
  // client render identical to the server HTML.
  const [mode, setMode] = useState<"public" | "upgrade">("public");

  useEffect(() => {
    if (hasAuthToken()) setMode("upgrade");
  }, []);

  return <PricingContent mode={mode} />;
}
