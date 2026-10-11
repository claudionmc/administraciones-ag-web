import { Hero } from "@/components/home/hero";
import { ServiceAreas } from "@/components/home/service-areas";
import { Philosophy } from "@/components/home/philosophy";
import { AdvisoryProcess } from "@/components/home/advisory-process";
import { ContactSection } from "@/components/home/contact-section";
import { Suspense } from "react";
import { EconomicIndicators, EconomicIndicatorsFallback } from "@/components/home/economic-indicators";
export default function HomePage() {
  return <><Hero /><Suspense fallback={<EconomicIndicatorsFallback />}><EconomicIndicators /></Suspense><ServiceAreas /><Philosophy /><AdvisoryProcess /><ContactSection /></>;
}
