export type ServiceAreaId = "tributaria" | "financiera" | "patrimonial";

export interface Service { readonly id: string; readonly title: string; readonly description: string; }
export interface ServiceArea {
  readonly id: ServiceAreaId;
  readonly title: string;
  readonly description: string;
  readonly summary: string;
  readonly scopeNote?: string;
  readonly homeScopeNote?: string;
  readonly services: readonly Service[];
}

export const SERVICE_AREAS = [
  {
    "id": "tributaria",
    "title": "Asesoría tributaria",
    "description": "Servicios de revisión y planificación tributaria personal.",
    "summary": "Comprenda sus obligaciones y planifique su situación tributaria personal.",
    "services": [
      {
        "id": "tributaria-1",
        "description": "Revisión de antecedentes y preparación de declaraciones para abordar sus obligaciones tributarias personales.",
        "title": "Declaración y revisión de impuestos."
      },
      {
        "id": "tributaria-2",
        "description": "Análisis de su situación y de las implicancias tributarias de sus decisiones personales.",
        "title": "Planificación tributaria personal."
      },
      {
        "id": "tributaria-3",
        "description": "Revisión de los aspectos tributarios asociados a la tenencia, arriendo y enajenación de inmuebles.",
        "title": "Tributación inmobiliaria."
      },
      {
        "id": "tributaria-4",
        "description": "Análisis del tratamiento tributario de sus inversiones y de las ganancias de capital, según los antecedentes del caso.",
        "title": "Tributación de inversiones y ganancias de capital."
      }
    ]
  },
  {
    "id": "financiera",
    "title": "Planificación financiera",
    "description": "Análisis para su propia comprensión y planificación financiera personal; sin certificaciones de capacidad de pago ni evaluaciones crediticias para terceros.",
    "summary": "Ordene sus finanzas personales y dé estructura a sus objetivos.",
    "scopeNote": "Planificación para su propio uso; sin certificaciones de capacidad de pago ni evaluaciones crediticias para terceros.",
    "homeScopeNote": "Planificación para su propio uso.",
    "services": [
      {
        "id": "financiera-1",
        "description": "Revisión conjunta de ingresos, gastos, activos y obligaciones para comprender su situación financiera.",
        "title": "Diagnóstico financiero personal."
      },
      {
        "id": "financiera-2",
        "description": "Organización de entradas y salidas de dinero para construir un presupuesto y una proyección de sus flujos.",
        "title": "Presupuesto y planificación de flujos de caja."
      },
      {
        "id": "financiera-3",
        "description": "Definición de prioridades, horizontes y necesidades de recursos para sus objetivos personales.",
        "title": "Planificación de objetivos financieros."
      },
      {
        "id": "financiera-4",
        "description": "Revisión de sus obligaciones y comparación de costos de financiamiento para su propia comprensión y planificación, sin informes de solvencia para terceros.",
        "title": "Análisis de endeudamiento y financiamiento."
      }
    ]
  },
  {
    "id": "patrimonial",
    "title": "Planificación y análisis patrimonial",
    "description": "Análisis objetivo y descriptivo del patrimonio y de carteras existentes, sin recomendaciones personalizadas de inversión.",
    "summary": "Comprenda la composición y evolución de su patrimonio.",
    "scopeNote": "Análisis descriptivo; sin recomendaciones personalizadas de inversión ni gestión discrecional de cartera.",
    "homeScopeNote": "Análisis descriptivo, sin recomendaciones de inversión.",
    "services": [
      {
        "id": "patrimonial-1",
        "description": "Organización de sus activos y pasivos para obtener una visión de conjunto de su patrimonio.",
        "title": "Diagnóstico patrimonial."
      },
      {
        "id": "patrimonial-2",
        "description": "Análisis de la composición patrimonial y de sus cambios a lo largo del tiempo.",
        "title": "Estructura y evolución del patrimonio."
      },
      {
        "id": "patrimonial-3",
        "description": "Descripción de la composición, concentración y evolución de una cartera existente, sin recomendaciones de compra, venta o mantención.",
        "title": "Análisis financiero descriptivo de cartera existente."
      },
      {
        "id": "patrimonial-4",
        "description": "Preparación de reportes para observar cambios patrimoniales y mantener ordenada la información de seguimiento.",
        "title": "Seguimiento y reportes patrimoniales."
      }
    ]
  }
] as const satisfies readonly ServiceArea[];

