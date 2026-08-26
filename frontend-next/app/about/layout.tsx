// The page in this segment is a Client Component and cannot export `metadata`,
// so the route's tab name and description live in this minimal server layout.
export const metadata = {
  title: "About",
  description: "What Safety InSite does and who it is built for.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
