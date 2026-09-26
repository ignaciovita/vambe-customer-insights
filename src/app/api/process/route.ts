import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { classifyTranscript } from "@/lib/ai";
import { getTranscriptHash } from "@/lib/hash";

// Validación de entrada por cliente proveniente del CSV parseado
const incomingClientSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Teléfono requerido"),
  salesRep: z.string().min(1, "Vendedor requerido"),
  meetingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida (esperado formato ISO o YYYY-MM-DD)",
  }),
  closed: z.union([z.boolean(), z.number(), z.string()]).transform((val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "number") return val === 1;
    return val.trim() === "1" || val.toLowerCase() === "true";
  }),
  transcript: z.string().min(5, "Transcripción demasiado corta"),
});

const requestPayloadSchema = z.object({
    clients: z
      .array(incomingClientSchema)
      .min(1, "Debe enviar al menos un cliente")
      .max(30, "No se pueden procesar más de 30 clientes por solicitud"),
});

// Función utilitaria para concurrencia controlada sin librerías externas
async function pMap<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = requestPayloadSchema.safeParse(rawBody);

    if (!parseResult.success) {
        return NextResponse.json(
          { 
            error: "Payload inválido", 
            details: parseResult.error.issues 
          },
          { status: 400 }
        );
    }

    const { clients } = parseResult.data;

    // 1. Calcular hashes SHA-256 para todos los registros del payload
    const clientsWithHash = clients.map((c) => ({
      ...c,
      hash: getTranscriptHash(c.transcript),
      parsedDate: new Date(c.meetingDate),
    }));

    const incomingHashes = clientsWithHash.map((c) => c.hash);

    // 2. Batch lookup: Buscar qué hashes ya existen en Neon
    const existingRecords = await db.client.findMany({
      where: {
        transcriptHash: { in: incomingHashes },
      },
      select: {
        transcriptHash: true,
      },
    });

    const existingHashSet = new Set(existingRecords.map((r) => r.transcriptHash));

    // 3. Separar los ya procesados (cache) de los que requieren llamada al LLM
    const skippedClients = clientsWithHash.filter((c) => existingHashSet.has(c.hash));
    const clientsToProcess = clientsWithHash.filter((c) => !existingHashSet.has(c.hash));

    const totalRequested = clients.length;
    const skippedCount = skippedClients.length;
    let newlyProcessedCount = 0;
    const failedRows: { email: string; reason: string }[] = [];

    // 4. Procesar solo los nuevos con concurrencia controlada (ej. 2 llamadas paralelas)
    const CONCURRENCY_LIMIT = 2;

    if (clientsToProcess.length > 0) {
      await pMap(clientsToProcess, CONCURRENCY_LIMIT, async (client) => {
        try {
          // Inferencia estructurada con el LLM
          const classification = await classifyTranscript(client.transcript);

          // Guardar en la base de datos
          await db.client.create({
            data: {
              name: client.name,
              email: client.email,
              phone: client.phone,
              salesRep: client.salesRep,
              meetingDate: client.parsedDate,
              closed: client.closed,
              transcript: client.transcript,
              transcriptHash: client.hash,
              industry: classification.industry,
              painPoint: classification.painPoint,
              requiredIntegrations: classification.requiredIntegrations,
              estimatedVolume: classification.estimatedVolume,
              acquisitionChannel: classification.acquisitionChannel,
            },
          });

          newlyProcessedCount++;
        } catch (error: any) {
          console.error(`Error procesando transcripción para ${client.email}:`, error);
          failedRows.push({
            email: client.email,
            reason: error?.message || "Error desconocido durante la inferencia",
          });
        }
      });
    }

    // 5. Calcular porcentaje de llamadas / costos ahorrados
    const savedPercentage =
      totalRequested > 0 ? ((skippedCount / totalRequested) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      success: true,
      summary: {
        totalRequested,
        newlyProcessed: newlyProcessedCount,
        skippedCached: skippedCount,
        failed: failedRows.length,
        savedCostPercentage: `${savedPercentage}%`,
      },
      failedRows: failedRows.length > 0 ? failedRows : undefined,
    });
  } catch (error: any) {
    console.error("Error crítico en /api/process:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", message: error?.message },
      { status: 500 }
    );
  }
}