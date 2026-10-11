import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { COMPANY } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: COMPANY.name, template: `%s | ${COMPANY.name}` },
  description: COMPANY.description,
  openGraph: { title: COMPANY.name, description: COMPANY.description, locale: "es_CL", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-CL"><body className={`${inter.variable} flex min-h-screen flex-col`}>
    <a href="#contenido" className="skip-link">Saltar al contenido</a>
    <SiteHeader /><main id="contenido" tabIndex={-1} className="flex-1">{children}</main><SiteFooter />
  </body></html>;
}

