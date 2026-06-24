import { describe, it, expect } from 'vitest'
import request from 'supertest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { roles, agilistas } from '../db/schema'
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
    expect(res.body.ativa).toBe(true)
  })

  it('PATCH /api/squads/:id inativa a squad', async () => {
    const db = makeTestDb()
    const app = createApp(db)
    const created = await request(app).post('/api/squads').send({ nome: 'Beta', tribo: 'Growth' })
    const { id } = created.body
    const res = await request(app).patch(`/api/squads/${id}`).send({ ativa: false })
    expect(res.status).toBe(200)
    expect(res.body.ativa).toBe(false)
  })

  it('GET /api/squads includes agilistas', async () => {
    const db = makeTestDb()
    const app = createApp(db)
    // Create a squad via HTTP
    await request(app).post('/api/squads').send({ nome: 'Gamma', tribo: 'Ops' })
    // Seed role and agilista directly via db to avoid dependency on /api/agilistas (Task 6)
    db.insert(roles).values({ nome: 'SM' }).run()
    db.insert(agilistas).values({ nome: 'Ana', email: 'ana@x.com', role_id: 1, squad_id: 1 }).run()
    const res = await request(app).get('/api/squads')
    expect(res.body[0].agilistas).toBeDefined()
    expect(res.body[0].agilistas).toHaveLength(1)
  })
})
