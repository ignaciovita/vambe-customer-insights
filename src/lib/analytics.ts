import {
    Industry,
    PainPoint,
    AcquisitionChannel,
    RequiredIntegration,
} from "@/generated/prisma/client";
import {
    INDUSTRY_LABELS,
    PAIN_POINT_LABELS,
    ACQUISITION_LABELS,
    INTEGRATION_LABELS,
} from "./constants";
  
export interface ClientRecord {
    id: string;
    name: string;
    email: string;
    phone: string;
    salesRep: string;
    meetingDate: string | Date;
    closed: boolean;
    transcript: string;
    industry: Industry | null;
    painPoint: PainPoint | null;
    requiredIntegrations: RequiredIntegration[];
    estimatedVolume: number | null;
    acquisitionChannel: AcquisitionChannel | null;
    createdAt: string | Date;
}
  
export interface FilterState {
    search: string;
    industry: Industry | "ALL";
    painPoint: PainPoint | "ALL";
    salesRep: string | "ALL";
    closed: "ALL" | "CLOSED" | "OPEN";
}
  
// 1. Filtrado en memoria
export function filterClients(
    clients: ClientRecord[],
    filters: FilterState
): ClientRecord[] {
    const query = filters.search.trim().toLowerCase();
  
    return clients.filter((client) => {
      // Filtro por texto libre (Nombre, Email, Vendedor)
      if (query) {
        const matchName = client.name.toLowerCase().includes(query);
        const matchEmail = client.email.toLowerCase().includes(query);
        const matchRep = client.salesRep.toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchRep) return false;
      }
  
      // Filtro por Industria
      if (filters.industry !== "ALL" && client.industry !== filters.industry) {
        return false;
      }
  
      // Filtro por Dolor Principal
      if (filters.painPoint !== "ALL" && client.painPoint !== filters.painPoint) {
        return false;
      }
  
      // Filtro por Vendedor
      if (filters.salesRep !== "ALL" && client.salesRep !== filters.salesRep) {
        return false;
      }
  
      // Filtro por Estado de Cierre
      if (filters.closed !== "ALL") {
        const isClosed = filters.closed === "CLOSED";
        if (client.closed !== isClosed) return false;
      }
  
      return true;
    });
}
  
// 2. Cálculo de KPIs Generales
export function calculateKPIs(clients: ClientRecord[]) {
    const total = clients.length;
    if (total === 0) {
      return {
        totalLeads: 0,
        closedLeads: 0,
        winRate: 0,
        avgVolume: 0,
      };
    }
  
    const closedLeads = clients.filter((c) => c.closed).length;
    const winRate = Number(((closedLeads / total) * 100).toFixed(1));
  
    const clientsWithVolume = clients.filter(
      (c) => c.estimatedVolume !== null && c.estimatedVolume > 0
    );
    const totalVolume = clientsWithVolume.reduce(
      (acc, curr) => acc + (curr.estimatedVolume || 0),
      0
    );
    const avgVolume =
      clientsWithVolume.length > 0
        ? Math.round(totalVolume / clientsWithVolume.length)
        : 0;
  
    return {
      totalLeads: total,
      closedLeads,
      winRate,
      avgVolume,
    };
}
  
// 3. Serie para Recharts: Tasa de Cierre y Volumen por Industria
export function getIndustryConversionData(clients: ClientRecord[]) {
    const grouped: Record<
      string,
      { total: number; closed: number; label: string }
    > = {};
  
    for (const client of clients) {
      const key = client.industry || "OTHER";
      if (!grouped[key]) {
        grouped[key] = {
          total: 0,
          closed: 0,
          label: INDUSTRY_LABELS[key as Industry] || "Otro",
        };
      }
      grouped[key].total += 1;
      if (client.closed) grouped[key].closed += 1;
    }
  
    return Object.entries(grouped)
      .map(([industryKey, data]) => ({
        key: industryKey,
        name: data.label,
        total: data.total,
        closed: data.closed,
        winRate: Number(((data.closed / data.total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.total - a.total);
}
  
// 4. Serie para Recharts: Distribución de Dolores Operativos (Pain Points)
export function getPainPointDistribution(clients: ClientRecord[]) {
    const counts: Record<string, number> = {};
  
    for (const client of clients) {
      const key = client.painPoint || "OTHER";
      counts[key] = (counts[key] || 0) + 1;
    }
  
    return Object.entries(counts)
      .map(([key, value]) => ({
        key,
        name: PAIN_POINT_LABELS[key as PainPoint] || "Otro",
        count: value,
      }))
      .sort((a, b) => b.count - a.count);
}
  
// 5. Serie para Recharts: Efectividad por Canal de Adquisición
export function getAcquisitionChannelData(clients: ClientRecord[]) {
    const grouped: Record<string, { total: number; closed: number }> = {};
  
    for (const client of clients) {
      const key = client.acquisitionChannel || "OTHER";
      if (!grouped[key]) grouped[key] = { total: 0, closed: 0 };
      grouped[key].total += 1;
      if (client.closed) grouped[key].closed += 1;
    }
  
    return Object.entries(grouped)
      .map(([key, val]) => ({
        key,
        name: ACQUISITION_LABELS[key as AcquisitionChannel] || "Otro",
        total: val.total,
        closed: val.closed,
        conversionRate: Number(((val.closed / val.total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.total - a.total);
}
  
// 6. Serie para Recharts: Integraciones Más Demandadas
export function getRequiredIntegrationsData(clients: ClientRecord[]) {
    const counts: Record<string, number> = {};
  
    for (const client of clients) {
      for (const integration of client.requiredIntegrations) {
        counts[integration] = (counts[integration] || 0) + 1;
      }
    }
  
    return Object.entries(counts)
      .map(([key, count]) => ({
        key,
        name: INTEGRATION_LABELS[key as RequiredIntegration] || "Otra",
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7); // Top 7 integraciones
}

// Conversión por Canal de Adquisición (ordenado descendentemente por tasa de conversión)
export function getAcquisitionChannelConversion(clients: ClientRecord[]) {
    const grouped: Record<string, { total: number; closed: number }> = {};
  
    for (const client of clients) {
      const key = client.acquisitionChannel || "OTHER";
      if (!grouped[key]) grouped[key] = { total: 0, closed: 0 };
      grouped[key].total += 1;
      if (client.closed) grouped[key].closed += 1;
    }
  
    return Object.entries(grouped)
      .map(([key, val]) => ({
        key,
        name: ACQUISITION_LABELS[key as AcquisitionChannel] || "Otro",
        total: val.total,
        closed: val.closed,
        winRate: Number(((val.closed / val.total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.winRate - a.winRate); // Orden descendente por % de conversión
}
  
// Conversión por Requerimiento de Integración (ordenado descendentemente por tasa de conversión)
export function getIntegrationConversionData(clients: ClientRecord[]) {
    const grouped: Record<string, { total: number; closed: number }> = {};
  
    for (const client of clients) {
      for (const integration of client.requiredIntegrations) {
        if (!grouped[integration]) {
          grouped[integration] = { total: 0, closed: 0 };
        }
        grouped[integration].total += 1;
        if (client.closed) {
          grouped[integration].closed += 1;
        }
      }
    }
  
    return Object.entries(grouped)
      .map(([key, val]) => ({
        key,
        name: INTEGRATION_LABELS[key as RequiredIntegration] || key,
        total: val.total,
        closed: val.closed,
        winRate: Number(((val.closed / val.total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.winRate - a.winRate); // Orden descendente por % de conversión
}