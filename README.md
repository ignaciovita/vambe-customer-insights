# Vambe - Revenue Intelligence & Transcript Analytics

Plataforma full-stack para la ingesta masiva de transcripciones de ventas, clasificación automatizada de dimensiones comerciales mediante IA y visualización de analítica en tiempo real.

---

## 1. Instrucciones de Ejecución Local

### Prerrequisitos
- Node.js (v18 o superior)
- Base de datos PostgreSQL activa
- Cuenta en Groq Cloud

---

### Paso a Paso

#### 1. Obtener Credenciales Gratuitas

- **Base de datos (Neon):**
  1. Regístrate gratis en [Neon.tech](https://neon.tech/).
  2. Crea un proyecto nuevo (ej. `vambe-insights`).
  3. En el Dashboard principal, copia el string de conexión que aparece bajo **Connection details** (`postgres://...`).

- **API Key del LLM (Groq Cloud):**
  1. Inicia sesión en [console.groq.com](https://console.groq.com/).
  2. En el menú lateral, dirígete a **API Keys** y presiona **Create API Key**.
  3. Copia el token generado (`gsk_...`).

#### 2. Clonar e Instalar Dependencias

```bash
git clone <url-del-repositorio>
cd vambe-customer-insights
npm install
```

#### 3. Configurar Variables de Entorno

Crea un archivo .env en la raíz del proyecto:

```
DATABASE_URL="postgresql://usuario:password@ep-ejemplo.neon.tech/neondb?sslmode=require"
GROQ_API_KEY="gsk_tu_clave_de_groq_aqui"
```

#### 4. Sincronizar Base de Datos con Prisma

Ejecuta las migraciones para generar los enums y las tablas en Neon:

```bash
npx prisma generate
npx prisma db push
```

#### 5. Iniciar la Aplicación

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

---

## 2. Límites de la Capa Gratuita y Manejo de Cuotas

Actualmente la plataforma utiliza el **Free Tier** de inferencia en Groq Cloud. Si bien permite procesar sin costos, existen restricciones de RPM (Requests Per Minute) y TPM (Tokens Per Minute). Al procesar transcripciones extensas en lote, es posible alcanzar estos topes.

- **Indicadores en la Interfaz:** La UI desglosa el resultado de cada tanda informando el total solicitado, cuántos registros fueron procesados por el LLM, cuántos se rescataron desde la caché y si hubo filas fallidas.
- **Recuperación ante errores:** Gracias al sistema de deduplicación por hash SHA-256, las filas procesadas exitosamente quedan guardadas de inmediato. Si una tanda arroja error por límite de cuota, basta con esperar 1 o 2 minutos y volver a procesar el mismo rango en el selector: el sistema saltará instantáneamente los registros ya guardados (0 llamadas al LLM) y solo procesará los pendientes.

---

## 3. Arquitectura y Decisiones Clave

### Stack Tecnológico

- **Frontend / Framework:** Next.js (App Router), React, Tailwind CSS y Lucide Icons.
- **Visualización:** Recharts para gráficos analíticos interactivos.
- **Base de Datos:** Neon (Serverless PostgreSQL) administrado mediante Prisma ORM.
- **Inferencia IA:** Vercel AI SDK con el proveedor de Groq Cloud ejecutando el modelo abierto openai/gpt-oss-20b.

---

### Dimensiones de Clasificación (Taxonomía)

Cada transcripción es analizada por el LLM y normalizada bajo 5 dimensiones clave modeladas en PostgreSQL mediante Enums:

#### 1. Industria (Industry):

- Identifica el rubro operativo del cliente.
- *Opciones:* ``RETAIL``, ``ECOMMERCE``, ``HEALTHCARE``, ``REAL_ESTATE``, ``FINANCE``, ``EDUCATION``, ``SERVICES``, ``LOGISTICS``, ``TECHNOLOGY``, ``OTHER``.

#### 2. Dolor Principal (PainPoint):

- Identifica el cuello de botella que motivó la reunión comercial.
- *Opciones:* ``HIGH_RESPONSE_TIME``, ``LOST_LEADS``, ``REPETITIVE_QUERIES``, ``LACK_OF_24_7_SUPPORT``, ``MANUAL_DATA_ENTRY``, ``POOR_CONVERSION``, ``SCALABILITY_LIMITS``, ``HIGH_SUPPORT_COSTS``, ``OTHER``.

#### 3. Canal de Adquisición (AcquisitionChannel)

- Origen del prospecto detectado en la llamada.
- *Opciones:* ``INBOUND_WEBSITE``, ``OUTBOUND_EMAIL``, ``LINKEDIN``, ``REFERRAL``, ``PAID_ADS``, ``EVENT_CONFERENCE``, ``PARTNER``, ``OTHER``.

#### 4. Integraciones Requeridas (RequiredIntegration):

- Tecnologías y conectores solicitados explícitamente (clasificación multi-etiqueta).
- *Opciones:* ``WHATSAPP``, ``HUBSPOT``, ``SALESFORCE``, ``ZOHO``, ``SHOPIFY``, ``WOOCOMMERCE``, ``CUSTOM_API``, ``ZAPIER``, ``SLACK``, ``GOOGLE_SHEETS``, ``OTHER``.

#### 5. Volumen Estimado (estimatedVolume):

- Estimación numérica normalizada a consultas/mensajes mensuales.

---

### Métricas y Visualizaciones

El dashboard traduce las transcripciones en métricas accionables:

- **Tarjetas KPI Generales:** Total de leads, acuerdos comerciales cerrados (Won), tasa de conversión global (Win Rate) y volumen promedio mensual estimado.

- **Desempeño y Cierres por Industria:** Gráfico compuesto que contrasta el volumen total frente a ventas ganadas por vertical de negocio.

- **Top Dolores Operativos:** Gráfico horizontal que clasifica las fricciones más comunes de los clientes para alimentar el roadmap de producto.

- **Origen de Leads:** Distribución porcentual de los canales de adquisición.

- **Tasa de Conversión por Canal e Integración:** Gráficos de barra (escala 0-100%) ordenados descendentemente que muestran la efectividad de cierre y la proporción exacta de leads ganados ("X de Y").

***Interactividad y Filtros Dinámicos:** Todas las métricas y gráficos responden en tiempo real al panel de filtros (búsqueda textual, industria, dolor, vendedor y estado de cierre). Esto permite aislar dimensiones específicas; por ejemplo, evaluar el Win Rate exclusivo de una industria particular o descubrir qué integraciones convierten mejor cuando el lead proviene de un vendedor determinado.*

---

### Decisiones de Diseño e Ingeniería

#### 1. Cero Costo Operativo y Modelo openai/gpt-oss-20b:

- Permite cumplir el requerimiento de modelos abiertos sin costo de inferencia ni registro de tarjetas bancarias.
- Ofrece inferencia de alta velocidad para respuestas estructuradas vía JSON Schema / Zod.

#### 2. Deduplicación por Hash SHA-256 (Caché Idempotente):

- Antes de consultar al LLM, el backend genera un hash SHA-256 de la transcripción cruda.
- Si el hash ya existe en Neon, se omite la inferencia (0 ms, 0 tokens gastados). Esto garantiza idempotencia y protege la cuota de la API en re-ingestas.

#### 3. Selector de Rango en Ventanas de 30 Filas:

- Para no saturar los límites de RPM/TPM ni superar los timeouts de ejecución de Next.js, el CSV se valida al cargarse. Si supera las 30 filas, un modal permite al usuario seleccionar qué ventana procesar (ej. 1 a 30).

#### 4. Filtrado y Agregaciones en Memoria:

- La base de datos despacha los registros y los cálculos analíticos se ejecutan reactivamente en el cliente.
- Garantiza tiempos de respuesta instantáneos al manipular filtros sin lanzar consultas constantes a PostgreSQL.