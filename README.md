# Círculo Orgánico · Grupo Orgánico Hoteles Boutique

Plataforma web full-stack de lealtad y recompensas multi-perfil (**Socio Personal**, **Empresa**, **Agencia** y **Staff Administrativo**) construida con Next.js App Router, TypeScript, Tailwind CSS v4, Auth.js v5, Prisma ORM y PostgreSQL Serverless en Neon.

## Estructura del Proyecto

- `prisma/schema.prisma`: Esquema relacional completo para Neon (`User`, `Membership`, `B2BProfile`, `AuthorizedPerson`, `HotelProperty`, `TransactionLedger`, `AgencyEvent`, `RewardCertificate`, `Reservation`, `QuoteRequest`).
- `prisma/seed.ts`: Script semilla oficial con las 6 sedes y las cuentas demo (`Ana López`, `Empresa Demo S.A. de C.V.`, `Agencia Demo` y `admin@grupoorganico.com`).
- `src/lib/loyalty-engine.ts`: Motor matemático centralizado (descuentos, puntos, bono de 5ta estancia, estancias consecutivas, tope anual de 2 masajes Diamante, saldo 2% corporativo, evaluación por evento de agencia y límites de canje 25% / 10% / 100%).
- `src/app/api/cron/loyalty-maintenance/route.ts`: Endpoint para Vercel Cron Jobs (`vercel.json`) que evalúa la ventana móvil de 12 meses y el vencimiento de puntos/saldo (24 meses) y certificados (12 meses).

## Configuración Local y Despliegue en Vercel + Neon

1. Copia `.env.example` a `.env` y coloca tus cadenas de conexión de Neon:
   - `DATABASE_URL` con `-pooler` (PgBouncer para Vercel serverless).
   - `DIRECT_URL` sin `-pooler` (para migraciones Prisma).
   - `NEXTAUTH_SECRET` y `CRON_SECRET`.
2. Instala dependencias y sincroniza el esquema con Neon:
   ```bash
   npm install
   npx prisma db push
   npm run db:seed
   ```
3. Ejecuta las pruebas y el servidor local:
   ```bash
   npm test
   npm run dev
   ```

## Cuentas Demo Sembradas

- **Socia Personal (Oro · SOCIO 000 248):** `ana@ejemplo.com` / `Organico2026!`
- **Empresa Demo (Empresas Oro):** `empresa@ejemplo.com` / `Organico2026!`
- **Agencia Demo:** `agencia@ejemplo.com` / `Organico2026!`
- **Admin Staff (`/admin`):** `admin@grupoorganico.com` / `AdminOrganico2026!`
