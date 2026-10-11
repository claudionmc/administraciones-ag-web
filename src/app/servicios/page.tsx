import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ServiceAreaSection } from "@/components/services/service-area-section";
import { SERVICE_AREAS } from "@/lib/services";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Conozca nuestros doce servicios de asesoría tributaria, planificación financiera y análisis patrimonial personal.",
};

export default function ServicesPage() {
  return <>
    <section aria-labelledby="catalogue-title" className="bg-surface-muted py-16 sm:py-20">
      <Container>
        <p className="eyebrow text-primary-action">Nuestro catálogo</p>
        <h1 id="catalogue-title" className="mt-5 max-w-3xl text-4xl font-medium leading-tight tracking-tight text-primary text-balance sm:text-5xl">Una asesoría con perspectiva integral y alcance definido.</h1>
        <p className="mt-6 max-w-2xl leading-8 text-text-muted">Tres áreas complementarias para comprender sus obligaciones tributarias, organizar sus finanzas y analizar su patrimonio. Cada trabajo se define de acuerdo con su situación y sus necesidades.</p>
        <nav aria-label="Áreas del catálogo" className="mt-10 border-t border-border pt-6">
          <ul className="flex flex-wrap gap-x-8 gap-y-4">{SERVICE_AREAS.map(area => <li key={area.id}><Link href={`#${area.id}`} className="inline-block py-2 text-sm font-medium text-primary-action underline decoration-border underline-offset-8 hover:decoration-primary-action">{area.title} <span aria-hidden="true">↓</span></Link></li>)}</ul>
        </nav>
      </Container>
    </section>
    {SERVICE_AREAS.map((area, index) => <ServiceAreaSection key={area.id} area={area} index={index} />)}
  </>;
}
