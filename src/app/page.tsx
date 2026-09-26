"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Sparkles, RefreshCw, AlertCircle, Database } from "lucide-react";
import { CsvUploader } from "@/components/CsvUploader";
import { FilterBar } from "@/components/FilterBar";
import { KpiCards } from "@/components/KpiCards";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ClientsTable } from "@/components/ClientsTable";
import {
  ClientRecord,
  FilterState,
  filterClients,
  calculateKPIs,
} from "@/lib/analytics";

export default function DashboardPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 1. Estado central de filtros globales
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    industry: "ALL",
    painPoint: "ALL",
    salesRep: "ALL",
    closed: "ALL",
  });

  // 2. Función para cargar clientes desde Neon
  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const res = await fetch("/api/clients", { cache: "no-store" });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al cargar la base de datos.");
      }

      const data = await res.json();
      setClients(data.clients || []);
    } catch (err: any) {
      console.error("Error al obtener clientes:", err);
      setFetchError(err.message || "Ocurrió un error de red al consultar Neon.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carga inicial al montar la aplicación
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // 3. Filtrado y cálculos reactivos en memoria (~1ms)
  const filteredClients = useMemo(
    () => filterClients(clients, filters),
    [clients, filters]
  );

  const kpis = useMemo(
    () => calculateKPIs(filteredClients),
    [filteredClients]
  );

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Barra de Navegación Superior */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                Vambe
              </span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                Revenue Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchClients}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition shadow-2xs disabled:opacity-50"
              title="Refrescar datos desde la base de datos"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner de error de red si ocurre */}
        {fetchError && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center justify-between text-red-700 dark:text-red-400 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={fetchClients}
              className="underline font-semibold text-xs hover:text-red-900 dark:hover:text-red-200"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Sección 1: Ingesta de CSV y Deduplicación */}
        <section>
          <CsvUploader onSuccess={fetchClients} />
        </section>

        {/* Estado de carga inicial */}
        {isLoading && clients.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Conectando con Neon y cargando transcripciones...
            </p>
          </div>
        ) : clients.length === 0 ? (
          /* Estado cuando la base de datos está vacía */
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              No hay datos registrados aún
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              Carga un archivo CSV utilizando el botón superior. Las reuniones
              serán analizadas por IA, normalizadas en PostgreSQL y los gráficos
              se generarán automáticamente.
            </p>
          </div>
        ) : (
          <>
            {/* Sección 2: Barra de Filtros Globales */}
            <section className="sticky top-20 z-20">
              <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                clients={clients}
                filteredCount={filteredClients.length}
              />
            </section>

            {/* Sección 3: KPIs */}
            <section>
              <KpiCards metrics={kpis} />
            </section>

            {/* Sección 4: Gráficos de Analítica con Recharts */}
            <section>
              <AnalyticsCharts clients={filteredClients} />
            </section>

            {/* Sección 5: Directorio y Modal de Transcripciones */}
            <section>
              <ClientsTable clients={filteredClients} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}