# DevPulse API

Internal tech issue and feature tracker API built with Express, TypeScript, and Neon PostgreSQL.

## Requirements
- Node.js 24+ (ES Modules)
- PostgreSQL (NeonDB recommended)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and fill in values.
3. Run migrations in [database/migrations/001_init.sql](database/migrations/001_init.sql).
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Scripts
- `npm run dev` - run in watch mode
- `npm run build` - compile TypeScript
- `npm start` - run compiled server
- `npm run typecheck` - typecheck only

## Environment Variables
- `DATABASE_URL` - Neon/Postgres connection string
- `JWT_SECRET` - token signing secret
- `BCRYPT_ROUNDS` - salt rounds between 8 and 12
- `PORT` - server port for local development

## API
Base URL: `/api`

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`

### Issues
- `POST /api/issues`
- `GET /api/issues?sort=newest&type=bug&status=open`
- `GET /api/issues/:id`
- `PATCH /api/issues/:id`
- `DELETE /api/issues/:id`

### Metrics (Maintainer only)
- `GET /api/metrics`

## Vercel
1. Set environment variables in Vercel Project Settings.
2. Build command: `npm run build`
3. Output: `dist`

## Notes
- No SQL JOINs are used. Reporter details are fetched separately and mapped in code.
- Passwords are hashed with bcrypt and never returned in responses.
