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
