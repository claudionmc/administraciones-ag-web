"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/app/acceso-clientes/actions";

export function ClientAccessForm({ enabled = false }: { enabled?: boolean }) {
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const [demoError, setDemoError] = useState(false);
  const [state, action, pending] = useActionState(signIn, { error: "" });

  useEffect(() => {
    if (fieldsetRef.current) fieldsetRef.current.disabled = false;
  }, []);

  function handleDemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setDemoError(true);
  }

  return (
    <form action={enabled ? action : undefined} onSubmit={enabled ? undefined : handleDemo}
      aria-describedby="client-access-notice" autoComplete={enabled ? "on" : "off"}>
      <fieldset ref={fieldsetRef} disabled className="space-y-6">
        <legend className="sr-only">Credenciales de acceso</legend>
        <div>
          <label htmlFor="client-email" className="block text-sm font-medium text-primary">Email</label>
          <input id="client-email" name={enabled ? "email" : undefined} type="email" required
            maxLength={254} autoCapitalize="none" spellCheck={false}
            autoComplete={enabled ? "username" : "off"}
            onChange={() => setDemoError(false)}
            className="mt-2 min-h-12 w-full rounded-sm border border-border bg-surface px-4 py-3 text-primary" />
        </div>
        <div>
          <label htmlFor="client-password" className="block text-sm font-medium text-primary">Contraseña</label>
          <input id="client-password" name={enabled ? "password" : undefined} type="password" required
            maxLength={1024} autoComplete={enabled ? "current-password" : "off"}
            onChange={() => setDemoError(false)}
            className="mt-2 min-h-12 w-full rounded-sm border border-border bg-surface px-4 py-3 text-primary" />
        </div>
        <div role="alert" aria-atomic="true">
          {(demoError || state.error) && <p className="border-l-2 border-primary-action bg-surface-muted p-4 text-sm font-medium text-primary">
            {enabled ? state.error : "Error: usuario no registrado"}
          </p>}
        </div>
        <Button type="submit" disabled={pending} className="w-full">{pending ? "Ingresando…" : "Ingresar"}</Button>
      </fieldset>
      <noscript><p className="mt-4 text-sm text-text-muted">Active JavaScript para utilizar este formulario.</p></noscript>
    </form>
  );
}
