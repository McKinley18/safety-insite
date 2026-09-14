// §280 (D-031). The route's tab name, taken from the ONE table in `lib/pageTitles.ts`.
//
// This file exists because the page in this segment is a Client Component and cannot export
// `metadata` itself. It deliberately contains no title string: change the name in the table, not
// here. `check:page-titles` fails if this file and the table stop agreeing.
import { routeMetadata } from "@/lib/pageTitles";

export const metadata = {
  ...routeMetadata("/pricing"),
  // A public, shareable page: its description is written for someone who has not seen
  // the product yet, so it is more specific than the product-wide one.
  description: "Compare the Free and Pro plans for Safety InSite.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
