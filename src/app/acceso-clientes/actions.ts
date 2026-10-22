"use server";

import { redirect } from "next/navigation";
import { clientAccessEnabled, createClient } from "@/lib/supabase/server";

export async function signIn(_previous: { error: string }, form: FormData) {
  if (!clientAccessEnabled()) return { error: "El acceso aún no está habilitado." };
  const email = form.get("email");
  const password = form.get("password");
  const invalid = { error: "Email o contraseña incorrectos." };
  if (typeof email !== "string" || typeof password !== "string" ||
    email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    !password || password.length > 1024) return invalid;
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return error.status === 429
      ? { error: "Demasiados intentos. Espere unos minutos antes de volver a intentar." }
      : invalid;
    const { data: client, error: profileError } = await supabase.from("clientes").select("id").eq("activo", true).maybeSingle();
    if (profileError || !client) {
      await supabase.auth.signOut();
      return invalid;
    }
  } catch {
    return { error: "No fue posible iniciar sesión. Inténtelo más tarde." };
  }
  redirect("/clientes");
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("No fue posible cerrar la sesión. Inténtelo nuevamente.");
  redirect("/acceso-clientes");
}
