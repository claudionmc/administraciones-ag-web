import { Container } from "@/components/ui/container";
import type { ServiceArea } from "@/lib/services";

export function ServiceAreaSection({ area, index }: { area: ServiceArea; index: number }) {
  return (
    <section id={area.id} aria-labelledby={`${area.id}-title`} className={`section-space ${index % 2 === 0 ? "bg-surface" : "bg-surface-muted"}`}>
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
        <div>
          <h2 id={`${area.id}-title`} className="text-3xl font-medium leading-tight tracking-tight text-primary sm:text-4xl">{area.title}</h2>
          <p className="mt-6 leading-8 text-text-muted">{area.summary}</p>
          {area.scopeNote && <p className="mt-6 border-l-2 border-primary-action pl-4 text-sm leading-7 text-text-muted">{area.scopeNote}</p>}
        </div>
        <div className="grid content-start gap-x-8 sm:grid-cols-2">
          {area.services.map((service) => (
            <article key={service.id} aria-labelledby={service.id} className="border-t border-border py-6">
              <h3 id={service.id} className="text-lg font-medium leading-7 text-primary">{service.title.replace(/\.$/, "")}</h3>
              <p className="mt-3 text-sm leading-7 text-text-muted">{service.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
