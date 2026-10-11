import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { COMPANY } from "@/lib/constants";
import { HeroPhoto } from "@/components/home/hero-photo";
export function Hero() {
  return <section aria-labelledby="hero-title" className="bg-primary text-white"><Container className="pb-8 pt-10 md:pb-10 md:pt-20 lg:pt-24">
    <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12"><div className="hero-enter min-w-0">
      <p className="eyebrow text-accent">Asesoría personal · Chile</p>
      <h1 id="hero-title" className="mt-4 max-w-3xl text-4xl font-medium leading-[1.18] tracking-tight text-balance md:mt-6 md:text-5xl lg:text-[3.25rem]">Una visión integral para sus decisiones financieras y patrimoniales.</h1>
      <p className="mt-5 max-w-2xl leading-7 text-on-dark md:mt-7 md:text-lg md:leading-8">{COMPANY.description} Un enfoque riguroso para comprender su situación, ordenar sus prioridades y acompañar su planificación.</p>
      <div className="mt-5 border-l border-accent/35 pl-5 md:mt-6">
        <p className="text-lg font-medium leading-7 text-white">{COMPANY.motto}</p>
        <p className="mt-2 text-sm leading-6 text-on-dark">Rigurosidad técnica. Atención personalizada. Visión de largo plazo</p>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-9 md:gap-6"><ButtonLink href="/contacto" variant="light">Solicitar asesoría <span aria-hidden="true">↗</span></ButtonLink><Link href="/servicios" className="inline-flex min-h-11 items-center text-sm text-on-dark underline decoration-accent/50 underline-offset-8 hover:text-white">Explorar nuestros servicios</Link></div>
    </div><div className="min-w-0">
      <HeroPhoto />
    </div></div>
    <div className="mt-20 hidden flex-wrap justify-between gap-x-8 gap-y-3 border-t border-accent/25 pt-6 text-xs tracking-wide text-on-dark md:flex"><span>Asesoría tributaria</span><span>Planificación financiera</span><span>Planificación y análisis patrimonial</span></div>
  </Container></section>;
}
