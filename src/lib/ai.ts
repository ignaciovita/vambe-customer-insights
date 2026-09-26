import { groq } from "@ai-sdk/groq";
import { generateText, Output } from "ai";
import { classificationSchema, ClientClassification } from "./ai-schema";

export async function classifyTranscript(
  transcript: string
): Promise<ClientClassification> {
  const { output } = await generateText({
    // Usamos Gemma 2 a través de los chips LPU de Groq
    model: groq("openai/gpt-oss-20b"),
    output: Output.object({
      schema: classificationSchema,
    }),
    prompt: `Eres un analista senior de Revenue Operations y Producto en Vambe, una empresa especializada en soluciones de automatización y chatbots con IA para ventas y soporte.

Tu tarea es analizar la siguiente transcripción de una reunión de ventas y extraer con precisión las dimensiones estructuradas según el esquema requerido:

<transcripcion>
${transcript}
</transcripcion>

Directrices clave para la clasificación:
1. "industry": Identifica la industria principal del prospecto según su negocio central.
2. "painPoint": Identifica el dolor operativo o cuello de botella crítico que los motivó a contactar a Vambe.
3. "requiredIntegrations": Lista únicamente las integraciones tecnológicas explícitamente solicitadas o mencionadas.
4. "estimatedVolume": Si mencionan un volumen de consultas/mensajes/órdenes, normalízalo a volumen MENSUAL (ej. 500 diarios -> ~15000; 800 semanales -> ~3200). Si no se indica o no es cuantificable, retorna null.
5. "acquisitionChannel": Cómo el cliente descubrió o llegó a conocer sobre Vambe.`,
  });

  return output;
}