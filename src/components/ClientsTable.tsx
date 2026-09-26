"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  X,
  Calendar,
  User,
  Mail,
  Phone,
  BarChart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ClientRecord } from "@/lib/analytics";
import {
  INDUSTRY_LABELS,
  PAIN_POINT_LABELS,
  ACQUISITION_LABELS,
  INTEGRATION_LABELS,
} from "@/lib/constants";
import { Industry, PainPoint, AcquisitionChannel, RequiredIntegration } from "@/generated/prisma/client";

interface ClientsTableProps {
  clients: ClientRecord[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Paginación en memoria
  const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE) || 1;
  const paginatedClients = clients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (rawDate: string | Date) => {
    try {
      const d = new Date(rawDate);
      return d.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(rawDate);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
      {/* Encabezado de la tabla */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Directorio de Clientes y Transcripciones
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Muestra detallada de los registros clasificados por IA según los filtros activos.
          </p>
        </div>
      </div>

      {/* Contenedor de la tabla con scroll horizontal si es necesario */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-medium">
              <th className="py-3 px-4">Cliente</th>
              <th className="py-3 px-4">Industria</th>
              <th className="py-3 px-4">Dolor Principal</th>
              <th className="py-3 px-4">Integraciones</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4">Vendedor</th>
              <th className="py-3 px-4 text-right">Transcripción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/70">
            {paginatedClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-zinc-500 dark:text-zinc-400">
                  No se encontraron prospectos que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              paginatedClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                >
                  {/* Nombre y Email */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {client.name}
                    </div>
                    <div className="text-xs text-zinc-400 dark:text-zinc-500">
                      {client.email}
                    </div>
                  </td>

                  {/* Badge Industria */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                      {client.industry ? INDUSTRY_LABELS[client.industry as Industry] : "Otro"}
                    </span>
                  </td>

                  {/* Badge Dolor */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50">
                      {client.painPoint ? PAIN_POINT_LABELS[client.painPoint as PainPoint] : "Otro"}
                    </span>
                  </td>

                  {/* Integraciones (muestra hasta 2 y contador) */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {client.requiredIntegrations.slice(0, 2).map((item) => (
                        <span
                          key={item}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                        >
                          {INTEGRATION_LABELS[item as RequiredIntegration] || item}
                        </span>
                      ))}
                      {client.requiredIntegrations.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                          +{client.requiredIntegrations.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Estado Won / In Progress */}
                  <td className="py-3.5 px-4 text-center">
                    {client.closed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cerrado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        <XCircle className="w-3.5 h-3.5" />
                        Abierto
                      </span>
                    )}
                  </td>

                  {/* Representante de Ventas */}
                  <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 text-xs">
                    {client.salesRep}
                  </td>

                  {/* Botón Ver Transcripción */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                    >
                      <span>Ver</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <div>
          Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> (
          {clients.length} clientes)
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal de Detalle de Transcripción */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Cabecera del modal */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <div>
                <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedClient.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {selectedClient.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedClient.phone}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-5">
              {/* Tarjetas de Dimensiones Extraídas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide block">
                    Industria
                  </span>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                    {selectedClient.industry
                      ? INDUSTRY_LABELS[selectedClient.industry as Industry]
                      : "No clasificada"}
                  </span>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide block">
                    Dolor Principal
                  </span>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                    {selectedClient.painPoint
                      ? PAIN_POINT_LABELS[selectedClient.painPoint as PainPoint]
                      : "No clasificado"}
                  </span>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide block">
                    Canal Adquisición
                  </span>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                    {selectedClient.acquisitionChannel
                      ? ACQUISITION_LABELS[selectedClient.acquisitionChannel as AcquisitionChannel]
                      : "No detectado"}
                  </span>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide block">
                    Volumen Estimado
                  </span>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 block flex items-center gap-1">
                    <BarChart className="w-3.5 h-3.5 text-amber-500" />
                    {selectedClient.estimatedVolume
                      ? `${selectedClient.estimatedVolume.toLocaleString()} / mes`
                      : "No especificado"}
                  </span>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide block">
                    Vendedor y Fecha
                  </span>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 block flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    {selectedClient.salesRep}
                  </span>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(selectedClient.meetingDate)}
                  </span>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide block">
                    Resultado
                  </span>
                  <span
                    className={`text-xs font-semibold mt-0.5 block ${
                      selectedClient.closed
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-zinc-500"
                    }`}
                  >
                    {selectedClient.closed ? "Acuerdo Cerrado" : "En Seguimiento"}
                  </span>
                </div>
              </div>

              {/* Integraciones Requeridas */}
              <div>
                <h5 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Integraciones Solicitadas:
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedClient.requiredIntegrations.length === 0 ? (
                    <span className="text-xs text-zinc-400">Sin integraciones explícitas</span>
                  ) : (
                    selectedClient.requiredIntegrations.map((integ) => (
                      <span
                        key={integ}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                      >
                        {INTEGRATION_LABELS[integ as RequiredIntegration] || integ}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Transcripción Completa */}
              <div>
                <h5 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Transcripción Original:
                </h5>
                <div className="bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {selectedClient.transcript}
                </div>
              </div>
            </div>

            {/* Pie de modal */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end bg-zinc-50/50 dark:bg-zinc-900/80 sticky bottom-0">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}