// The page in this segment is a Client Component and cannot export `metadata`,
// so the route's tab name and description live in this minimal server layout.
export const metadata = {
  title: "Legal",
  description: "Legal disclaimer and use limitations for Safety InSite and HazLenz AI.",
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
