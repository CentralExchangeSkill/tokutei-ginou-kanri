# Tokutei Ginou Worker Management (MVP Scaffold)

Monorepo scaffold for the first milestone.

## Tech Stack
- Frontend: React + Vite + TypeScript (`apps/web`)
- Backend: Node.js + Express + TypeScript (`apps/api`)
- ORM: Prisma
- Database: PostgreSQL (Docker compose)
- Shared schemas: Zod (`packages/shared`)

## Project Structure
- `apps/web`: login, workers list, worker detail, add worker (admin only)
- `apps/api`: JWT auth, role checks, worker endpoints, Prisma models
- `packages/shared`: shared Zod schemas and TS types

## Run locally
1. Copy env file:
   - `cp .env.example .env`
2. Start Postgres:
   - `docker compose up -d`
3. Install deps:
   - `npm install`
4. Generate Prisma client + migrate + seed:
   - `npm run db:generate`
   - `npm run db:migrate -- --name init`
   - `npm run db:seed`
5. Start app:
   - `npm run dev`

Web: `http://localhost:5173`
API: `http://localhost:4000`

## Seed users
- Admin: `admin@example.com` / `password123`
- User: `user@example.com` / `password123`

## API endpoints (MVP)
- `POST /auth/login`
- `GET /workers` (auth)
- `GET /workers/:id` (auth)
- `POST /workers` (ADMIN only)
