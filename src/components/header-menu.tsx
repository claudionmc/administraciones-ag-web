"use client";

import { useEffect, useRef, useState } from "react";
import { SiteNavigation } from "@/components/site-navigation";
import { ButtonLink } from "@/components/ui/button";

export function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reset = () => setOpen(false);
    desktop.addEventListener("change", reset);
    return () => desktop.removeEventListener("change", reset);
  }, []);

  function close() {
    setOpen(false);
    toggleRef.current?.focus();
  }

  return (
    <div
      className="contents"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          close();
        }
      }}
    >
      <button
        ref={toggleRef}
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="header-menu"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-11 shrink-0 items-center justify-center text-primary lg:hidden"
      >
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          {open ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>
      <div
        id="header-menu"
        className={`${open ? "flex" : "hidden"} col-span-2 min-w-0 flex-col items-start gap-5 border-t border-border pt-5 lg:flex lg:flex-row lg:items-center lg:gap-8 lg:border-0 lg:pt-0`}
      >
        <SiteNavigation layout="header" onNavigate={close} />
        <ButtonLink href="/contacto" onClick={close}>Solicitar asesoría <span aria-hidden="true">↗</span></ButtonLink>
      </div>
    </div>
  );
}
