"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

function isEditableElement(element: Element | null) {
  if (!element) return false;

  const tag = element.tagName.toLowerCase();

  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    element.getAttribute("contenteditable") === "true"
  );
}

export default function MobileTabBar() {
  const pathname = usePathname();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialHeight = window.visualViewport?.height || window.innerHeight;

    function syncKeyboardState() {
      const activeElement = document.activeElement;
      const focusedEditable = isEditableElement(activeElement);

      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDelta = initialHeight - currentHeight;

      const likelyKeyboardOpen =
        focusedEditable && heightDelta > 120 && window.innerWidth < 1024;

      setKeyboardOpen(likelyKeyboardOpen);
      document.body.classList.toggle("sentinel-keyboard-open", likelyKeyboardOpen);
    }

    const viewport = window.visualViewport;

    viewport?.addEventListener("resize", syncKeyboardState);
    viewport?.addEventListener("scroll", syncKeyboardState);
    window.addEventListener("resize", syncKeyboardState);
    document.addEventListener("focusin", syncKeyboardState);
    document.addEventListener("focusout", syncKeyboardState);

    syncKeyboardState();

    return () => {
      viewport?.removeEventListener("resize", syncKeyboardState);
      viewport?.removeEventListener("scroll", syncKeyboardState);
      window.removeEventListener("resize", syncKeyboardState);
      document.removeEventListener("focusin", syncKeyboardState);
      document.removeEventListener("focusout", syncKeyboardState);
      document.body.classList.remove("sentinel-keyboard-open");
    };
  }, [pathname]);

  if (keyboardOpen) {
    return null;
  }

  return (
    <div className="sentinel-mobile-chrome fixed inset-x-0 bottom-0 z-[999999] lg:hidden">
      <nav className="border-t border-white/10 bg-[#0F172A] px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-2xl shadow-slate-950/30">
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

    </div>
  );
}
