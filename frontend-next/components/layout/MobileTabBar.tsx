"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/command-center",
    label: "Home",
    icon: "🏠",
    activeRoots: ["/command-center", "/dashboard"],
  },
  {
    href: "/inspections",
    label: "Inspect",
    icon: "📋",
    activeRoots: [
      "/inspections",
      "/inspection",
      "/inspection-cover",
      "/inspection-review",
      "/inspection-walkthrough",
    ],
  },
  { href: "/reports", label: "Reports", icon: "🗂", activeRoots: ["/reports"] },
  {
    href: "/analytics",
    label: "Insights",
    icon: "📈",
    activeRoots: ["/analytics"],
  },
  {
    href: "/safety-calendar",
    label: "Calendar",
    icon: "📅",
    activeRoots: ["/safety-calendar"],
  },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-[999999] lg:hidden">
      <nav className="border-t border-white/10 bg-[#0F172A] px-3 pt-2 shadow-2xl shadow-slate-950/30">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {navItems.map((item) => {
            const active = item.activeRoots.some(
              (root) => pathname === root || pathname.startsWith(root + "/"),
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex h-[52px] flex-col items-center justify-center rounded-xl px-1 text-[10px] font-black",
                  active ? "bg-[#1D72B8] !text-white" : "!text-white/80",
                ].join(" ")}
              >
                <span className="text-[18px] leading-none">{item.icon}</span>
                <span className="mt-1 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="bg-[#0B1320] px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-1.5 text-center">
        <div className="mb-0.5 flex flex-wrap items-center justify-center gap-3">
          <Link href="/about" className="text-[11px] font-black !text-white">
            About
          </Link>
          <span className="h-3 w-px bg-[#6F7782]" />
          <Link href="/legal" className="text-[11px] font-black !text-white">
            Legal
          </Link>
          <span className="h-3 w-px bg-[#6F7782]" />
          <Link href="/safescope" className="text-[11px] font-black !text-white">
            SafeScope<span className="ml-[1px] align-super text-[8px]">TM</span>
          </Link>
        </div>

        <p className="text-[9px] font-semibold text-white/60">
          © {new Date().getFullYear()} Sentinel Safety. All rights reserved.
        </p>
      </div>
    </div>
  );
}
