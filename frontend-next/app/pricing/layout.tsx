// The page in this segment is a Client Component and cannot export `metadata`,
// so the route's tab name and description live in this minimal server layout.
export const metadata = {
  title: "Pricing",
  description: "Compare the Free and Pro plans for Safety InSite.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
