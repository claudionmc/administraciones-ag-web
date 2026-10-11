import { Container } from "@/components/ui/container";
import { COMPANY } from "@/lib/constants";
const principles = [
  { title: "Rigurosidad técnica", description: "Información ordenada, análisis fundamentado y claridad sobre el alcance de cada trabajo." },
  { title: "Atención personalizada", description: "Comprender su contexto, escuchar sus prioridades y definir un trabajo acorde con sus necesidades." },
  { title: "Visión de largo plazo", description: "Considerar cómo se relacionan sus decisiones actuales con sus objetivos y la evolución de su patrimonio." },
] as const;
export function Philosophy() {
  return <section aria-labelledby="philosophy-title" className="section-space bg-surface-muted"><Container className="grid gap-12 lg:grid-cols-2 lg:gap-24">
    <div><p className="eyebrow text-primary-action">Nuestra filosofía</p><h2 id="philosophy-title" className="mt-5 max-w-md text-4xl font-medium leading-tight tracking-tight text-primary sm:text-5xl">{COMPANY.motto}</h2><p className="mt-6 max-w-md leading-8 text-text-muted">Una forma de trabajar que pone el cuidado del análisis y la comprensión de cada persona en el centro de la asesoría.</p></div>
    <div className="divide-y divide-border">{principles.map((principle, index) => <div key={principle.title} className="flex gap-5 py-6 first:pt-0 last:pb-0"><span aria-hidden="true" className="pt-1 text-xs font-medium text-primary-action">0{index + 1}</span><div><h3 className="text-xl font-medium text-primary">{principle.title}</h3><p className="mt-3 text-sm leading-7 text-text-muted">{principle.description}</p></div></div>)}</div>
  </Container></section>;
}
