# One Million Copy - Leads API

Backend en NestJS + Prisma para gestionar leads, sacar estadisticas y generar resumen ejecutivo con IA.

## 1) Que trae este proyecto

- NestJS 11
- Prisma 7 con PostgreSQL
- Arquitectura hexagonal por modulo
- Swagger en /docs
- Seguridad con x-api-key
- Rate limit global
- Webhook de ejemplo tipo Typeform
- Integracion IA con LangChain + OpenRouter u OpenAI
- Docker y docker compose

## 2) Requisitos

- Node.js 20 o superior
- Docker (opcional, recomendado)
- PostgreSQL si vas a correr sin Docker

## 3) Levantar local en minutos

1. Instala dependencias.

```bash
npm install
```

2. Crea tu archivo de entorno.

```bash
cp .env.example .env
```

3. Genera cliente Prisma.

```bash
npm run prisma:generate
```

4. Aplica migraciones.

```bash
npm run prisma:migrate:dev -- --name init_leads
```

5. Carga datos de prueba (11 leads).

```bash
npm run prisma:seed
```

6. Arranca la API.

```bash
npm run start:dev
```

API base: <http://localhost:3000/api>

Swagger: <http://localhost:3000/docs>

## 4) Variables de entorno

- DATABASE_URL: conexion a Postgres
- API_KEY: llave para consumir endpoints de leads
- THROTTLE_TTL_MS: ventana del rate limit (ms)
- THROTTLE_LIMIT: maximo de requests por ventana
- LLM_PROVIDER: openrouter u openai
- OPENROUTER_API_KEY: key de OpenRouter
- OPENROUTER_MODEL: modelo principal
- OPENROUTER_FALLBACK_MODELS: modelos backup (CSV)
- OPENROUTER_ATTEMPTS_PER_MODEL: intentos por modelo antes de saltar al siguiente

Nota importante:
Si no hay key valida del proveedor IA activo, el endpoint de resumen puede devolver fallback mock.

## 5) Como usar la API

Todos los endpoints de leads piden header:

```text
x-api-key: local-dev-api-key
```

### Crear lead

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -H "x-api-key: local-dev-api-key" \
  -d '{
    "nombre":"Laura Mendoza",
    "email":"laura@example.com",
    "telefono":"+573001112233",
    "fuente":"instagram",
    "producto_interes":"Curso de copywriting",
    "presupuesto":450
  }'
```

### Listar leads

```bash
curl "http://localhost:3000/api/leads?page=1&limit=20&fuente=instagram" \
  -H "x-api-key: local-dev-api-key"
```

### Estadisticas

```bash
curl http://localhost:3000/api/leads/stats \
  -H "x-api-key: local-dev-api-key"
```

### Resumen IA

```bash
curl -X POST http://localhost:3000/api/leads/ai/summary \
  -H "Content-Type: application/json" \
  -H "x-api-key: local-dev-api-key" \
  -d '{
    "fuente":"facebook",
    "fecha_inicio":"2026-01-01T00:00:00.000Z",
    "fecha_fin":"2026-12-31T23:59:59.999Z"
  }'
```

### Webhook

```bash
curl -X POST http://localhost:3000/api/leads/webhook \
  -H "Content-Type: application/json" \
  -H "x-api-key: local-dev-api-key" \
  -d '{
    "event_id":"evt_01hxm3w9",
    "form_id":"frm_abc123",
    "submitted_at":"2026-05-18T14:30:00.000Z",
    "lead":{
      "nombre":"Camila Rojas",
      "email":"camila.rojas@example.com",
      "telefono":"+573001234567",
      "fuente":"landing_page",
      "producto_interes":"Mentoria embudos",
      "presupuesto":980
    }
  }'
```

Por comodidad puedes usar el archivo de postman que se encuentra en la carpeta de postman para hacer las pruebas de forma local

## 6) Docker

Levantar todo:

```bash
npm run docker:up
```

Bajar todo y limpiar volumenes:

```bash
npm run docker:down
```

Primera vez en Docker, ejecuta migracion y seed dentro del contenedor API:

```bash
docker compose exec api npm run prisma:migrate:deploy
docker compose exec api npm run prisma:seed
```

## 7) Tests y validacion

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```
