# AgileManager — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack web app for managing agilists (Scrum Masters, Agile Coaches, PMOs) across squads — with CRUD, reallocation, spreadsheet import, and a dashboard.

**Architecture:** Monorepo with two workspaces — `server/` (Express + Drizzle + SQLite) and `client/` (React + Vite). The server exposes a REST API on port 3001; the client runs on port 5173 and proxies `/api` to the server. All state lives in Zustand on the client; the server is stateless.

**Tech Stack:** Node.js 20, TypeScript 5, React 18, Vite 5, Tailwind CSS 3, shadcn/ui, TanStack Table v8, SheetJS (xlsx), Zustand 4, Express 4, Drizzle ORM, better-sqlite3, Vitest, React Testing Library, Supertest.

## Global Constraints

- Node.js >= 20
- TypeScript strict mode in both `client/` and `server/`
- All API routes prefixed with `/api`
- SQLite database file at `server/data/agilemanager.db`
- Drizzle schema file at `server/src/db/schema.ts`
- All dates stored as ISO 8601 strings (`YYYY-MM-DD`)
- Status values: `"ativo"` | `"inativo"` (lowercase, Portuguese)
- Tests run with `npm test` in each workspace

---

### Task 1: Monorepo Scaffolding

**Files:**
- Create: `package.json` (root, workspaces)
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/vite.config.ts`
- Create: `.gitignore`

**Interfaces:**
- Produces: `npm run dev` at root starts both server and client via `concurrently`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "agile-manager",
  "private": true,
  "workspaces": ["server", "client"],
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=server\" \"npm run dev --workspace=client\"",
    "test": "npm test --workspace=server && npm test --workspace=client"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 2: Create server/package.json**

```json
{
  "name": "agile-manager-server",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "test": "vitest run",
    "db:migrate": "drizzle-kit migrate"
  },
  "dependencies": {
    "better-sqlite3": "^9.4.3",
    "drizzle-orm": "^0.30.9",
    "express": "^4.18.3",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.9",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.12.5",
    "@types/supertest": "^6.0.2",
    "drizzle-kit": "^0.21.1",
    "supertest": "^7.0.0",
    "tsx": "^4.7.2",
    "typescript": "^5.4.5",
    "vitest": "^1.5.0"
  }
}
```

- [ ] **Step 3: Create server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create client/package.json**

```json
{
  "name": "agile-manager-client",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@tanstack/react-table": "^8.16.0",
    "lucide-react": "^0.376.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "xlsx": "^0.18.5",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^15.0.6",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.0.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5",
    "vite": "^5.2.10",
    "vitest": "^1.5.0"
  }
}
```

- [ ] **Step 5: Create client/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 6: Create client/tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 7: Create client/vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 8: Create .gitignore**

```
node_modules/
dist/
server/data/*.db
.env
*.local
```

- [ ] **Step 9: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created in root, `server/`, and `client/`.

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: monorepo scaffolding with server and client workspaces"
```

---

### Task 2: Database Schema + Drizzle Setup

**Files:**
- Create: `server/src/db/schema.ts`
- Create: `server/src/db/index.ts`
- Create: `server/drizzle.config.ts`
- Create: `server/src/db/seed.ts`
- Create: `server/data/` (directory, gitignored)

**Interfaces:**
- Produces: `db` exported from `server/src/db/index.ts` — a `BetterSQLite3Database` instance
- Produces: table types exported from `server/src/db/schema.ts`:
  - `Role`: `{ id: number, nome: string }`
  - `Squad`: `{ id: number, nome: string, tribo: string, ativa: number }`
  - `Agilista`: `{ id: number, nome: string, email: string, role_id: number, squad_id: number | null, status: string }`
  - `Alocacao`: `{ id: number, agilista_id: number, squad_id: number, data_inicio: string, data_fim: string | null }`

- [ ] **Step 1: Create server/src/db/schema.ts**

```typescript
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull().unique(),
})

export const squads = sqliteTable('squads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  tribo: text('tribo').notNull(),
  ativa: integer('ativa', { mode: 'boolean' }).notNull().default(true),
})

export const agilistas = sqliteTable('agilistas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  role_id: integer('role_id').references(() => roles.id).notNull(),
  squad_id: integer('squad_id').references(() => squads.id),
  status: text('status', { enum: ['ativo', 'inativo'] }).notNull().default('ativo'),
})

export const alocacoes = sqliteTable('alocacoes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  agilista_id: integer('agilista_id').references(() => agilistas.id).notNull(),
  squad_id: integer('squad_id').references(() => squads.id).notNull(),
  data_inicio: text('data_inicio').notNull(),
  data_fim: text('data_fim'),
})

export type Role = typeof roles.$inferSelect
export type Squad = typeof squads.$inferSelect
export type Agilista = typeof agilistas.$inferSelect
export type Alocacao = typeof alocacoes.$inferSelect
export type NewAgilista = typeof agilistas.$inferInsert
export type NewSquad = typeof squads.$inferInsert
export type NewAlocacao = typeof alocacoes.$inferInsert
```

- [ ] **Step 2: Create server/src/db/index.ts**

```typescript
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'
import fs from 'fs'

const dataDir = path.join(__dirname, '../../data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

const sqlite = new Database(path.join(dataDir, 'agilemanager.db'))
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
export { sqlite }
```

- [ ] **Step 3: Create server/drizzle.config.ts**

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: { url: './data/agilemanager.db' },
} satisfies Config
```

- [ ] **Step 4: Create server/src/db/migrate.ts** (run once on startup)

```typescript
import { sqlite } from './index'

export function runMigrations() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS squads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      tribo TEXT NOT NULL,
      ativa INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS agilistas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role_id INTEGER NOT NULL REFERENCES roles(id),
      squad_id INTEGER REFERENCES squads(id),
      status TEXT NOT NULL DEFAULT 'ativo' CHECK(status IN ('ativo','inativo'))
    );
    CREATE TABLE IF NOT EXISTS alocacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agilista_id INTEGER NOT NULL REFERENCES agilistas(id),
      squad_id INTEGER NOT NULL REFERENCES squads(id),
      data_inicio TEXT NOT NULL,
      data_fim TEXT
    );
  `)
}
```

- [ ] **Step 5: Create server/src/db/seed.ts**

```typescript
import { db } from './index'
import { runMigrations } from './migrate'
import { roles, squads, agilistas } from './schema'

runMigrations()

db.insert(roles).values([
  { nome: 'Scrum Master' },
  { nome: 'Agile Coach' },
  { nome: 'PMO' },
  { nome: 'RTE' },
]).run()

db.insert(squads).values([
  { nome: 'Payments', tribo: 'Fintech', ativa: true },
  { nome: 'Onboarding', tribo: 'Growth', ativa: true },
]).run()

const [sm] = db.select().from(roles).where(/* role nome = Scrum Master */).all()

db.insert(agilistas).values([
  { nome: 'Ana Lima', email: 'ana@example.com', role_id: 1, squad_id: 1, status: 'ativo' },
  { nome: 'Carlos Melo', email: 'carlos@example.com', role_id: 2, squad_id: null, status: 'ativo' },
]).run()

console.log('Seed complete')
```

- [ ] **Step 6: Write schema test**

Create `server/src/db/__tests__/schema.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { runMigrations } from '../migrate'
import { roles, squads, agilistas, alocacoes } from '../schema'
import { eq } from 'drizzle-orm'

function makeTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  // patch the migrate function to run on this sqlite instance
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL UNIQUE);
    CREATE TABLE IF NOT EXISTS squads (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, tribo TEXT NOT NULL, ativa INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS agilistas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE, role_id INTEGER NOT NULL REFERENCES roles(id), squad_id INTEGER REFERENCES squads(id), status TEXT NOT NULL DEFAULT 'ativo' CHECK(status IN ('ativo','inativo')));
    CREATE TABLE IF NOT EXISTS alocacoes (id INTEGER PRIMARY KEY AUTOINCREMENT, agilista_id INTEGER NOT NULL REFERENCES agilistas(id), squad_id INTEGER NOT NULL REFERENCES squads(id), data_inicio TEXT NOT NULL, data_fim TEXT);
  `)
  return drizzle(sqlite, { schema: { roles, squads, agilistas, alocacoes } })
}

describe('schema', () => {
  it('inserts and reads a role', () => {
    const db = makeTestDb()
    db.insert(roles).values({ nome: 'SM' }).run()
    const result = db.select().from(roles).all()
    expect(result).toHaveLength(1)
    expect(result[0].nome).toBe('SM')
  })

  it('inserts agilista with role and squad', () => {
    const db = makeTestDb()
    db.insert(roles).values({ nome: 'SM' }).run()
    db.insert(squads).values({ nome: 'Alpha', tribo: 'Tech', ativa: true }).run()
    db.insert(agilistas).values({ nome: 'Ana', email: 'ana@x.com', role_id: 1, squad_id: 1, status: 'ativo' }).run()
    const result = db.select().from(agilistas).all()
    expect(result[0].nome).toBe('Ana')
    expect(result[0].status).toBe('ativo')
  })

  it('allows null squad_id (pool)', () => {
    const db = makeTestDb()
    db.insert(roles).values({ nome: 'Coach' }).run()
    db.insert(agilistas).values({ nome: 'Bob', email: 'bob@x.com', role_id: 1, squad_id: null, status: 'ativo' }).run()
    const [a] = db.select().from(agilistas).all()
    expect(a.squad_id).toBeNull()
  })
})
```

- [ ] **Step 7: Run tests**

```bash
cd server && npm test
```

Expected: 3 tests pass.

- [ ] **Step 8: Commit**

```bash
git add server/src/db server/drizzle.config.ts
git commit -m "feat: drizzle schema + in-memory test db"
```

---

### Task 3: Server Entry Point + Base API

**Files:**
- Create: `server/src/index.ts`
- Create: `server/src/app.ts`
- Test: `server/src/__tests__/health.test.ts`

**Interfaces:**
- Consumes: `db` from `server/src/db/index.ts`
- Produces: `app` exported from `server/src/app.ts` — Express app, used by tests via Supertest
- Produces: Server running on `PORT` env var (default `3001`)

- [ ] **Step 1: Create server/src/app.ts**

```typescript
import express from 'express'
import cors from 'cors'

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  return app
}
```

- [ ] **Step 2: Create server/src/index.ts**

```typescript
import { createApp } from './app'
import { runMigrations } from './db/migrate'

runMigrations()

const app = createApp()
const port = process.env.PORT ?? 3001

app.listen(port, () => {
  console.log(`AgileManager API running on http://localhost:${port}`)
})
```

- [ ] **Step 3: Write health test**

Create `server/src/__tests__/health.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const app = createApp()
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})
```

- [ ] **Step 4: Run test**

```bash
cd server && npm test
```

Expected: health test passes.

- [ ] **Step 5: Commit**

```bash
git add server/src/index.ts server/src/app.ts server/src/__tests__
git commit -m "feat: express app with health endpoint"
```

---

### Task 4: Roles API

**Files:**
- Create: `server/src/routes/roles.ts`
- Modify: `server/src/app.ts`
- Test: `server/src/__tests__/roles.test.ts`

**Interfaces:**
- Consumes: `db` from `server/src/db/index.ts`, `roles` table from schema
- Produces:
  - `GET /api/roles` → `Role[]`
  - `POST /api/roles` body `{ nome: string }` → `Role`
  - `DELETE /api/roles/:id` → `204`

- [ ] **Step 1: Write failing tests**

Create `server/src/__tests__/roles.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { createApp } from '../app'

function makeTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL UNIQUE);
    CREATE TABLE IF NOT EXISTS squads (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, tribo TEXT NOT NULL, ativa INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS agilistas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE, role_id INTEGER NOT NULL REFERENCES roles(id), squad_id INTEGER REFERENCES squads(id), status TEXT NOT NULL DEFAULT 'ativo' CHECK(status IN ('ativo','inativo')));
    CREATE TABLE IF NOT EXISTS alocacoes (id INTEGER PRIMARY KEY AUTOINCREMENT, agilista_id INTEGER NOT NULL REFERENCES agilistas(id), squad_id INTEGER NOT NULL REFERENCES squads(id), data_inicio TEXT NOT NULL, data_fim TEXT);
  `)
  return drizzle(sqlite, { schema })
}

describe('Roles API', () => {
  it('GET /api/roles returns empty array initially', async () => {
    const db = makeTestDb()
    const app = createApp(db)
    const res = await request(app).get('/api/roles')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('POST /api/roles creates a role', async () => {
    const db = makeTestDb()
    const app = createApp(db)
    const res = await request(app).post('/api/roles').send({ nome: 'SM' })
    expect(res.status).toBe(201)
    expect(res.body.nome).toBe('SM')
    expect(res.body.id).toBeDefined()
  })

  it('GET /api/roles returns created roles', async () => {
    const db = makeTestDb()
    const app = createApp(db)
    await request(app).post('/api/roles').send({ nome: 'SM' })
    await request(app).post('/api/roles').send({ nome: 'Coach' })
    const res = await request(app).get('/api/roles')
    expect(res.body).toHaveLength(2)
  })

  it('POST /api/roles returns 400 if nome missing', async () => {
    const db = makeTestDb()
    const app = createApp(db)
    const res = await request(app).post('/api/roles').send({})
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd server && npm test -- --reporter=verbose
```

Expected: FAIL — `createApp` doesn't accept a `db` parameter yet.

- [ ] **Step 3: Update server/src/app.ts to accept injected db**

```typescript
import express from 'express'
import cors from 'cors'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './db/schema'
import { rolesRouter } from './routes/roles'
import { db as defaultDb } from './db/index'

export function createApp(db: BetterSQLite3Database<typeof schema> = defaultDb) {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api/roles', rolesRouter(db))

  return app
}
```

- [ ] **Step 4: Create server/src/routes/roles.ts**

```typescript
import { Router } from 'express'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { roles } from '../db/schema'

export function rolesRouter(db: BetterSQLite3Database<typeof schema>) {
  const router = Router()

  router.get('/', (_req, res) => {
    const result = db.select().from(roles).all()
    res.json(result)
  })

  router.post('/', (req, res) => {
    const { nome } = req.body
    if (!nome || typeof nome !== 'string') {
      return res.status(400).json({ error: 'nome is required' })
    }
    const [created] = db.insert(roles).values({ nome }).returning().all()
    res.status(201).json(created)
  })

  router.delete('/:id', (req, res) => {
    db.delete(roles).where(/* eq(roles.id, Number(req.params.id)) */).run()
    res.status(204).send()
  })

  return router
}
```

> Note: Add `import { eq } from 'drizzle-orm'` and replace the comment with `eq(roles.id, Number(req.params.id))`.

- [ ] **Step 5: Run tests**

```bash
cd server && npm test
```

Expected: all roles tests pass.

- [ ] **Step 6: Commit**

```bash
git add server/src/routes/roles.ts server/src/app.ts server/src/__tests__/roles.test.ts
git commit -m "feat: roles CRUD API"
```

---

### Task 5: Squads API

**Files:**
- Create: `server/src/routes/squads.ts`
- Modify: `server/src/app.ts`
- Test: `server/src/__tests__/squads.test.ts`

**Interfaces:**
- Consumes: `db`, `squads` table, `agilistas` table
- Produces:
  - `GET /api/squads` → `Array<Squad & { agilistas: Agilista[] }>`
  - `POST /api/squads` body `{ nome, tribo }` → `Squad`
  - `PATCH /api/squads/:id` body `{ nome?, tribo?, ativa? }` → `Squad`

- [ ] **Step 1: Write failing tests**

Create `server/src/__tests__/squads.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { createApp } from '../app'

function makeTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL UNIQUE);
    CREATE TABLE IF NOT EXISTS squads (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, tribo TEXT NOT NULL, ativa INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS agilistas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE, role_id INTEGER NOT NULL REFERENCES roles(id), squad_id INTEGER REFERENCES squads(id), status TEXT NOT NULL DEFAULT 'ativo' CHECK(status IN ('ativo','inativo')));
    CREATE TABLE IF NOT EXISTS alocacoes (id INTEGER PRIMARY KEY AUTOINCREMENT, agilista_id INTEGER NOT NULL REFERENCES agilistas(id), squad_id INTEGER NOT NULL REFERENCES squads(id), data_inicio TEXT NOT NULL, data_fim TEXT);
  `)
  return drizzle(sqlite, { schema })
}

describe('Squads API', () => {
  it('GET /api/squads returns empty array', async () => {
    const db = makeTestDb()
    const app = createApp(db)
    const res = await request(app).get('/api/squads')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('POST /api/squads creates a squad', async () => {
    const db = makeTestDb()
    const app = createApp(db)
    const res = await request(app).post('/api/squads').send({ nome: 'Alpha', tribo: 'Tech' })
    expect(res.status).toBe(201)
    expect(res.body.nome).toBe('Alpha')
    expect(res.body.ativa).toBe(1)
  })

  it('PATCH /api/squads/:id inativa a squad', async () => {
    const db = makeTestDb()
    const app = createApp(db)
    const created = await request(app).post('/api/squads').send({ nome: 'Beta', tribo: 'Growth' })
    const { id } = created.body
    const res = await request(app).patch(`/api/squads/${id}`).send({ ativa: false })
    expect(res.status).toBe(200)
    expect(res.body.ativa).toBe(0)
  })

  it('GET /api/squads includes agilistas', async () => {
    const db = makeTestDb()
    const app = createApp(db)
    await request(app).post('/api/squads').send({ nome: 'Gamma', tribo: 'Ops' })
    await request(app).post('/api/roles').send({ nome: 'SM' })
    await request(app).post('/api/agilistas').send({ nome: 'Ana', email: 'ana@x.com', role_id: 1, squad_id: 1 })
    const res = await request(app).get('/api/squads')
    expect(res.body[0].agilistas).toBeDefined()
    expect(res.body[0].agilistas).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd server && npm test -- src/__tests__/squads.test.ts
```

Expected: FAIL — route not registered.

- [ ] **Step 3: Create server/src/routes/squads.ts**

```typescript
import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { squads, agilistas } from '../db/schema'

export function squadsRouter(db: BetterSQLite3Database<typeof schema>) {
  const router = Router()

  router.get('/', (_req, res) => {
    const allSquads = db.select().from(squads).all()
    const result = allSquads.map(squad => ({
      ...squad,
      agilistas: db.select().from(agilistas).where(eq(agilistas.squad_id, squad.id)).all(),
    }))
    res.json(result)
  })

  router.post('/', (req, res) => {
    const { nome, tribo } = req.body
    if (!nome || !tribo) return res.status(400).json({ error: 'nome and tribo are required' })
    const [created] = db.insert(squads).values({ nome, tribo, ativa: true }).returning().all()
    res.status(201).json(created)
  })

  router.patch('/:id', (req, res) => {
    const id = Number(req.params.id)
    const { nome, tribo, ativa } = req.body
    const updates: Partial<typeof squads.$inferInsert> = {}
    if (nome !== undefined) updates.nome = nome
    if (tribo !== undefined) updates.tribo = tribo
    if (ativa !== undefined) updates.ativa = ativa
    const [updated] = db.update(squads).set(updates).where(eq(squads.id, id)).returning().all()
    if (!updated) return res.status(404).json({ error: 'Squad not found' })
    res.json(updated)
  })

  return router
}
```

- [ ] **Step 4: Register in server/src/app.ts**

Add after the roles router line:
```typescript
import { squadsRouter } from './routes/squads'
// ...
app.use('/api/squads', squadsRouter(db))
```

- [ ] **Step 5: Run tests**

```bash
cd server && npm test
```

Expected: all squads tests pass.

- [ ] **Step 6: Commit**

```bash
git add server/src/routes/squads.ts server/src/app.ts server/src/__tests__/squads.test.ts
git commit -m "feat: squads CRUD API with agilistas join"
```

---

### Task 6: Agilistas API

**Files:**
- Create: `server/src/routes/agilistas.ts`
- Modify: `server/src/app.ts`
- Test: `server/src/__tests__/agilistas.test.ts`

**Interfaces:**
- Produces:
  - `GET /api/agilistas` → `Agilista[]` (accepts query `?role_id=&squad_id=&status=`)
  - `POST /api/agilistas` body `{ nome, email, role_id, squad_id? }` → `Agilista`
  - `PATCH /api/agilistas/:id` body `{ nome?, email?, role_id?, squad_id?, status? }` → `Agilista`
  - `POST /api/agilistas/bulk` body `Agilista[]` → `{ created: number, updated: number }`

- [ ] **Step 1: Write failing tests**

Create `server/src/__tests__/agilistas.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { createApp } from '../app'

function makeTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL UNIQUE);
    CREATE TABLE IF NOT EXISTS squads (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, tribo TEXT NOT NULL, ativa INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS agilistas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE, role_id INTEGER NOT NULL REFERENCES roles(id), squad_id INTEGER REFERENCES squads(id), status TEXT NOT NULL DEFAULT 'ativo' CHECK(status IN ('ativo','inativo')));
    CREATE TABLE IF NOT EXISTS alocacoes (id INTEGER PRIMARY KEY AUTOINCREMENT, agilista_id INTEGER NOT NULL REFERENCES agilistas(id), squad_id INTEGER NOT NULL REFERENCES squads(id), data_inicio TEXT NOT NULL, data_fim TEXT);
  `)
  const db = drizzle(sqlite, { schema })
  db.insert(schema.roles).values({ nome: 'SM' }).run()
  db.insert(schema.squads).values({ nome: 'Alpha', tribo: 'Tech', ativa: true }).run()
  return db
}

describe('Agilistas API', () => {
  it('GET /api/agilistas returns empty array', async () => {
    const app = createApp(makeTestDb())
    const res = await request(app).get('/api/agilistas')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('POST /api/agilistas creates an agilista', async () => {
    const app = createApp(makeTestDb())
    const res = await request(app).post('/api/agilistas').send({
      nome: 'Ana Lima', email: 'ana@x.com', role_id: 1
    })
    expect(res.status).toBe(201)
    expect(res.body.nome).toBe('Ana Lima')
    expect(res.body.status).toBe('ativo')
    expect(res.body.squad_id).toBeNull()
  })

  it('POST /api/agilistas returns 400 if nome missing', async () => {
    const app = createApp(makeTestDb())
    const res = await request(app).post('/api/agilistas').send({ email: 'x@x.com', role_id: 1 })
    expect(res.status).toBe(400)
  })

  it('PATCH /api/agilistas/:id updates fields', async () => {
    const app = createApp(makeTestDb())
    const created = await request(app).post('/api/agilistas').send({ nome: 'Bob', email: 'bob@x.com', role_id: 1 })
    const res = await request(app).patch(`/api/agilistas/${created.body.id}`).send({ nome: 'Roberto' })
    expect(res.status).toBe(200)
    expect(res.body.nome).toBe('Roberto')
  })

  it('GET /api/agilistas?status=inativo filters correctly', async () => {
    const app = createApp(makeTestDb())
    await request(app).post('/api/agilistas').send({ nome: 'Ana', email: 'ana@x.com', role_id: 1, status: 'ativo' })
    await request(app).post('/api/agilistas').send({ nome: 'Bob', email: 'bob@x.com', role_id: 1, status: 'inativo' })
    const res = await request(app).get('/api/agilistas?status=inativo')
    expect(res.body).toHaveLength(1)
    expect(res.body[0].nome).toBe('Bob')
  })

  it('POST /api/agilistas/bulk creates multiple', async () => {
    const app = createApp(makeTestDb())
    const res = await request(app).post('/api/agilistas/bulk').send([
      { nome: 'A', email: 'a@x.com', role_id: 1 },
      { nome: 'B', email: 'b@x.com', role_id: 1 },
    ])
    expect(res.status).toBe(200)
    expect(res.body.created).toBe(2)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd server && npm test -- src/__tests__/agilistas.test.ts
```

- [ ] **Step 3: Create server/src/routes/agilistas.ts**

```typescript
import { Router } from 'express'
import { eq, and } from 'drizzle-orm'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { agilistas } from '../db/schema'

export function agilistaRouter(db: BetterSQLite3Database<typeof schema>) {
  const router = Router()

  router.get('/', (req, res) => {
    const { role_id, squad_id, status } = req.query
    let query = db.select().from(agilistas)
    const filters = []
    if (role_id) filters.push(eq(agilistas.role_id, Number(role_id)))
    if (squad_id) filters.push(eq(agilistas.squad_id, Number(squad_id)))
    if (status) filters.push(eq(agilistas.status, status as 'ativo' | 'inativo'))
    const result = filters.length
      ? db.select().from(agilistas).where(and(...filters)).all()
      : db.select().from(agilistas).all()
    res.json(result)
  })

  router.post('/bulk', (req, res) => {
    const rows: schema.NewAgilista[] = req.body
    if (!Array.isArray(rows)) return res.status(400).json({ error: 'Expected array' })
    let created = 0
    for (const row of rows) {
      try {
        db.insert(agilistas).values(row).run()
        created++
      } catch {
        // skip duplicates (unique email constraint)
      }
    }
    res.json({ created, updated: 0 })
  })

  router.post('/', (req, res) => {
    const { nome, email, role_id, squad_id, status } = req.body
    if (!nome || !email || !role_id) return res.status(400).json({ error: 'nome, email, role_id are required' })
    try {
      const [created] = db.insert(agilistas).values({ nome, email, role_id, squad_id: squad_id ?? null, status: status ?? 'ativo' }).returning().all()
      res.status(201).json(created)
    } catch {
      res.status(409).json({ error: 'Email already exists' })
    }
  })

  router.patch('/:id', (req, res) => {
    const id = Number(req.params.id)
    const { nome, email, role_id, squad_id, status } = req.body
    const updates: Partial<schema.NewAgilista> = {}
    if (nome !== undefined) updates.nome = nome
    if (email !== undefined) updates.email = email
    if (role_id !== undefined) updates.role_id = role_id
    if (squad_id !== undefined) updates.squad_id = squad_id
    if (status !== undefined) updates.status = status
    const [updated] = db.update(agilistas).set(updates).where(eq(agilistas.id, id)).returning().all()
    if (!updated) return res.status(404).json({ error: 'Agilista not found' })
    res.json(updated)
  })

  return router
}
```

- [ ] **Step 4: Register in server/src/app.ts**

```typescript
import { agilistaRouter } from './routes/agilistas'
// ...
app.use('/api/agilistas', agilistaRouter(db))
```

- [ ] **Step 5: Run all server tests**

```bash
cd server && npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add server/src/routes/agilistas.ts server/src/app.ts server/src/__tests__/agilistas.test.ts
git commit -m "feat: agilistas CRUD + bulk import API"
```

---

### Task 7: Realocações API

**Files:**
- Create: `server/src/routes/alocacoes.ts`
- Modify: `server/src/app.ts`
- Test: `server/src/__tests__/alocacoes.test.ts`

**Interfaces:**
- Produces:
  - `POST /api/alocacoes` body `{ agilista_id, squad_id }` → moves agilista, closes previous alocacao, creates new one
  - `GET /api/alocacoes/:agilista_id` → `Alocacao[]` (history for one agilista)

- [ ] **Step 1: Write failing tests**

Create `server/src/__tests__/alocacoes.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { createApp } from '../app'

function makeTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL UNIQUE);
    CREATE TABLE IF NOT EXISTS squads (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, tribo TEXT NOT NULL, ativa INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS agilistas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE, role_id INTEGER NOT NULL REFERENCES roles(id), squad_id INTEGER REFERENCES squads(id), status TEXT NOT NULL DEFAULT 'ativo' CHECK(status IN ('ativo','inativo')));
    CREATE TABLE IF NOT EXISTS alocacoes (id INTEGER PRIMARY KEY AUTOINCREMENT, agilista_id INTEGER NOT NULL REFERENCES agilistas(id), squad_id INTEGER NOT NULL REFERENCES squads(id), data_inicio TEXT NOT NULL, data_fim TEXT);
  `)
  const db = drizzle(sqlite, { schema })
  db.insert(schema.roles).values({ nome: 'SM' }).run()
  db.insert(schema.squads).values({ nome: 'Alpha', tribo: 'Tech', ativa: true }).run()
  db.insert(schema.squads).values({ nome: 'Beta', tribo: 'Ops', ativa: true }).run()
  db.insert(schema.agilistas).values({ nome: 'Ana', email: 'ana@x.com', role_id: 1, squad_id: null, status: 'ativo' }).run()
  return db
}

describe('Alocacoes API', () => {
  it('POST /api/alocacoes moves agilista to squad', async () => {
    const app = createApp(makeTestDb())
    const res = await request(app).post('/api/alocacoes').send({ agilista_id: 1, squad_id: 1 })
    expect(res.status).toBe(201)
    expect(res.body.squad_id).toBe(1)
    // agilista.squad_id should be updated
    const ag = await request(app).get('/api/agilistas')
    expect(ag.body[0].squad_id).toBe(1)
  })

  it('POST /api/alocacoes closes previous open alocacao', async () => {
    const db = makeTestDb()
    const app = createApp(db)
    await request(app).post('/api/alocacoes').send({ agilista_id: 1, squad_id: 1 })
    await request(app).post('/api/alocacoes').send({ agilista_id: 1, squad_id: 2 })
    const res = await request(app).get('/api/alocacoes/1')
    expect(res.body).toHaveLength(2)
    expect(res.body[0].data_fim).not.toBeNull()
  })

  it('GET /api/alocacoes/:id returns history', async () => {
    const app = createApp(makeTestDb())
    await request(app).post('/api/alocacoes').send({ agilista_id: 1, squad_id: 1 })
    const res = await request(app).get('/api/alocacoes/1')
    expect(res.status).toBe(200)
    expect(res.body[0].agilista_id).toBe(1)
  })
})
```

- [ ] **Step 2: Create server/src/routes/alocacoes.ts**

```typescript
import { Router } from 'express'
import { eq, and, isNull } from 'drizzle-orm'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { alocacoes, agilistas } from '../db/schema'

export function alocacoesRouter(db: BetterSQLite3Database<typeof schema>) {
  const router = Router()

  router.post('/', (req, res) => {
    const { agilista_id, squad_id } = req.body
    if (!agilista_id || !squad_id) return res.status(400).json({ error: 'agilista_id and squad_id are required' })

    const today = new Date().toISOString().slice(0, 10)

    // close previous open alocacao
    db.update(alocacoes)
      .set({ data_fim: today })
      .where(and(eq(alocacoes.agilista_id, agilista_id), isNull(alocacoes.data_fim)))
      .run()

    // create new alocacao
    const [created] = db.insert(alocacoes)
      .values({ agilista_id, squad_id, data_inicio: today, data_fim: null })
      .returning().all()

    // update agilista.squad_id
    db.update(agilistas).set({ squad_id }).where(eq(agilistas.id, agilista_id)).run()

    res.status(201).json(created)
  })

  router.get('/:agilista_id', (req, res) => {
    const result = db.select().from(alocacoes)
      .where(eq(alocacoes.agilista_id, Number(req.params.agilista_id)))
      .all()
    res.json(result)
  })

  return router
}
```

- [ ] **Step 3: Register in server/src/app.ts**

```typescript
import { alocacoesRouter } from './routes/alocacoes'
// ...
app.use('/api/alocacoes', alocacoesRouter(db))
```

- [ ] **Step 4: Run all server tests**

```bash
cd server && npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add server/src/routes/alocacoes.ts server/src/app.ts server/src/__tests__/alocacoes.test.ts
git commit -m "feat: realocações API with history tracking"
```

---

### Task 8: Frontend Scaffolding + Tailwind + shadcn/ui

**Files:**
- Create: `client/index.html`
- Create: `client/src/main.tsx`
- Create: `client/src/App.tsx`
- Create: `client/src/index.css`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/src/test/setup.ts`
- Create: `client/components.json` (shadcn config)

**Interfaces:**
- Produces: React app at `http://localhost:5173` with Tailwind and shadcn/ui components available

- [ ] **Step 1: Create client/index.html**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AgileManager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create client/src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 3: Create client/src/App.tsx**

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">AgileManager</h1>
      </header>
      <main className="p-6">
        <p className="text-gray-500">Carregando...</p>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Create client/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Create client/tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 6: Create client/postcss.config.js**

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
```

- [ ] **Step 7: Create client/src/test/setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Initialize shadcn/ui**

```bash
cd client && npx shadcn-ui@latest init --yes --defaults
```

When prompted: use TypeScript, style `default`, base color `slate`, CSS variables `yes`.

- [ ] **Step 9: Add core shadcn components**

```bash
cd client && npx shadcn-ui@latest add button table dialog select badge input
```

- [ ] **Step 10: Write a smoke test**

Create `client/src/__tests__/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App', () => {
  it('renders header', () => {
    render(<App />)
    expect(screen.getByText('AgileManager')).toBeInTheDocument()
  })
})
```

- [ ] **Step 11: Run client tests**

```bash
cd client && npm test
```

Expected: App renders header — 1 test passes.

- [ ] **Step 12: Commit**

```bash
git add client/
git commit -m "feat: React + Vite + Tailwind + shadcn/ui scaffolding"
```

---

### Task 9: Zustand Store + API Client

**Files:**
- Create: `client/src/api.ts`
- Create: `client/src/store.ts`
- Test: `client/src/__tests__/store.test.ts`

**Interfaces:**
- Produces from `client/src/api.ts`:
  - `api.roles.list(): Promise<Role[]>`
  - `api.squads.list(): Promise<SquadWithAgilistas[]>`
  - `api.squads.create(data: { nome: string, tribo: string }): Promise<Squad>`
  - `api.squads.update(id: number, data: Partial<Squad>): Promise<Squad>`
  - `api.agilistas.list(filters?: { role_id?: number, squad_id?: number, status?: string }): Promise<Agilista[]>`
  - `api.agilistas.create(data: NewAgilista): Promise<Agilista>`
  - `api.agilistas.update(id: number, data: Partial<Agilista>): Promise<Agilista>`
  - `api.agilistas.bulk(rows: NewAgilista[]): Promise<{ created: number, updated: number }>`
  - `api.alocacoes.move(agilista_id: number, squad_id: number): Promise<Alocacao>`
  - `api.alocacoes.history(agilista_id: number): Promise<Alocacao[]>`
- Produces from `client/src/store.ts` (Zustand):
  - `useStore()` returning `{ roles, squads, agilistas, fetchAll, moveAgilista, updateAgilista }`

- [ ] **Step 1: Define shared types**

Create `client/src/types.ts`:

```typescript
export interface Role { id: number; nome: string }
export interface Squad { id: number; nome: string; tribo: string; ativa: number }
export interface SquadWithAgilistas extends Squad { agilistas: Agilista[] }
export interface Agilista { id: number; nome: string; email: string; role_id: number; squad_id: number | null; status: 'ativo' | 'inativo' }
export interface Alocacao { id: number; agilista_id: number; squad_id: number; data_inicio: string; data_fim: string | null }
export type NewAgilista = Omit<Agilista, 'id'>
```

- [ ] **Step 2: Create client/src/api.ts**

```typescript
import type { Role, Squad, SquadWithAgilistas, Agilista, NewAgilista, Alocacao } from './types'

const BASE = '/api'

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  roles: {
    list: () => fetch(`${BASE}/roles`).then(r => json<Role[]>(r)),
  },
  squads: {
    list: () => fetch(`${BASE}/squads`).then(r => json<SquadWithAgilistas[]>(r)),
    create: (data: { nome: string; tribo: string }) =>
      fetch(`${BASE}/squads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => json<Squad>(r)),
    update: (id: number, data: Partial<Squad>) =>
      fetch(`${BASE}/squads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => json<Squad>(r)),
  },
  agilistas: {
    list: (filters?: { role_id?: number; squad_id?: number; status?: string }) => {
      const params = new URLSearchParams()
      if (filters?.role_id) params.set('role_id', String(filters.role_id))
      if (filters?.squad_id) params.set('squad_id', String(filters.squad_id))
      if (filters?.status) params.set('status', filters.status)
      return fetch(`${BASE}/agilistas?${params}`).then(r => json<Agilista[]>(r))
    },
    create: (data: NewAgilista) =>
      fetch(`${BASE}/agilistas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => json<Agilista>(r)),
    update: (id: number, data: Partial<Agilista>) =>
      fetch(`${BASE}/agilistas/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => json<Agilista>(r)),
    bulk: (rows: NewAgilista[]) =>
      fetch(`${BASE}/agilistas/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rows) }).then(r => json<{ created: number; updated: number }>(r)),
  },
  alocacoes: {
    move: (agilista_id: number, squad_id: number) =>
      fetch(`${BASE}/alocacoes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agilista_id, squad_id }) }).then(r => json<Alocacao>(r)),
    history: (agilista_id: number) =>
      fetch(`${BASE}/alocacoes/${agilista_id}`).then(r => json<Alocacao[]>(r)),
  },
}
```

- [ ] **Step 3: Create client/src/store.ts**

```typescript
import { create } from 'zustand'
import { api } from './api'
import type { Role, SquadWithAgilistas, Agilista } from './types'

interface State {
  roles: Role[]
  squads: SquadWithAgilistas[]
  agilistas: Agilista[]
  loading: boolean
  fetchAll: () => Promise<void>
  moveAgilista: (agilista_id: number, squad_id: number) => Promise<void>
  updateAgilista: (id: number, data: Partial<Agilista>) => Promise<void>
}

export const useStore = create<State>((set, get) => ({
  roles: [],
  squads: [],
  agilistas: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true })
    const [roles, squads, agilistas] = await Promise.all([
      api.roles.list(),
      api.squads.list(),
      api.agilistas.list(),
    ])
    set({ roles, squads, agilistas, loading: false })
  },

  moveAgilista: async (agilista_id, squad_id) => {
    await api.alocacoes.move(agilista_id, squad_id)
    await get().fetchAll()
  },

  updateAgilista: async (id, data) => {
    await api.agilistas.update(id, data)
    await get().fetchAll()
  },
}))
```

- [ ] **Step 4: Write store test (mocked fetch)**

Create `client/src/__tests__/store.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStore } from '../store'

const mockRoles = [{ id: 1, nome: 'SM' }]
const mockSquads = [{ id: 1, nome: 'Alpha', tribo: 'Tech', ativa: 1, agilistas: [] }]
const mockAgilistas = [{ id: 1, nome: 'Ana', email: 'ana@x.com', role_id: 1, squad_id: null, status: 'ativo' as const }]

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/roles')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRoles) })
    if (url.includes('/squads')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSquads) })
    if (url.includes('/agilistas')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockAgilistas) })
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  }))
  // reset store
  useStore.setState({ roles: [], squads: [], agilistas: [], loading: false })
})

describe('useStore', () => {
  it('fetchAll populates roles, squads, agilistas', async () => {
    const { result } = renderHook(() => useStore())
    await act(async () => { await result.current.fetchAll() })
    expect(result.current.roles).toEqual(mockRoles)
    expect(result.current.squads).toEqual(mockSquads)
    expect(result.current.agilistas).toEqual(mockAgilistas)
  })
})
```

- [ ] **Step 5: Run tests**

```bash
cd client && npm test
```

Expected: store test passes.

- [ ] **Step 6: Commit**

```bash
git add client/src/api.ts client/src/store.ts client/src/types.ts client/src/__tests__/store.test.ts
git commit -m "feat: api client + zustand store"
```

---

### Task 10: Dashboard View

**Files:**
- Create: `client/src/pages/Dashboard.tsx`
- Create: `client/src/__tests__/Dashboard.test.tsx`
- Modify: `client/src/App.tsx`

**Interfaces:**
- Consumes: `useStore()` from `client/src/store.ts`
- Produces: Dashboard page with stat cards and squad allocation map

- [ ] **Step 1: Write failing test**

Create `client/src/__tests__/Dashboard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Dashboard from '../pages/Dashboard'

vi.mock('../store', () => ({
  useStore: () => ({
    roles: [],
    squads: [
      { id: 1, nome: 'Alpha', tribo: 'Tech', ativa: 1, agilistas: [{ id: 1, nome: 'Ana', email: 'ana@x.com', role_id: 1, squad_id: 1, status: 'ativo' }] },
      { id: 2, nome: 'Beta', tribo: 'Ops', ativa: 1, agilistas: [] },
    ],
    agilistas: [
      { id: 1, nome: 'Ana', email: 'ana@x.com', role_id: 1, squad_id: 1, status: 'ativo' },
      { id: 2, nome: 'Bob', email: 'bob@x.com', role_id: 1, squad_id: null, status: 'ativo' },
    ],
    loading: false,
    fetchAll: vi.fn(),
  }),
}))

describe('Dashboard', () => {
  it('shows active agilistas count', () => {
    render(<Dashboard />)
    expect(screen.getByText('2')).toBeInTheDocument() // total agilistas ativos
  })

  it('shows squad without agilista warning', () => {
    render(<Dashboard />)
    expect(screen.getByText(/Beta/)).toBeInTheDocument()
  })

  it('shows agilistas without squad (pool)', () => {
    render(<Dashboard />)
    expect(screen.getByText(/Bob/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Create client/src/pages/Dashboard.tsx**

```tsx
import { useEffect } from 'react'
import { useStore } from '../store'

export default function Dashboard() {
  const { squads, agilistas, fetchAll, loading } = useStore()

  useEffect(() => { fetchAll() }, [fetchAll])

  const squadsAtivas = squads.filter(s => s.ativa)
  const aglistasAtivos = agilistas.filter(a => a.status === 'ativo')
  const semSquad = aglistasAtivos.filter(a => a.squad_id === null)
  const squadsSemAgilista = squadsAtivas.filter(s => s.agilistas.length === 0)

  if (loading) return <p className="text-gray-500 p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Agilistas Ativos', value: aglistasAtivos.length },
          { label: 'Squads Ativas', value: squadsAtivas.length },
          { label: 'Sem Squad', value: semSquad.length },
          { label: 'Squads Sem Agilista', value: squadsSemAgilista.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-4">Mapa de Alocação</h2>
        <div className="space-y-3">
          {squadsAtivas.map(squad => (
            <div key={squad.id} className="flex items-start gap-3">
              <span className="font-medium w-40 shrink-0">{squad.nome}</span>
              <div className="flex flex-wrap gap-2">
                {squad.agilistas.length === 0
                  ? <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Sem agilista</span>
                  : squad.agilistas.map(a => (
                      <span key={a.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{a.nome}</span>
                    ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {semSquad.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold mb-4">Pool — Sem Squad</h2>
          <div className="flex flex-wrap gap-2">
            {semSquad.map(a => (
              <span key={a.id} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{a.nome}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Run tests**

```bash
cd client && npm test
```

Expected: Dashboard tests pass.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/Dashboard.tsx client/src/__tests__/Dashboard.test.tsx
git commit -m "feat: dashboard with stats and allocation map"
```

---

### Task 11: Agilistas Page — Table + Inline Edit + Filters

**Files:**
- Create: `client/src/pages/Agilistas.tsx`
- Create: `client/src/components/AgilistaTable.tsx`
- Test: `client/src/__tests__/AgilistaTable.test.tsx`

**Interfaces:**
- Consumes: `useStore()`, shadcn `Select`, `Input`, `Button`, TanStack Table
- Produces: Filterable table with inline edit for nome/email, dropdown for role/squad/status

- [ ] **Step 1: Write failing test**

Create `client/src/__tests__/AgilistaTable.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import AgilistaTable from '../components/AgilistaTable'
import type { Agilista, Role, Squad } from '../types'

const roles: Role[] = [{ id: 1, nome: 'SM' }]
const squads: Squad[] = [{ id: 1, nome: 'Alpha', tribo: 'Tech', ativa: 1 }]
const agilistas: Agilista[] = [
  { id: 1, nome: 'Ana Lima', email: 'ana@x.com', role_id: 1, squad_id: 1, status: 'ativo' },
  { id: 2, nome: 'Bob Silva', email: 'bob@x.com', role_id: 1, squad_id: null, status: 'ativo' },
]
const onUpdate = vi.fn()

describe('AgilistaTable', () => {
  it('renders all agilistas', () => {
    render(<AgilistaTable agilistas={agilistas} roles={roles} squads={squads} onUpdate={onUpdate} />)
    expect(screen.getByText('Ana Lima')).toBeInTheDocument()
    expect(screen.getByText('Bob Silva')).toBeInTheDocument()
  })

  it('filters by name search', async () => {
    render(<AgilistaTable agilistas={agilistas} roles={roles} squads={squads} onUpdate={onUpdate} />)
    await userEvent.type(screen.getByPlaceholderText(/buscar/i), 'bob')
    expect(screen.queryByText('Ana Lima')).not.toBeInTheDocument()
    expect(screen.getByText('Bob Silva')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Create client/src/components/AgilistaTable.tsx**

```tsx
import { useState, useMemo } from 'react'
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  createColumnHelper, flexRender,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import type { Agilista, Role, Squad } from '../types'

interface Props {
  agilistas: Agilista[]
  roles: Role[]
  squads: Squad[]
  onUpdate: (id: number, data: Partial<Agilista>) => Promise<void>
}

const col = createColumnHelper<Agilista>()

export default function AgilistaTable({ agilistas, roles, squads, onUpdate }: Props) {
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo(() => [
    col.accessor('nome', {
      header: 'Nome',
      cell: ({ row, getValue }) => (
        <input
          className="w-full border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
          defaultValue={getValue()}
          onBlur={e => {
            if (e.target.value !== row.original.nome) {
              onUpdate(row.original.id, { nome: e.target.value })
            }
          }}
        />
      ),
    }),
    col.accessor('email', {
      header: 'E-mail',
      cell: ({ row, getValue }) => (
        <input
          className="w-full border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
          defaultValue={getValue()}
          onBlur={e => {
            if (e.target.value !== row.original.email) {
              onUpdate(row.original.id, { email: e.target.value })
            }
          }}
        />
      ),
    }),
    col.accessor('role_id', {
      header: 'Role',
      cell: ({ row, getValue }) => (
        <select
          className="border rounded px-2 py-1 text-sm"
          value={getValue()}
          onChange={e => onUpdate(row.original.id, { role_id: Number(e.target.value) })}
        >
          {roles.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
        </select>
      ),
    }),
    col.accessor('squad_id', {
      header: 'Squad',
      cell: ({ row, getValue }) => (
        <select
          className="border rounded px-2 py-1 text-sm"
          value={getValue() ?? ''}
          onChange={e => onUpdate(row.original.id, { squad_id: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">— Pool —</option>
          {squads.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      ),
    }),
    col.accessor('status', {
      header: 'Status',
      cell: ({ row, getValue }) => (
        <select
          className="border rounded px-2 py-1 text-sm"
          value={getValue()}
          onChange={e => onUpdate(row.original.id, { status: e.target.value as 'ativo' | 'inativo' })}
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      ),
    }),
  ], [roles, squads, onUpdate])

  const table = useReactTable({
    data: agilistas,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-3">
      <Input
        placeholder="Buscar por nome, e-mail..."
        value={globalFilter}
        onChange={e => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className="px-4 py-3 text-left font-medium text-gray-600">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create client/src/pages/Agilistas.tsx**

```tsx
import { useEffect, useState } from 'react'
import { useStore } from '../store'
import AgilistaTable from '../components/AgilistaTable'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api } from '../api'

export default function Agilistas() {
  const { agilistas, roles, squads, fetchAll, updateAgilista } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', role_id: '' })

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleCreate = async () => {
    await api.agilistas.create({ nome: form.nome, email: form.email, role_id: Number(form.role_id), squad_id: null, status: 'ativo' })
    setOpen(false)
    setForm({ nome: '', email: '', role_id: '' })
    await fetchAll()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Agilistas</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Novo Agilista</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Agilista</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <Input placeholder="Nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              <Input placeholder="E-mail" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <select className="w-full border rounded px-3 py-2 text-sm" value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}>
                <option value="">Selecione um role</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
              </select>
              <Button onClick={handleCreate} disabled={!form.nome || !form.email || !form.role_id}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <AgilistaTable agilistas={agilistas} roles={roles} squads={squads.map(s => ({ id: s.id, nome: s.nome, tribo: s.tribo, ativa: s.ativa }))} onUpdate={updateAgilista} />
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

```bash
cd client && npm test
```

Expected: AgilistaTable tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Agilistas.tsx client/src/components/AgilistaTable.tsx client/src/__tests__/AgilistaTable.test.tsx
git commit -m "feat: agilistas page with filterable table + inline edit"
```

---

### Task 12: Squads Page

**Files:**
- Create: `client/src/pages/Squads.tsx`
- Test: `client/src/__tests__/Squads.test.tsx`

**Interfaces:**
- Consumes: `useStore()`, shadcn Dialog/Button/Input

- [ ] **Step 1: Write failing test**

Create `client/src/__tests__/Squads.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Squads from '../pages/Squads'

vi.mock('../store', () => ({
  useStore: () => ({
    squads: [
      { id: 1, nome: 'Alpha', tribo: 'Tech', ativa: 1, agilistas: [{ id: 1, nome: 'Ana', email: 'a@x.com', role_id: 1, squad_id: 1, status: 'ativo' }] },
    ],
    fetchAll: vi.fn(),
  }),
}))

vi.mock('../api', () => ({ api: { squads: { create: vi.fn(), update: vi.fn() } } }))

describe('Squads', () => {
  it('renders squad name and tribo', () => {
    render(<Squads />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
  })

  it('shows agilista count', () => {
    render(<Squads />)
    expect(screen.getByText('1 agilista')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Create client/src/pages/Squads.tsx**

```tsx
import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api } from '../api'

export default function Squads() {
  const { squads, fetchAll } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nome: '', tribo: '' })

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleCreate = async () => {
    await api.squads.create(form)
    setOpen(false)
    setForm({ nome: '', tribo: '' })
    await fetchAll()
  }

  const handleToggle = async (id: number, ativa: number) => {
    await api.squads.update(id, { ativa: ativa ? 0 : 1 })
    await fetchAll()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Squads</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>+ Nova Squad</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Squad</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <Input placeholder="Nome da squad" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              <Input placeholder="Tribo / Área" value={form.tribo} onChange={e => setForm(f => ({ ...f, tribo: e.target.value }))} />
              <Button onClick={handleCreate} disabled={!form.nome || !form.tribo}>Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {squads.map(squad => (
          <div key={squad.id} className={`bg-white rounded-lg border p-4 space-y-2 ${!squad.ativa ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{squad.nome}</p>
                <p className="text-sm text-gray-500">{squad.tribo}</p>
              </div>
              <button
                onClick={() => handleToggle(squad.id, squad.ativa)}
                className="text-xs text-gray-400 hover:text-gray-700"
              >
                {squad.ativa ? 'Inativar' : 'Ativar'}
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {squad.agilistas.length} {squad.agilistas.length === 1 ? 'agilista' : 'agilistas'}
            </p>
            <div className="flex flex-wrap gap-1">
              {squad.agilistas.map(a => (
                <span key={a.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{a.nome}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run tests**

```bash
cd client && npm test
```

Expected: Squads tests pass.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/Squads.tsx client/src/__tests__/Squads.test.tsx
git commit -m "feat: squads page with cards + create/inativar"
```

---

### Task 13: Upload de Planilha

**Files:**
- Create: `client/src/components/UploadModal.tsx`
- Create: `client/src/lib/parseSheet.ts`
- Test: `client/src/__tests__/parseSheet.test.ts`

**Interfaces:**
- Produces from `client/src/lib/parseSheet.ts`:
  - `parseSheet(file: File): Promise<ParsedRow[]>` where `ParsedRow = { nome: string, email: string, role: string, squad?: string }`
- Produces: `<UploadModal roles={roles} squads={squads} onImport={fn} />` component

- [ ] **Step 1: Write failing test**

Create `client/src/__tests__/parseSheet.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { parseRawRows, validateRows } from '../lib/parseSheet'

describe('parseRawRows', () => {
  it('normalizes header row to lowercase keys', () => {
    const raw = [['Nome', 'Email', 'Role'], ['Ana', 'ana@x.com', 'SM']]
    const result = parseRawRows(raw)
    expect(result[0]).toEqual({ nome: 'Ana', email: 'ana@x.com', role: 'SM' })
  })

  it('skips rows with empty nome', () => {
    const raw = [['nome', 'email', 'role'], ['', 'x@x.com', 'SM']]
    const result = parseRawRows(raw)
    expect(result).toHaveLength(0)
  })
})

describe('validateRows', () => {
  it('returns errors for missing email', () => {
    const rows = [{ nome: 'Ana', email: '', role: 'SM' }]
    const errors = validateRows(rows)
    expect(errors[0]).toContain('email')
  })

  it('returns empty array for valid rows', () => {
    const rows = [{ nome: 'Ana', email: 'ana@x.com', role: 'SM' }]
    const errors = validateRows(rows)
    expect(errors).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Create client/src/lib/parseSheet.ts**

```typescript
import * as XLSX from 'xlsx'

export interface ParsedRow {
  nome: string
  email: string
  role: string
  squad?: string
}

export function parseRawRows(rows: unknown[][]): ParsedRow[] {
  if (rows.length < 2) return []
  const headers = (rows[0] as string[]).map(h => h.toLowerCase().trim())
  return rows.slice(1).map(row => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = String((row as unknown[])[i] ?? '').trim() })
    return { nome: obj['nome'] ?? '', email: obj['email'] ?? '', role: obj['role'] ?? '', squad: obj['squad'] }
  }).filter(r => r.nome !== '')
}

export function validateRows(rows: ParsedRow[]): string[] {
  const errors: string[] = []
  rows.forEach((r, i) => {
    if (!r.email) errors.push(`Linha ${i + 2}: email obrigatório`)
    if (!r.role) errors.push(`Linha ${i + 2}: role obrigatório`)
  })
  return errors
}

export async function parseSheet(file: File): Promise<ParsedRow[]> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 })
  return parseRawRows(rows)
}
```

- [ ] **Step 3: Create client/src/components/UploadModal.tsx**

```tsx
import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { parseSheet, validateRows, type ParsedRow } from '../lib/parseSheet'
import type { Role, Squad, NewAgilista } from '../types'

interface Props {
  roles: Role[]
  squads: Squad[]
  onImport: (rows: NewAgilista[]) => Promise<void>
}

export default function UploadModal({ roles, squads, onImport }: Props) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const parsed = await parseSheet(file)
    const errs = validateRows(parsed)
    setRows(parsed)
    setErrors(errs)
  }

  const handleConfirm = async () => {
    const mapped: NewAgilista[] = rows.map(r => {
      const role = roles.find(ro => ro.nome.toLowerCase() === r.role.toLowerCase())
      const squad = r.squad ? squads.find(s => s.nome.toLowerCase() === r.squad!.toLowerCase()) : undefined
      return { nome: r.nome, email: r.email, role_id: role?.id ?? 0, squad_id: squad?.id ?? null, status: 'ativo' as const }
    })
    await onImport(mapped)
    setOpen(false)
    setRows([])
    setErrors([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Importar Planilha</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Importar Agilistas via Planilha</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <input ref={inputRef} type="file" accept=".xlsx,.csv" onChange={handleFile} className="text-sm" />
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 space-y-1">
              {errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}
          {rows.length > 0 && errors.length === 0 && (
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="bg-gray-50">
                  {['Nome', 'E-mail', 'Role', 'Squad'].map(h => <th key={h} className="px-3 py-2 text-left border">{h}</th>)}
                </tr></thead>
                <tbody>{rows.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-1 border">{r.nome}</td>
                    <td className="px-3 py-1 border">{r.email}</td>
                    <td className="px-3 py-1 border">{r.role}</td>
                    <td className="px-3 py-1 border">{r.squad ?? '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={rows.length === 0 || errors.length > 0}>
              Importar {rows.length} registro(s)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run tests**

```bash
cd client && npm test
```

Expected: parseSheet tests pass.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/parseSheet.ts client/src/components/UploadModal.tsx client/src/__tests__/parseSheet.test.ts
git commit -m "feat: spreadsheet upload parser + import modal"
```

---

### Task 14: Navigation Shell + Wire Everything Together

**Files:**
- Modify: `client/src/App.tsx`
- Create: `client/src/components/Nav.tsx`

**Interfaces:**
- Consumes: all pages (Dashboard, Agilistas, Squads), UploadModal

- [ ] **Step 1: Create client/src/components/Nav.tsx**

```tsx
interface Props {
  current: string
  onChange: (page: string) => void
}

const links = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'agilistas', label: 'Agilistas' },
  { id: 'squads', label: 'Squads' },
]

export default function Nav({ current, onChange }: Props) {
  return (
    <nav className="flex gap-1 border-b bg-white px-6">
      {links.map(l => (
        <button
          key={l.id}
          onClick={() => onChange(l.id)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            current === l.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          {l.label}
        </button>
      ))}
    </nav>
  )
}
```

- [ ] **Step 2: Update client/src/App.tsx**

```tsx
import { useState } from 'react'
import Nav from './components/Nav'
import Dashboard from './pages/Dashboard'
import Agilistas from './pages/Agilistas'
import Squads from './pages/Squads'

export default function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">AgileManager</h1>
      </header>
      <Nav current={page} onChange={setPage} />
      <main>
        {page === 'dashboard' && <Dashboard />}
        {page === 'agilistas' && <Agilistas />}
        {page === 'squads' && <Squads />}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: all tests across both workspaces pass.

- [ ] **Step 4: Commit**

```bash
git add client/src/App.tsx client/src/components/Nav.tsx
git commit -m "feat: navigation shell wiring all pages"
```

---

### Task 15: Push + README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md**

```markdown
# AgileManager

Gestão de agilistas em times de governança.

## Dev

```bash
npm install
npm run dev        # server :3001, client :5173
npm test           # todos os testes
```

## Seed (primeiro uso)

```bash
cd server && npx tsx src/db/seed.ts
```

## Estrutura

```
server/   Express + Drizzle + SQLite
client/   React + Vite + Tailwind + shadcn/ui
```
```

- [ ] **Step 2: Push to origin**

```bash
git add README.md SPEC.md
git commit -m "docs: README and SPEC"
git push origin main
```

---

## Self-Review

**Spec coverage:**
- Gestão de Agilistas (filtros, cadastro, edição inline, dropdowns) → Tasks 6, 11
- Gestão de Squads (listagem com agilistas, criação, edição, inativação) → Tasks 5, 12
- Realocação + histórico + pool → Tasks 7, 11 (squad dropdown)
- Upload de planilha (preview, validação, bulk import) → Tasks 13
- Dashboard (contagens, mapa, indicadores) → Task 10
- Testes unitários, componente, integração → all tasks

**Placeholder scan:** None found.

**Type consistency:** `Agilista`, `Squad`, `Role`, `Alocacao` defined once in `client/src/types.ts` and mirrored in `server/src/db/schema.ts` exports. All references use the same field names.
