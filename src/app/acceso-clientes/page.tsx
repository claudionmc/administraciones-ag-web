import type { Metadata } from "next";
import { ClientAccessForm } from "@/components/client-access-form";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Acceso clientes",
  description: "Acceso de clientes de Administraciones AG SpA.",
  robots: { index: false, follow: false },
};

export default function ClientAccessPage() {
  return (
    <section aria-labelledby="client-access-title" className="section-space bg-surface-muted">
      <Container>
        <div className="mx-auto max-w-lg">
          <p className="eyebrow text-primary-action">Administraciones AG SpA</p>
          <h1 id="client-access-title" className="mt-5 text-4xl font-medium tracking-tight text-primary sm:text-5xl">
            Acceso clientes
          </h1>
          <p id="client-access-notice" className="mt-6 leading-7 text-text-muted">
            El acceso aún no está habilitado. Este formulario no envía ni guarda
            los datos ingresados y no permite iniciar sesión.
          </p>
          <div className="mt-8 border border-border bg-surface p-6 sm:p-8">
            <ClientAccessForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
