# TrustHire — Recruitment System

A full-stack recruitment platform built with **Clean Architecture**, **TypeScript**,
**NestJS-style Express** backend, and **React 19 + Vite** frontend.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Architecture Summary](#architecture-summary)
6. [Installation Guide](#installation-guide)
7. [Environment Variables](#environment-variables)
8. [Running the Application](#running-the-application)
9. [API Documentation](#api-documentation)
10. [Testing](#testing)
11. [Audit & Code Quality](#audit--code-quality)

---

## Overview

TrustHire is a recruitment platform that connects students, employers, and
administrators. Students can search for jobs, apply, and track their applications.
Employers can post jobs, review applicants, and manage their company profile.
Administrators can verify employers, approve job postings, and manage user accounts.

## Features

- **Student**: Job search, application tracking, CV management, profile management
- **Employer**: Job posting, applicant management, company profile, dashboard
- **Admin**: Employer verification, job approval, user management, dashboard analytics
- **Real-time**: Socket.io notifications for application status updates
- **Authentication**: JWT-based access and refresh tokens
- **File Upload**: Local file storage for CVs and company logos

## Tech Stack

### Backend
| Layer      | Technology           |
| ---------- | -------------------- |
| Runtime    | Node.js 20+          |
| Framework  | Express + TypeScript |
| Database   | MySQL (Prisma ORM)   |
| Auth       | JWT, bcrypt          |
| Validation | Zod                  |
| Logging    | Pino (pino-http)     |
| Real-time  | Socket.io            |
| Testing    | Jest                 |
| Linting    | ESLint + Prettier    |

### Frontend
| Layer      | Technology            |
| ---------- | --------------------- |
| Runtime    | React 19              |
| Build      | Vite                  |
| Routing    | React Router DOM 7    |
| State Mgmt | TanStack Query 5      |
| Forms      | React Hook Form + Zod |
| HTTP       | Axios                 |
| Styling    | Tailwind CSS          |
| Validation | Zod                   |
| Linting    | ESLint + Prettier     |

## Project Structure

```
Recruitment-system/
├── source-code/
│   ├── backend/                 # Express + TypeScript API
│   │   ├── src/
│   │   │   ├── config/          # Configuration (env, email)
│   │   │   ├── common/          # Shared utilities (logger, types)
│   │   │   ├── infrastructure/  # DB, security, storage, websocket
│   │   │   ├── modules/         # Feature modules (admin, job, auth, etc.)
│   │   │   │   └── <module>/
│   │   │   │       ├── domain/          # Entities, VOs, Repositories
│   │   │   │       ├── application/     # Use Cases
│   │   │   │       ├── infrastructure/  # Prisma repos, strategies
│   │   │   │       ├── presentation/    # Controllers, Routes
│   │   │   │       └── composition/     # Module wiring (DI)
│   │   │   ├── types/           # Global type declarations
│   │   │   ├── app.ts           # Composition Root
│   │   │   └── server.ts        # HTTP server entry point
│   │   ├── prisma/              # Prisma schema & migrations
│   │   ├── .env.example         # Environment template
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── frontend/                # React + Vite SPA
│   │   ├── src/
│   │   │   ├── core/            # Shared (api, components, hooks, layouts, routes, query)
│   │   │   ├── features/        # Feature-based modules
│   │   │   │   └── <feature>/
│   │   │   │       ├── components/  # React components
│   │   │   │       ├── hooks/       # Feature hooks
│   │   │   │       ├── services/    # API services
│   │   │   │       ├── schemas/     # Zod validation schemas
│   │   │   │       └── types/       # TypeScript types
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── database/                # Database scripts
├── docs/                      # Documentation
├── testing/                   # Test scripts
└── package.json               # Root workspace
```

## Architecture Summary

The project follows **Clean Architecture** (a.k.a. Onion Architecture / Hexagonal):

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                          │
│  Controllers → Routes → Express App                      │
├─────────────────────────────────────────────────────────┤
│                    APPLICATION                           │
│  Use Cases (orchestrate domain logic)                    │
├─────────────────────────────────────────────────────────┤
│                    DOMAIN                                │
│  Entities • Value Objects • Repositories (interfaces)  │
├─────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE                        │
│  Prisma Repositories • JWT Provider • File Storage       │
└─────────────────────────────────────────────────────────┘
```

### Dependency Direction

- **Domain** ← has no dependencies (pure business logic)
- **Application** → depends on Domain (interfaces)
- **Infrastructure** → depends on Domain + Application
- **Presentation** → depends on Application + Infrastructure
- **Composition Root** (`app.ts`) → wires all dependencies

### Key Patterns

| Pattern            | Where                                |
| ------------------ | ------------------------------------ |
| Repository Pattern | Domain interfaces → Prisma impl      |
| Factory Pattern    | Domain factories                     |
| Value Object       | Domain VOs (e.g. `ApplicationState`) |
| Entity             | Domain entities (e.g. `Application`) |
| Use Case           | Application layer                    |
| Controller         | Presentation layer                   |
| Composition Root   | `app.ts`                             |

## Installation Guide

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10 (or pnpm/yarn)
- **MySQL** ≥ 8.0

### Step 1: Clone the repository

```bash
git clone https://github.com/phuongnh2208/Recruitment-system.git
cd Recruitment-system
```

### Step 2: Set up the database

```bash
# Start MySQL (adjust credentials as needed)
# Create database
mysql -u root -p -e "CREATE DATABASE trusthire;"
```

### Step 3: Configure environment variables

```bash
# Backend
cp source-code/backend/.env.example source-code/backend/.env
# Edit .env with your actual credentials
nano source-code/backend/.env

# Frontend (if needed)
cp source-code/frontend/.env.example source-code/frontend/.env
```

### Step 4: Install dependencies

```bash
# Backend
cd source-code/backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 5: Run database migrations

```bash
cd ../backend
npx prisma migrate dev --name init
```

### Step 6: Start the application

```bash
# Terminal 1 — Backend
cd source-code/backend
npm run dev

# Terminal 2 — Frontend
cd source-code/frontend
npm run dev
```

- Backend API: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## Environment Variables

### Backend (`source-code/backend/.env`)

| Variable                   | Description             | Default                             |
| -------------------------- | ----------------------- | ----------------------------------- |
| `PORT`                     | Server port             | `3000`                              |
| `DATABASE_URL`             | MySQL connection string | —                                   |
| `JWT_SECRET`               | Access token secret     | —                                   |
| `JWT_REFRESH_SECRET`       | Refresh token secret    | —                                   |
| `JWT_ACCESS_TOKEN_EXPIRY`  | Access token expiry     | `15m`                               |
| `JWT_REFRESH_TOKEN_EXPIRY` | Refresh token expiry    | `7d`                                |
| `SMTP_HOST`                | SMTP server host        | `smtp.gmail.com`                    |
| `SMTP_PORT`                | SMTP server port        | `587`                               |
| `SMTP_USER`                | SMTP username           | —                                   |
| `SMTP_PASSWORD`            | SMTP password           | —                                   |
| `SMTP_FROM`                | Email sender            | `TrustHire <noreply@trusthire.com>` |
| `BCRYPT_COST_FACTOR`       | bcrypt cost factor      | `12`                                |
| `UPLOAD_ROOT`              | File upload directory   | `uploads`                           |
| `CLIENT_URL`               | Frontend URL (for CORS) | `http://localhost:5173`             |

### Frontend (`source-code/frontend/.env`)

| Variable            | Description          | Default                     |
| ------------------- | -------------------- | --------------------------- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api` |

## Running the Application

```bash
# Backend (development)
cd source-code/backend
npm run dev

# Backend (production build)
npm run build
npm start

# Frontend (development)
cd source-code/frontend
npm run dev

# Frontend (production build)
npm run build
npm run preview
```

## API Documentation

See [`docs/api-spec.md`](docs/api-spec.md) for the full API specification.

## Testing

```bash
# Backend tests
cd source-code/backend
npm test

# Frontend tests
cd source-code/frontend
npm test
```

## Audit & Code Quality

This project has been audited for production readiness. See
[`docs/audit-report.md`](docs/audit-report.md) for the full audit report.
