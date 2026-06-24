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
