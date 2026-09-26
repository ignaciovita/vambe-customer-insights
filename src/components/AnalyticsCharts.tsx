"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ClientRecord,
  getIndustryConversionData,
  getPainPointDistribution,
  getAcquisitionChannelData,
  getRequiredIntegrationsData,
  getAcquisitionChannelConversion,
  getIntegrationConversionData
} from "@/lib/analytics";
import { BarChart3, PieChart as PieIcon, Cpu, Layers } from "lucide-react";

interface AnalyticsChartsProps {
  clients: ClientRecord[];
}

const PALETTE = [
  "#4f46e5", // Indigo
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#64748b", // Slate
];

// Tooltip estilizado para gráficos oscuros/claros
function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const activeEntry = payload[0];
  
      // Se activa SOLO en los gráficos donde la barra mide la tasa de conversión
      const isConversionBar = activeEntry.dataKey === "winRate";
  
      return (
        <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 p-3 rounded-lg shadow-xl text-xs space-y-1.5">
          <p className="font-semibold text-zinc-200 border-b border-zinc-800 pb-1">
            {label || data.name}
          </p>
  
          {isConversionBar ? (
            <>
              <p className="text-emerald-400 font-bold">
                Conversión: {data.winRate}%
              </p>
              <p className="text-zinc-400">
                Proporción:{" "}
                <span className="font-medium text-zinc-200">
                  {data.closed} de {data.total}
                </span>{" "}
                leads cerrados
              </p>
            </>
          ) : (
            // Para el gráfico de torta y gráficos de volumen: solo la cantidad
            payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }}>
                {entry.name}: <span className="font-bold">{entry.value}</span>
              </p>
            ))
          )}
        </div>
      );
    }
    return null;
}

export function AnalyticsCharts({ clients }: AnalyticsChartsProps) {
  const industryData = useMemo(() => getIndustryConversionData(clients), [clients]);
  const painPointData = useMemo(() => getPainPointDistribution(clients).slice(0, 6), [clients]);
  const channelData = useMemo(() => getAcquisitionChannelData(clients), [clients]);
  const integrationData = useMemo(() => getRequiredIntegrationsData(clients), [clients]);
  const channelConversionData = useMemo(() => getAcquisitionChannelConversion(clients), [clients]);
  const integrationConversionData = useMemo(() => getIntegrationConversionData(clients), [clients]);

  if (clients.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-10 text-center">
        <Layers className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
          No hay datos para mostrar en este segmento
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Ajusta los filtros o sube más transcripciones para visualizar métricas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Conversión y Volumen por Industria */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Desempeño y Cierres por Industria
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-medium">Total vs. Cerrados</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={industryData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#71717a" }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: "#71717a" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Total Leads" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="closed" name="Cerrados (Won)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Distribución de Dolores Principales */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Top Dolores Operativos (Pain Points)
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-medium">Frecuencia</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={painPointData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" opacity={0.5} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: "#71717a" }}
                width={130}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Casos Detectados" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Canales de Adquisición */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Canales de Origen (Lead Source)
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-medium">Volumen</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelData}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
              >
                {channelData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Integraciones Más Solicitadas */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Integraciones Técnicas Clave
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-medium">Demanda relativa</span>
          </div>

          <div className="space-y-3.5">
            {integrationData.map((item, index) => {
              const maxVal = integrationData[0]?.count || 1;
              const percentage = Math.round((item.count / maxVal) * 100);

              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-700 dark:text-zinc-300">{item.name}</span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {item.count} menciones
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: PALETTE[index % PALETTE.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-zinc-400 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          Útil para priorizar el roadmap de conectores e integraciones oficiales en Vambe.
        </p>
      </div>

      {/* 5. Gráfico: Tasa de Conversión por Canal de Adquisición */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Conversión por Canal de Adquisición (%)
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-medium">0% a 100%</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={channelConversionData}
              margin={{ top: 10, right: 10, left: -20, bottom: 35 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#71717a" }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: "#71717a" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="winRate"
                name="% Conversión"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Gráfico: Tasa de Conversión por Requerimiento de Integración */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Conversión por Integración Requerida (%)
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-medium">0% a 100%</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={integrationConversionData}
              margin={{ top: 10, right: 10, left: -20, bottom: 35 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#71717a" }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: "#71717a" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="winRate"
                name="% Conversión"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}