# NestJS + Hexagonal + Prisma Starter

Base lista para una prueba tecnica con:

- NestJS 11 (ultima major estable)
- Arquitectura hexagonal por modulo
- Prisma como adaptador de persistencia
- LangChain con configuracion global
- DTO validation global

## Requisitos

- Node.js 20+
- PostgreSQL corriendo local o remoto

## Configuracion rapida

1. Instala dependencias:

```bash
npm install
```

1. Copia el archivo de entorno y ajusta `DATABASE_URL`:

```bash
cp .env.example .env
```

1. Genera cliente y corre migraciones:

```bash
npm run prisma:generate
npm run prisma:migrate:dev -- --name init
```

1. Levanta el proyecto:

```bash
npm run start:dev
```

## Estructura hexagonal

```text
src/
  main.ts
  app.module.ts
  shared/
    infrastructure/
      ai/
        langchain/
          langchain.module.ts
          langchain.service.ts
      prisma/
        prisma.module.ts
        prisma.service.ts
  modules/
    health/
      health.module.ts
      presentation/http/health.controller.ts
    users/
      users.module.ts
      domain/
        entities/user.entity.ts
        repositories/user.repository.ts
      application/
        dto/create-user.command.ts
        use-cases/create-user.use-case.ts
        use-cases/list-users.use-case.ts
      infrastructure/
        persistence/prisma-user.repository.ts
      presentation/
        http/
          dto/create-user.request.dto.ts
          dto/user.response.dto.ts
          users.controller.ts
```

## Principios aplicados

- `domain`: contratos y entidades sin dependencias de framework.
- `application`: casos de uso que dependen de puertos.
- `infrastructure`: adaptadores concretos (Prisma).
- `presentation`: controladores HTTP y DTOs de entrada/salida.

## LangChain global

- El modulo global vive en `src/shared/infrastructure/ai/langchain`.
- Se registra en `AppModule` para poder inyectar `LangchainService` en cualquier modulo.
- Variables de entorno:
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL` (default: `gpt-4.1-mini`)
  - `OPENAI_TEMPERATURE` (default: `0`)

Por ahora solo se deja la configuracion global, sin endpoints de IA.

## Endpoints ejemplo

- `GET /api/health`
- `GET /api/users`
- `POST /api/users`

Body de ejemplo:

```json
{
  "email": "coach@example.com",
  "fullName": "Coach Demo"
}
```
