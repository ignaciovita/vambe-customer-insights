"use client";

import React, { useState, useRef } from "react";
import Papa from "papaparse";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  DollarSign,
  SlidersHorizontal,
  X,
} from "lucide-react";

const MAX_ALLOWED_ROWS = 30; // Límite seguro para Free Tier (15 RPM)
const CHUNK_SIZE = 8; // Lotes pequeños para no agotar timeouts de Vercel/Next.js

interface IngestionSummary {
  totalRequested: number;
  newlyProcessed: number;
  skippedCached: number;
  failed: number;
  savedCostPercentage: string;
}

interface SanitizedClient {
  name: string;
  email: string;
  phone: string;
  salesRep: string;
  meetingDate: string;
  closed: boolean;
  transcript: string;
}

interface CsvUploaderProps {
  onSuccess: () => void;
}

export function CsvUploader({ onSuccess }: CsvUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [summary, setSummary] = useState<IngestionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados para el Modal de Selección de Rango
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [pendingClients, setPendingClients] = useState<SanitizedClient[]>([]);
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(MAX_ALLOWED_ROWS);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  // Función núcleo que envía las filas en chunks al backend
  const executeIngestion = async (clientsToIngest: SanitizedClient[]) => {
    setShowRangeModal(false);
    setIsProcessing(true);
    setProgress(5);
    setStatusMessage("Preparando lotes de análisis...");

    try {
      const chunks = chunkArray(clientsToIngest, CHUNK_SIZE);
      let totalSkipped = 0;
      let totalProcessed = 0;
      let totalFailed = 0;

      for (let i = 0; i < chunks.length; i++) {
        const currentChunk = chunks[i];
        const currentProgress = Math.round(
          10 + ((i + 1) / chunks.length) * 85
        );
        setProgress(currentProgress);
        setStatusMessage(
          `Procesando lote ${i + 1} de ${chunks.length} (${clientsToIngest.length} clientes)...`
        );

        const response = await fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clients: currentChunk }),
        });

        if (!response.ok) {
          const resError = await response.json();
          throw new Error(resError.error || `Error en lote ${i + 1}`);
        }

        const data = await response.json();
        if (data.summary) {
          totalSkipped += data.summary.skippedCached;
          totalProcessed += data.summary.newlyProcessed;
          totalFailed += data.summary.failed;
        }
      }

      const totalReq = clientsToIngest.length;
      const savedPct =
        totalReq > 0 ? ((totalSkipped / totalReq) * 100).toFixed(1) : "0.0";

      setSummary({
        totalRequested: totalReq,
        newlyProcessed: totalProcessed,
        skippedCached: totalSkipped,
        failed: totalFailed,
        savedCostPercentage: `${savedPct}%`,
      });

      setProgress(100);
      setStatusMessage("¡Procesamiento finalizado!");
      onSuccess();
    } catch (err: any) {
      console.error("Error al procesar el lote:", err);
      setError(err.message || "Ocurrió un error inesperado al procesar el archivo.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSummary(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            throw new Error("El archivo CSV no contiene registros válidos.");
          }

          // Función normalizadora: busca claves ignorando mayúsculas, acentos y espacios
          const normalizeKey = (str: string) =>
            str
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[\s_-]/g, "");

          const getVal = (row: Record<string, string>, ...targets: string[]) => {
            const rowKeys = Object.keys(row);
            for (const target of targets) {
              const normTarget = normalizeKey(target);
              const foundKey = rowKeys.find((k) => normalizeKey(k) === normTarget);
              if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
                return String(row[foundKey]).trim();
              }
            }
            return "";
          };

          const sanitized: SanitizedClient[] = results.data.map((row, index) => {
            const name =
              getVal(row, "Nombre", "name", "cliente") || `Cliente ${index + 1}`;

            const email =
              getVal(row, "Correo Electronico", "Correo", "email") ||
              `contacto${index + 1}@ejemplo.com`;

            const phone =
              getVal(row, "Numero de Telefono", "Telefono", "phone") || "N/A";

            const salesRep =
              getVal(row, "Vendedor asignado", "Vendedor", "salesRep") || "No Asignado";

            const meetingDate =
              getVal(row, "Fecha de la Reunion", "Fecha", "meetingDate") ||
              new Date().toISOString();

            const rawClosed = getVal(row, "closed", "cerrado", "estado");
            const closed =
              rawClosed === "1" ||
              rawClosed.toLowerCase() === "true" ||
              rawClosed.toLowerCase() === "cerrado" ||
              rawClosed.toLowerCase() === "won";

            const transcript = getVal(
              row,
              "Transcripcion",
              "transcript",
              "notas"
            );

            return { name, email, phone, salesRep, meetingDate, closed, transcript };
          });

          const valid = sanitized.filter((c) => c.transcript.length > 5);

          if (valid.length === 0) {
            throw new Error(
              "No se encontraron transcripciones válidas o el texto de la columna 'Transcripcion' está vacío."
            );
          }

          // Si supera el límite de filas, activamos el selector de rango
          if (valid.length > MAX_ALLOWED_ROWS) {
            setPendingClients(valid);
            setRangeFrom(1);
            setRangeTo(MAX_ALLOWED_ROWS);
            setShowRangeModal(true);
          } else {
            executeIngestion(valid);
          }
        } catch (err: any) {
          setError(err.message);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (parseError) => {
        setError(`Error al leer el archivo CSV: ${parseError.message}`);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
    });
  };

  // Validaciones del rango
  const totalAvailable = pendingClients.length;
  const selectedCount = rangeTo - rangeFrom + 1;
  const isRangeValid =
    rangeFrom >= 1 &&
    rangeTo <= totalAvailable &&
    rangeFrom <= rangeTo &&
    selectedCount > 0 &&
    selectedCount <= MAX_ALLOWED_ROWS;

  const handleConfirmRange = () => {
    if (!isRangeValid) return;
    const sliced = pendingClients.slice(rangeFrom - 1, rangeTo);
    executeIngestion(sliced);
  };

  return (
    <>
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Ingesta de Transcripciones Comerciales
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Carga tu CSV de llamadas para deduplicar con SHA-256 y clasificar con IA (máx. {MAX_ALLOWED_ROWS} filas por sesión).
            </p>
          </div>

          <div>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                isProcessing
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow"
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Procesando lote...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Cargar CSV
                </>
              )}
            </label>
          </div>
        </div>

        {/* Barra de progreso */}
        {isProcessing && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <span>{statusMessage}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tarjeta de Métricas de Deduplicación y Ahorro */}
        {summary && (
          <div className="mt-5 border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium text-sm mb-3">
              <CheckCircle2 className="w-4 h-4" />
              Lote completado con optimización de caché activa
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 text-center">
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-emerald-100 dark:border-zinc-800 shadow-xs">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Total en Rango</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {summary.totalRequested}
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-emerald-100 dark:border-zinc-800 shadow-xs">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Nuevos con LLM
                </span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {summary.newlyProcessed}
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-emerald-100 dark:border-zinc-800 shadow-xs">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Cacheados (Neon)</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {summary.skippedCached}
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-emerald-100 dark:border-zinc-800 shadow-xs">
                <span className="text-xs ... block flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    Con errores
                </span>
                <span
                    className={`text-lg font-bold ${
                    summary.failed > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-zinc-400 dark:text-zinc-500"
                    }`}
                >
                    {summary.failed}
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-emerald-100 dark:border-zinc-800 shadow-xs">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block flex items-center justify-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  Llamadas Ahorradas
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {summary.savedCostPercentage}
                </span>
              </div>
            </div>

            {summary.failed > 0 && (
                <p className="mt-3 text-sm text-amber-800 dark:text-amber-200/90 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg px-3 py-2">
                    {summary.failed} fila{summary.failed !== 1 ? "s" : ""} no se procesaron (p. ej. límites de la API).
                    Vuelve a cargar el mismo rango del CSV en unos minutos; las filas ya guardadas se omitirán y solo se reintentarán las fallidas.
                </p>
            )}
          </div>
        )}
      </div>

      {/* Pop-up / Modal de Selección de Rango */}
      {showRangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-base">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Límite de procesamiento
              </div>
              <button
                onClick={() => {
                  setShowRangeModal(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                El archivo contiene un total de <strong>{totalAvailable}</strong> filas válidas.
              </p>
              <p>
                Para respetar los límites de cuota de la API gratuita, el máximo permitido por carga es de <strong>{MAX_ALLOWED_ROWS} filas</strong>.
              </p>
              <p className="text-xs text-zinc-500">
                Indica qué rango de filas deseas procesar en esta sesión:
              </p>
            </div>

            {/* Formulario de Rango */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Desde la fila:
                </label>
                <input
                  type="number"
                  min={1}
                  max={totalAvailable}
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Hasta la fila:
                </label>
                <input
                  type="number"
                  min={1}
                  max={totalAvailable}
                  value={rangeTo}
                  onChange={(e) => setRangeTo(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Mensaje de validación del rango */}
            <div className="text-xs">
              {isRangeValid ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Rango válido: se procesarán {selectedCount} filas (de la {rangeFrom} a la {rangeTo}).
                </span>
              ) : (
                <span className="text-red-500 font-medium">
                  {selectedCount > MAX_ALLOWED_ROWS
                    ? `⚠ Has seleccionado ${selectedCount} filas. El máximo por sesión es ${MAX_ALLOWED_ROWS}.`
                    : "⚠ El rango ingresado no es válido."}
                </span>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRangeModal(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="px-4 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRange}
                disabled={!isRangeValid}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Procesar Rango ({isRangeValid ? selectedCount : 0})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}