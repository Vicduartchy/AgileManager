# AgileManager

Gestão de agilistas em times de governança — alocações em squads, visualização, edição e importação via planilha.

## Dev

```bash
npm install
npm run dev        # server :3001 + client :5173
```

Acesse `http://localhost:5173`.

## Testes

```bash
npm test                          # todos os workspaces
npm test --workspace=server       # só backend
npm test --workspace=client       # só frontend

# arquivo único:
cd server && npx vitest run src/__tests__/agilistas.test.ts
cd client && npx vitest run src/__tests__/AgilistaTable.test.tsx
```

## Seed (primeiro uso)

```bash
cd server && npx tsx src/db/seed.ts
```

## Estrutura

```
server/   Express + Drizzle ORM + SQLite (porta 3001)
client/   React + Vite + Tailwind + shadcn/ui (porta 5173)
```

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js 20+, Express 4, TypeScript strict |
| ORM | Drizzle ORM + better-sqlite3 |
| Frontend | React 18, Vite 5, TypeScript strict |
| UI | Tailwind CSS 3 + shadcn/ui |
| Tabela | TanStack Table v8 |
| Upload | SheetJS (xlsx) |
| Estado | Zustand 4 |
| Testes | Vitest + React Testing Library + Supertest |

## CI/CD

Todo push para `main` executa o pipeline em `.github/workflows/ci.yml`:
- Typecheck + testes do server
- Typecheck + testes do client
- Deploy para Vercel (requer secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
