# CIELP Backend 3.0

API REST de CIELP para autenticacion, gestion de usuarios/docentes, evaluacion MBI, espacios digitales y analitica institucional.

## Stack

- Node.js (ESM)
- Express 5
- PostgreSQL
- Sequelize + Umzug (migraciones y seeders)
- JWT (access + refresh con rotacion)
- Zod (validacion)
- Helmet, CORS, rate limiting

## Estructura

```text
src/
  app.js
  index.js
  config/
  controllers/
  database/
    migrations/
    seeders/
  middlewares/
  models/
  routes/
  services/
  utils/
```

## Requisitos

- Node.js 20+
- PostgreSQL 14+

## Variables de entorno

Usa el archivo [.env.example](.env.example) como plantilla y crea tu `.env` local.

Variables clave:

- `NODE_ENV`
- `PORT`
- `POSTGRES_URL`
- `JWT_SECRET`
- `JWT_REFRESH`
- `FRONTEND_URL`
- `EMAIL_PROVIDER` (`smtp` o `resend`)
- `EMAIL_FROM`
- `RESEND_API_KEY` (si `EMAIL_PROVIDER=resend`)
- `RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_MAX`

## Scripts

```bash
npm install
npm run migrate
npm run seed
npm run dev
```

Scripts disponibles:

- `npm run dev`: inicia en modo desarrollo con watch
- `npm start`: inicia servidor sin watch
- `npm run migrate`: ejecuta migraciones
- `npm run seed`: ejecuta seeders

## Endpoints operativos

- `GET /health`
- `GET /keepalive/ping`
- `GET /api/cielp/v1/health`
- `GET /api/cielp/v1/metrics`

## Keep-alive para Render y Supabase (Cron-job.org)

Este backend ya incluye un endpoint de keep-alive que despierta Render y, de forma opcional, hace ping a Supabase en la misma llamada.

### 1) Variables de entorno en Render

- `KEEPALIVE_TOKEN`: token largo y aleatorio (recomendado para proteger el endpoint).
- `KEEPALIVE_ENABLE_SUPABASE_PING=true`
- `SUPABASE_PROJECT_URL=https://<project-ref>.supabase.co`
- `SUPABASE_ANON_KEY=<anon-key>`
- `SUPABASE_PING_PATH=/rest/v1/mbi_questions?select=id&limit=1`

Notas:

- No usar `SERVICE_ROLE_KEY` en keep-alive.
- Si la tabla usada en `SUPABASE_PING_PATH` tiene RLS estricto, usa una ruta publica de lectura minima para el ping.

### 2) Cron-job.org

Crear un job HTTP con estos valores:

- URL: `https://<tu-servicio-render>.onrender.com/keepalive/ping`
- Method: `GET`
- Schedule: `*/10 * * * *` (cada 10 minutos)
- Timeout: 15s
- Header: `x-keepalive-token: <KEEPALIVE_TOKEN>`

### 3) Verificacion

- Comprobar `200 OK` en cron-job.org.
- Respuesta esperada del endpoint:
  - `render.awake=true`
  - `supabase.enabled=true`
  - `supabase.ok=true`

Si `supabase.ok=false`, el endpoint responde `502` para que puedas detectar fallos en monitoreo.

## Flujo recomendado para primer despliegue

1. Configurar variables de entorno de produccion.
2. Ejecutar migraciones.
3. Ejecutar seeders iniciales (solo si aplica a entorno nuevo).
4. Levantar API con `npm start`.
5. Validar `GET /health`, login y endpoint `/keepalive/ping`.

## Seguridad y buenas practicas

- Validacion fail-fast de variables de entorno al arranque.
- Refresh tokens con sesion en DB y rotacion.
- Limitacion de tasa global y por autenticacion.
- Logs estructurados y trazabilidad por request.

## Notas

- No subir `.env` al repositorio.
- Mantener `JWT_SECRET` y `JWT_REFRESH` con longitud minima segura.
- Para produccion, configurar CORS con dominio frontend real.
