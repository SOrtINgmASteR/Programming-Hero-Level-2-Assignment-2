# 🚀 Programming Hero Level-2 Assignment 2

## 📒 Assignment: DevPulse API (Issue & Feature Tracker)
REST API built with Express, TypeScript, and PostgreSQL (Neon). This project implements authentication, role-based authorization, issue tracking, and system metrics using raw SQL and a modular architecture.

## 📁 Project Structure

```text
.
├── B7A2-main/
├── database/
│   └── migrations/
│       └── 001_init.sql
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── env.ts
│   ├── db/
│   │   ├── pool.ts
│   │   └── queries/
│   │       ├── issues.ts
│   │       └── users.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── error.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── issues/
│   │   └── metrics/
│   ├── types/
│   │   ├── common.ts
│   │   └── express.d.ts
│   └── utils/
│       ├── asyncHandler.ts
│       ├── httpError.ts
│       └── response.ts
├── .env.example
├── package.json
├── README.md
└── tsconfig.json
```

## ✨ Features
- JWT authentication and role-based authorization
- Contributor and maintainer permissions
- Issue creation, listing, update, and delete
- Metrics endpoint for maintainers only
- Raw SQL queries (no ORM / no JOINs)

## ▶️ How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and fill in values.
3. Run the migration in [database/migrations/001_init.sql](database/migrations/001_init.sql).
4. Start the dev server:
   ```bash
   npm run dev
   ```

## 🧪 Scripts
- `npm run dev` - run in watch mode
- `npm run build` - compile TypeScript
- `npm start` - run compiled server
- `npm run typecheck` - typecheck only

## 🔐 Environment Variables
- `DATABASE_URL` - Neon/Postgres connection string
- `JWT_SECRET` - token signing secret
- `BCRYPT_ROUNDS` - salt rounds between 8 and 12
- `PORT` - server port for local development

## 🌐 API Endpoints
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

## 🚀 Deployment (Vercel)
1. Push this repo to GitHub.
2. Import it into Vercel.
3. Set environment variables in Vercel Project Settings.
4. Build command: `npm run build`
5. Output directory: `dist`

## 💻 Repository Link
- [https://github.com/SOrtINgmASteR/Programming-Hero-Level-2-Assignment-2](GitHub Repository Link)

## 💻 Vercel Link
- [https://devpulse-api-six.vercel.app/](GitHub Repository Link)
