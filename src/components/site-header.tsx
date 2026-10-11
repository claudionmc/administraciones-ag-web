import Link from "next/link";
import { NAVIGATION } from "@/lib/constants";
import { BrandLogo } from "@/components/brand-logo";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
export function SiteHeader() {
  return <header className="border-b border-border bg-surface py-5"><Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
    <Link href="/" className="block w-64 max-w-full shrink-0 sm:w-72"><BrandLogo preload /></Link>
    <div className="flex flex-wrap items-center gap-x-8 gap-y-5"><nav aria-label="Navegación principal"><ul className="flex flex-wrap gap-6">{NAVIGATION.map(({ href, label }) => <li key={href}><Link href={href} className="text-sm text-primary hover:text-primary-action hover:underline underline-offset-8">{label}</Link></li>)}</ul></nav><ButtonLink href="/contacto">Solicitar asesoría <span aria-hidden="true">↗</span></ButtonLink></div>
  </Container></header>;
}
