export const COMPANY = {
  name: "Administraciones AG SpA",
  motto: "Pasión por la excelencia.",
  description: "Asesoría tributaria, planificación financiera y análisis patrimonial para personas e inversionistas en Chile.",
  contactModes: ["Online", "Presencial, previa coordinación"],
} as const;

export const WHATSAPP = {
  phone: "56987430175",
  message: "Solicitar una asesoría",
  buttonLabel: "Solicitar asesoría",
} as const;

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP.phone}?text=${encodeURIComponent(WHATSAPP.message)}`;

export const NAVIGATION = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/contacto", label: "Contacto" },
  { href: "/acceso-clientes", label: "Acceso clientes" },
] as const;

