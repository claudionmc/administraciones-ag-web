import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { COMPANY, WHATSAPP, WHATSAPP_URL } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Solicite una asesoría por WhatsApp. Atención online y presencial, previa coordinación.",
};

export default function ContactPage() {
  return <section aria-labelledby="contact-page-title" className="section-space bg-surface-muted">
    <Container>
      <p className="eyebrow text-primary-action">Contacto</p>
      <h1 id="contact-page-title" className="mt-5 max-w-3xl text-4xl font-medium leading-tight tracking-tight text-primary text-balance sm:text-5xl">Conversemos sobre lo que usted necesita.</h1>
      <div className="mt-7 grid items-start gap-10 md:mt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="max-w-xl leading-8 text-text-muted">El primer paso es comprender su situación y el tipo de apoyo que busca. A partir de esa conversación, podremos definir el alcance de una asesoría tributaria, financiera o patrimonial.</p>
          <h2 className="mt-10 text-xl font-medium text-primary">Modalidades de atención</h2>
          <div className="mt-5 divide-y divide-border border-y border-border">
            <article className="py-6">
              <h3 className="text-lg font-medium text-primary">{COMPANY.contactModes[0]}</h3>
              <p className="mt-2 max-w-lg text-sm leading-7 text-text-muted">Una alternativa para conversar y revisar sus necesidades a distancia. La modalidad y los detalles se acuerdan previamente.</p>
            </article>
            <article className="py-6">
              <h3 className="text-lg font-medium text-primary">{COMPANY.contactModes[1]}</h3>
              <p className="mt-2 max-w-lg text-sm leading-7 text-text-muted">Si prefiere una reunión presencial, coordinaremos previamente su disponibilidad y las condiciones del encuentro.</p>
            </article>
          </div>
        </div>
        <aside aria-labelledby="whatsapp-title" className="min-w-0 bg-primary p-7 text-white sm:p-10">
          <p className="eyebrow text-accent">Una primera conversación</p>
          <h2 id="whatsapp-title" className="mt-5 text-3xl font-medium leading-tight tracking-tight">Solicite su asesoría por WhatsApp.</h2>
          <p className="mt-5 leading-8 text-on-dark">Cuéntenos, en términos generales, qué área desea abordar y qué modalidad de atención prefiere.</p>
          <div className="mt-8"><ButtonLink href={WHATSAPP_URL} variant="light">{WHATSAPP.buttonLabel} <span aria-hidden="true">↗</span></ButtonLink></div>
          <p className="mt-5 text-xs leading-6 text-on-dark">Se abrirá WhatsApp con un mensaje preparado. Usted decide cuándo enviarlo.</p>
          <p className="mt-8 border-t border-accent/25 pt-5 text-sm leading-7 text-on-dark">Para esta primera conversación, evite compartir documentos tributarios, claves o información financiera sensible.</p>
        </aside>
      </div>
    </Container>
  </section>;
}
