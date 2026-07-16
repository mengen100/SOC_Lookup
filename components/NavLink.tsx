"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && Boolean(pathname?.startsWith(href)));

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={
        isActive
          ? "rounded border border-line bg-white px-2.5 py-1.5 font-semibold text-ink"
          : "rounded border border-transparent px-2.5 py-1.5 text-steel hover:border-line hover:bg-white"
      }
      href={href}
    >
      {children}
    </Link>
  );
}
