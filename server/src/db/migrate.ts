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
