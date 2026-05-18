import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: ReactNode;
  className?: string;
};

export default function PrimaryButton({
  href,
  children,
  className = "",
  ...props
}: PrimaryButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black !text-white transition hover:bg-[#1D72B8] disabled:opacity-60";

  if (href) {
    return (
      <Link href={href} className={`${base} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}
