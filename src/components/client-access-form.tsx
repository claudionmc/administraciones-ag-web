"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function ClientAccessForm() {
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (fieldsetRef.current) fieldsetRef.current.disabled = false;
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setHasError(true);
  }

  return (
    <form onSubmit={handleSubmit} aria-describedby="client-access-notice" autoComplete="off">
      {/* No names: credentials must never be serialized as form data. */}
      <fieldset ref={fieldsetRef} disabled className="space-y-6">
        <legend className="sr-only">Credenciales de acceso</legend>
        <div>
          <label htmlFor="client-username" className="block text-sm font-medium text-primary">Usuario</label>
          <input
            id="client-username"
            type="text"
            required
            autoCapitalize="none"
            spellCheck={false}
            autoComplete="off"
            onChange={() => setHasError(false)}
            className="mt-2 min-h-12 w-full rounded-sm border border-border bg-surface px-4 py-3 text-primary"
          />
        </div>
        <div>
          <label htmlFor="client-password" className="block text-sm font-medium text-primary">Contraseña</label>
          <input
            id="client-password"
            type="password"
            required
            autoComplete="off"
            onChange={() => setHasError(false)}
            className="mt-2 min-h-12 w-full rounded-sm border border-border bg-surface px-4 py-3 text-primary"
          />
        </div>
        <div role="alert" aria-atomic="true">
          {hasError && <p className="border-l-2 border-primary-action bg-surface-muted p-4 text-sm font-medium text-primary">Error: usuario no registrado</p>}
        </div>
        <Button type="submit" className="w-full">Ingresar</Button>
      </fieldset>
      <noscript><p className="mt-4 text-sm text-text-muted">Active JavaScript para utilizar este formulario de demostración.</p></noscript>
    </form>
  );
}
