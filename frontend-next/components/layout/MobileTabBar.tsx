"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = [
  { href: "/command-center", label: "Home", icon: "🏠" },
  { href: "/inspections", label: "Inspect", icon: "📋" },
  { href: "/reports", label: "Reports", icon: "🗂" },
  { href: "/safety-calendar", label: "Calendar", icon: "📅" },
];

function isMobileKeyboardLikelyOpen() {
  if (typeof window === "undefined") return false;

  const visualViewport = window.visualViewport;
  if (!visualViewport) return false;

  const viewportLoss = window.innerHeight - visualViewport.height;
  return viewportLoss > 140;
}

export default function MobileTabBar() {
  const pathname = usePathname();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    function updateKeyboardState() {
      const open = isMobileKeyboardLikelyOpen();

      setKeyboardOpen(open);
      document.documentElement.classList.toggle("sentinel-keyboard-open", open);
      document.body.classList.toggle("sentinel-keyboard-open", open);
    }

    updateKeyboardState();

    window.visualViewport?.addEventListener("resize", updateKeyboardState);
    window.visualViewport?.addEventListener("scroll", updateKeyboardState);
    window.addEventListener("resize", updateKeyboardState);
    window.addEventListener("orientationchange", updateKeyboardState);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateKeyboardState);
      window.visualViewport?.removeEventListener("scroll", updateKeyboardState);
      window.removeEventListener("resize", updateKeyboardState);
      window.removeEventListener("orientationchange", updateKeyboardState);
      document.documentElement.classList.remove("sentinel-keyboard-open");
      document.body.classList.remove("sentinel-keyboard-open");
    };
  });

  return (
    <nav
      aria-label="Mobile primary navigation"
      data-keyboard-open={keyboardOpen ? "true" : "false"}
      className="mobile-tab-bar fixed inset-x-0 bottom-0 z-[800] border-t border-app-border bg-app-surface px-2 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1 text-app-primary shadow-[0_-8px_24px_rgba(15,23,42,0.16)] backdrop-blur-xl transition-transform duration-150 dark:bg-[#07111F]/96 lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1.5">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href ||
            (tab.href !== "/command-center" && pathname?.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-h-[36px] flex-col items-center justify-center rounded-lg px-1 text-center transition ${
                active
                  ? "bg-app-brand text-app-inverse shadow-sm shadow-blue-950/30"
                  : "text-app-primary hover:bg-app-brand-soft hover:text-app-primary"
              }`}
            >
              <span className="text-[13px] leading-none">{tab.icon}</span>
              <span className="mt-0.5 text-[8px] font-black uppercase tracking-wide">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
