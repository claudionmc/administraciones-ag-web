import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { COMPANY, WHATSAPP, WHATSAPP_URL } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Contacto", description: "Modalidades de atención online y presencial, previa coordinación." };

export default function ContactPage() {
  return <Container className="py-16"><h1 className="text-3xl font-semibold text-primary">Contacto</h1>
    <p className="mt-4">Modalidades de atención:</p>
    <ul className="mt-3 list-disc space-y-2 pl-6">{COMPANY.contactModes.map((mode) => <li key={mode}>{mode}</li>)}</ul>
    <p className="mt-6">Puede contactarnos por WhatsApp para solicitar una asesoría.</p>
    <div className="mt-6"><ButtonLink href={WHATSAPP_URL}>{WHATSAPP.buttonLabel}</ButtonLink></div>
  </Container>;
}

