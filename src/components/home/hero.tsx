import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { COMPANY } from "@/lib/constants";
export function Hero() {
  return <section aria-labelledby="hero-title" className="bg-primary text-white"><Container className="pb-10 pt-16 sm:pt-24 lg:pt-28">
    <div className="grid gap-12 lg:grid-cols-[1fr_220px] lg:gap-16"><div className="hero-enter">
      <p className="eyebrow text-accent">Asesoría personal · Chile</p>
      <h1 id="hero-title" className="mt-6 max-w-4xl text-4xl font-medium leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">Una visión integral para sus decisiones financieras y patrimoniales.</h1>
      <p className="mt-7 max-w-2xl leading-8 text-on-dark sm:text-lg">{COMPANY.description} Un enfoque riguroso para comprender su situación, ordenar sus prioridades y acompañar su planificación.</p>
      <div className="mt-9 flex flex-wrap items-center gap-6"><ButtonLink href="/contacto" variant="light">Solicitar asesoría <span aria-hidden="true">↗</span></ButtonLink><Link href="/servicios" className="text-sm text-on-dark underline decoration-accent/50 underline-offset-8 hover:text-white">Explorar nuestros servicios</Link></div>
    </div><aside className="self-end border-l border-accent/35 pl-6"><p className="eyebrow text-accent">Nuestro compromiso</p><p className="mt-4 text-2xl font-medium leading-relaxed">{COMPANY.motto}</p><p className="mt-5 text-sm leading-7 text-on-dark">Rigurosidad en el análisis.<br />Cercanía en la atención.<br />Perspectiva de largo plazo.</p></aside></div>
    <div className="mt-16 flex flex-wrap justify-between gap-x-8 gap-y-3 border-t border-accent/25 pt-6 text-xs tracking-wide text-on-dark sm:mt-20"><span>Asesoría tributaria</span><span>Planificación financiera</span><span>Planificación y análisis patrimonial</span></div>
  </Container></section>;
}
