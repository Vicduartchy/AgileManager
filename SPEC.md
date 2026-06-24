# AgileManager — Especificação de Funcionalidades

## O que é
Uma aplicação web para gestão de **agilistas** em times de governança: alocações em squads, visualização, edição e importação via planilha.

---

## Funcionalidades

### 1. Gestão de Agilistas
- Listagem de agilistas com filtros por **role** (ex: SM, PMO, Agile Coach, RTE — configurável), squad e status
- Cadastro manual ou via upload de planilha (`.xlsx` / `.csv`)
- Edição inline de campos simples (nome, e-mail)
- Campos de seleção única (role, squad, status) como **dropdown**

### 2. Gestão de Squads
- Listagem de squads com seus agilistas alocados
- Criação de nova squad (nome, tribo/área)
- Edição e inativação de squad

### 3. Realocação de Agilistas
- Mover um agilista de uma squad para outra via dropdown
- Histórico de alocações por agilista
- Visualização de quem está sem squad ("pool")

### 4. Upload de Planilha
- Upload de `.xlsx` / `.csv` para criação ou atualização em massa
- Preview dos dados antes de confirmar a importação
- Validação de campos obrigatórios e conflitos

### 5. Dashboard de Visão Geral
- Contagem de agilistas ativos, squads ativas
- Mapa de alocação: squad → agilistas
- Indicadores: squads sem agilista, agilistas sem alocação

---

## Tecnologia

| Camada | Escolha | Justificativa |
|--------|---------|---------------|
| **Frontend** | React + Vite + TypeScript | Rápido, tipado, ecossistema amplo |
| **UI** | Tailwind CSS + shadcn/ui | Componentes prontos (dropdown, table, dialog) |
| **Tabela** | TanStack Table (react-table v8) | Filtros, ordenação, edição inline |
| **Upload/Parse** | SheetJS (xlsx) | Leitura de `.xlsx` e `.csv` no browser |
| **Estado** | Zustand | Simples, sem boilerplate |
| **Backend** | Node.js + Express + TypeScript | API REST leve |
| **Banco** | SQLite (via better-sqlite3) | Zero config, arquivo local, fácil de migrar |
| **ORM** | Drizzle ORM | Type-safe, schema como código |
| **Testes** | Vitest + React Testing Library | Unitários e de componente |

---

## Testes

| Tipo | O que cobre |
|------|-------------|
| **Unitário (Vitest)** | Parsing de planilha, validações de importação, lógica de realocação |
| **Componente (RTL)** | Dropdown de squad, tabela editável, modal de upload |
| **Integração (Supertest)** | Endpoints da API (CRUD de agilistas, squads, alocações) |

---

## Modelo de Dados

```
Squad      { id, nome, tribo, ativa }
Agilista   { id, nome, email, role, squad_id, status: ativo|inativo }
Alocacao   { id, agilista_id, squad_id, data_inicio, data_fim }  ← histórico
Role       { id, nome }  ← tabela configurável (SM, PMO, Agile Coach...)
```
