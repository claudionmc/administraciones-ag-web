import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { SERVICE_AREAS, type ServiceArea } from "@/lib/services";
export function ServiceAreas() {
  return <section aria-labelledby="services-title" className="section-space bg-surface"><Container>
    <div id="services-title"><SectionHeading eyebrow="Áreas de asesoría" title="Tres perspectivas. Una comprensión integral."><p>Su situación tributaria, sus finanzas personales y su patrimonio se relacionan. Nuestro catálogo aborda cada dimensión con un alcance definido.</p></SectionHeading></div>
    <div className="mt-12 grid gap-5 lg:grid-cols-3">{SERVICE_AREAS.map((area: ServiceArea, index) => <article key={area.id} className="service-card flex flex-col border border-border bg-surface p-7 sm:p-8">
      <div className="flex items-center justify-between border-b border-border pb-5"><span className="eyebrow text-primary-action">Área {String(index + 1).padStart(2, "0")}</span><span aria-hidden="true" className="text-xl text-primary-action">↗</span></div>
      <h3 className="mt-7 text-2xl font-medium leading-snug tracking-tight text-primary">{area.title}</h3>
      <p className="mt-4 text-sm leading-7 text-text-muted">{area.summary}</p>
      {area.scopeNote && <p className="mt-5 border-l border-border pl-3 text-xs leading-6 text-text-muted">{area.scopeNote}</p>}
      <Link href={`/servicios#${area.id}`} className="mt-auto pt-8 text-sm font-medium text-primary-action underline decoration-border underline-offset-8 hover:decoration-primary-action">Ver catálogo de {area.title.toLocaleLowerCase("es-CL")} <span aria-hidden="true">→</span></Link>
    </article>)}</div>
  </Container></section>;
}
