import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { COMPANY } from "@/lib/constants";
import { HeroPhoto } from "@/components/home/hero-photo";
export function Hero() {
  return <section aria-labelledby="hero-title" className="bg-primary text-white"><Container className="pb-10 pt-16 sm:pt-24 lg:pt-28">
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12"><div className="hero-enter min-w-0">
      <p className="eyebrow text-accent">Asesoría personal · Chile</p>
      <h1 id="hero-title" className="mt-6 max-w-3xl text-4xl font-medium leading-[1.18] tracking-tight text-balance sm:text-5xl lg:text-[3.25rem]">Una visión integral para sus decisiones financieras y patrimoniales.</h1>
      <p className="mt-7 max-w-2xl leading-8 text-on-dark sm:text-lg">{COMPANY.description} Un enfoque riguroso para comprender su situación, ordenar sus prioridades y acompañar su planificación.</p>
      <div className="mt-9 flex flex-wrap items-center gap-6"><ButtonLink href="/contacto" variant="light">Solicitar asesoría <span aria-hidden="true">↗</span></ButtonLink><Link href="/servicios" className="text-sm text-on-dark underline decoration-accent/50 underline-offset-8 hover:text-white">Explorar nuestros servicios</Link></div>
    </div><div className="min-w-0">
      <HeroPhoto />
      <aside className="mt-7 border-l border-accent/35 pl-6"><p className="eyebrow text-accent">Nuestro compromiso</p><p className="mt-3 text-2xl font-medium leading-relaxed text-balance">{COMPANY.motto}</p><p className="mt-3 text-sm leading-7 text-on-dark">Rigurosidad en el análisis. Cercanía en la atención. Perspectiva de largo plazo.</p></aside>
    </div></div>
    <div className="mt-16 flex flex-wrap justify-between gap-x-8 gap-y-3 border-t border-accent/25 pt-6 text-xs tracking-wide text-on-dark sm:mt-20"><span>Asesoría tributaria</span><span>Planificación financiera</span><span>Planificación y análisis patrimonial</span></div>
  </Container></section>;
}
