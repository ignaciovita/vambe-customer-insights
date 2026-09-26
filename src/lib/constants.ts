import { Industry, PainPoint, AcquisitionChannel, RequiredIntegration } from "@/generated/prisma/client";

export const INDUSTRY_LABELS: Record<Industry, string> = {
  RETAIL: "Retail & Tiendas Físicas",
  ECOMMERCE: "E-commerce & Tiendas Online",
  HEALTH_WELLNESS: "Salud, Bienestar & Belleza",
  GASTRONOMY_RESTAURANTS: "Gastronomía & Restaurantes",
  FINANCE_INSURANCE: "Seguros & Finanzas",
  REAL_ESTATE: "Inmobiliaria & Propiedades",
  TRAVEL_HOSPITALITY: "Turismo & Hotelería",
  TELECOM_TECH: "Tecnología & Telecomunicaciones",
  ENERGY_UTILITIES: "Energía & Servicios",
  EDUCATION: "Educación & Academias",
  AUTOMOTIVE: "Automotriz & Talleres",
  LOGISTICS_TRANSPORT: "Logística & Transporte",
  SERVICES_B2B: "Servicios B2B & Consultoría",
  OTHER: "Otros Rubros",
};

export const PAIN_POINT_LABELS: Record<PainPoint, string> = {
  APPOINTMENT_SCHEDULING: "Agendamiento de Citas/Horas",
  HIGH_VOLUME_INQUIRIES: "Alto Volumen de Consultas",
  ORDER_TRACKING_LOGISTICS: "Seguimiento de Pedidos/Tracking",
  TECHNICAL_SUPPORT_TRIAGE: "Soporte Técnico Especializado",
  PRICING_AND_QUOTING: "Cotizaciones & Precios Complejos",
  CATALOG_AND_AVAILABILITY: "Consulta de Catálogo y Stock",
  OFF_HOURS_ATTENTION: "Atención Fuera de Horario (24/7)",
  LEAD_QUALIFICATION: "Calificación de Prospectos (Leads)",
  OTHER: "Otros Dolores",
};

export const ACQUISITION_LABELS: Record<AcquisitionChannel, string> = {
  LINKEDIN: "LinkedIn",
  SEARCH_ENGINE: "Google / Búsqueda Orgánica",
  PEER_RECOMMENDATION: "Recomendación Boca a Boca",
  PODCAST_MEDIA: "Podcast / Medios",
  INDUSTRY_FAIR_EVENT: "Feria / Evento Presencial",
  WEBINAR_ONLINE_EVENT: "Webinar / Evento Online",
  BLOG_SPECIALIZED_ARTICLE: "Artículo Especializado / Blog",
  SOCIAL_MEDIA_ORGANIC: "Redes Sociales",
  OTHER: "Otros Canales",
};

export const INTEGRATION_LABELS: Record<RequiredIntegration, string> = {
  CRM: "CRM (Hubspot/Salesforce)",
  ERP_INVENTORY: "ERP / Inventario",
  SCHEDULING_CALENDAR: "Calendario / Agendamiento",
  ORDER_MANAGEMENT_POS: "POS / Gestión de Órdenes",
  TRACKING_GPS: "Tracking GPS",
  LMS_EDUCATION: "LMS / Plataforma Educativa",
  EHR_CLINICAL_RECORDS: "Ficha Médica / EHR",
  WHATSAPP_MESSAGING: "WhatsApp Business API",
  PAYMENTS_SUBSCRIPTION: "Pasarela de Pagos / Billing",
  EXTERNAL_APIS_GOV: "APIs Externas / Gubernamentales",
  OTHER: "Otras Integraciones",
};