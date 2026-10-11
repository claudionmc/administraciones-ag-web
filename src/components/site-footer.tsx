import Link from "next/link";
import { COMPANY } from "@/lib/constants";
import { SiteNavigation } from "@/components/site-navigation";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "@/components/brand-logo";
export function SiteFooter() {
  return <footer className="border-t border-accent/25 bg-primary py-10 text-white"><Container>
    <div className="flex flex-wrap items-start justify-between gap-8"><div><Link href="/" className="block w-64 max-w-full sm:w-72"><BrandLogo variant="white" /></Link><p className="mt-4 text-sm text-on-dark">{COMPANY.motto}</p></div><SiteNavigation variant="dark" /></div>
    <p className="mt-8 border-t border-accent/20 pt-6 text-xs leading-6 text-on-dark">{COMPANY.name} · Asesoría tributaria, financiera y patrimonial.</p>
  </Container></footer>;
}
