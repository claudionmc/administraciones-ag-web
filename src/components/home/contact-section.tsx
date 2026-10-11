import { Container } from "@/components/ui/container";
import Link from "next/link";
import { COMPANY } from "@/lib/constants";
export function ContactSection() {
  return <section aria-labelledby="contact-title" className="section-space bg-primary text-white"><Container className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-20">
    <div><p className="eyebrow text-accent">Conversemos</p><h2 id="contact-title" className="mt-5 max-w-2xl text-3xl font-medium leading-tight tracking-tight sm:text-4xl">El primer paso es comprender lo que usted necesita.</h2><p className="mt-5 max-w-xl leading-8 text-on-dark">Conozca nuestras modalidades de atención y el alcance de la asesoría para su situación personal.</p><ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-on-dark">{COMPANY.contactModes.map(mode => <li key={mode}>{mode}</li>)}</ul></div>
    <Link href="/contacto" className="inline-flex min-h-11 items-center text-sm text-on-dark underline decoration-accent/50 underline-offset-8 hover:text-white">Contacto</Link>
  </Container></section>;
}
