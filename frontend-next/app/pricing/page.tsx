// /pricing is the acquisition page and stays the acquisition page for everyone.
//
// It used to switch into "upgrade" mode for a signed-in visitor, which is how
// /pricing and /upgrade came to render the same component with the same content.
// A signed-in visitor who deliberately opens /pricing wants the full comparison;
// the in-product conversion path is /upgrade, which is now a different page.
import PricingContent from "@/components/pricing/PricingContent";

export default function PricingPage() {
  return <PricingContent />;
}
