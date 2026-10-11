import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
type Variant = "primary" | "light";
const base = "inline-flex min-h-12 items-center justify-center gap-4 rounded-sm px-6 py-3 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
const variants: Record<Variant, string> = { primary: "bg-primary-action text-white hover:bg-primary-hover", light: "bg-on-dark text-primary hover:bg-accent" };
export function Button({ className = "", type = "button", variant = "primary", ...props }: ComponentPropsWithoutRef<"button"> & { variant?: Variant }) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
export function ButtonLink({ className = "", variant = "primary", ...props }: ComponentPropsWithoutRef<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
