import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { clientAccessEnabled, createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/acceso-clientes/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Área de clientes", robots: { index: false, follow: false } };

export default async function ClientsPage() {
  if (!clientAccessEnabled()) redirect("/acceso-clientes");
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/acceso-clientes");
  const { data: client, error: profileError } = await supabase.from("clientes")
    .select("id").eq("id", user.id).eq("activo", true).maybeSingle();
  if (profileError || !client) redirect("/acceso-clientes");
  return <section className="section-space bg-surface-muted"><Container>
    <h1 className="text-4xl font-medium text-primary">Área de clientes</h1>
    <p className="mt-6 text-text-muted">Su sesión está iniciada. Aún no hay documentos ni reportes disponibles.</p>
    <form action={signOut} className="mt-8"><Button type="submit">Cerrar sesión</Button></form>
  </Container></section>;
}
