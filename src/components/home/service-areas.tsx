import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { SERVICE_AREAS, type ServiceArea } from "@/lib/services";
export function ServiceAreas() {
  return <section aria-labelledby="services-title" className="section-space bg-surface"><Container>
    <div id="services-title"><SectionHeading eyebrow="Áreas de asesoría" title="Tres perspectivas. Una comprensión integral."><p>Su situación tributaria, sus finanzas personales y su patrimonio se relacionan. Nuestro catálogo aborda cada dimensión con un alcance definido.</p></SectionHeading></div>
    <div className="mt-12 grid gap-5 lg:grid-cols-3">{SERVICE_AREAS.map((area: ServiceArea) => <article key={area.id} className="service-card flex flex-col border border-border bg-surface p-7 sm:p-8">
      <h3 className="border-b border-border pb-5 text-2xl font-medium leading-snug tracking-tight text-primary">{area.title}</h3>
      <p className="mt-4 text-sm leading-7 text-text-muted">{area.summary}</p>
      {area.homeScopeNote && <p className="mt-3 text-xs leading-6 text-text-muted">{area.homeScopeNote}</p>}
      <Link href={`/servicios#${area.id}`} aria-label={`Ver servicios de ${area.title.toLocaleLowerCase("es-CL")}`} className="mt-auto inline-flex min-h-11 items-center gap-2 self-start whitespace-nowrap pt-6 text-sm font-medium text-primary-action underline decoration-border underline-offset-8 hover:decoration-primary-action">Ver servicios <span aria-hidden="true">→</span></Link>
    </article>)}</div>
  </Container></section>;
}
