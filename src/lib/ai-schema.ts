import { z } from "zod";

export const classificationSchema = z.object({
  industry: z.enum([
    "RETAIL",
    "ECOMMERCE",
    "HEALTH_WELLNESS",
    "GASTRONOMY_RESTAURANTS",
    "FINANCE_INSURANCE",
    "REAL_ESTATE",
    "TRAVEL_HOSPITALITY",
    "TELECOM_TECH",
    "ENERGY_UTILITIES",
    "EDUCATION",
    "AUTOMOTIVE",
    "LOGISTICS_TRANSPORT",
    "SERVICES_B2B",
    "OTHER",
  ]).describe("La industria o sector principal del cliente."),

  painPoint: z.enum([
    "APPOINTMENT_SCHEDULING",
    "HIGH_VOLUME_INQUIRIES",
    "ORDER_TRACKING_LOGISTICS",
    "TECHNICAL_SUPPORT_TRIAGE",
    "PRICING_AND_QUOTING",
    "CATALOG_AND_AVAILABILITY",
    "OFF_HOURS_ATTENTION",
    "LEAD_QUALIFICATION",
    "OTHER",
  ]).describe("El dolor operativo central o cuello de botella que busca resolver."),

  requiredIntegrations: z.array(
    z.enum([
      "CRM",
      "ERP_INVENTORY",
      "SCHEDULING_CALENDAR",
      "ORDER_MANAGEMENT_POS",
      "TRACKING_GPS",
      "LMS_EDUCATION",
      "EHR_CLINICAL_RECORDS",
      "WHATSAPP_MESSAGING",
      "PAYMENTS_SUBSCRIPTION",
      "EXTERNAL_APIS_GOV",
      "OTHER",
    ])
  ).describe("Lista de integraciones técnicas o herramientas explícitamente solicitadas."),

  estimatedVolume: z.number().nullable().describe(
    "Volumen estimado mensual de consultas, mensajes o transacciones. Normalizar a escala mensual (ej. 500 diarios -> 15000). Si no se menciona o no es claro, retornar null."
  ),

  acquisitionChannel: z.enum([
    "LINKEDIN",
    "SEARCH_ENGINE",
    "PEER_RECOMMENDATION",
    "PODCAST_MEDIA",
    "INDUSTRY_FAIR_EVENT",
    "WEBINAR_ONLINE_EVENT",
    "BLOG_SPECIALIZED_ARTICLE",
    "SOCIAL_MEDIA_ORGANIC",
    "OTHER",
  ]).describe("Cómo el prospecto conoció a Vambe."),
});

export type ClientClassification = z.infer<typeof classificationSchema>;