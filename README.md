# Vambe - Revenue Intelligence & Transcript Analytics

Plataforma full-stack para la ingesta masiva de transcripciones de ventas, clasificación automatizada de dimensiones comerciales mediante IA y visualización de analítica en tiempo real.

---

## 1. Instrucciones de Ejecución Local

### Prerrequisitos
- Node.js (v18 o superior)
- Cuenta o instancia de PostgreSQL (recomendado: [Neon.tech](https://neon.tech/))
- API Key gratuita de [Groq Cloud](https://console.groq.com/)

### Paso a Paso

1. **Clonar e instalar dependencias:**
   ```bash
   git clone <url-del-repositorio>
   cd vambe-customer-insights
   npm install



2. **Configurar variables de entorno:**
Crea un archivo `.env` en la raíz copiando como base el siguiente formato:
```env
DATABASE_URL="postgresql://usuario:password@ep-ejemplo.neon.tech/neondb?sslmode=require"
GROQ_API_KEY="gsk_tu_clave_de_groq_aqui"

```


3. **Sincronizar base de datos con Prisma:**
```bash
npx prisma generate
npx prisma db push

```


4. **Iniciar en modo desarrollo:**
```bash
npm run dev

```


Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 2. Arquitectura y Decisiones Clave

### Stack Tecnológico

* **Frontend / Framework:** Next.js (App Router), React, Tailwind CSS y Lucide Icons.
* **Visualización:** Recharts para gráficos de conversión, barras y distribución.
* **Base de Datos:** Neon (Serverless PostgreSQL) administrado mediante Prisma ORM.
* **Inferencia IA:** Vercel AI SDK con el proveedor de **Groq Cloud** ejecutando el modelo abierto **openai/gpt-oss-20b**.

---

### Decisiones de Diseño e Ingeniería

1. **Cero Costo Operativo y Modelo openai/gpt-oss-20b:**
* Para cumplir con el requerimiento de modelos abiertos y gratuitos sin restricciones presupuestarias ni necesidad de tarjetas de crédito, se integró el motor de inferencia de **Groq** usando `openai/gpt-oss-20b`.
* Ofrece inferencia ultrarrápida (centenares de tokens/seg) y límites holgados en su capa gratuita (30 RPM).


2. **Deduplicación por Hash SHA-256 (Caché Idempotente):**
* Antes de enviar cualquier transcripción al LLM, el backend genera un hash SHA-256 del texto de la llamada.
* Si el hash ya existe en PostgreSQL, se reutiliza el registro previo en 0 ms.
* Esto evita gastar cuota de API en archivos con filas repetidas o cargas recurrentes.


3. **Control de Cuota y Modal de Rango (Ventana de 30 filas):**
* El ingestor divide el archivo en bloques pequeños (`CHUNK_SIZE`) y aplica pausas controladas para evitar errores `429 Too Many Requests`.
* Si el CSV excede 30 filas, un modal emergente permite al usuario elegir qué ventana procesar (ej. de la 1 a la 30) sin romper los límites del servicio.


4. **Filtrado y Métricas Reactivas en Memoria:**
* La base de datos sirve los registros al cliente y las transformaciones (`filterClients`, cálculo de win rates y conversiones) se ejecutan reactivamente en el navegador.
* Permite que los cambios de filtros (vendedor, industria, estado) actualicen tablas y gráficos al instante sin sobrecargar la base de datos con peticiones constantes.


5. **Clasificación Multi-etiqueta en Integraciones:**
* Las métricas de conversión por requerimiento tecnológico evalúan a cada conector de forma independiente, reconociendo que un mismo cliente puede solicitar simultáneamente WhatsApp y un CRM sin distorsionar el cálculo de cierre.

