"use client";

import React from "react";
import { Search, X, RotateCcw } from "lucide-react";
import { FilterState, ClientRecord } from "@/lib/analytics";
import { INDUSTRY_LABELS, PAIN_POINT_LABELS } from "@/lib/constants";
import { Industry, PainPoint } from "@/generated/prisma/client";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  clients: ClientRecord[];
  filteredCount: number;
}

export function FilterBar({
  filters,
  onFilterChange,
  clients,
  filteredCount,
}: FilterBarProps) {
  // Extraer lista única de representantes comerciales en base a los datos existentes
  const availableSalesReps = React.useMemo(() => {
    const reps = new Set<string>();
    clients.forEach((c) => {
      if (c.salesRep && c.salesRep.trim() !== "") {
        reps.add(c.salesRep.trim());
      }
    });
    return Array.from(reps).sort();
  }, [clients]);

  // Verificar si hay algún filtro activo para mostrar el botón de reinicio
  const isFiltered =
    filters.search !== "" ||
    filters.industry !== "ALL" ||
    filters.painPoint !== "ALL" ||
    filters.salesRep !== "ALL" ||
    filters.closed !== "ALL";

  const handleReset = () => {
    onFilterChange({
      search: "",
      industry: "ALL",
      painPoint: "ALL",
      salesRep: "ALL",
      closed: "ALL",
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Buscador de texto */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, email o vendedor..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="w-full pl-9 pr-8 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Selector de Industria */}
        <select
          value={filters.industry}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              industry: e.target.value as Industry | "ALL",
            })
          }
          className="text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
        >
          <option value="ALL">Todas las Industrias</option>
          {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Selector de Dolor Principal */}
        <select
          value={filters.painPoint}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              painPoint: e.target.value as PainPoint | "ALL",
            })
          }
          className="text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
        >
          <option value="ALL">Todos los Dolores</option>
          {Object.entries(PAIN_POINT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Selector de Vendedor */}
        <select
          value={filters.salesRep}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              salesRep: e.target.value,
            })
          }
          className="text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
        >
          <option value="ALL">Todos los Vendedores</option>
          {availableSalesReps.map((rep) => (
            <option key={rep} value={rep}>
              {rep}
            </option>
          ))}
        </select>

        {/* Selector de Estado de Cierre */}
        <select
          value={filters.closed}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              closed: e.target.value as "ALL" | "CLOSED" | "OPEN",
            })
          }
          className="text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
        >
          <option value="ALL">Estado: Todos</option>
          <option value="CLOSED">Solo Cerrados (Won)</option>
          <option value="OPEN">Solo Abiertos (In Progress)</option>
        </select>
      </div>

      {/* Barra de estado inferior: Conteo y botón de reseteo */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
        <span>
          Mostrando <strong>{filteredCount}</strong> de{" "}
          <strong>{clients.length}</strong> clientes registrados
        </span>

        {isFiltered && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}