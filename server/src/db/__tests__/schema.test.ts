import { describe, it, expect } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { roles, squads, agilistas, alocacoes } from '../schema'

function makeTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
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
