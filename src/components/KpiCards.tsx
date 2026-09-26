"use client";

import React from "react";
import { Users, CheckCircle2, TrendingUp, BarChart3 } from "lucide-react";

interface KpiCardsProps {
  metrics: {
    totalLeads: number;
    closedLeads: number;
    winRate: number;
    avgVolume: number;
  };
}

export function KpiCards({ metrics }: KpiCardsProps) {
  const { totalLeads, closedLeads, winRate, avgVolume } = metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Leads Filtrados */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total Leads
          </span>
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {totalLeads.toLocaleString()}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Prospectos en el segmento actual
          </p>
        </div>
      </div>

      {/* 2. Clientes Cerrados (Won) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Ventas Cerradas
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {closedLeads.toLocaleString()}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Acuerdos comerciales concretados
          </p>
        </div>
      </div>

      {/* 3. Tasa de Conversión (Win Rate) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Tasa de Cierre (Win Rate)
          </span>
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {winRate}%
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {totalLeads > 0
              ? `${closedLeads} de ${totalLeads} prospectos convertidos`
              : "Sin datos disponibles"}
          </p>
        </div>
      </div>

      {/* 4. Volumen Promedio Mensual Estimado */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Volumen Promedio / Mes
          </span>
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {avgVolume.toLocaleString()}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Consultas mensuales por cliente
          </p>
        </div>
      </div>
    </div>
  );
}