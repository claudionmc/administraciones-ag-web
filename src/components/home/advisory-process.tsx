import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
const stages = [
  { title: "Comprensión del cliente", description: "Conversamos sobre su situación, sus inquietudes y los objetivos que desea abordar." },
  { title: "Diagnóstico", description: "Revisamos la información disponible e identificamos los aspectos relevantes para el análisis." },
  { title: "Propuesta de trabajo", description: "Definimos con usted el alcance, las etapas y los entregables de la asesoría." },
  { title: "Ejecución y seguimiento", description: "Desarrollamos el trabajo acordado, presentamos los resultados y coordinamos el seguimiento previsto." },
] as const;
export function AdvisoryProcess() {
  return <section aria-labelledby="process-title" className="section-space bg-surface"><Container>
    <div id="process-title"><SectionHeading eyebrow="Cómo trabajamos" title="Un proceso claro, de principio a fin."><p>Cada etapa tiene un propósito: transformar la información en una comprensión útil para su planificación.</p></SectionHeading></div>
    <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{stages.map((stage, index) => <li key={stage.title} className="border-t border-border pt-6"><span aria-hidden="true" className="text-4xl tracking-tight text-primary-action">0{index + 1}</span><h3 className="mt-6 text-lg font-medium text-primary">{stage.title}</h3><p className="mt-3 text-sm leading-7 text-text-muted">{stage.description}</p></li>)}</ol>
  </Container></section>;
}
