"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION } from "@/lib/constants";

export function SiteNavigation({ variant = "light", layout = "inline", onNavigate }: {
  variant?: "light" | "dark";
  layout?: "inline" | "header";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={variant === "dark" ? "Navegación del pie" : "Navegación principal"}>
      <ul className={layout === "header" ? "flex flex-col gap-1 lg:flex-row lg:gap-6" : "flex flex-wrap gap-6"}>
        {NAVIGATION.map(({ href, label }) => {
          const active = pathname === href;
          const color = variant === "dark"
            ? active ? "text-white" : "text-on-dark hover:text-white"
            : active ? "text-primary-action" : "text-primary hover:text-primary-action";

          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center text-sm decoration-1 underline-offset-8 transition-colors ${color} ${active ? "font-medium underline" : "font-normal no-underline"}`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
