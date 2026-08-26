// The page in this segment is a Client Component and cannot export `metadata`,
// so the route's tab name and description live in this minimal server layout.
export const metadata = {
  title: "HazLenz AI",
  description: "How the HazLenz AI hazard intelligence engine reasons about field observations.",
};

export default function HazlenzLayout({ children }: { children: React.ReactNode }) {
  return children;
}
