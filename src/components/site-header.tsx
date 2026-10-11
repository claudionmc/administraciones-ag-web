import Link from "next/link";
import { HeaderMenu } from "@/components/header-menu";
import { BrandLogo } from "@/components/brand-logo";
import { Container } from "@/components/ui/container";
export function SiteHeader() {
  return <header className="border-b border-border bg-surface py-3 lg:py-5"><Container className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-4 lg:flex lg:justify-between lg:gap-x-8">
    <Link href="/" className="block w-64 max-w-full min-w-0 lg:w-72"><BrandLogo preload /></Link>
    <HeaderMenu />
  </Container></header>;
}
