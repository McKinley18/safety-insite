"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export function Accordion({ title, children, defaultOpen = false, onToggle }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (onToggle) {
      onToggle(nextOpen);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full min-h-[48px] items-center justify-between px-5 py-4 text-left focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800"
      >
        <span className="text-sm font-black text-slate-950 dark:text-white">{title}</span>
        <ChevronDown
          className={twMerge(
            clsx("h-5 w-5 text-slate-500 transition-transform duration-300 dark:text-slate-200", {
              "rotate-180": isOpen,
            })
          )}
        />
      </button>
      <div
        className={twMerge(
          clsx("grid transition-all duration-300 ease-in-out", {
            "grid-rows-[1fr] opacity-100": isOpen,
            "grid-rows-[0fr] opacity-0": !isOpen,
          })
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1 text-sm text-slate-700 dark:text-slate-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
