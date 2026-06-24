# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

AgileManager é uma aplicação web full-stack para gestão de agilistas (Scrum Masters, Agile Coaches, PMOs, RTEs) em times de governança. Permite cadastro, alocação em squads, realocação com histórico e importação via planilha.

## Comandos

```bash
# Instalar dependências (raiz — instala server/ e client/)
npm install

# Rodar em dev (server :3001 + client :5173)
npm run dev

# Rodar todos os testes
npm test

# Rodar testes de um workspace específico
npm test --workspace=server
npm test --workspace=client

# Rodar um único arquivo de teste
cd server && npx vitest run src/__tests__/agilistas.test.ts
cd client && npx vitest run src/__tests__/AgilistaTable.test.tsx

# Seed inicial do banco
cd server && npx tsx src/db/seed.ts

# Checar tipos
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit
```

## Arquitetura

Monorepo com dois workspaces independentes:

```
server/   → API REST (Express + Drizzle + SQLite)
client/   → SPA (React + Vite + Zustand)
```

### server/

- `src/index.ts` — entry point: roda `runMigrations()` e sobe o Express na porta `PORT` (padrão 3001)
- `src/app.ts` — factory `createApp(db?)` que retorna o Express app; aceita `db` injetado para facilitar testes com banco em memória
- `src/db/schema.ts` — schema Drizzle com os 4 modelos: `roles`, `squads`, `agilistas`, `alocacoes`
- `src/db/index.ts` — instancia `better-sqlite3` e exporta `db` (singleton para produção)
- `src/db/migrate.ts` — função `runMigrations()` que cria as tabelas via SQL raw (não usa drizzle-kit em runtime)
- `src/routes/*.ts` — cada rota exporta uma factory `xyzRouter(db)` que recebe o db injetado

**Padrão de teste no server:** todos os testes criam um banco SQLite `:memory:` local e passam para `createApp(db)`. Nunca usam o banco real.

**Rota de realocação** (`POST /api/alocacoes`): fecha a alocação aberta do agilista (seta `data_fim = hoje`), cria nova entrada em `alocacoes`, e atualiza `agilistas.squad_id`. É a única operação que toca três tabelas.

### client/

- `src/types.ts` — tipos compartilhados (`Role`, `Squad`, `Agilista`, `Alocacao`) — fonte de verdade do lado frontend
- `src/api.ts` — cliente fetch tipado; todas as chamadas à API passam por aqui (prefixo `/api` proxiado pelo Vite para `:3001`)
- `src/store.ts` — Zustand store com `fetchAll()`, `moveAgilista()`, `updateAgilista()`; os componentes nunca chamam `api.*` diretamente, só o store
- `src/pages/` — Dashboard, Agilistas, Squads (rotas de nível superior)
- `src/components/AgilistaTable.tsx` — TanStack Table com edição inline; recebe `onUpdate` como prop
- `src/components/UploadModal.tsx` — modal de upload; usa `parseSheet()` internamente
- `src/lib/parseSheet.ts` — lógica pura de parse de `.xlsx`/`.csv` com SheetJS; testável sem DOM

**Padrão de teste no client:** componentes que dependem do store usam `vi.mock('../store', ...)`. Lógica pura (parseSheet, validações) é testada sem mock.

## Modelo de dados

```
Role      { id, nome }
Squad     { id, nome, tribo, ativa: boolean }
Agilista  { id, nome, email, role_id → Role, squad_id → Squad | null, status: 'ativo'|'inativo' }
Alocacao  { id, agilista_id → Agilista, squad_id → Squad, data_inicio, data_fim | null }
```

`Alocacao` com `data_fim = null` é a alocação corrente. Cada realocação fecha a linha aberta e abre uma nova.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js 20, Express 4, TypeScript strict |
| ORM | Drizzle ORM + better-sqlite3 |
| Frontend | React 18, Vite 5, TypeScript strict |
| UI | Tailwind CSS 3 + shadcn/ui |
| Tabela | TanStack Table v8 |
| Upload | SheetJS (xlsx) |
| Estado | Zustand 4 |
| Testes | Vitest + React Testing Library + Supertest |

## Convenção de commits

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: mudança visual sem alterar comportamento
```

## Plano de implementação

O plano completo com 15 tasks está em `docs/superpowers/plans/2026-06-24-agile-manager.md`.
