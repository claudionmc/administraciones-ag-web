import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SERVICE_AREAS } from "@/lib/services";

export const metadata: Metadata = { title: "Servicios", description: "Catálogo de asesoría tributaria, planificación financiera y análisis patrimonial." };

export default function ServicesPage() {
  return <Container className="py-16"><h1 className="text-3xl font-semibold text-primary">Servicios</h1>
    <div className="mt-8 space-y-8">{SERVICE_AREAS.map((area) => (
      <section key={area.id} aria-labelledby={area.id}>
        <h2 id={area.id} className="text-xl font-medium text-primary">{area.title}</h2>
        <p className="mt-2 max-w-3xl">{area.description}</p>
        <ul className="mt-3 list-disc space-y-2 pl-6">{area.services.map((service) => <li key={service.id}>{service.title}</li>)}</ul>
      </section>
    ))}</div>
  </Container>;
}

