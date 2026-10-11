export type ServiceAreaId = "tributaria" | "financiera" | "patrimonial";

export interface Service { readonly id: string; readonly title: string; }
export interface ServiceArea {
  readonly id: ServiceAreaId;
  readonly title: string;
  readonly description: string;
  readonly services: readonly Service[];
}

export const SERVICE_AREAS = [
  {
    "id": "tributaria",
    "title": "Asesoría tributaria",
    "description": "Servicios de revisión y planificación tributaria personal.",
    "services": [
      {
        "id": "tributaria-1",
        "title": "Declaración y revisión de impuestos."
      },
      {
        "id": "tributaria-2",
        "title": "Planificación tributaria personal."
      },
      {
        "id": "tributaria-3",
        "title": "Tributación inmobiliaria."
      },
      {
        "id": "tributaria-4",
        "title": "Tributación de inversiones y ganancias de capital."
      }
    ]
  },
  {
    "id": "financiera",
    "title": "Planificación financiera",
    "description": "Análisis para su propia comprensión y planificación financiera personal; sin certificaciones de capacidad de pago ni evaluaciones crediticias para terceros.",
    "services": [
      {
        "id": "financiera-1",
        "title": "Diagnóstico financiero personal."
      },
      {
        "id": "financiera-2",
        "title": "Presupuesto y planificación de flujos de caja."
      },
      {
        "id": "financiera-3",
        "title": "Planificación de objetivos financieros."
      },
      {
        "id": "financiera-4",
        "title": "Análisis de endeudamiento y financiamiento."
      }
    ]
  },
  {
    "id": "patrimonial",
    "title": "Planificación y análisis patrimonial",
    "description": "Análisis objetivo y descriptivo del patrimonio y de carteras existentes, sin recomendaciones personalizadas de inversión.",
    "services": [
      {
        "id": "patrimonial-1",
        "title": "Diagnóstico patrimonial."
      },
      {
        "id": "patrimonial-2",
        "title": "Estructura y evolución del patrimonio."
      },
      {
        "id": "patrimonial-3",
        "title": "Análisis financiero descriptivo de cartera existente."
      },
      {
        "id": "patrimonial-4",
        "title": "Seguimiento y reportes patrimoniales."
      }
    ]
  }
] as const satisfies readonly ServiceArea[];

